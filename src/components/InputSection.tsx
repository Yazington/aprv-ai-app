interface Props {
  input: string | null;
  setInput: React.Dispatch<React.SetStateAction<string | null>>;
  handleSend: () => void;
}

const InputSection = ({ input, setInput, handleSend }: Props) => {
  return (
    <div className="p-4 border-t border-gray-700">
      <div className="flex">
        <textarea
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500"
          placeholder="Type your message..."
          value={input ? input : ''}
          onChange={e => {
            setInput(e.target.value);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default InputSection;
