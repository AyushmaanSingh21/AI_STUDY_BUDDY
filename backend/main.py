from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
import os
import asyncio
from dotenv import load_dotenv

from services.youtube_service import YouTubeService
from services.ai_service import AIService
from services.quiz_service import QuizService
from models.video_analysis import VideoAnalysis, Summary, Timestamp, Quiz

load_dotenv()

app = FastAPI(
    title="AI Study Buddy API",
    description="Transform YouTube videos into smart study materials",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ai-study-buddy.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
youtube_service = YouTubeService()
ai_service = AIService()
quiz_service = QuizService()

class VideoRequest(BaseModel):
    url: HttpUrl
    summary_depth: Optional[str] = "medium"  # short, medium, detailed

class AnalysisResponse(BaseModel):
    video_id: str
    title: str
    duration: int
    summary: Summary
    timestamps: List[Timestamp]
    quizzes: List[Quiz]
    status: str = "completed"

@app.get("/")
async def root():
    return {"message": "AI Study Buddy API is running! 🎓"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "services": ["youtube", "ai", "quiz"]}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_video(request: VideoRequest, background_tasks: BackgroundTasks):
    """
    Analyze a YouTube video and generate study materials
    """
    try:
        # Extract video ID from URL
        video_id = youtube_service.extract_video_id(str(request.url))
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
        # Get video metadata
        video_info = await youtube_service.get_video_info(video_id)
        
        # Get transcript
        transcript = await youtube_service.get_transcript(video_id)
        if not transcript:
            raise HTTPException(status_code=404, detail="No transcript available for this video")
        
        # Process with AI (this could be moved to background task for long videos)
        try:
            summary = await ai_service.generate_summary(transcript, request.summary_depth)
        except Exception as e:
            print(f"Summary generation failed: {e}")
            # Use fallback summary
            summary = ai_service._create_fallback_summary(transcript)
        
        try:
            timestamps = await ai_service.generate_timestamps(transcript)
        except Exception as e:
            print(f"Timestamp generation failed: {e}")
            # Use fallback timestamps
            timestamps = ai_service._create_fallback_timestamps(transcript)
        
        try:
            quizzes = await quiz_service.generate_quizzes(transcript, summary)
        except Exception as e:
            print(f"Quiz generation failed: {e}")
            # Use fallback quiz
            quizzes = [quiz_service._create_fallback_quiz("Comprehensive Quiz", summary)]
        
        return AnalysisResponse(
            video_id=video_id,
            title=video_info["title"],
            duration=video_info["duration"],
            summary=summary,
            timestamps=timestamps,
            quizzes=quizzes
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze/async")
async def analyze_video_async(request: VideoRequest, background_tasks: BackgroundTasks):
    """
    Start async analysis - returns job ID immediately
    """
    try:
        video_id = youtube_service.extract_video_id(str(request.url))
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
        # Generate job ID
        job_id = f"job_{video_id}_{int(asyncio.get_event_loop().time())}"
        
        # Add background task
        background_tasks.add_task(
            process_video_async, 
            job_id, 
            str(request.url), 
            request.summary_depth
        )
        
        return {"job_id": job_id, "status": "processing", "message": "Analysis started"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start analysis: {str(e)}")

@app.get("/status/{job_id}")
async def get_analysis_status(job_id: str):
    """
    Check status of async analysis
    """
    # In a real implementation, you'd store this in a database
    # For now, return a mock response
    return {"job_id": job_id, "status": "completed", "progress": 100}

async def process_video_async(job_id: str, url: str, summary_depth: str):
    """
    Background task for video processing
    """
    try:
        # This would be the same logic as the sync endpoint
        # but with progress updates stored in a database
        pass
    except Exception as e:
        # Log error and update job status
        print(f"Background task failed for {job_id}: {e}")

@app.get("/export/{video_id}")
async def export_notes(video_id: str, format: str = "pdf"):
    """
    Export study materials in various formats
    """
    try:
        # This would retrieve stored analysis and generate export
        if format == "pdf":
            return {"message": "PDF export endpoint", "video_id": video_id}
        elif format == "markdown":
            return {"message": "Markdown export endpoint", "video_id": video_id}
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
