import React, { useState } from 'react';
import { Brain, CheckCircle, XCircle, Trophy, Clock, Target, Zap, Star, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const getScoreEmoji = (percentage) => {
    if (percentage >= 90) return '🎉';
    if (percentage >= 80) return '🎯';
    if (percentage >= 60) return '👍';
    return '📚';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Quizzes</h2>
      </div>

      {/* Quiz Selection */}
      {quizzes.length > 1 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Quiz</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {quizzes.map((quiz, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedQuiz(index);
                  resetQuiz();
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedQuiz === index
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
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
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Current Quiz */}
      <div className="border-t border-gray-200 pt-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{currentQuiz.title}</h2>
            <p className="text-gray-600 text-sm">{currentQuiz.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {Object.keys(userAnswers).length} / {currentQuiz.questions.length} answered
            </div>
            <div className="text-sm text-gray-500">
              ~{currentQuiz.estimated_time} min
            </div>
          </div>
        </div>

        {!showResults ? (
          <div className="space-y-6 flex-1 overflow-y-auto min-h-0">
            {currentQuiz.questions.map((question, questionIndex) => (
              <motion.div 
                key={questionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: questionIndex * 0.1 }}
                className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors duration-200"
              >
                <div className="flex items-start space-x-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{questionIndex + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <motion.label
                          key={optionIndex}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            userAnswers[questionIndex] === option
                              ? 'border-purple-500 bg-purple-50 shadow-sm'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={option}
                            checked={userAnswers[questionIndex] === option}
                            onChange={() => handleAnswerSelect(questionIndex, option)}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </motion.label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetQuiz}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Reset Quiz
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userAnswers).length < currentQuiz.questions.length}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                Submit Quiz
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 flex-1 flex flex-col">
            {/* Results Summary */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-center space-y-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
            >
              <div className="text-6xl mb-2">{getScoreEmoji(quizResults.scorePercentage)}</div>
              <div className={`text-5xl font-bold ${getScoreColor(quizResults.scorePercentage)}`}>
                {quizResults.scorePercentage}%
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {getScoreMessage(quizResults.scorePercentage)}
              </h3>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{quizResults.correctAnswers} correct</span>
                </span>
                <span className="text-gray-400">•</span>
                <span>{quizResults.totalQuestions} total</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-4 mt-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetQuiz}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Try Again
              </motion.button>
              
              {selectedQuiz < quizzes.length - 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedQuiz(selectedQuiz + 1);
                    resetQuiz();
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Next Quiz
                </motion.button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quiz Tips */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">🧠 Quiz Tips</h3>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200">
          <ul className="space-y-1 text-gray-700 text-xs">
            <li>• Read questions carefully before answering</li>
            <li>• Review explanations to understand concepts</li>
            <li>• Use results to identify study areas</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizSection;
