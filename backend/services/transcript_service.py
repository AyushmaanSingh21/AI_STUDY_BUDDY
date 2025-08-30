import re
from urllib.parse import urlparse, parse_qs
from typing import Optional, List
import yt_dlp
from models.transcript import TranscriptSegment

class TranscriptService:
    """Service for fetching YouTube video transcripts"""
    
    def __init__(self):
        # Configure yt-dlp options for transcript extraction
        self.ydl_opts = {
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['en'],
            'skip_download': True,  # Don't download video, just extract info
            'quiet': True,
        }
    
    def extract_video_id(self, url: str) -> str:
        """
        Extract YouTube video ID from full link
        """
        parsed_url = urlparse(url)
        if parsed_url.hostname == "youtu.be":
            return parsed_url.path[1:]
        if parsed_url.hostname in ("www.youtube.com", "youtube.com"):
            if parsed_url.path == "/watch":
                return parse_qs(parsed_url.query)["v"][0]
            if parsed_url.path.startswith("/embed/"):
                return parsed_url.path.split("/")[2]
            if parsed_url.path.startswith("/v/"):
                return parsed_url.path.split("/")[2]
        raise ValueError("Invalid YouTube URL")
    
    def get_transcript(self, video_id: str) -> List[TranscriptSegment]:
        """
        Fetch transcript from YouTube using yt-dlp
        """
        try:
            # Construct full YouTube URL
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            
            # Use yt-dlp to extract video info including transcripts
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                
                # Check if automatic captions are available
                if 'automatic_captions' in info and 'en' in info['automatic_captions']:
                    # Get the first available English automatic caption
                    caption_url = info['automatic_captions']['en'][0]['url']
                    transcript_data = self._download_caption(caption_url)
                elif 'subtitles' in info and 'en' in info['subtitles']:
                    # Get the first available English subtitle
                    caption_url = info['subtitles']['en'][0]['url']
                    transcript_data = self._download_caption(caption_url)
                else:
                    raise ValueError("No English transcript available for this video")
                
                # Convert to our format
                segments = []
                for segment in transcript_data:
                    transcript_segment = TranscriptSegment(
                        text=segment['text'],
                        start=segment['start'],
                        duration=segment['duration']
                    )
                    segments.append(transcript_segment)
                
                return segments
                
        except Exception as e:
            raise Exception(f"Failed to fetch transcript: {str(e)}")
    
    def _download_caption(self, caption_url: str) -> List[dict]:
        """
        Download and parse caption data from URL
        """
        try:
            import requests
            
            response = requests.get(caption_url)
            response.raise_for_status()
            
            # Caption data is typically in JSON format
            
            # Try different parsing methods
            caption_data = self._parse_caption_data(response.text)
            return caption_data
            
        except Exception as e:
            raise Exception(f"Failed to download caption: {str(e)}")
    
    def _parse_caption_data(self, content: str) -> List[dict]:
        """
        Parse caption data in various formats (XML, JSON, etc.)
        """
        try:
            # First try to parse as XML
            return self._parse_caption_xml(content)
        except:
            try:
                # Try to parse as JSON
                return self._parse_caption_json(content)
            except:
                # Try to parse as plain text with timestamps
                return self._parse_caption_text(content)
    
    def _parse_caption_xml(self, xml_content: str) -> List[dict]:
        """
        Parse caption XML and convert to segment format
        """
        try:
            import xml.etree.ElementTree as ET
            
            # Parse XML content
            root = ET.fromstring(xml_content)
            
            segments = []
            for text_element in root.findall('.//text'):
                start = float(text_element.get('start', 0))
                duration = float(text_element.get('dur', 0))
                text = text_element.text or ""
                
                if text.strip():  # Only add non-empty segments
                    segments.append({
                        'text': text.strip(),
                        'start': start,
                        'duration': duration
                    })
            
            return segments
            
        except Exception as e:
            raise Exception(f"Failed to parse caption XML: {str(e)}")
    
    def _parse_caption_json(self, json_content: str) -> List[dict]:
        """
        Parse caption JSON and convert to segment format
        """
        try:
            import json
            
            data = json.loads(json_content)
            segments = []
            
            # Handle different JSON formats
            if 'events' in data:
                for event in data['events']:
                    if 'segs' in event:
                        text = ''.join([seg.get('utf8', '') for seg in event['segs']])
                        if text.strip():
                            segments.append({
                                'text': text.strip(),
                                'start': event.get('tStartMs', 0) / 1000.0,
                                'duration': event.get('dDurationMs', 0) / 1000.0
                            })
            
            return segments
            
        except Exception as e:
            raise Exception(f"Failed to parse caption JSON: {str(e)}")
    
    def _parse_caption_text(self, text_content: str) -> List[dict]:
        """
        Parse plain text caption format
        """
        try:
            segments = []
            lines = text_content.strip().split('\n')
            
            current_text = ""
            current_start = 0.0
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Try to extract timestamp and text
                if '-->' in line:  # SRT format
                    parts = line.split('-->')
                    if len(parts) == 2:
                        start_time = self._parse_time(parts[0].strip())
                        end_time = self._parse_time(parts[1].strip())
                        duration = end_time - start_time
                        
                        if current_text:
                            segments.append({
                                'text': current_text.strip(),
                                'start': current_start,
                                'duration': duration
                            })
                            current_text = ""
                            current_start = start_time
                else:
                    current_text += " " + line
            
            # Add the last segment
            if current_text:
                segments.append({
                    'text': current_text.strip(),
                    'start': current_start,
                    'duration': 2.0  # Default duration
                })
            
            return segments
            
        except Exception as e:
            raise Exception(f"Failed to parse caption text: {str(e)}")
    
    def _parse_time(self, time_str: str) -> float:
        """
        Parse time string in format HH:MM:SS,mmm to seconds
        """
        try:
            # Handle format like "00:00:15,000"
            time_parts = time_str.replace(',', '.').split(':')
            hours = int(time_parts[0])
            minutes = int(time_parts[1])
            seconds = float(time_parts[2])
            
            return hours * 3600 + minutes * 60 + seconds
        except:
            return 0.0
    
    def validate_video_url(self, url: str) -> bool:
        """
        Validate if the URL is a valid YouTube video URL
        """
        try:
            self.extract_video_id(url)
            return True
        except ValueError:
            return False
