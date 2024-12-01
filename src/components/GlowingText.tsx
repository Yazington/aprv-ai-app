import React from 'react';

const ReflectingText: React.FC<{ text: string | undefined }> = ({ text }) => {
  const containerStyles: React.CSSProperties = {
    fontSize: '24px', // Further reduced text size
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'reflect 2s infinite',
    textAlign: 'center',
    display: 'inline-block',
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
            100% {
              background-position: 200% 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ReflectingText;
