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
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    async def generate_quizzes(self, transcript: Transcript, summary: Summary) -> List[Quiz]:
        """
        Generate multiple quizzes from video content
        """
        try:
            quizzes = []
            
            # Generate a comprehensive quiz
            comprehensive_quiz = await self._generate_comprehensive_quiz(transcript, summary)
            quizzes.append(comprehensive_quiz)
            
            # Generate additional quizzes based on content complexity
            additional_quiz = await self._generate_additional_quiz(transcript, summary)
            if additional_quiz:
                quizzes.append(additional_quiz)
            
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
        {summary.clean_summary}
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
                    "topic": "General"
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
    
    async def _generate_additional_quiz(self, transcript: Transcript, summary: Summary) -> Quiz:
        """
        Generate an additional quiz focusing on specific aspects
        """
        prompt = f"""
        Create a focused quiz based on this educational video content.
        
        Video Summary:
        {summary.clean_summary}
        Difficulty: {summary.difficulty_level}
        
        Transcript (first 2000 characters):
        {transcript.full_text[:2000]}
        
        Generate 3-5 multiple choice questions that:
        1. Focus on practical applications
        2. Test deeper understanding
        3. Include scenario-based questions
        4. Have clear, correct answers
        5. Provide helpful explanations
        
        Return as JSON:
        {{
            "title": "Advanced Concepts Quiz",
            "description": "Test your deeper understanding of key concepts",
            "questions": [
                {{
                    "question": "Question about advanced concepts?",
                    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
                    "correct_answer": "A. Option 1",
                    "explanation": "Explanation",
                    "difficulty": "medium",
                    "topic": "Advanced Concepts"
                }}
            ],
            "total_questions": 3,
            "estimated_time": 5
        }}
        """
        
        try:
            response = self._make_gemini_call(prompt)
            quiz_data = json.loads(response)
            return Quiz(**quiz_data)
        except (json.JSONDecodeError, Exception):
            return None
    
    async def generate_flashcards(self, transcript: Transcript, summary: Summary) -> List[Dict[str, str]]:
        """
        Generate flashcards for quick revision
        """
        prompt = f"""
        Create flashcards based on this educational content.
        
        Video Summary:
        {summary.clean_summary}
        
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
        # Create simple questions based on the summary content
        questions = []
        
        # Split the summary into sentences and create questions
        summary_sentences = summary.clean_summary.split('. ')
        
        for i, sentence in enumerate(summary_sentences[:5]):
            if sentence.strip():
                question = QuizQuestion(
                    question=f"What is the main focus of this content?",
                    options=[
                        "A. Educational content",
                        "B. Entertainment",
                        "C. Technical documentation",
                        "D. News report"
                    ],
                    correct_answer="A. Educational content",
                    explanation=f"This question tests understanding of the video content",
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
        
        # Create flashcards based on the summary content
        summary_sentences = summary.clean_summary.split('. ')
        
        for i, sentence in enumerate(summary_sentences[:10]):
            if sentence.strip():
                flashcards.append({
                    "front": f"What is the main topic of this video?",
                    "back": f"Key concept: {sentence[:50]}..."
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
