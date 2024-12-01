import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default ({ text }: { text: string }) => {
  const [displayText, setdisplayText] = useState('');
  const [isTyping, setISTyping] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isTyping) {
      timeout = setTimeout(() => {
        setdisplayText(text);
        setISTyping(false);
      }, 2000); // Adjust typing speed
    }
    return () => clearTimeout(timeout);
  }, [text, isTyping]);

  return <ReactMarkdown className="leading-tight tracking-tight">{displayText}</ReactMarkdown>;
};
