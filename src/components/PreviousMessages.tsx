import { useEffect, useRef, useState } from 'react';
import { FaRobot } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { RiUser6Line } from 'react-icons/ri';
import { useConversationStore } from '../stores/conversationsStore';
import { useShallow } from 'zustand/shallow';
import ReflectingText from './GlowingText';
import { Message } from '../types/Message';

const PreviousMessages = () => {
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { currentToolInUse, selectedConversationMessages } = useConversationStore(
    useShallow(state => ({
      currentToolInUse: state.currentToolInUse,
      selectedConversationMessages: state.selectedConversationMessages,
    }))
  );

  const [regularMessages, setRegularMessages] = useState<Message[]>(selectedConversationMessages);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversationMessages]);

  useEffect(() => {
    setRegularMessages(
      selectedConversationMessages.map(message => {
        const lines = message.content.split('\n');
        let filteredLines = lines.filter(line => !line.includes('[TOOL_USAGE_APRV_AI_DONE]:'));

        filteredLines = filteredLines.map(line => line.replace('[TOOL_USAGE_APRV_AI]:', ' Tool Use: '));

        if (currentToolInUse) {
          filteredLines = filteredLines.filter(line => !line.includes('[TOOL_USAGE_APRV_AI]:'));
        }
        let content = filteredLines.join('\n');
        // content = content.replace('[TOOL_USAGE_APRV_AI]:', 'Tool : ');
        // message.content = message.content.replace('[TOOL_USAGE_APRV_AI]:', 'Tool : ');

        // filteredLines.push('\n\n');

        return { ...message, content };
      })
    );
  }, [selectedConversationMessages]);

  return (
    <div className="flex max-h-full min-w-0 flex-col overflow-y-auto text-sm">
      {regularMessages.map((message, index) => (
        <div
          key={'previous-messages-' + index}
          className={`flex basis-full items-center p-5 ${message.is_from_human ? 'justify-end' : 'incoming'} outgoing ${
            message.isStreaming ? 'new-message' : ''
          }`}
        >
          <div className="w-full basis-[10%] items-center justify-center">
            {!message.is_from_human && (
              <FaRobot
                size={'40px'}
                className={`pulse mr-2 w-full basis-[10%] items-center justify-center text-gray-500`}
              />
            )}
          </div>
          <div
            className={`p-5 ${message.is_from_human ? 'message-bubble outgoing rounded-2xl bg-darkBg4 shadow-all-around' : 'bg-lightGrey message-bubble incoming rounded-2xl shadow-all-around'} min-w-0 basis-[90%] break-words`}
          >
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
                className={`pulse ml-2 w-full basis-[10%] items-center justify-center text-blue-500`}
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
