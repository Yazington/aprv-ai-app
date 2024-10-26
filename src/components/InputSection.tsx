import React, { useEffect, useState } from 'react';

interface Props {
  input: string | undefined;
  setInput: (input: string | undefined) => void;
  handleSend: () => void;
}

const InputSection = ({ input, setInput, handleSend }: Props) => {
  const textareaRef = React.useRef<HTMLInputElement>(null);
  const [isInputNotEmpty, setIsInputNotEmpty] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setIsInputNotEmpty(input ? input.trim().length > 0 : false);
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  };

  return (
    <div className="flex w-full basis-1/5">
      <div className="relative flex w-[100%] basis-full items-center justify-center p-5">
        <input
          ref={textareaRef}
          className="flex w-full rounded-full bg-darkBg1 p-5 pr-16 text-center" // Increase right padding
          placeholder="Message APRV AI ..."
          value={input || ''}
          onChange={handleInputChange}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          className="absolute right-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300/50 bg-buttonBlack text-textSecondary shadow-md transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:rotate-1 hover:scale-105 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-800 hover:text-gray-200 hover:shadow-lg"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={
                isInputNotEmpty
                  ? 'M5 15l7-7 7 7' // Up arrow shape
                  : 'M2 12l7 7 13-13' // Checkmark shape
              }
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InputSection;
