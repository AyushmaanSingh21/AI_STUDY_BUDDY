import React, { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';

const VideoInputForm = ({ onAnalyze, isAnalyzing }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [summaryDepth, setSummaryDepth] = useState('medium');
  const [error, setError] = useState('');

  const validateYouTubeUrl = (url) => {
    const patterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^https?:\/\/www\.youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /^https?:\/\/youtu\.be\/([^&\n?#]+)/,
      /^https?:\/\/www\.youtube\.com\/embed\/([^&\n?#]+)/
    ];

    return patterns.some(pattern => pattern.test(url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!validateYouTubeUrl(videoUrl)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    try {
      await onAnalyze(videoUrl, summaryDepth);
    } catch (error) {
      setError('Failed to analyze video. Please try again.');
    }
  };

  return (
    <div className="card max-w-2xl mx-auto" id="video-input">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Video URL
          </label>
          <div className="relative">
            <input
              type="url"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="input-field pr-12"
              disabled={isAnalyzing}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Play className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div>
          <label htmlFor="summaryDepth" className="block text-sm font-medium text-gray-700 mb-2">
            Summary Depth
          </label>
          <select
            id="summaryDepth"
            value={summaryDepth}
            onChange={(e) => setSummaryDepth(e.target.value)}
            className="input-field"
            disabled={isAnalyzing}
          >
            <option value="short">Short Summary (2-3 min read)</option>
            <option value="medium">Medium Summary (5-8 min read)</option>
            <option value="detailed">Detailed Summary (10-15 min read)</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Choose how detailed you want your study materials to be
          </p>
        </div>

        <button
          type="submit"
          disabled={isAnalyzing || !videoUrl.trim()}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Video...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Generate Study Materials</span>
            </>
          )}
        </button>

        {isAnalyzing && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing your video...</span>
            </div>
            <p className="text-xs text-gray-500">
              This usually takes 15-30 seconds depending on video length
            </p>
          </div>
        )}
      </form>

      {/* Example URLs */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Example URLs:</h4>
        <div className="space-y-2">
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            https://www.youtube.com/watch?v=dQw4w9WgXcQ
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            https://youtu.be/dQw4w9WgXcQ
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoInputForm;
