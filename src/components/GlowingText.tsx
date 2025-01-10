import React from 'react';

const ReflectingText: React.FC<{ text: string | undefined }> = ({ text }) => {
  return (
    <div className="bg-lightBg4/10 inline-block rounded-lg px-5 py-2.5 text-center text-lg font-bold text-textPrimary shadow-md transition-all duration-300 dark:bg-darkBg4/10 dark:text-textSecondary">
      {text}
    </div>
  );
};

export default ReflectingText;
