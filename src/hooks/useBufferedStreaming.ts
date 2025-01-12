import { useEffect, useMemo, useRef } from 'react';
import { useConversationStore } from '../stores/conversationsStore';
import { unstable_batchedUpdates } from 'react-dom';
import { useShallow } from 'zustand/shallow';

export const useBufferedStreaming = () => {
  const buffer = useRef<string[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout>();
  const isFlushingRef = useRef(false);

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

  // Get the last message directly since it's always the streaming one
  const lastMessage = useMemo(() => {
    const messages = selectedConversationMessages;
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }, [selectedConversationMessages]);

  // Function to process the buffer with debouncing
  const flushBuffer = () => {
    if (isFlushingRef.current || buffer.current.length === 0) return;

    isFlushingRef.current = true;
    const content = buffer.current.join('');
    buffer.current = [];

    if (content && content.length > 0) {
      unstable_batchedUpdates(() => {
        concatTextToLastMessage(content);
      });
    }

    // Reset flushing flag after a short delay to prevent too frequent updates
    setTimeout(() => {
      isFlushingRef.current = false;
    }, 10);
  };

  // Handle streaming completion
  useEffect(() => {
    if (lastMessage?.isStreaming && lastMessage?.content.includes('[DONE-STREAMING-APRV-AI]')) {
      // Flush any remaining content
      flushBuffer();
      markLastMessageAsComplete();
    }
  }, [lastMessage, markLastMessageAsComplete]);

  // Set up periodic buffer flushing
  useEffect(() => {
    const flushInterval = setInterval(() => {
      if (buffer.current.length > 0) {
        flushBuffer();
      }
    }, 16); // ~60fps for smooth updates

    return () => {
      clearInterval(flushInterval);
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, []);

  // Add content to buffer with smart batching
  const addToBuffer = (content: string) => {
    buffer.current.push(content);

    // Schedule a flush if buffer gets too large
    if (buffer.current.length > 10) {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushTimeoutRef.current = setTimeout(flushBuffer, 0);
    }
  };

  return {
    addToBuffer,
    previousMessages,
  };
};
