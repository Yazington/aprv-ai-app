import { useEffect, useRef } from 'react';
import { FaRobot } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { RiUser6Line } from 'react-icons/ri';
import { useConversationStore } from '../stores/conversationsStore';
import { useShallow } from 'zustand/shallow';
import ReflectingText from './GlowingText';

const PreviousMessages = () => {
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { currentToolInUse, selectedConversationMessages } = useConversationStore(
    useShallow(state => ({
      currentToolInUse: state.currentToolInUse,
      selectedConversationMessages: state.selectedConversationMessages,
    }))
  );

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversationMessages]);

  const regularMessages = selectedConversationMessages.map(message => {
    const lines = message.content.split('\n');
    let filteredLines = lines.filter(line => !line.includes('[TOOL_USAGE_APRV_AI_DONE]:'));

    if (currentToolInUse) {
      filteredLines = filteredLines.filter(line => !line.includes('[TOOL_USAGE_APRV_AI]:'));
    }
    let content = filteredLines.join('\n');
    content = content.replace('[TOOL_USAGE_APRV_AI]:', 'Tool : ');
    // message.content = message.content.replace('[TOOL_USAGE_APRV_AI]:', 'Tool : ');
    return { ...message, content };
  });

  return (
    <div className="flex max-h-full min-w-0 flex-col overflow-y-auto text-sm">
      {regularMessages.map((message, index) => (
        <div
          key={'previous-messages-' + index}
          className={`flex basis-full items-center p-5 ${message.is_from_human ? 'justify-end' : ''}`}
        >
          <div className="w-full basis-[10%] items-center justify-center">
            {!message.is_from_human && (
              <FaRobot
                size={'40px'}
                className="mr-2 w-full basis-[10%] items-center justify-center text-gray-500"
              />
            )}
          </div>
          <div className={`p-5 ${message.is_from_human ? 'rounded-2xl bg-darkBg4 shadow-all-around' : ''} min-w-0 basis-[90%] break-words`}>
            <ReactMarkdown
              key={index + 'message'}
              className={`message ${message.is_from_human ? 'justify-end text-end' : 'justify-start text-start'} leading-tight tracking-tight`}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <div className="w-full basis-[10%] items-center justify-center">
            {message.is_from_human && (
              <RiUser6Line
                size={'40px'}
                className="ml-2 w-full basis-[10%] items-center justify-center text-blue-500"
              />
            )}
          </div>
        </div>
      ))}
      {currentToolInUse && <ReflectingText text={currentToolInUse}></ReflectingText>}
      <div ref={messageEndRef} />
    </div>
  );
};

export default PreviousMessages;
