# QuizCrafter 🧠📄

QuizCrafter is an intelligent quiz generation system that takes PDFs as input and outputs interactive flashcard-style questions. It's designed for students, educators, and learners who want to turn study materials into engaging quizzes automatically.

## 🚀 Project Idea

The goal of QuizCrafter is simple:
> **Upload a PDF → Get Quiz Questions → Study Smarter**

QuizCrafter uses the power of AI and language models to extract meaningful questions from study material in PDFs. The app intelligently processes text, splits it into manageable chunks, and generates questions using the OpenAI API.

---

### Key Highlights:
- **Rule-based validation**: Ensures the number of questions requested is feasible (based on PDF length).
- **Chunking logic**: Breaks down PDF content into ~300-word chunks.
- **Circular chunk selection**: Efficient use of context by rotating chunks during LLM calls.
- **Dynamic UI**: Flashcards are generated on the frontend using a queue-based structure.
- **Optimized prompt engineering**: Manages question generation batches intelligently.

_Chunking and orchestration of the LLM logic will be implemented using **LangChain**, **LangGraph**, and **LangSmith**._

---

## 🛠 Tech Stack

### Frontend + Backend (Monorepo in Next.js)

- **Next.js** – Fullstack React framework
- **Tailwind CSS** – Utility-first styling
- **Zustand** – Global state management
- **Formidable** – File upload handling
- **Axios** – API calls
- **LangChain** *(planned)* – For chunk management and LLM orchestration
- **LangGraph & LangSmith** *(planned)* – For intelligent flows and debugging

---

## 🧪 Features (WIP)

- ✅ PDF Upload via drag & drop
- ✅ Rule-check and error messaging
- 🛠️ LangChain chunking integration
- 🛠️ Flashcard-style UI generation
- 🛠️ Queue-based flashcard flow
- 🔒 Future support for user sessions and saving history

---

## 📦 Installation

```bash
git clone https://github.com/your-username/quizcrafter.git
cd quizcrafter
npm install
npm run dev

## Inspiration:

Inspired by the learning struggles of modern students, QuizCrafter is meant to bring the power of AI to everyday studying.

### Maintained By Smit Pawar
