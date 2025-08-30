# 🎓 AI Study Buddy

**Turn any educational video into smart notes, summaries, timestamps & quizzes.**

## 📋 Project Overview

AI Study Buddy is an AI-powered platform that transforms YouTube educational videos into comprehensive study materials. Simply paste a YouTube link and get instant access to:

- 📝 **Smart Notes**: Concise bullet points and highlights
- ⏰ **Clickable Timestamps**: Jump to specific topics instantly
- 🧠 **Auto-Generated Quizzes**: Test your understanding
- 📄 **Exportable Notes**: Download as PDF/Markdown

## 🎯 Problem Statement

Students waste hours watching long YouTube tutorials without efficient ways to:
- Extract key points quickly
- Find specific concepts in long videos
- Test understanding through active learning

## 🚀 Solution

Our platform automatically:
1. Fetches video transcripts
2. Generates structured notes using AI
3. Creates topic-based timestamps
4. Builds practice quizzes
5. Provides exportable study materials

## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface
- **TailwindCSS** - Styling
- **Shadcn/UI** - Component library

### Backend
- **Python FastAPI** - API server
- **YouTube Transcript API** - Video transcript extraction
- **OpenAI API** - AI-powered summarization and quiz generation
- **NLP Tools** - Text processing and segmentation

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend API hosting

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- OpenAI API key

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📁 Project Structure

```
ai_video_analyser/
├── frontend/          # React.js application
├── backend/           # FastAPI server
├── docs/             # Documentation
└── README.md         # This file
```

## 🎯 Features

### Core (MVP)
- [x] YouTube video link processing
- [x] Transcript extraction
- [x] AI-powered summarization
- [x] Topic-based timestamps
- [x] Quiz generation
- [x] Clean UI dashboard

### Advanced (Nice-to-Have)
- [ ] PDF/Markdown export
- [ ] Flashcard mode
- [ ] Multi-language support
- [ ] AI-powered search
- [ ] Multiple summary depths

## 🧪 Demo Flow

1. Paste a YouTube tutorial link (e.g., JavaScript crash course)
2. Click "Generate Notes"
3. View results:
   - Bullet-point notes
   - Clickable timestamps
   - Auto-generated quizzes
4. Export notes as PDF (bonus)

## 📊 Success Metrics

- **Accuracy**: Quality of summaries and notes
- **Relevance**: Timestamp segmentation accuracy
- **Engagement**: Student usage of generated materials
- **Speed**: Results in < 30 seconds

## 🤝 Contributing

This is a hackathon project. See `docs/CONTRIBUTING.md` for development guidelines.

## 📄 License

MIT License - see `LICENSE` file for details.

---

**Built with ❤️ for the AI Education Hackathon**
