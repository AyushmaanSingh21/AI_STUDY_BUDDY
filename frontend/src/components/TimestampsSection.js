import React, { useState } from 'react';
import { Clock, Play, Tag, Search, Filter, Target, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const TimestampsSection = ({ timestamps, videoId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');

  // Get unique topics for filtering
  const topics = ['all', ...new Set(timestamps.map(ts => ts.topic))];

  // Filter timestamps based on search and topic
  const filteredTimestamps = timestamps.filter(timestamp => {
    const matchesSearch = timestamp.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timestamp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timestamp.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTopic = selectedTopic === 'all' || timestamp.topic === selectedTopic;
    
    return matchesSearch && matchesTopic;
  });

  const handleTimestampClick = (timestamp) => {
    // Open YouTube video at specific timestamp
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}&t=${timestamp.seconds}`;
    window.open(youtubeUrl, '_blank');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Timestamps</h2>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search timestamps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            {topics.map(topic => (
              <option key={topic} value={topic}>
                {topic === 'all' ? 'All Topics' : topic}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timestamps List */}
      <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
        {filteredTimestamps.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No timestamps found</h3>
            <p className="text-gray-600 text-sm">
              {searchTerm || selectedTopic !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No timestamps available for this video'
              }
            </p>
          </div>
        ) : (
          filteredTimestamps.map((timestamp, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-gray-50/50"
              onClick={() => handleTimestampClick(timestamp)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Topic Badge */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                      {timestamp.topic}
                    </span>
                  </div>
                  
                  {/* Time and Play Button */}
                  <div className="flex items-center space-x-2 mb-2">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Play className="w-4 h-4" />
                      <span className="text-sm font-semibold">{timestamp.time}</span>
                    </motion.button>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                    {timestamp.description}
                  </p>
                  
                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1">
                    {timestamp.keywords.slice(0, 3).map((keyword, keywordIndex) => (
                      <span
                        key={keywordIndex}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {keyword}
                      </span>
                    ))}
                    {timestamp.keywords.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{timestamp.keywords.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="ml-3 text-right">
                  <div className="text-xs text-gray-500 font-mono">
                    {formatTime(timestamp.seconds)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900">{timestamps.length}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{topics.length - 1}</p>
            <p className="text-xs text-gray-600">Topics</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {Math.floor(timestamps.reduce((acc, ts) => acc + ts.seconds, 0) / 60)}:{(timestamps.reduce((acc, ts) => acc + ts.seconds, 0) % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-gray-600">Duration</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">💡 How to Use</h3>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 border border-green-200">
          <ul className="space-y-1 text-gray-700 text-xs">
            <li>• Click timestamps to jump to video sections</li>
            <li>• Use search to find specific topics</li>
            <li>• Filter by topic to focus on areas</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default TimestampsSection;
