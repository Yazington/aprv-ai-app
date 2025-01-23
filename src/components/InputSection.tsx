import React, { useEffect, useState } from 'react';

interface Props {
  input: string | undefined;
  setInput: (input: string) => void;
  handleSend: () => void;
}

const InputSection = ({ input, setInput, handleSend }: Props) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isInputNotEmpty, setIsInputNotEmpty] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height first to get correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set new height with limits
      const newHeight = Math.min(textareaRef.current.scrollHeight, 300);
      textareaRef.current.style.height = `${newHeight}px`;
    }
    if(!input) return;
    setIsInputNotEmpty(input.trim().length > 0);
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isInputNotEmpty) {
        handleSend();
        setInput('');
      }
    }
    // Shift+Enter will create new line naturally
  };

  return (
    <div className="flex w-full transform-gpu py-2 md:py-4">
      <div className="relative mx-auto flex w-full max-w-2xl items-center justify-center px-2 md:px-0">
        <div className="group relative w-full">
          <textarea
            ref={textareaRef}
            className="relative w-full rounded-xl border-none bg-lightBg2 px-3 py-2.5 md:px-5 md:py-3.5 text-[15px] shadow-lg transition-all duration-300 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-lightBg4 dark:bg-darkBg2 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:bg-darkBg3 dark:focus:ring-darkBg4 resize-none overflow-y-auto"
            placeholder="Type a message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />
        </div>
        <button
          onClick={() => {
            if (isInputNotEmpty) {
              handleSend();
              setInput('');
              textareaRef.current?.focus();
            }
          }}
          className="group absolute right-2 flex h-11 w-11 md:h-10 md:w-10 items-center justify-center overflow-hidden rounded-xl bg-lightBg4 text-textPrimary shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:transform-none dark:bg-darkBg4 dark:text-textSecondary"
          disabled={!isInputNotEmpty}
        >
          <div className="flex h-full w-full items-center justify-center rounded-xl px-2.5 py-2 transition-all duration-300 group-hover:bg-lightBg4 dark:group-hover:bg-darkBg4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 md:h-5 md:w-5 transform stroke-2 transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default InputSection;
