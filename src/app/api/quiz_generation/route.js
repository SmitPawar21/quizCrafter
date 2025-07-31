import fs from 'fs';
import os from 'os';
import path from 'path';
import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { NextResponse } from 'next/server';

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-3.5-turbo', // Fixed model name
  temperature: 0.3
});

const prompt = ChatPromptTemplate.fromTemplate(`
Based on the following text content, generate exactly 3 multiple-choice quiz questions in JSON format.
Each question should:
1. Test understanding of key concepts from the text
2. Have 4 options with only one correct answer
3. Be clear and unambiguous
4. Cover different aspects of the content

Text content:
{text}

Return ONLY a valid JSON array in this exact format (no additional text or formatting):
[
  {{
    "id": 1,
    "question": "Question text here?",
    "options": [
      "Option A",
      "Option B", 
      "Option C",
      "Option D"
    ],
    "correctAnswer": 0
  }},
  {{
    "id": 2,
    "question": "Question text here?",
    "options": [
      "Option A",
      "Option B",
      "Option C", 
      "Option D"
    ],
    "correctAnswer": 1
  }},
  {{
    "id": 3,
    "question": "Question text here?",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": 2
  }}
]

Important: The correctAnswer should be the index (0-3) of the correct option.
`);

const quizChain = prompt.pipe(model).pipe(new StringOutputParser());

async function generateQuizFromPdf(filepath) {
  try {
    const loader = new PDFLoader(filepath);
    const docs = await loader.load();

    console.log("Docs size = ", docs.length);
    const fullText = docs.map(doc => doc.pageContent).join('\n\n');

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000, 
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });

    const chunks = await textSplitter.splitText(fullText);
    console.log("Split text into chunks of length = ", chunks.length);

    const meaningfulChunks = chunks
      .filter(chunk => chunk.trim().length >= 200) 
      .slice(0, 5);

    console.log("Processing", meaningfulChunks.length, "meaningful chunks");

    const allQuizzes = [];
    let questionId = 1;

    const concurrencyLimit = 2;
    for (let i = 0; i < meaningfulChunks.length; i += concurrencyLimit) {
      const batch = meaningfulChunks.slice(i, i + concurrencyLimit);
      
      const batchPromises = batch.map(async (chunk, batchIndex) => {
        try {
          console.log(`Processing chunk ${i + batchIndex + 1}/${meaningfulChunks.length}`);
          const result = await quizChain.invoke({ text: chunk });
          
          let chunkQuiz;
          try {
            const cleanedResponse = typeof result === 'string' ? result.trim() : result.text ? result.text.trim() : '';
            chunkQuiz = JSON.parse(cleanedResponse);
          } catch (parseError) {
            console.log('JSON parse error for chunk', i + batchIndex + 1, ':', parseError.message);
            return parseError;
          }

          if (Array.isArray(chunkQuiz)) {
            return chunkQuiz.map(question => ({
              ...question,
              id: questionId++
            }));
          }
          return [];
        } catch (error) {
          console.error(`Error processing chunk ${i + batchIndex + 1}:`, error.message);
          return {"message": "error", "error": error};
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(questions => {
        allQuizzes.push(questions);
      });

      // Reduced delay between batches
      if (i + concurrencyLimit < meaningfulChunks.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return allQuizzes;

  } catch (error) {
    console.error('Error in generateQuizFromPdf:', error);
    throw error;
  }
}

export async function POST(request) {
  console.log('POST request received');
  
  try {
    // Add content type check
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json({ 
        error: 'Invalid content type. Expected multipart/form-data' 
      }, { status: 400 });
    }

    let formData;
    let file;
    
    try {
      // Use Web API FormData with error handling
      formData = await request.formData();
      file = formData.get('pdf'); // Changed from 'file' to 'pdf' to match frontend
    } catch (formDataError) {
      console.error('FormData parsing error:', formDataError);
      return NextResponse.json({ 
        error: 'Failed to parse form data',
        details: formDataError.message 
      }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
    }

    // Check if it's a PDF file
    if (!file.name?.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Check file size (limit to 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 });
    }

    console.log('Processing PDF:', file.name);

    // Create temporary file
    const tempDir = os.tmpdir();
    const tempFileName = `quiz_pdf_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const tempFilePath = path.join(tempDir, tempFileName);

    console.log('Temp file path:', tempFilePath);

    // Convert File to Buffer and write to temp location
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(tempFilePath, buffer);

    let quizQuestions;
    try {
      quizQuestions = await generateQuizFromPdf(tempFilePath);
      console.log(quizQuestions);
    } finally {
      // Cleanup temp file
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      }
    }

    if (quizQuestions.length === 0) {
      return NextResponse.json({
        error: 'No quiz questions could be generated from the PDF content. The PDF might be too short, contain mostly images, or have unclear text.'
      }, { status: 400 });
    }

    if (quizQuestions[0].message && quizQuestions[0].message == 'error') {
      return NextResponse.json({
        error: quizQuestions[0].error
      }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Quiz generated successfully',
      filename: file.name,
      totalQuestions: quizQuestions.length,
      quiz: quizQuestions
    }, { status: 200 });

  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({
      error: 'Error generating quiz from PDF',
      details: error.message
    }, { status: 500 });
  }
}