import React from 'react';

const ReflectingText: React.FC<{ text: string | undefined }> = ({ text }) => {
  const containerStyles: React.CSSProperties = {
    fontSize: '18px', // Further reduced text size
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'reflect 2s infinite linear', // Smooth animation
    textAlign: 'center',
    display: 'inline-block',
    padding: '10px 20px', // Added padding for spacing
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', // Added shadow for depth
  };

  return (
    <div style={containerStyles}>
      {text}
      <style>
        {`
          @keyframes reflect {
            0% {
              background-position: -100% 0;
            }
            50% {
              background-position: 200% 0;
            }
            100% {
              background-position: 400% 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ReflectingText;
