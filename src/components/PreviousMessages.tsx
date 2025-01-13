import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useConversationStore } from '../stores/conversationsStore';
import { useShallow } from 'zustand/shallow';
import { Message } from '../types/Message';
import { motion, AnimatePresence } from 'framer-motion';

const PreviousMessages = () => {
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { selectedConversationMessages } = useConversationStore(
    useShallow(state => ({
      selectedConversationMessages: state.selectedConversationMessages,
    }))
  );

  const [regularMessages, setRegularMessages] = useState<Message[]>(selectedConversationMessages);
  const [toolUsageDone, setToolUsageDone] = useState(false);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversationMessages]);

  useEffect(() => {
    setRegularMessages(
      selectedConversationMessages.map(message => {
        const lines = message.content.split('\n');
        const processedLines = lines.map(line => {
          if (line.includes('[TOOL_USAGE_APRV_AI_DONE]:')) {
            const [before, _] = line.split('[TOOL_USAGE_APRV_AI_DONE]:');
            // return `${before}🔧 TOOL USE :\n\n**${after.trim()}**`;
            return `${before}\n\n`;
          }
          return line;
        });
        return { ...message, content: processedLines.join('\n') };
      })
    );
  }, [selectedConversationMessages]);

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
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
    stream: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const processMessageContent = (content: string) => {
    const parts = content.split('\n');
    return parts.map((line, index) => {
      if (line.includes('[TOOL_USAGE_APRV_AI_DONE]:')) {
        setToolUsageDone(true);
        const [before, _] = line.split('[TOOL_USAGE_APRV_AI_DONE]:');
        return (
          <div key={index}>
            {before && <ReactMarkdown remarkPlugins={[remarkGfm]}>{before}</ReactMarkdown>}
          </div>
        );
      } else if (line.includes('[TOOL_USAGE_APRV_AI]:')) {
        const [before, after] = line.split('[TOOL_USAGE_APRV_AI]:');
        return (
          <div key={index}>
            {before && <ReactMarkdown remarkPlugins={[remarkGfm]}>{before}</ReactMarkdown>}
            <motion.span
              initial={{ opacity: 0.5 }}
              animate={!toolUsageDone ? { 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.02, 1],
                color: ['#60A5FA', '#3B82F6', '#60A5FA']
              } : { 
                opacity: 1,
                scale: 1,
                color: '#60A5FA'
              }}
              transition={{
                duration: 2,
                repeat: toolUsageDone ? 0 : Infinity,
                ease: "easeInOut"
              }}
              className="font-semibold"
            >
              🔧 TOOL USE : {after.trim()}
            </motion.span>
          </div>
        );
      }
      return (
        <div key={index}>
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
                  className="rounded bg-lightBg3 px-1 py-0.5 text-gray-800 dark:bg-darkBg2 dark:text-gray-200"
                />
              ),
              pre: ({ node, ...props }) => (
                <pre
                  {...props}
                  className="overflow-hidden rounded-lg bg-lightBg3 p-4 dark:bg-darkBg2"
                />
              )
            }}
          >
            {line}
          </ReactMarkdown>
        </div>
      );
    });
  };

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 overflow-hidden pb-20 text-sm">
      <AnimatePresence>
        {regularMessages.map((message, index) => (
          <motion.div
            key={'previous-messages-' + index}
            className={`grid basis-full grid-cols-[40px_1fr_40px] items-center justify-center gap-10 ${
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
                <div className="group relative items-center justify-center">
                  <div className="">
                    <img
                      src="/Icon White.png"
                      alt="AI Assistant"
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
                  ? 'rounded-2xl rounded-tr-sm bg-lightBg4 shadow-md dark:bg-darkBg4'
                  : 'rounded-2xl rounded-tl-sm bg-lightBg3 shadow-md dark:bg-darkBg3'
              } transition-all duration-300 hover:shadow-xl`}
            >
              <motion.div
                variants={textVariants}
                initial="hidden"
                animate={message.isStreaming ? 'stream' : 'visible'}
                transition={{ duration: 0.3 }}
              >
                {processMessageContent(message.content)}
              </motion.div>
            </motion.div>
            <div className="flex h-10 w-10 items-start justify-center">
              {message.is_from_human && (
                <div className="group relative">
                  <div className="">
                    <img
                      src="/user-avatar.png"
                      alt="User"
                      className="h-10 w-10 rounded-full object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMWE3IDcgMCAxIDAtMTQgMCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjQiLz48L3N2Zz4=';
                        target.className = 'h-10 w-10 text-purple-400';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messageEndRef} />
    </div>
  );
};

export default PreviousMessages;
