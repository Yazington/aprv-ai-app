import React, { useEffect } from 'react';

interface Props {
  input: string | null;
  setInput: React.Dispatch<React.SetStateAction<string | null>>;
  handleSend: () => void;
}

const InputSection = ({ input, setInput, handleSend }: Props) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to calculate the new scrollHeight
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Adjust height after setting the value
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  };

  return (
    <div className="p-4 border-t border-gray-700">
      <div className="flex">
        <textarea
          ref={textareaRef}
          className="flex-1  bg-gray-900 border border-gray-700 rounded px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500 max-h-[300px] resize-none"
          placeholder="Type your message..."
          value={input ? input : ''}
          onChange={e => handleInputChange(e)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-gray-700 text-white hover:bg-gray-600 focus:outline-none rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default InputSection;
