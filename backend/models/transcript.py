from pydantic import BaseModel, HttpUrl
from typing import List

class TranscriptSegment(BaseModel):
    """Individual transcript segment with text, start time, and duration"""
    text: str
    start: float
    duration: float

class TranscriptRequest(BaseModel):
    """Request model for transcript endpoint"""
    url: HttpUrl

class TranscriptResponse(BaseModel):
    """Response model for transcript endpoint"""
    video_id: str
    transcript: List[TranscriptSegment]

class TranscriptError(BaseModel):
    """Error response model"""
    error: str
