# QuizCrafter 

QuizCrafter is an intelligent quiz generation system that takes PDFs as input and outputs interactive flashcard-style questions. It's designed for students, educators, and learners who want to turn study materials into engaging quizzes automatically.

## 🚀 Project Idea

The goal of QuizCrafter is simple:
> **Upload a PDF → Get Quiz Questions → Study Smarter**

QuizCrafter uses the power of AI and language models to extract meaningful questions from study material in PDFs. The app intelligently processes text, splits it into manageable chunks, and generates questions using the OpenAI API.

---

![QuizCrafter Demo](https://drive.google.com/file/d/1po4CcY4O-FsDfgAGu_pDTo0Ab04ZXE6p/view?usp=drive_link)

[![QuizCrafter Demo]](https://drive.google.com/file/d/1po4CcY4O-FsDfgAGu_pDTo0Ab04ZXE6p/view?usp=drive_link)


### Key Highlights:
- **Rule-based validation**: Ensures the number of questions requested is feasible (based on PDF length).
- **Chunking logic**: Breaks down PDF content chunks by using the langchain package.
- **Meaningful chunk selection**: Selecting chunks greater than size of 200 so that LLM gets sufficient context.
- **Dynamic UI**: Flashcards are generated on the frontend using a queue-based structure.
- **Optimized prompt engineering**: Manages question generation batches intelligently.

_Chunking and orchestration of the LLM logic will be implemented using **LangChain**, **LangGraph**, and **LangSmith**._

---

## 🛠 Tech Stack

### Frontend + Backend (Monorepo in Next.js)

- **Next.js** – Fullstack React framework
- **Tailwind CSS** – Utility-first styling
- **Zustand** – Global state management
- **Axios** – API calls
- **LangChain** – For chunk management and LLM orchestration

---

## 🧪 Features (WIP)

- ✅ PDF Upload via drag & drop
- ✅ Rule-check and error messaging
- 🛠️ LangChain chunking integration
- 🛠️ Flashcard-style UI generation
- 🛠️ Queue-based flashcard flow

---

## 📦 Installation

```bash
git clone https://github.com/your-username/quizcrafter.git
cd quizcrafter
npm install
npm run dev
```

## Folder Structure

```bash
/pages
  /api
    quiz_generation.js
/components
/utils
/hooks
/public
/styles
```

## Inspiration:

Inspired by the learning struggles of modern students, QuizCrafter is meant to bring the power of AI to everyday studying.

## Maintained By 

Smit Pawar

pawar.smit2108@gmail.com

