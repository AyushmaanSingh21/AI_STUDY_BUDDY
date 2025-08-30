import os
import json
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from models.video_analysis import Summary, Timestamp, Transcript

class AIService:
    """Service for AI-powered content analysis and generation using Google Gemini"""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    async def generate_summary(self, transcript: Transcript, depth: str = "medium") -> Summary:
        """
        Generate a clean, concise summary of the video content
        """
        try:
            # Prepare the prompt based on depth
            depth_instructions = {
                "short": "Create a very brief summary (around 50-75 words)",
                "medium": "Create a concise summary (around 100 words)",
                "detailed": "Create a comprehensive summary (around 125-150 words)"
            }
            
            prompt = f"""
            Analyze this video transcript and create a single, clean summary paragraph.
            
            {depth_instructions.get(depth, depth_instructions["medium"])}
            
            Transcript:
            {transcript.full_text[:4000]}  # Limit to avoid token limits
            
            Requirements:
            - Write in clear, simple language
            - Focus on the main content and key takeaways
            - Do not include section titles or bullet points
            - Write as a flowing paragraph
            - Make it educational and easy to understand
            - Avoid technical jargon unless necessary
            
            Return your response as a single paragraph of text, nothing else.
            """
            
            response = self._make_gemini_call(prompt)
            
            # Clean the response to ensure it's just the summary text
            clean_summary = response.strip()
            
            # Analyze difficulty and reading time
            difficulty = await self.analyze_difficulty(transcript)
            reading_time = max(1, transcript.word_count // 200)  # Rough estimate: 200 words per minute
            
            return Summary(
                clean_summary=clean_summary,
                difficulty_level=difficulty,
                estimated_reading_time=reading_time
            )
                
        except Exception as e:
            raise Exception(f"Failed to generate summary: {str(e)}")
    
    async def generate_timestamps(self, transcript: Transcript) -> List[Timestamp]:
        """
        Generate topic-based timestamps from transcript
        """
        try:
            # Group transcript segments into topics
            topics = await self._identify_topics(transcript)
            
            timestamps = []
            for topic in topics:
                timestamp = Timestamp(
                    time=self._format_time(topic["start_time"]),
                    seconds=int(topic["start_time"]),
                    topic=topic["title"],
                    description=topic["description"],
                    keywords=topic["keywords"]
                )
                timestamps.append(timestamp)
            
            return timestamps
            
        except Exception as e:
            raise Exception(f"Failed to generate timestamps: {str(e)}")
    
    async def _identify_topics(self, transcript: Transcript) -> List[Dict[str, Any]]:
        """
        Identify topics and their timestamps from transcript
        """
        # Create chunks of transcript for analysis
        chunks = self._create_transcript_chunks(transcript)
        
        prompt = f"""
        Analyze these transcript chunks and identify distinct topics with their timestamps.
        
        Transcript chunks:
        {json.dumps(chunks, indent=2)}
        
        For each topic, provide:
        - title: A clear, concise topic name
        - start_time: The timestamp when this topic begins (in seconds)
        - description: A brief description of what's covered
        - keywords: 3-5 relevant keywords
        
        Return as JSON array:
        [
            {{
                "title": "Topic Name",
                "start_time": 120,
                "description": "Description of the topic",
                "keywords": ["keyword1", "keyword2", "keyword3"]
            }}
        ]
        
        Focus on natural topic transitions and educational value.
        """
        
        response = self._make_gemini_call(prompt)
        
        try:
            topics = json.loads(response)
            return topics
        except json.JSONDecodeError:
            # Fallback: create basic timestamps
            return self._create_fallback_timestamps(transcript)
    
    def _create_transcript_chunks(self, transcript: Transcript, chunk_size: int = 1000) -> List[Dict[str, Any]]:
        """
        Create manageable chunks of transcript for analysis
        """
        chunks = []
        current_chunk = {"text": "", "start_time": 0, "end_time": 0}
        
        for segment in transcript.segments:
            if len(current_chunk["text"]) + len(segment.text) > chunk_size:
                # Save current chunk
                current_chunk["end_time"] = segment.start
                chunks.append(current_chunk)
                
                # Start new chunk
                current_chunk = {
                    "text": segment.text,
                    "start_time": segment.start,
                    "end_time": segment.end
                }
            else:
                current_chunk["text"] += " " + segment.text
                current_chunk["end_time"] = segment.end
        
        # Add final chunk
        if current_chunk["text"]:
            chunks.append(current_chunk)
        
        return chunks
    
    def _format_time(self, seconds: float) -> str:
        """
        Convert seconds to MM:SS format
        """
        minutes = int(seconds // 60)
        remaining_seconds = int(seconds % 60)
        return f"{minutes:02d}:{remaining_seconds:02d}"
    
    def _make_gemini_call(self, prompt: str) -> str:
        """
        Make a call to Gemini API
        """
        try:
            response = self.model.generate_content(prompt)
            
            if response.text:
                return response.text.strip()
            else:
                raise Exception("Empty response from Gemini API")
            
        except Exception as e:
            raise Exception(f"Gemini API call failed: {str(e)}")
    
    def _create_fallback_summary(self, transcript: Transcript) -> Summary:
        """
        Create a basic summary when AI generation fails
        """
        # Create a simple fallback summary
        fallback_text = f"This video covers various topics discussed in the transcript. The content appears to be educational in nature and provides information on the subject matter covered throughout the video."
        
        return Summary(
            clean_summary=fallback_text,
            difficulty_level="intermediate",
            estimated_reading_time=max(1, transcript.word_count // 200)
        )
    
    def _create_fallback_timestamps(self, transcript: Transcript) -> List[Timestamp]:
        """
        Create basic timestamps when AI generation fails
        """
        timestamps = []
        chunk_size = len(transcript.segments) // 5  # 5 segments
        
        for i in range(0, len(transcript.segments), chunk_size):
            chunk = transcript.segments[i:i + chunk_size]
            if chunk:
                start_time = chunk[0].start
                end_time = chunk[-1].end
                
                timestamp = Timestamp(
                    time=self._format_time(start_time),
                    seconds=int(start_time),
                    topic=f"Section {i // chunk_size + 1}",
                    description=f"Content from {self._format_time(start_time)} to {self._format_time(end_time)}",
                    keywords=["content", "section", "video"]
                )
                timestamps.append(timestamp)
        
        return timestamps
    
    async def analyze_difficulty(self, transcript: Transcript) -> str:
        """
        Analyze the difficulty level of the content
        """
        prompt = f"""
        Analyze this educational content and determine its difficulty level.
        
        Content:
        {transcript.full_text[:2000]}
        
        Classify as: beginner, intermediate, or advanced.
        
        Consider:
        - Technical terminology used
        - Complexity of concepts
        - Assumed prior knowledge
        - Pace of explanation
        
        Return only the difficulty level (beginner/intermediate/advanced).
        """
        
        try:
            response = self._make_gemini_call(prompt)
            difficulty = response.lower().strip()
            
            if difficulty in ["beginner", "intermediate", "advanced"]:
                return difficulty
            else:
                return "intermediate"  # Default
                
        except Exception:
            return "intermediate"  # Default fallback
