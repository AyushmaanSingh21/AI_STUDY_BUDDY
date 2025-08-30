from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class Summary(BaseModel):
    """Summary of the video content"""
    overview: str
    key_points: List[str]
    main_topics: List[str]
    difficulty_level: str  # beginner, intermediate, advanced
    estimated_reading_time: int  # in minutes

class Timestamp(BaseModel):
    """Timestamp for a specific topic or section"""
    time: str  # format: "MM:SS"
    seconds: int
    topic: str
    description: str
    keywords: List[str]

class QuizQuestion(BaseModel):
    """Individual quiz question"""
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    difficulty: str  # easy, medium, hard
    topic: str

class Quiz(BaseModel):
    """Quiz section with multiple questions"""
    title: str
    description: str
    questions: List[QuizQuestion]
    total_questions: int
    estimated_time: int  # in minutes

class VideoAnalysis(BaseModel):
    """Complete video analysis result"""
    video_id: str
    title: str
    duration: int  # in seconds
    summary: Summary
    timestamps: List[Timestamp]
    quizzes: List[Quiz]
    created_at: datetime = datetime.now()
    processing_time: Optional[float] = None

class VideoInfo(BaseModel):
    """Basic video information"""
    video_id: str
    title: str
    description: str
    duration: int
    channel: str
    upload_date: str
    view_count: Optional[int] = None
    like_count: Optional[int] = None

class TranscriptSegment(BaseModel):
    """Individual transcript segment with timing"""
    start: float
    end: float
    text: str
    confidence: Optional[float] = None

class Transcript(BaseModel):
    """Complete transcript with segments"""
    video_id: str
    language: str
    segments: List[TranscriptSegment]
    full_text: str
    word_count: int
