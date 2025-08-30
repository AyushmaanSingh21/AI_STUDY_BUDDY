import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="card text-center space-y-4 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto">
        <div className="text-blue-600">
          {icon}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
