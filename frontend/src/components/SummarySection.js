import React from 'react';
import { BookOpen, Clock, Target, CheckCircle } from 'lucide-react';

const SummarySection = ({ summary }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
        </div>
        <p className="text-gray-700 leading-relaxed text-lg">
          {summary.overview}
        </p>
      </div>

      {/* Key Points */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Key Points</h2>
        </div>
        <ul className="space-y-3">
          {summary.key_points.map((point, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-sm font-semibold">{index + 1}</span>
              </div>
              <span className="text-gray-700">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Topics */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Main Topics</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {summary.main_topics.map((topic, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Video Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Reading Time</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {summary.estimated_reading_time} min
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Estimated time to read through all materials
          </p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Difficulty Level</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getDifficultyColor(summary.difficulty_level)}`}>
            {summary.difficulty_level}
          </span>
          <p className="text-gray-600 text-sm mt-2">
            Recommended for {summary.difficulty_level} learners
          </p>
        </div>
      </div>

      {/* Study Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Study Tips</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Review the key points before diving into specific topics</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Use the timestamps to jump to sections you need to review</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Take the quizzes to test your understanding</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Focus on topics that match your current skill level</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SummarySection;
