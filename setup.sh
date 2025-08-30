#!/bin/bash

echo "🚀 Setting up AI Study Buddy for Hackathon..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Python and Node.js found"

# Create virtual environment for backend
echo "📦 Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env and add your OpenAI API key!"
fi

cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add your OpenAI API key to backend/.env"
echo "2. Start the backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "3. Start the frontend: cd frontend && npm start"
echo ""
echo "🌐 Backend will run on: http://localhost:8000"
echo "🌐 Frontend will run on: http://localhost:3000"
echo ""
echo "📚 Check docs/TEAM_TASKS.md for detailed team responsibilities"
echo ""
echo "Good luck with your hackathon! 🚀"
