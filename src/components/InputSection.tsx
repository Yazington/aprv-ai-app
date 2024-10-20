import React, { useEffect } from 'react';

interface Props {
  input: string | undefined;
  setInput: (input: string | undefined) => void;
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
    <div className="flex w-full basis-1/5">
      <div className="flex w-[100%] basis-full items-center justify-center p-5">
        <div className="flex basis-10/12">
          <textarea
            ref={textareaRef}
            className="max-h-[100px] w-[100%] flex-1 resize-none rounded-xl border border-darkBg1 bg-darkBg1 px-4 py-2 text-textPrimary placeholder-textTert focus:outline-none"
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
        </div>
        <button
          onClick={handleSend}
          className="ml-2 items-center justify-center rounded-xl bg-buttonBlack p-5 px-4 font-bold text-textSecondary transition delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-slate-900"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default InputSection;
