import React from 'react';
import { Brain, BookOpen, Clock, Zap, Github, Heart, Users, Code } from 'lucide-react';

const AboutPage = () => {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced natural language processing to extract key insights from video content"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Smart Summarization",
      description: "Intelligent summarization that captures the most important concepts and ideas"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Precise Timestamps",
      description: "Accurate topic-based timestamps for efficient navigation through video content"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Results",
      description: "Get comprehensive study materials in under 30 seconds for most videos"
    }
  ];

  const techStack = [
    { name: "React.js", description: "Frontend framework for building the user interface" },
    { name: "FastAPI", description: "High-performance Python web framework for the backend" },
    { name: "OpenAI GPT", description: "AI model for content analysis and generation" },
    { name: "YouTube API", description: "For video transcript extraction and metadata" },
    { name: "TailwindCSS", description: "Utility-first CSS framework for styling" },
    { name: "PostgreSQL", description: "Database for storing analysis results and user data" }
  ];

  const team = [
    {
      name: "AI/ML Engineer",
      role: "Backend Development & AI Integration",
      description: "Responsible for implementing the AI analysis pipeline and API development"
    },
    {
      name: "Frontend Developer", 
      role: "UI/UX Design & React Development",
      description: "Creates the user interface and ensures smooth user experience"
    },
    {
      name: "Full Stack Developer",
      role: "System Architecture & DevOps",
      description: "Handles system design, deployment, and infrastructure management"
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">About AI Study Buddy</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're revolutionizing how students learn from educational videos by combining 
          cutting-edge AI technology with intuitive design to create the ultimate study companion.
        </p>
      </section>

      {/* Mission Statement */}
      <section className="card">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            To democratize access to quality education by transforming any educational video 
            into comprehensive, interactive study materials that enhance learning outcomes 
            and save students valuable time.
          </p>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">The Problem</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Students waste hours manually taking notes from long videos</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Finding specific topics in lengthy educational content is frustrating</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Lack of active learning tools reduces retention and engagement</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-500 mt-1">•</span>
              <span>No efficient way to test understanding of video content</span>
            </li>
          </ul>
        </div>

        <div className="card">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Solution</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">•</span>
              <span>AI-generated smart notes and summaries in seconds</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Clickable timestamps for instant topic navigation</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Interactive quizzes to test and reinforce learning</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Exportable study materials for offline review</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform combines advanced AI technology with user-friendly design 
            to deliver the most comprehensive video analysis experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="card text-center space-y-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto">
                <div className="text-blue-600">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Technology Stack</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Built with modern, scalable technologies to ensure reliability and performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((tech, index) => (
            <div key={index} className="card">
              <div className="flex items-center space-x-3 mb-3">
                <Code className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{tech.name}</h3>
              </div>
              <p className="text-gray-600 text-sm">{tech.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A passionate team of developers, designers, and AI researchers working 
            together to revolutionize educational technology.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <div key={index} className="card text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-blue-600 text-sm font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold mb-2">1000+</div>
            <div className="text-blue-100">Videos Analyzed</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">500+</div>
            <div className="text-blue-100">Happy Students</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">30s</div>
            <div className="text-blue-100">Average Processing Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">95%</div>
            <div className="text-blue-100">Accuracy Rate</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Ready to Transform Your Learning?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join thousands of students who are already studying smarter with AI Study Buddy.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <a
            href="/"
            className="btn-primary"
          >
            Get Started Now
          </a>
          <a
            href="https://github.com/your-username/ai-study-buddy"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <Github className="w-4 h-4 mr-2" />
            View on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <section className="text-center space-y-4 pt-8 border-t border-gray-200">
        <p className="text-gray-600">
          Made with <Heart className="inline w-4 h-4 text-red-500" /> for students worldwide
        </p>
        <p className="text-sm text-gray-500">
          © 2024 AI Study Buddy. Built for educational purposes.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
