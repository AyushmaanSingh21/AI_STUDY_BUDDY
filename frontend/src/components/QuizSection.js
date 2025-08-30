import React, { useState } from 'react';
import { Brain, CheckCircle, XCircle, Trophy, Clock, Target } from 'lucide-react';

const QuizSection = ({ quizzes }) => {
  const [selectedQuiz, setSelectedQuiz] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  const currentQuiz = quizzes[selectedQuiz];

  const handleAnswerSelect = (questionIndex, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    const results = calculateResults(currentQuiz, userAnswers);
    setQuizResults(results);
    setShowResults(true);
  };

  const calculateResults = (quiz, answers) => {
    let correctAnswers = 0;
    const feedback = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correct_answer;
      
      if (isCorrect) {
        correctAnswers++;
      }

      feedback.push({
        questionIndex: index,
        userAnswer: userAnswer || 'Not answered',
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation
      });
    });

    return {
      totalQuestions: quiz.questions.length,
      correctAnswers,
      scorePercentage: Math.round((correctAnswers / quiz.questions.length) * 100),
      feedback
    };
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setShowResults(false);
    setQuizResults(null);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent! You have a great understanding of this topic.';
    if (percentage >= 80) return 'Great job! You have a solid understanding of this topic.';
    if (percentage >= 60) return 'Good work! You have a basic understanding, but there\'s room for improvement.';
    return 'Keep studying! Review the material and try again.';
  };

  return (
    <div className="space-y-6">
      {/* Quiz Selection */}
      {quizzes.length > 1 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Quiz</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedQuiz(index);
                  resetQuiz();
                }}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedQuiz === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Target className="w-3 h-3" />
                    <span>{quiz.total_questions} questions</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{quiz.estimated_time} min</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Quiz */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentQuiz.title}</h2>
            <p className="text-gray-600">{currentQuiz.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {Object.keys(userAnswers).length} / {currentQuiz.questions.length} answered
            </div>
            <div className="text-sm text-gray-500">
              Estimated time: {currentQuiz.estimated_time} minutes
            </div>
          </div>
        </div>

        {!showResults ? (
          <div className="space-y-8">
            {currentQuiz.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{questionIndex + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                            userAnswers[questionIndex] === option
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={option}
                            checked={userAnswers[questionIndex] === option}
                            onChange={() => handleAnswerSelect(questionIndex, option)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={resetQuiz}
                className="btn-secondary"
              >
                Reset Quiz
              </button>
              
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userAnswers).length < currentQuiz.questions.length}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="text-center space-y-4">
              <div className={`text-6xl font-bold ${getScoreColor(quizResults.scorePercentage)}`}>
                {quizResults.scorePercentage}%
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {getScoreMessage(quizResults.scorePercentage)}
              </h3>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <span>{quizResults.correctAnswers} out of {quizResults.totalQuestions} correct</span>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Question Review</h4>
              {quizResults.feedback.map((feedback, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    {feedback.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">
                        Question {index + 1}
                      </h5>
                      <p className="text-gray-700 mt-1">
                        {currentQuiz.questions[index].question}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Your answer:</span>
                      <p className={`mt-1 ${feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback.userAnswer}
                      </p>
                    </div>
                    {!feedback.isCorrect && (
                      <div>
                        <span className="font-medium text-gray-700">Correct answer:</span>
                        <p className="text-green-600 mt-1">{feedback.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-700">Explanation:</span>
                    <p className="text-gray-700 mt-1">{feedback.explanation}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={resetQuiz}
                className="btn-secondary"
              >
                Try Again
              </button>
              
              {selectedQuiz < quizzes.length - 1 && (
                <button
                  onClick={() => {
                    setSelectedQuiz(selectedQuiz + 1);
                    resetQuiz();
                  }}
                  className="btn-primary"
                >
                  Next Quiz
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Study Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">🧠 Quiz Tips</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Read each question carefully before selecting your answer</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Review the explanations to understand why answers are correct or incorrect</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Use the quiz results to identify areas that need more study</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Take multiple quizzes to reinforce your learning</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default QuizSection;
