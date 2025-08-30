import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Brain, Download, Play, CheckCircle, XCircle } from 'lucide-react';
import SummarySection from '../components/SummarySection';
import TimestampsSection from '../components/TimestampsSection';
import QuizSection from '../components/QuizSection';

const AnalysisPage = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState(location.state?.analysisData || null);
  const [loading, setLoading] = useState(!analysisData);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

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

  const tabs = [
    { id: 'summary', label: 'Summary', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'timestamps', label: 'Timestamps', icon: <Clock className="w-4 h-4" /> },
    { id: 'quizzes', label: 'Quizzes', icon: <Brain className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{analysisData.title}</h1>
            <p className="text-gray-600">Video ID: {videoId}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Video Info */}
      <div className="card">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-lg font-semibold text-gray-900">
              {Math.floor(analysisData.duration / 60)}:{(analysisData.duration % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Difficulty</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {analysisData.summary.difficulty_level}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Reading Time</p>
            <p className="text-lg font-semibold text-gray-900">
              {analysisData.summary.estimated_reading_time} min
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'summary' && (
          <SummarySection summary={analysisData.summary} />
        )}
        
        {activeTab === 'timestamps' && (
          <TimestampsSection timestamps={analysisData.timestamps} videoId={videoId} />
        )}
        
        {activeTab === 'quizzes' && (
          <QuizSection quizzes={analysisData.quizzes} />
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="btn-secondary">
            <Play className="w-4 h-4 mr-2" />
            Watch Original Video
          </button>
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Download Notes
          </button>
          <button className="btn-secondary">
            <Brain className="w-4 h-4 mr-2" />
            Generate Flashcards
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
