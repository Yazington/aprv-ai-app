import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useConversationStore } from '../stores/conversationsStore';
import { useShallow } from 'zustand/shallow';
import ReflectingText from './GlowingText';
import { Message } from '../types/Message';
import { motion, AnimatePresence } from 'framer-motion';

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
        return { ...message, content: filteredLines.join('\n') };
      })
    );
  }, [selectedConversationMessages, currentToolInUse]);

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.05, // Increased delay
        duration: 0.3, // Increased duration
      },
    }),
    stream: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Increased staggerChildren
      },
    },
  };

  const tokenVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5, // Fade-in duration
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3, // Fade-out duration
      },
    },
  };

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 pb-20 text-sm">
      <AnimatePresence>
        {regularMessages.map((message, index) => (
          <motion.div
            key={'previous-messages-' + index}
            className={`grid basis-full grid-cols-[40px_1fr_40px] items-start gap-2 ${
              message.is_from_human ? 'justify-end' : ''
            } ${message.isStreaming ? 'animate-fade-in' : ''}`}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <div className="flex h-10 w-10 items-start justify-center">
              {!message.is_from_human && (
                <div className="group relative">
                  <div className="animate-tilt bg-lightBg4 absolute -inset-0.5 rounded-full opacity-20 blur transition duration-1000 group-hover:opacity-30 dark:bg-darkBg4"></div>
                  <div className="bg-lightBg4/70 relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow ring-1 ring-black/10 dark:bg-darkBg4/70 dark:ring-white/10">
                    <img
                      src="/bot-avatar.png"
                      alt="AI Assistant"
                      className="h-8 w-8 rounded-full object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1zcGFya2xlcyI+PHBhdGggZD0iTTEyIDNhMyAzIDAgMCAwLTMgM3Y0YTMgMyAwIDAgMCA2IDBWNmEzIDMgMCAwIDAtMy0zWiIvPjxwYXRoIGQ9Ik0xOSA5aDJhMiAyIDAgMCAwIDAtNGgtMmEyIDIgMCAwIDAgMCA0WiIvPjxwYXRoIGQ9Ik01IDloLTJhMiAyIDAgMCAxIDAtNC1oMmEyIDIgMCAwIDEgMCA0WiIvPjxwYXRoIGQ9Ik0xMiAxNmEzIDMgMCAwIDEtMyAzSDdhMyAzIDAgMCAxIDAtNmgyYTMgMyAwIDAgMSAzIDNaIi8+PHBhdGggZD0iTTIyIDE2YTMgMyAwIDAgMS0zIDNoLTJhMyAzIDAgMCAxIDAtNmgyYTMgMyAwIDAgMSAzIDNaIi8+PC9zdmc+';
                        target.className = 'h-8 w-8 text-blue-400';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <motion.div
              className={`group relative min-w-0 break-words p-4 ${
                message.is_from_human
                  ? 'bg-lightBg4/10 rounded-2xl rounded-tr-sm shadow-md backdrop-blur-sm dark:bg-darkBg4/10'
                  : 'bg-lightBg2/90 rounded-2xl rounded-tl-sm shadow-md backdrop-blur-sm dark:bg-darkBg2/80'
              } transition-all duration-300 hover:shadow-xl`}
            >
              <motion.div
                variants={textVariants}
                initial="hidden"
                animate={message.isStreaming ? 'stream' : 'visible'}
                transition={{ duration: 0.3 }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="prose prose-zinc dark:prose-invert prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-textPrimary prose-code:text-textSecondary dark:prose-headings:text-gray-50 dark:prose-p:text-gray-200 dark:prose-a:text-textSecondary dark:prose-code:text-textTert max-w-none"
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className="text-textPrimary underline hover:text-textSecondary dark:text-textSecondary dark:hover:text-textTert"
                      />
                    ),
                    code: ({ node, ...props }) => (
                      <code
                        {...props}
                        className="bg-lightBg3/50 rounded px-1 py-0.5 text-gray-800 dark:bg-darkBg2/50 dark:text-gray-200"
                      />
                    ),
                    pre: ({ node, ...props }) => (
                      <pre
                        {...props}
                        className="bg-lightBg3/50 overflow-x-auto rounded-lg p-4 backdrop-blur-sm dark:bg-darkBg2/50"
                      />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </motion.div>
            </motion.div>
            <div className="flex h-10 w-10 items-start justify-center">
              {message.is_from_human && (
                <div className="group relative">
                  <div className="animate-tilt bg-lightBg4 absolute -inset-0.5 rounded-full opacity-20 blur transition duration-1000 group-hover:opacity-30 dark:bg-darkBg4"></div>
                  <div className="bg-lightBg4/70 relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow ring-1 ring-black/10 dark:bg-darkBg4/70 dark:ring-white/10">
                    <img
                      src="/user-avatar.png"
                      alt="User"
                      className="h-8 w-8 rounded-full object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11c2VyIj48cGF0aCBkPSJNMTkgMjFhNyA3IDAgMSAwLTE0IDAiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSI0Ii8+PC9zdmc+';
                        target.className = 'h-8 w-8 text-purple-400';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {currentToolInUse && (
        <motion.div
          variants={tokenVariants}
          initial="hidden"
          animate="visible"
        >
          <ReflectingText text={currentToolInUse} />
        </motion.div>
      )}
      <div ref={messageEndRef} />
    </div>
  );
};

export default PreviousMessages;
