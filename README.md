# 🎓 StudyBuddy AI — Gamified AI Study Companion

StudyBuddy AI is a **GenAI-powered learning assistant** designed to act as a **24×7 AI tutor** that helps students understand concepts, practice quizzes, and stay motivated through gamified learning.

This project was developed as part of an **AI Engineering Internship Prototype** to demonstrate practical AI system design, LLM integration, and gamified education experiences.

---

## 🚀 Project Overview

Traditional learning platforms often lack personalization and engagement.  
StudyBuddy AI combines **Generative AI + Gamification** to create an interactive learning environment where students can:

- ✅ Understand concepts with AI explanations  
- ✅ Generate quizzes automatically  
- ✅ Track learning progress using XP & levels  
- ✅ Learn interactively through a clean UI  

---

## ✨ Core Features

### 🤖 AI Tutor (Concept Explanation)
- Uses LLM (Cohere API) for intelligent tutoring
- Provides structured responses:
  - Step-by-step explanation
  - Key concept summary
  - Practical example

### 🧠 AI Quiz Generator
- Generates MCQ quizzes dynamically
- Supports:
  - Topic-based quiz generation
  - File upload (PDF/Text) for context-based quizzes
- Adjustable difficulty & time limits

### 🎮 Gamification System (Most Important)
- XP-based progress tracking
- Level system
- Learning engagement through rewards
- Progress visualization

### 📊 Learning Dashboard
- Chat-based learning interface
- Quiz arena
- Progress tracking
- Analytics & achievements pages

---

## 🏗️ System Architecture

```
Frontend (HTML + Tailwind + JS)
            │
            │ REST API
            ▼
Backend (Node.js + Express)
            │
            ▼
LLM API (Cohere)
            │
            ▼
AI Responses (Explanation + Quiz)
```

### Flow

1. User asks question or selects topic  
2. Backend builds structured prompt  
3. Request sent to LLM  
4. AI response processed  
5. XP updated & returned to frontend  

---

## 🧩 Tech Stack

### Frontend
- HTML5
- Tailwind CSS
- Vanilla JavaScript
- Vite

### Backend
- Node.js
- Express.js
- Multer (file upload)
- PDF-Parse
- dotenv

### AI & APIs
- Cohere LLM API

### Tools
- Git & GitHub
- VS Code

---

## 📁 Project Structure

```
StudyBuddyAI/
│
├── backend/
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── learn.html
│   ├── quiz.html
│   ├── progress.html
│   ├── analytics.html
│   ├── achievements.html
│   └── chat.js
│
├── package.json
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Akanksh0301/StudyBuddyAI.git
cd StudyBuddyAI
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Add Environment Variables

Create a `.env` file inside the **backend** folder:

```
COHERE_API_KEY=your_api_key_here
PORT=3000
```

### 4️⃣ Run Backend

```bash
node backend/server.js
```

Server runs at:

```
http://localhost:3000
```

### 5️⃣ Open Application

Open browser and visit:

```
http://localhost:3000
```

---

## 🔌 API Endpoints

### Explain Concept

**POST /api/explain**

Request:

```json
{
  "message": "Explain Neural Networks",
  "topic": "AI",
  "level": "Beginner"
}
```

Response:

```json
{
  "steps": [],
  "keyConcept": "",
  "example": ""
}
```

---

### Generate Quiz

**POST /api/generate-quiz**

Supports:
- Topic input
- File upload (PDF/Text)

---

## 🧠 Key AI Engineering Concepts Demonstrated

- Prompt Engineering
- Structured LLM Outputs (JSON parsing)
- Retry handling for API rate limits
- Context extraction from documents
- AI + Gamification integration
- REST API architecture

---

## 🎥 Demo Video

👉 Add your demo video link here

---

## 📌 Future Improvements

- Vector database for long-term memory
- Personalized learning recommendations
- Student performance analytics using ML
- Multi-user authentication
- Adaptive difficulty quizzes

---

## 👩‍💻 Author

**Akanksha Chougule**

- GitHub: https://github.com/Akanksh0301  
  
---

## ⭐ Project Goal

This project demonstrates how **AI Engineering + Generative AI** can transform education into an engaging, personalized, and interactive learning experience.
