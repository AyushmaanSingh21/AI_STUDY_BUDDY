import json
import random
from typing import List, Dict, Any
import google.generativeai as genai
import os
from models.video_analysis import Quiz, QuizQuestion, Summary, Transcript

class QuizService:
    """Service for generating quizzes and flashcards from video content using Google Gemini"""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def generate_quizzes(self, transcript: Transcript, summary: Summary) -> List[Quiz]:
        """
        Generate multiple quizzes from video content
        """
        try:
            quizzes = []
            
            # Generate a comprehensive quiz
            comprehensive_quiz = await self._generate_comprehensive_quiz(transcript, summary)
            quizzes.append(comprehensive_quiz)
            
            # Generate topic-specific quizzes if there are multiple topics
            if len(summary.main_topics) > 1:
                topic_quizzes = await self._generate_topic_quizzes(transcript, summary)
                quizzes.extend(topic_quizzes)
            
            return quizzes
            
        except Exception as e:
            raise Exception(f"Failed to generate quizzes: {str(e)}")
    
    async def _generate_comprehensive_quiz(self, transcript: Transcript, summary: Summary) -> Quiz:
        """
        Generate a comprehensive quiz covering the entire video
        """
        prompt = f"""
        Create a comprehensive quiz based on this educational video content.
        
        Video Summary:
        Overview: {summary.overview}
        Key Points: {', '.join(summary.key_points)}
        Main Topics: {', '.join(summary.main_topics)}
        Difficulty: {summary.difficulty_level}
        
        Transcript (first 3000 characters):
        {transcript.full_text[:3000]}
        
        Generate 5-8 multiple choice questions that:
        1. Test understanding of key concepts
        2. Cover different difficulty levels (easy, medium, hard)
        3. Include practical application questions
        4. Have clear, unambiguous answers
        5. Provide helpful explanations for correct answers
        
        Return as JSON:
        {{
            "title": "Comprehensive Quiz",
            "description": "Test your understanding of the entire video content",
            "questions": [
                {{
                    "question": "Question text here?",
                    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
                    "correct_answer": "A. Option 1",
                    "explanation": "Explanation of why this is correct",
                    "difficulty": "easy|medium|hard",
                    "topic": "Topic name"
                }}
            ],
            "total_questions": 5,
            "estimated_time": 10
        }}
        
        Make questions engaging and educational.
        """
        
        response = self._make_gemini_call(prompt)
        
        try:
            quiz_data = json.loads(response)
            return Quiz(**quiz_data)
        except json.JSONDecodeError:
            return self._create_fallback_quiz("Comprehensive Quiz", summary)
    
    async def _generate_topic_quizzes(self, transcript: Transcript, summary: Summary) -> List[Quiz]:
        """
        Generate topic-specific quizzes
        """
        quizzes = []
        
        for topic in summary.main_topics[:3]:  # Limit to 3 topics to avoid too many quizzes
            prompt = f"""
            Create a focused quiz for the topic: "{topic}"
            
            Video Summary:
            Overview: {summary.overview}
            Key Points: {', '.join(summary.key_points)}
            Difficulty: {summary.difficulty_level}
            
            Transcript (first 2000 characters):
            {transcript.full_text[:2000]}
            
            Generate 3-5 multiple choice questions specifically about "{topic}" that:
            1. Test deep understanding of this specific topic
            2. Include both theoretical and practical questions
            3. Have clear, correct answers
            4. Provide helpful explanations
            
            Return as JSON:
            {{
                "title": "{topic} Quiz",
                "description": "Test your knowledge of {topic}",
                "questions": [
                    {{
                        "question": "Question about {topic}?",
                        "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
                        "correct_answer": "A. Option 1",
                        "explanation": "Explanation",
                        "difficulty": "medium",
                        "topic": "{topic}"
                    }}
                ],
                "total_questions": 3,
                "estimated_time": 5
            }}
            """
            
            try:
                response = self._make_gemini_call(prompt)
                quiz_data = json.loads(response)
                quizzes.append(Quiz(**quiz_data))
            except (json.JSONDecodeError, Exception):
                # Skip this topic if generation fails
                continue
        
        return quizzes
    
    async def generate_flashcards(self, transcript: Transcript, summary: Summary) -> List[Dict[str, str]]:
        """
        Generate flashcards for quick revision
        """
        prompt = f"""
        Create flashcards based on this educational content.
        
        Video Summary:
        Overview: {summary.overview}
        Key Points: {', '.join(summary.key_points)}
        Main Topics: {', '.join(summary.main_topics)}
        
        Transcript (first 2000 characters):
        {transcript.full_text[:2000]}
        
        Generate 10-15 flashcards in this format:
        [
            {{
                "front": "Question or concept",
                "back": "Answer or explanation"
            }}
        ]
        
        Focus on:
        - Key definitions
        - Important concepts
        - Quick facts
        - Common misconceptions
        """
        
        try:
            response = self._make_gemini_call(prompt)
            flashcards = json.loads(response)
            return flashcards
        except (json.JSONDecodeError, Exception):
            return self._create_fallback_flashcards(summary)
    
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
    
    def _create_fallback_quiz(self, title: str, summary: Summary) -> Quiz:
        """
        Create a basic quiz when AI generation fails
        """
        questions = []
        
        # Create simple questions based on key points
        for i, point in enumerate(summary.key_points[:5]):
            question = QuizQuestion(
                question=f"What is the main focus of: {point}?",
                options=[
                    f"A. {point}",
                    f"B. Something else",
                    f"C. Not related",
                    f"D. Opposite of {point}"
                ],
                correct_answer=f"A. {point}",
                explanation=f"This question tests understanding of {point}",
                difficulty="medium",
                topic="General"
            )
            questions.append(question)
        
        return Quiz(
            title=title,
            description="Basic quiz based on video content",
            questions=questions,
            total_questions=len(questions),
            estimated_time=len(questions) * 2
        )
    
    def _create_fallback_flashcards(self, summary: Summary) -> List[Dict[str, str]]:
        """
        Create basic flashcards when AI generation fails
        """
        flashcards = []
        
        for point in summary.key_points[:10]:
            flashcards.append({
                "front": f"What is {point}?",
                "back": f"Key concept: {point}"
            })
        
        return flashcards
    
    def validate_quiz_answers(self, quiz: Quiz, user_answers: Dict[int, str]) -> Dict[str, Any]:
        """
        Validate quiz answers and provide feedback
        """
        results = {
            "total_questions": len(quiz.questions),
            "correct_answers": 0,
            "score_percentage": 0,
            "feedback": []
        }
        
        for i, question in enumerate(quiz.questions):
            user_answer = user_answers.get(i, "")
            is_correct = user_answer.strip() == question.correct_answer.strip()
            
            if is_correct:
                results["correct_answers"] += 1
            
            feedback = {
                "question_index": i,
                "user_answer": user_answer,
                "correct_answer": question.correct_answer,
                "is_correct": is_correct,
                "explanation": question.explanation
            }
            results["feedback"].append(feedback)
        
        results["score_percentage"] = (results["correct_answers"] / results["total_questions"]) * 100
        
        return results
