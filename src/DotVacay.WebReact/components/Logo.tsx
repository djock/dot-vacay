import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        <path
          d="M50 95C50 95 85 60 85 35C85 15.67 69.33 0 50 0C30.67 0 15 15.67 15 35C15 60 50 95 50 95Z"
          fill="url(#logo-gradient)"
        />
        <circle cx="50" cy="35" r="12" fill="white" />
        <path
          d="M30 35C30 35 40 45 50 45C60 45 70 35 70 35"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M75 15L85 5M85 5H78M85 5V12"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default Logo;
