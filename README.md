# �� AI Study Buddy

**Transform any educational YouTube video into smart study materials with AI-powered analysis.**

## 📋 Project Overview

AI Study Buddy is an AI-powered platform that transforms YouTube educational videos into comprehensive study materials. Simply paste a YouTube link and get instant access to:

- 📝 **Clean AI Summaries**: Single, concise summaries (~100 words) for quick understanding
- ⏰ **Smart Timestamps**: Topic-based timestamps with descriptions and keywords
- 🧠 **Interactive Quizzes**: Auto-generated quizzes to test your knowledge
- 📱 **Modern UI**: Gen Z-friendly, responsive design with smooth animations
- 📄 **Exportable Notes**: Download study materials as text files

## 🎯 Problem Statement

Students waste hours watching long YouTube tutorials without efficient ways to:
- Extract key points quickly
- Find specific concepts in long videos
- Test understanding through active learning
- Get clean, readable summaries

## 🚀 Solution

Our platform automatically:
1. **Fetches video transcripts** using YouTube Transcript API
2. **Generates clean summaries** using Google Gemini AI (single paragraph format)
3. **Creates topic-based timestamps** for easy navigation
4. **Builds practice quizzes** with explanations
5. **Provides modern, responsive UI** with smooth animations
6. **Offers export functionality** for offline study

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern user interface
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icons
- **Responsive Design** - Works on all devices

### Backend
- **Python FastAPI** - High-performance API server
- **Google Gemini AI** - Advanced AI-powered content analysis
- **YouTube Transcript API** - Video transcript extraction
- **Pydantic** - Data validation and serialization
- **Async/Await** - High-performance concurrent processing

### AI Features
- **Smart Summarization** - Generates clean, readable summaries
- **Topic Detection** - Identifies key topics and timestamps
- **Quiz Generation** - Creates educational quizzes with explanations
- **Difficulty Analysis** - Determines content complexity level

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- Google Gemini API key

### Environment Setup
```bash
# Clone the repository
git clone https://github.com/AyushmaanSingh21/AI_STUDY_BUDDY.git
cd AI_STUDY_BUDDY

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env file
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

## 📁 Project Structure

```
ai_video_analyser/
├── frontend/          # React.js application with modern UI
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main application
├── backend/           # FastAPI server
│   ├── services/      # AI, YouTube, Quiz services
│   ├── models/        # Data models
│   └── main.py        # API server
├── Video/             # Demo videos and examples
├── docs/              # Documentation
└── README.md          # This file
```

## 🎯 Features

### ✅ Core Features (Implemented)
- [x] **YouTube video processing** with automatic transcript extraction
- [x] **AI-powered summarization** using Google Gemini
- [x] **Clean summary format** - Single paragraph instead of structured sections
- [x] **Topic-based timestamps** with descriptions and keywords
- [x] **Interactive quiz generation** with multiple choice questions
- [x] **Modern, responsive UI** with TailwindCSS and Framer Motion
- [x] **Download functionality** for study notes
- [x] **Difficulty analysis** and reading time estimation
- [x] **Search and filter** timestamps by topic

### 🚀 Advanced Features
- [x] **Smooth animations** and hover effects
- [x] **Gen Z-friendly design** with gradients and modern typography
- [x] **Responsive grid layout** with equal-height cards
- [x] **Glassmorphism effects** and modern shadows
- [x] **Real-time processing** with progress indicators

### 🔮 Future Enhancements
- [ ] PDF export functionality
- [ ] Flashcard generation
- [ ] Multi-language support
- [ ] AI-powered search within content
- [ ] User accounts and progress tracking

## 🎬 Demo

### Demo Video
Watch our demo video to see AI Study Buddy in action:

[![Demo Video](Video/demo_vid.mp4)](Video/demo_vid.mp4)

*Click the video above to see how AI Study Buddy transforms YouTube videos into study materials*

### Demo Flow
1. **Paste a YouTube tutorial link** (e.g., programming tutorial, math lesson)
2. **Click "Analyze Video"** to start processing
3. **View results in seconds**:
   - Clean, readable summary
   - Interactive timestamps with topics
   - Auto-generated quizzes
4. **Download notes** for offline study
5. **Navigate easily** with the modern, responsive interface

## 🎨 UI/UX Features

### Modern Design
- **Clean, minimalist interface** with rounded corners and shadows
- **Gradient backgrounds** and modern color schemes
- **Smooth animations** using Framer Motion
- **Responsive grid layout** that works on all devices

### User Experience
- **Intuitive navigation** with clear visual hierarchy
- **Interactive elements** with hover effects and feedback
- **Fast loading** with optimized API calls
- **Accessible design** with proper contrast and typography

## 📊 Success Metrics

- **Processing Speed**: Results in < 30 seconds
- **Summary Quality**: Clean, readable summaries (~100 words)
- **Timestamp Accuracy**: Relevant topic segmentation
- **Quiz Relevance**: Educational value and clarity
- **User Experience**: Modern, responsive interface

## 🚀 Recent Updates

### v2.0 - Modern UI Redesign
- ✨ **Complete frontend redesign** with Gen Z-friendly aesthetics
- 🎨 **Framer Motion animations** for smooth interactions
- 📱 **Responsive grid layout** with equal-height cards
- 🌈 **Modern gradients** and glassmorphism effects
- 📝 **Simplified summary format** - Single clean paragraph
- 🔍 **Enhanced timestamp search** and filtering
- 💾 **Download functionality** for study notes

### v1.0 - Core Features
- 🎯 **AI-powered summarization** using Google Gemini
- ⏰ **Topic-based timestamps** with descriptions
- 🧠 **Quiz generation** with explanations
- 📺 **YouTube integration** for transcript extraction

## 🤝 Contributing

This is an open-source project. See `docs/CONTRIBUTING.md` for development guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see `LICENSE` file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful content analysis
- **YouTube Transcript API** for video content extraction
- **React.js & FastAPI** communities for excellent frameworks
- **Open source contributors** who made this possible

---

**Built with ❤️ for the AI Education Hackathon**

*Transform your learning experience with AI-powered study materials! 🎓✨*
