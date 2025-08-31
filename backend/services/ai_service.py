import os
import json
import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from models.video_analysis import Summary, Timestamp, Transcript

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    """Service for AI-powered content analysis and generation using Google Gemini"""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        logger.info(f"GEMINI_API_KEY loaded: {'Yes' if api_key else 'No'}")
        if not api_key:
            logger.error("GEMINI_API_KEY environment variable is required")
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
                if isinstance(topic, dict):
                    # Handle dictionary input
                    timestamp = Timestamp(
                        time=self._format_time(topic.get("start_time", 0)),
                        seconds=int(topic.get("start_time", 0)),
                        topic=topic.get("title", "Untitled"),
                        description=topic.get("description", ""),
                        keywords=topic.get("keywords", [])
                    )
                    timestamps.append(timestamp)
                elif hasattr(topic, 'model_dump'):  # Pydantic v2
                    # Convert to dict and create new Timestamp
                    topic_dict = topic.model_dump()
                    timestamp = Timestamp(
                        time=self._format_time(topic_dict.get("seconds", 0)),
                        seconds=int(topic_dict.get("seconds", 0)),
                        topic=topic_dict.get("topic", "Untitled"),
                        description=topic_dict.get("description", ""),
                        keywords=topic_dict.get("keywords", [])
                    )
                    timestamps.append(timestamp)
                elif hasattr(topic, 'dict'):  # Pydantic v1
                    # Convert to dict and create new Timestamp
                    topic_dict = topic.dict()
                    timestamp = Timestamp(
                        time=self._format_time(topic_dict.get("seconds", 0)),
                        seconds=int(topic_dict.get("seconds", 0)),
                        topic=topic_dict.get("topic", "Untitled"),
                        description=topic_dict.get("description", ""),
                        keywords=topic_dict.get("keywords", [])
                    )
                    timestamps.append(timestamp)
                elif isinstance(topic, Timestamp):
                    # If it's already a Timestamp object, use it directly
                    timestamps.append(topic)
            
            # Sort timestamps by seconds
            timestamps.sort(key=lambda x: x.seconds)
            
            return timestamps
            
        except Exception as e:
            logger.error(f"Error in generate_timestamps: {str(e)}")
            logger.exception("Full traceback:")
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
    
    async def _call_gemini_api(self, prompt: str) -> str:
        """
        Make a call to Gemini API
        """
        try:
            response = self.model.generate_content(prompt)
            
            if response.text:
                return response.text.strip()
            else:
                logger.error("No text in Gemini API response")
                raise Exception("No response content from AI model")
                
        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
            raise Exception(f"AI service error: {str(e)}")
    
    async def generate_flashcards(self, transcript: Transcript, summary: str, num_cards: int = 10) -> List[Dict[str, str]]:
        """
        Generate flashcards from video transcript and summary
        
        Args:
            transcript: The transcript object containing text and timestamps
            summary: The generated summary of the video
            num_cards: Number of flashcard pairs to generate (default: 10)
            
        Returns:
            List of flashcard dictionaries with 'term' and 'definition' keys
        """
        try:
            # Prepare the prompt for flashcard generation
            prompt = f"""
            Based on the following video transcript and summary, create {num_cards} high-quality flashcards.
            Each flashcard should have a clear term or question (front) and a detailed definition or answer (back).
            Focus on key concepts, important facts, and technical terms from the content.
            
            Summary: {summary}
            
            Transcript: {transcript.text[:4000]}  # Using first 4000 chars for context
            
            Return the flashcards as a JSON array of objects with 'term' and 'definition' keys.
            Example:
            [
                {{
                    "term": "What is photosynthesis?",
                    "definition": "The process by which green plants use sunlight to synthesize foods with the help of chlorophyll."
                }},
                ...
            ]
            """
            
            # Generate the response
            response = await self._call_gemini_api(prompt)
            
            # Parse the response
            try:
                # Extract JSON from markdown code block if present
                if '```json' in response:
                    response = response.split('```json')[1].split('```')[0].strip()
                elif '```' in response:
                    response = response.split('```')[1].strip()
                
                flashcards = json.loads(response)
                if not isinstance(flashcards, list):
                    raise ValueError("Expected a list of flashcards")
                
                # Validate each flashcard
                valid_flashcards = []
                for card in flashcards:
                    if isinstance(card, dict) and 'term' in card and 'definition' in card:
                        valid_flashcards.append({
                            'term': str(card['term']).strip(),
                            'definition': str(card['definition']).strip()
                        })
                
                return valid_flashcards[:num_cards]  # Ensure we don't return more than requested
                
            except (json.JSONDecodeError, KeyError, AttributeError) as e:
                logger.error(f"Error parsing flashcards: {e}")
                # Fallback to generating simple term-definition pairs
                return self._generate_simple_flashcards(transcript.text, num_cards)
                
        except Exception as e:
            logger.error(f"Error generating flashcards: {e}")
            # Fallback to generating simple term-definition pairs
            return self._generate_simple_flashcards(transcript.text, num_cards)
    
    def _generate_simple_flashcards(self, text: str, num_cards: int) -> List[Dict[str, str]]:
        """Fallback method to generate simple flashcards from text"""
        import re
        from collections import Counter
        
        # Extract potential terms (capitalized words or phrases in quotes)
        terms = re.findall(r'"([^"]+)"|([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', text)
        terms = [term[0] or term[1] for term in terms if any(term)]
        
        # Get most common terms
        common_terms = [term for term, _ in Counter(terms).most_common(num_cards)]
        
        # Create simple flashcards
        flashcards = []
        for term in common_terms:
            # Find the sentence containing the term as a simple definition
            sentences = re.split(r'(?<=[.!?])\s+', text)
            for sentence in sentences:
                if term in sentence and len(sentence) > len(term) + 10:  # Ensure some context
                    flashcards.append({
                        'term': term,
                        'definition': sentence.strip()
                    })
                    break
        
        return flashcards[:num_cards]

    async def generate_notes(self, transcript: Transcript, summary: Summary, timestamps: List[Timestamp]) -> str:
        """
        Generate structured study notes from the video content
        
        Args:
            transcript: The video transcript
            summary: Generated summary of the video
            timestamps: List of timestamps with topics
            
        Returns:
            str: Formatted markdown notes
        """
        try:
            # Prepare the prompt for note generation
            prompt = f"""
            Create comprehensive study notes from the following video content.
            
            Video Summary:
            {summary.clean_summary}
            
            Key Topics (with timestamps):
            {"\n".join([f"- {ts.time} - {ts.topic}: {ts.description}" for ts in timestamps])}
            
            Transcript (first 2000 chars for context):
            {transcript.full_text[:2000]}
            
            Generate well-structured study notes in Markdown format with the following sections:
            1. # Video Summary
               - Brief overview of main points
               - Key takeaways
            
            2. # Detailed Notes
               - Organized by main topics
               - Include key concepts, definitions, and examples
               - Use bullet points and sub-bullets for better readability
            
            3. # Key Terms & Definitions
               - Important terms with their definitions
               - Format as a definition list
            
            4. # Action Items
               - Key actions or steps to take
               - Follow-up tasks
            
            Make the notes clear, concise, and well-organized for effective studying.
            """
            
            # Call the AI to generate notes
            notes = await self._call_gemini_api(prompt)
            
            # Add a header with metadata
            formatted_notes = f"""
# Study Notes
*Generated from video content*

**Difficulty Level**: {summary.difficulty_level.capitalize()}  
**Estimated Reading Time**: {summary.estimated_reading_time} minutes

---

{notes}

*Notes generated on {datetime.now().strftime('%Y-%m-%d %H:%M')}*
"""
            return formatted_notes.strip()
            
        except Exception as e:
            logger.error(f"Error generating notes: {str(e)}")
            # Fallback to a simple note format if AI generation fails
            return f"""# Study Notes

## Video Summary
{summary.clean_summary}

## Key Topics
{"\n".join([f"- {ts.time} - {ts.topic}" for ts in timestamps])}

*Note: Could not generate detailed notes due to an error.*
"""
    
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
        try:
            if not transcript.segments:
                return []
                
            timestamps = []
            total_segments = len(transcript.segments)
            chunk_size = max(1, total_segments // 5)  # At least 1 segment per chunk
            
            for i in range(0, total_segments, chunk_size):
                chunk = transcript.segments[i:i + chunk_size]
                if not chunk:
                    continue
                    
                start_time = getattr(chunk[0], 'start', 0)
                end_time = getattr(chunk[-1], 'end', start_time + 60)  # Default 1min duration
                
                timestamp = Timestamp(
                    time=self._format_time(start_time),
                    seconds=int(start_time),
                    topic=f"Section {len(timestamps) + 1}",
                    description=f"Content from {self._format_time(start_time)} to {self._format_time(end_time)}",
                    keywords=["content", "section", "video"]
                )
                timestamps.append(timestamp)
            
            return timestamps
            
        except Exception as e:
            logger.error(f"Error in _create_fallback_timestamps: {str(e)}")
            return []
    
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
