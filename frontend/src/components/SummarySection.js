import React from 'react';
import { BookOpen, Download, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const SummarySection = ({ summary }) => {
  const handleDownloadNotes = () => {
    const notesContent = `
Video Summary Notes

SUMMARY:
${summary.clean_summary}

DIFFICULTY LEVEL: ${summary.difficulty_level}
ESTIMATED READING TIME: ${summary.estimated_reading_time} minutes

STUDY TIPS:
• Review the summary to understand the main concepts
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

      {/* Clean Summary */}
      <div className="mb-6 flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <span>Video Summary</span>
        </h3>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <p className="text-gray-700 leading-relaxed text-base">
            {summary.clean_summary}
          </p>
        </div>
      </div>

      {/* Video Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <div className="text-2xl font-bold text-green-600 capitalize">
            {summary.difficulty_level}
          </div>
          <p className="text-sm text-gray-600">Difficulty Level</p>
        </div>
        
        <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {summary.estimated_reading_time}
          </div>
          <p className="text-sm text-gray-600">Min Read</p>
        </div>
      </div>

      {/* Study Tips */}
      <div className="mt-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Study Tips</h3>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <span>Review the summary to understand main concepts</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <span>Use timestamps to jump to specific sections</span>
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
