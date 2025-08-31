from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
import os
import asyncio
import logging
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
logger.info("Environment variables loaded. GEMINI_API_KEY present: %s", 
           "Yes" if os.getenv("GEMINI_API_KEY") else "No")

from services.youtube_service import YouTubeService
from services.ai_service import AIService
from services.quiz_service import QuizService
from services.transcript_service import TranscriptService
from models.video_analysis import VideoAnalysis, Summary, Timestamp, Quiz
from models.transcript import TranscriptRequest, TranscriptResponse, TranscriptError

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
transcript_service = TranscriptService()

class VideoRequest(BaseModel):
    url: HttpUrl
    summary_depth: Optional[str] = "medium"  # short, medium, detailed

class FlashcardRequest(BaseModel):
    video_id: str
    transcript: str
    summary: str

class FlashcardResponse(BaseModel):
    flashcards: List[Dict[str, str]]
    status: str = "success"

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
    return {"status": "healthy", "services": ["youtube", "ai", "quiz", "transcript"]}

@app.post("/transcript", response_model=TranscriptResponse)
async def get_transcript(request: TranscriptRequest):
    """
    Fetch transcript for a YouTube video
    """
    try:
        # Extract video ID from URL
        try:
            video_id = transcript_service.extract_video_id(str(request.url))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid YouTube link")
        
        # Get transcript
        transcript_segments = transcript_service.get_transcript(video_id)
        
        return TranscriptResponse(
            video_id=video_id,
            transcript=transcript_segments
        )
        
    except ValueError as e:
        if str(e) == "Transcript not found":
            raise HTTPException(status_code=404, detail="Transcript not found")
        else: 
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transcript: {str(e)}")

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_video(request: VideoRequest, background_tasks: BackgroundTasks):
    """
    Analyze a YouTube video and generate study materials
    """
    try:
        # Extract video ID from URL
        try:
            video_id = youtube_service.extract_video_id(str(request.url))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
        # Get video metadata
        video_info = await youtube_service.get_video_info(video_id)
        
        # Get transcript
        try:
            transcript = await youtube_service.get_transcript(video_id)
            if not transcript:
                logger.warning(f"No transcript available for video {video_id}")
                # Continue with a minimal transcript to allow fallback content
                transcript = Transcript(
                    full_text="No transcript available. Using mock data.",
                    segments=[],
                    word_count=0
                )
        except Exception as e:
            logger.error(f"Error fetching transcript: {str(e)}")
            # Continue with a minimal transcript to allow fallback content
            transcript = Transcript(
                full_text="Error fetching transcript. Using mock data.",
                segments=[],
                word_count=0
            )
        
        # Track if we're using any fallback data
        using_mock_data = not transcript.segments  # If no segments, we're using mock data
        
        # Process with AI (this could be moved to background task for long videos)
        try:
            summary = await ai_service.generate_summary(transcript, request.summary_depth)
        except Exception as e:
            print(f"Summary generation failed: {e}")
            # Use fallback summary
            summary = ai_service._create_fallback_summary(transcript)
            using_mock_data = True
        
        try:
            timestamps = await ai_service.generate_timestamps(transcript)
        except Exception as e:
            print(f"Timestamp generation failed: {e}")
            # Use fallback timestamps
            timestamps = ai_service._create_fallback_timestamps(transcript)
            using_mock_data = True
        
        try:
            quizzes = await quiz_service.generate_quizzes(transcript, summary)
        except Exception as e:
            print(f"Quiz generation failed: {e}")
            # Use fallback quiz
            quizzes = [quiz_service._create_fallback_quiz("Comprehensive Quiz", summary)]
            using_mock_data = True
            
        # Generate study notes
        try:
            notes = await ai_service.generate_notes(transcript, summary, timestamps)
        except Exception as e:
            print(f"Notes generation failed: {e}")
            notes = "# Study Notes\n\nCould not generate detailed notes. Please try again later."
            using_mock_data = True
        
        # Determine status message
        status = "using_mock_data" if using_mock_data else "completed"
        
        # Include notes in the response
        response_data = AnalysisResponse(
            video_id=video_id,
            title=video_info["title"],
            duration=video_info["duration"],
            summary=summary,
            timestamps=timestamps,
            quizzes=quizzes,
            status=status
        )
        
        # Convert to dict and add notes
        response_dict = response_data.dict()
        response_dict["notes"] = notes
        
        return response_dict
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze/async")
async def analyze_video_async(request: VideoRequest, background_tasks: BackgroundTasks):
    """
    Start async analysis - returns job ID immediately
    """
    try:
        try:
            video_id = youtube_service.extract_video_id(str(request.url))
        except ValueError:
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

@app.post("/api/generate-flashcards", response_model=FlashcardResponse)
async def generate_flashcards(request: FlashcardRequest):
    """
    Generate flashcards from video transcript and summary
    """
    try:
        from models.transcript import Transcript
        
        # Create a transcript object
        transcript = Transcript(
            video_id=request.video_id,
            text=request.transcript,
            language="en",
            timestamps=[]
        )
        
        # Generate flashcards using AI service
        flashcards = await ai_service.generate_flashcards(
            transcript=transcript,
            summary=request.summary,
            num_cards=10  # Default to 10 flashcards
        )
        
        return {"flashcards": flashcards, "status": "success"}
        
    except Exception as e:
        logger.error(f"Error generating flashcards: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating flashcards: {str(e)}")

@app.get("/export/{video_id}")
async def export_notes(video_id: str, format: str = "pdf"):
    """
    Export study materials in various formats
    """
    try:
        # In a real implementation, this would generate and return a downloadable file
        # For now, just return a success message
        return {"status": "success", "message": f"Exporting notes for video {video_id} in {format} format"}
    except Exception as e:
        logger.error(f"Error exporting notes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
