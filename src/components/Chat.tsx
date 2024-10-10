import { useEffect, useRef, useState } from 'react';
import MessageList from './MessageList';
import { Message } from '../types/Message';
import InputSection from './InputSection';
import axios from 'axios';
import { apiClient } from '../services/axiosConfig';

interface StreamedContent {
  content: string;
}

export default () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserInput, setCurrentUserInput] = useState<string | null>(null);
  const [currentModelOutput, setCurrentModelOutput] = useState<Message | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const generateSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (generateSourceRef.current) {
        generateSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      closeEventSource();
    };
  }, []);

  useEffect(() => {
    if (currentModelOutput?.content.includes('[DONE-STREAMING-APRV-AI]')) {
      const newContent = currentModelOutput.content.replace('[DONE-STREAMING-APRV-AI]', '');
      setMessages([...messages, { content: newContent, conversation_id: currentModelOutput.conversation_id, is_from_human: false }]);
      setCurrentModelOutput(null);
    }
  }, [currentModelOutput]);

  const closeEventSource = (eventSource?: EventSource) => {
    if (!eventSource && generateSourceRef.current) {
      eventSource = generateSourceRef.current;
    }
    eventSource?.close();
  };

  const getModelResponseAndStreamTokens = async (firstPrompt: string): Promise<void> => {
    const response = await apiClient.post(
      '/chat/create_prompt',
      { prompt: firstPrompt, conversation_id: conversationId ?? null },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status !== 200) {
      throw new Error('Network response was not ok');
    }

    const message: Message = await response.data;
    setConversationId(message.conversation_id);
    // Use the sessionId to stream responses
    setIsStreaming(true);
    setCurrentModelOutput({ content: '', is_from_human: false, conversation_id: message.conversation_id ?? null });
    const generationSource = new EventSource(
      `${apiClient.defaults.baseURL}/chat/generate/${message.message_id}?access_token=${localStorage.getItem('access_token')}&user_id=${localStorage.getItem('user_id')}`
    );

    generateSourceRef.current = generationSource;

    setupEventHandlers(generationSource);
  };

  const setupEventHandlers = (generationSource: EventSource) => {
    generationSource.onmessage = event => handleStreamData(event);
    generationSource.onerror = error => handleError(error, generationSource);
  };

  const handleStreamData = (event: any) => {
    const data: StreamedContent = JSON.parse(event.data);
    const { content } = data;

    if (data) {
      setCurrentModelOutput(previousOutput => ({
        content: previousOutput?.content + content,
        is_from_human: false,
        conversation_id: conversationId,
      }));
    }

    if (content.includes('[DONE-STREAMING-APRV-AI]')) {
      setIsStreaming(false);
      closeEventSource();
      return;
    }
  };

  const handleError = (event: Event, generationSource: EventSource) => {
    if (event instanceof ErrorEvent) {
      console.error('generation source failed:', event.message);
    } else {
      console.error('generation source failed:', event);
    }
    generationSource.close();
  };

  const handleSend = () => {
    if (!currentUserInput || currentUserInput.trim() === '') return;
    setMessages([...messages, { content: currentUserInput, is_from_human: true, conversation_id: conversationId }]);
    getModelResponseAndStreamTokens(currentUserInput);
    setCurrentUserInput('');
  };

  return (
    <div className="flex flex-1 flex-grow flex-col">
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        currentModelOutput={currentModelOutput}
      />
      <InputSection
        input={currentUserInput}
        setInput={setCurrentUserInput}
        handleSend={handleSend}
      />
    </div>
  );
};
