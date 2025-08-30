import React, { useState } from 'react';
import { Clock, Play, Tag, Search } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="card">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Timestamps
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by topic, description, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="input-field"
            >
              {topics.map(topic => (
                <option key={topic} value={topic}>
                  {topic === 'all' ? 'All Topics' : topic}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timestamps List */}
      <div className="space-y-4">
        {filteredTimestamps.length === 0 ? (
          <div className="card text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No timestamps found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedTopic !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No timestamps available for this video'
              }
            </p>
          </div>
        ) : (
          filteredTimestamps.map((timestamp, index) => (
            <div key={index} className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTimestampClick(timestamp)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                      <Play className="w-4 h-4" />
                      <span className="text-lg">{timestamp.time}</span>
                    </button>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {timestamp.topic}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {timestamp.topic}
                  </h3>
                  
                  <p className="text-gray-600 mb-3">
                    {timestamp.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {timestamp.keywords.map((keyword, keywordIndex) => (
                      <span
                        key={keywordIndex}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="ml-4 text-right">
                  <div className="text-sm text-gray-500">
                    {formatTime(timestamp.seconds)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="card bg-gray-50">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{timestamps.length}</p>
            <p className="text-sm text-gray-600">Total Timestamps</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{topics.length - 1}</p>
            <p className="text-sm text-gray-600">Topics Covered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.floor(timestamps.reduce((acc, ts) => acc + ts.seconds, 0) / 60)}:{(timestamps.reduce((acc, ts) => acc + ts.seconds, 0) % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-sm text-gray-600">Total Duration</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 How to Use Timestamps</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Click on any timestamp to jump directly to that section in the original video</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Use the search to find specific topics or concepts</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Filter by topic to focus on particular areas of interest</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Review the keywords to understand what each section covers</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TimestampsSection;
