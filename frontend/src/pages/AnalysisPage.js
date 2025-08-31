import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Brain, Download, Play, CheckCircle, XCircle, Eye, Target, Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import SummarySection from '../components/SummarySection';
import TimestampsSection from '../components/TimestampsSection';
import QuizSection from '../components/QuizSection';
import Toast from '../components/Toast';

const AnalysisPage = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState(location.state?.analysisData || null);
  const [loading, setLoading] = useState(!analysisData);
  const [generatingCards, setGeneratingCards] = useState(false);
  const [error, setError] = useState(null);
  const [showMockDataToast, setShowMockDataToast] = useState(false);
  const [showCardsToast, setShowCardsToast] = useState(false);

  useEffect(() => {
    if (!analysisData) {
      fetchAnalysisData();
    }
  }, [videoId]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analysis/${videoId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404 && errorData.detail === "No transcript available for this video") {
          setShowMockDataToast(true);
          const data = await response.json();
          setAnalysisData(data);
          return;
        }
        throw new Error(errorData.detail || 'Failed to fetch analysis data');
      }
      
      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      setError(error.message || 'Failed to load analysis data. Please try again.');
      if (location.state?.analysisData) {
        setAnalysisData(location.state.analysisData);
        setShowMockDataToast(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if we're using mock data
  const isUsingMockData = analysisData?.status === 'using_mock_data' || 
                        (typeof analysisData?.summary === 'string' && 
                         (analysisData.summary.includes('mock data') || 
                          analysisData.summary.includes('No transcript') ||
                          analysisData.summary.includes('dummy') ||
                          analysisData.summary.includes('using mock transcript for testing')));

  // Add mock notes if in mock data mode
  if (isUsingMockData && !analysisData.notes) {
    analysisData.notes = `# Study Notes: Introduction to React

## Summary
This video covers the basics of React, a popular JavaScript library for building user interfaces.

## Key Concepts

### 1. Components
- Building blocks of React applications
- Can be class or function components
- Reusable and composable

### 2. JSX
- Syntax extension for JavaScript
- Allows writing HTML in JavaScript
- Gets compiled to React.createElement() calls

### 3. Props and State
- Props: Pass data to components (read-only)
- State: Manage component's internal state
- Use useState hook for functional components

## Code Examples

### Functional Component
\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

### Using State Hook
\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Best Practices
- Keep components small and focused
- Lift state up when needed
- Use destructuring for props
- Keep state minimal and derive values when possible

## Resources
- [React Documentation](https://reactjs.org/)
- [React Hooks Guide](https://reactjs.org/docs/hooks-intro.html)
- [Thinking in React](https://reactjs.org/docs/thinking-in-react.html)`;
  }

  useEffect(() => {
    console.log('Analysis Data:', JSON.stringify(analysisData, null, 2));
    console.log('Is using mock data:', isUsingMockData);
    
    // Always show the toast when the component mounts if we're using mock data
    if (isUsingMockData) {
      console.log('Using mock data, showing toast');
      setShowMockDataToast(true);
      const timer = setTimeout(() => {
        setShowMockDataToast(false);
      }, 10000); // Hide after 10 seconds
      return () => clearTimeout(timer);
    } else {
      console.log('Not using mock data');
      setShowMockDataToast(false);
    }
  }, [isUsingMockData]);

  const generateFlashcards = async () => {
    try {
      setGeneratingCards(true);
      
      // Check if we have transcript data
      if (!analysisData?.transcript) {
        throw new Error('No transcript available to generate flashcards');
      }

      // Call the backend API to generate flashcards
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoId,
          transcript: analysisData.transcript,
          summary: analysisData.summary
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      setShowCardsToast(true);
      return data;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setError(error.message || 'Failed to generate flashcards');
    } finally {
      setGeneratingCards(false);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link to="/" className="text-gray-600 hover:text-gray-900 mr-3" title="Go back">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-lg font-medium text-gray-900">Video Analysis</h1>
              </div>
              {analysisData?.video_info?.title && (
                <div className="hidden md:block text-sm text-gray-500 truncate max-w-md">
                  {analysisData.video_info.title}
                </div>
              )}
            </div>
            
            {isUsingMockData && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-yellow-700">
                    <span className="font-medium">Transcript not available.</span> Using mock data for demonstration.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <Toast
        show={showMockDataToast}
        message="Transcript not available. Using mock data for demonstration."
        onClose={() => setShowMockDataToast(false)}
      />
      
      <main className="flex-1 py-2 sm:py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-5">
          {/* Debug button - remove in production */}
          <button 
            onClick={() => setShowMockDataToast(true)}
            className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg z-50 transition-colors"
            title="Test Toast Notification"
          >
            <AlertTriangle className="w-5 h-5" />
          </button>

          {/* Video Info Section */}
          <div className="px-1">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent line-clamp-2">
              {analysisData.title || 'Video Analysis'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Video ID: {videoId}</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div className="relative w-full sm:w-40 flex-shrink-0">
                    <img 
                      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-28 sm:h-20 rounded-lg object-cover shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center hover:bg-black/30 transition-colors cursor-pointer">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-2">
                    <div className="text-center p-1.5 bg-gray-50/80 rounded-lg">
                      <div className="flex flex-col items-center">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        <p className="text-sm sm:text-base font-semibold text-gray-800 mt-1">
                          {analysisData?.duration 
                            ? `${Math.floor(analysisData.duration / 60)}:${(analysisData.duration % 60).toString().padStart(2, '0')}`
                            : '--:--'}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Duration</p>
                      </div>
                    </div>
                    
                    <div className="text-center p-1.5 bg-gray-50/80 rounded-lg">
                      <div className="flex flex-col items-center">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                        <p className="text-sm sm:text-base font-semibold text-gray-800 mt-1 capitalize">
                          {analysisData?.summary?.difficulty_level?.toLowerCase() || 'N/A'}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Difficulty</p>
                      </div>
                    </div>
                    
                    <div className="text-center p-1.5 bg-gray-50/80 rounded-lg">
                      <div className="flex flex-col items-center">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        <p className="text-sm sm:text-base font-semibold text-gray-800 mt-1">
                          {analysisData?.summary?.estimated_reading_time || '--'}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Min Read</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Summary and Notes */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-6"
              >
                <SummarySection summary={analysisData.summary} />
                
                {/* Notes Section */}
                {analysisData.notes && (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Study Notes</h2>
                          <p className="text-sm text-gray-500 mt-1">Key concepts and takeaways from the video</p>
                        </div>
                        <button 
                          onClick={() => {
                            const blob = new Blob([analysisData.notes], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `study-notes-${videoId}.md`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Notes
                        </button>
                      </div>
                      <div 
                        className="prose prose-sm sm:prose max-w-none text-gray-700 max-h-[600px] overflow-y-auto p-4 bg-gray-50 rounded-lg"
                      >
                        {analysisData.notes.split('\n').map((line, i) => {
                          // Handle headers
                          if (line.startsWith('## ')) {
                            return <h2 key={i} className="text-xl font-semibold text-gray-800 mt-6 mb-3 pb-2 border-b border-gray-200">{line.replace('## ', '')}</h2>;
                          }
                          if (line.startsWith('### ')) {
                            return <h3 key={i} className="text-lg font-medium text-gray-800 mt-5 mb-2">{line.replace('### ', '')}</h3>;
                          }
                          // Handle code blocks
                          if (line.startsWith('```')) {
                            const codeBlock = analysisData.notes.split('```')[1];
                            return (
                              <pre key={i} className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto my-4 text-sm">
                                <code>{codeBlock}</code>
                              </pre>
                            );
                          }
                          // Handle lists
                          if (line.trim().startsWith('- ')) {
                            return (
                              <ul key={i} className="list-disc pl-5 space-y-1 my-2">
                                <li>{line.replace('- ', '')}</li>
                              </ul>
                            );
                          }
                          // Handle links
                          if (line.includes('[') && line.includes('](')) {
                            const text = line.match(/\[(.*?)\]/)[1];
                            const url = line.match(/\((.*?)\)/)[1];
                            return (
                              <a 
                                key={i} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {text}
                              </a>
                            );
                          }
                          // Regular paragraph
                          if (line.trim() !== '') {
                            return <p key={i} className="my-3 leading-relaxed">{line}</p>;
                          }
                          // Empty line
                          return <div key={i} className="h-4"></div>;
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Timestamps Section */}
                <TimestampsSection timestamps={analysisData.timestamps} videoId={videoId} />
                
                {/* Quizzes Section */}
                <QuizSection quizzes={analysisData.quizzes} />
              </motion.div>
            </div>
            
            {/* Right Column - Quick Actions */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 h-full"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">🚀 Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                  <a 
                    href={`https://www.youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline"
                  >
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-center justify-center p-4 w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300"
                    >
                      <Play className="w-6 h-6 text-blue-600 mb-2" />
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Watch Original</span>
                    </motion.button>
                  </a>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-green-300"
                    onClick={() => {
                      const blob = new Blob([analysisData.notes || ''], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `study-notes-${videoId}.md`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-6 h-6 text-green-600 mb-2" />
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Download Notes</span>
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateFlashcards}
                    disabled={generatingCards}
                    className={`flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border ${generatingCards ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-300'} border-gray-200`}
                  >
                    <Brain className={`w-6 h-6 mb-2 ${generatingCards ? 'text-purple-400' : 'text-purple-600'}`} />
                    <span className="font-medium text-gray-700 text-sm sm:text-base">
                      {generatingCards ? 'Generating...' : 'Generate Cards'}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Flashcard Generation Toast */}
      <Toast 
        show={showCardsToast}
        onClose={() => setShowCardsToast(false)}
        message="Flashcards generated successfully!"
      />
    </div>
  );
};

export default AnalysisPage;