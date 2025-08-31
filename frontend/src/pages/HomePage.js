import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen, Clock, Brain, Zap, CheckCircle } from 'lucide-react';
import VideoInputForm from '../components/VideoInputForm';
import FeatureCard from '../components/FeatureCard';

const HomePage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleVideoAnalysis = async (videoUrl, summaryDepth) => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: videoUrl,
          summary_depth: summaryDepth
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze video');
      }

      const data = await response.json();
      
      // Navigate to analysis page with results
      navigate(`/analysis/${data.video_id}`, { 
        state: { analysisData: data } 
      });
      
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze video. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Smart Notes",
      description: "AI-generated bullet points and highlights from any educational video"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Clickable Timestamps",
      description: "Jump to specific topics instantly with intelligent timestamping"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Auto-Generated Quizzes",
      description: "Test your understanding with AI-created practice questions"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Results",
      description: "Get comprehensive study materials in under 30 seconds"
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Turn Any Video Into
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Smart Study Materials
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Paste a YouTube educational video link and instantly get AI-generated notes, 
            timestamps, and quizzes. Save hours of manual note-taking.
          </p>
        </div>

        {/* Video Input Form */}
        <div className="max-w-2xl mx-auto">
          <VideoInputForm 
            onAnalyze={handleVideoAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Quick Stats */}
        <div className="flex justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Free to use</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>No registration required</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Works with any YouTube video</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Study Smarter
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI analyzes educational videos and creates comprehensive study materials 
            that help you learn faster and retain more information.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Paste YouTube Link</h3>
            <p className="text-gray-600">
              Simply copy and paste any educational YouTube video URL into our platform
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">AI Analysis</h3>
            <p className="text-gray-600">
              Our AI extracts the transcript and generates comprehensive study materials
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Get Results</h3>
            <p className="text-gray-600">
              Instantly access notes, timestamps, and quizzes to enhance your learning
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold">
          Ready to Transform Your Learning?
        </h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Join thousands of students who are already studying smarter with AI Study Buddy
        </p>
        <button 
          onClick={() => document.getElementById('video-input').scrollIntoView({ behavior: 'smooth' })}
          className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Get Started Now
        </button>
      </section>
    </div>
  );
};

export default HomePage;
