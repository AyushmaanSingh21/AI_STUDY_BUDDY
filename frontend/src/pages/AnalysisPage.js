import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Brain, Download, Play, CheckCircle, XCircle, Eye, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import SummarySection from '../components/SummarySection';
import TimestampsSection from '../components/TimestampsSection';
import QuizSection from '../components/QuizSection';

const AnalysisPage = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState(location.state?.analysisData || null);
  const [loading, setLoading] = useState(!analysisData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!analysisData) {
      fetchAnalysisData();
    }
  }, [videoId]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/analysis/${videoId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analysis data');
      }
      
      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      setError('Failed to load analysis data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="spinner mx-auto"></div>
          <p className="text-gray-600">Loading your study materials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
        <p className="text-gray-600">{error}</p>
        <Link to="/" className="btn-primary">
          Try Another Video
        </Link>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">No analysis data found</h2>
        <p className="text-gray-600">Please try analyzing a video again.</p>
        <Link to="/" className="btn-primary">
          Analyze New Video
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {analysisData.title}
            </h1>
            <p className="text-gray-600">Video ID: {videoId}</p>
          </div>
        </div>
      </div>

      {/* Video Info Card - Long Rectangle Below Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 w-full"
        >
          <div className="flex items-center space-x-6">
            {/* Video Thumbnail */}
            <div className="relative flex-shrink-0">
              <img 
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt="Video thumbnail"
                className="w-32 h-24 rounded-xl object-cover shadow-lg"
              />
              <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                <Play className="w-8 h-8 text-white" />
              </div>
            </div>
            
            {/* Video Stats */}
            <div className="flex-1 grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor(analysisData.duration / 60)}:{(analysisData.duration % 60).toString().padStart(2, '0')}
                </p>
                <p className="text-sm text-gray-600">Duration</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Target className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {analysisData.summary.difficulty_level}
                </p>
                <p className="text-sm text-gray-600">Difficulty</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <BookOpen className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisData.summary.estimated_reading_time}
                </p>
                <p className="text-sm text-gray-600">Min Read</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content - 3 Cards Grid */}
      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1 flex"
        >
          <SummarySection summary={analysisData.summary} />
        </motion.div>

        {/* Timestamps Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1 flex"
        >
          <TimestampsSection timestamps={analysisData.timestamps} videoId={videoId} />
        </motion.div>

        {/* Quizzes Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-1 flex"
        >
          <QuizSection quizzes={analysisData.quizzes} />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">🚀 Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center space-x-2 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300"
          >
            <Play className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Watch Original</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center space-x-2 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-green-300"
          >
            <Download className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Download Notes</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center space-x-2 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-purple-300"
          >
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">Generate Cards</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalysisPage;
