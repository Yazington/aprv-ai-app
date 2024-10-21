import { useEffect, useMemo, useRef } from 'react';
import { useConversationStore } from '../stores/conversationsStore';
import { unstable_batchedUpdates } from 'react-dom';
import { useShallow } from 'zustand/shallow';

export const useBufferedStreaming = () => {
  const buffer = useRef<string[]>([]); // A buffer to temporarily store incoming data
  const { selectedConversationMessages, markLastMessageAsComplete, concatTextToLastMessage } = useConversationStore(
    useShallow(state => ({
      selectedConversationId: state.selectedConversationId,
      selectedConversationMessages: state.selectedConversationMessages,
      markLastMessageAsComplete: state.markLastMessageAsComplete,
      concatTextToLastMessage: state.concatTextToLastMessage,
    }))
  );

  // Memoize previous messages to avoid unnecessary re-renders
  const previousMessages = useMemo(() => {
    return selectedConversationMessages;
  }, [selectedConversationMessages]);

  // Memoize the last message to handle frequent updates
  const lastMessage = useMemo(() => {
    return selectedConversationMessages.filter(message => message.isStreaming)[0];
  }, [selectedConversationMessages]);

  useEffect(() => {
    if (lastMessage?.content.includes('[DONE-STREAMING-APRV-AI]')) {
      flushBuffer();
      markLastMessageAsComplete();
    }
  }, [lastMessage]);

  // Function to process the buffer
  function flushBuffer() {
    if (buffer.current.length > 0) {
      const content = buffer.current.join('');
      if (content && content.length > 0) {
        unstable_batchedUpdates(() => {
          concatTextToLastMessage(content);
        });
      }
      buffer.current = [];
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      flushBuffer();
    }, 10);

    return () => clearInterval(interval); // Clean up on component unmount
  }, []); // No dependencies

  return {
    addToBuffer: (content: string) => {
      buffer.current.push(content); // Add new content to buffer
    },
    previousMessages,
    // lastMessage,
  };
};
