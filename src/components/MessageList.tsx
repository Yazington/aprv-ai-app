import { useEffect, useRef } from 'react';
import { Message } from '../types/Message';
import { LLMOutputRenderer } from './Renderer';

interface Props {
  messages: Message[];
  isStreaming: boolean;
  currentModelOutput: Message | null;
}

const MessagesSection = ({ messages, isStreaming, currentModelOutput }: Props) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when new content is added or updated
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, currentModelOutput]);

  return (
    <div
      ref={messageContainerRef}
      className="flex-1 overflow-auto p-4"
    >
      {messages.map((message, index) => (
        <div
          key={index}
          className={`mb-4 ${message.is_from_human ? 'text-right' : 'text-left'} `}
        >
          <div
            className={`inline-block px-4 py-2 rounded-lg max-w-xl ${message.is_from_human ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-200'}`}
          >
            {message.is_from_human ? <span>{message.content}</span> : <LLMOutputRenderer llmOutput={message.content} />}
          </div>
        </div>
      ))}
      {isStreaming && currentModelOutput && (
        <div className={`mb-4 text-left`}>
          <div className={`inline-block px-4 py-2 rounded-lg max-w-xl bg-gray-800 text-gray-200`}>
            <LLMOutputRenderer llmOutput={currentModelOutput.content} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesSection;
