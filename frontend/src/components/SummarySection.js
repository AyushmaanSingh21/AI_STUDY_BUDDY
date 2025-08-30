import React from 'react';
import { BookOpen, Download, CheckCircle, Sparkles, Target, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const SummarySection = ({ summary }) => {
  const handleDownloadNotes = () => {
    const notesContent = `
Video Summary Notes

OVERVIEW:
${summary.overview}

KEY POINTS:
${summary.key_points.map((point, index) => `${index + 1}. ${point}`).join('\n')}

MAIN TOPICS:
${summary.main_topics.join(', ')}

STUDY TIPS:
• Review the key points before diving into specific topics
• Use the timestamps to jump to sections you need to review
• Take the quizzes to test your understanding
• Focus on topics that match your current skill level
    `;

    const blob = new Blob([notesContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video-notes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Summary</h2>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadNotes}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Download</span>
        </motion.button>
      </div>

      {/* Overview */}
      <div className="mb-6 flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <span>Overview</span>
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          {summary.overview}
        </p>
      </div>

      {/* Key Points */}
      <div className="mb-6 flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Points</h3>
        <div className="space-y-3">
          {summary.key_points.map((point, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-3"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-sm font-semibold">{index + 1}</span>
              </div>
              <span className="text-gray-700">{point}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Topics */}
      <div className="mb-6 flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Main Topics</h3>
        <div className="flex flex-wrap gap-2">
          {summary.main_topics.map((topic, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
            >
              {topic}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Study Tips */}
      <div className="mt-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Study Tips</h3>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <span>Review key points before diving into specific topics</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <span>Use timestamps to jump to sections you need</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <span>Take quizzes to test your understanding</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default SummarySection;
