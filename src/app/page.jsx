"use client"

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/useQuizStore';

export default function Home() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const router = useRouter();
  const {setQuizData} = useQuizStore();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      setUploadedFile(file);
      setIsUploading(false);
    }, 1500);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateQuiz = async () => {
    if (!uploadedFile) {
      alert("Please upload a file first");
      return;
    }

    console.log('Generate quiz from:', uploadedFile.name);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', uploadedFile);
      formData.append('number', numberOfQuestions);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch("/api/quiz_generation", {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));

        if (errorData.error.name === "InsufficientQuotaError") {
          alert("You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.")
        } else {
          alert(errorData.error.name);
        }
        return;
      }

      const data = await response.json();
      console.log('Quiz generation response:', data);

      if (!data.quiz || data.quiz.length === 0) {
        throw new Error('No quiz questions were generated from the PDF');
      }

      alert("Quiz generated successfully!");
      setQuizData(data.quiz);

      router.push('/quiz_section');

    } catch (err) {
      console.error('Quiz generation error:', err);

      if (err.name === 'AbortError') {
        alert("Request timed out. Please try with a smaller PDF or try again.");
      } else {
        alert(err.message || "Failed to generate quiz");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {isLoading && (
          <div className='fixed top-0 left-0 w-full h-full z-50'>
            <div className='absolute w-full h-full bg-gray-300 opacity-50'></div>
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
              <Loader className='animate-spin h-12 w-12 text-indigo-600' />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quiz Crafter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your PDF document and we'll automatically generate interactive quizzes based on the content
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 flex flex-col items-center gap-2">

          <div className='w-[100%] text-black flex gap-2 justify-center items-center'>
            select number of questions
            <input className='w-[100px] bg-green-600 text-white rounded z-100 px-3' type='number' value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(e.target.value)} />
          </div>

          {!uploadedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${dragActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleChange}
                className="hidden"
              />

              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-lg font-medium text-gray-700">Processing your PDF...</p>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    Drop your PDF here
                  </h3>
                  <p className="text-gray-500 mb-6">
                    or click to browse from your computer
                  </p>
                  <button
                    onClick={onButtonClick}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Choose PDF File
                  </button>
                  <p className="text-sm text-gray-400 mt-4">
                    Maximum file size: 10MB • Supported format: PDF
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {uploadedFile?.name ? String(uploadedFile.name) : 'Unknown file'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {uploadedFile?.size ? (uploadedFile.size / 1024 / 1024).toFixed(2) : '0'} MB • Ready for processing
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          )}

          <div className='text-black px-10 text-center'>
            Note: The scoring pattern for the generated quiz is +2 points for a correct answer and -1 point for a wrong answer.
          </div>

        </div>

        {/* Action Buttons */}
        {uploadedFile && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={removeFile}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Upload Different File
            </button>
            <button
              onClick={generateQuiz}
              disabled={isLoading}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Upload</h3>
            <p className="text-gray-600">Simply drag and drop your PDF or click to browse</p>
          </div>
          <div className="text-center p-6">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analysis</h3>
            <p className="text-gray-600">AI analyzes your content to create relevant questions</p>
          </div>
          <div className="text-center p-6">
            <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-gray-600">Get your interactive quiz in seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
}