import { useEffect, useRef } from 'react';
import { Message } from '../types/Message';
import InputSection from './InputSection';
import { Tools } from './Tools';
import { apiClient } from '../services/axiosConfig';
import { useShallow } from 'zustand/react/shallow';
import { useConversationStore } from '../stores/conversationsStore';
import { useAuthStore } from '../stores/authStore';
import { useBufferedStreaming } from '../hooks/useBufferedStreaming';
import PreviousMessages from './PreviousMessages';

interface StreamedContent {
  content: string;
}

export const Chat = () => {
  const {
    selectedConversationId,
    selectedConversationUserInput,
    setSelectedConversationId,
    addMessageToSelectedConversation,
    setSelectedConversationUserInput,
    markLastMessageAsComplete,
    setSelectedConversation,
    setCurrentToolInUse,
  } = useConversationStore(
    useShallow(state => ({
      addMessageToSelectedConversation: state.addMessageToSelectedConversation,
      selectedConversationId: state.selectedConversationId,
      setSelectedConversationId: state.setSelectedConversationId,
      selectedConversationUserInput: state.selectedConversationUserInput,
      currentToolInUse: state.currentToolInUse,
      setSelectedConversationUserInput: state.setSelectedConversationUserInput,
      markLastMessageAsComplete: state.markLastMessageAsComplete,
      setSelectedConversation: state.setSelectedConversation,
      setCurrentToolInUse: state.setCurrentToolInUse,
    }))
  );

  const { addToBuffer } = useBufferedStreaming();

  const { access_token: accessToken, user_id: userId } = useAuthStore(
    useShallow(state => ({
      access_token: state.access_token,
      user_id: state.user_id,
    }))
  );

  const generateSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (generateSourceRef.current) {
        generateSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const getConversation = async () => {
      apiClient
        .get(`/conversations/conversation?conversation_id=${selectedConversationId}`)
        .then(response => {
          if (response.status == 200) {
            setSelectedConversation(response.data);
          }
        })
        .catch(error => console.log(error));
    };
    if (selectedConversationId) {
      getConversation();
    }
  }, [selectedConversationId]);

  const closeEventSource = (eventSource?: EventSource) => {
    if (!eventSource && generateSourceRef.current) {
      eventSource = generateSourceRef.current;
    }
    eventSource?.close();
  };

  const getModelResponseAndStreamTokens = async (firstPrompt: string): Promise<void> => {
    const response = await apiClient.post(
      '/chat/create_prompt',
      { prompt: firstPrompt, conversation_id: selectedConversationId ?? null },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status !== 200) {
      throw new Error('Network response was not ok');
    }
    const message: Message = {
      id: response.data.message_id,
      conversation_id: response.data.conversation_id,
      content: response.data.prompt,
      is_from_human: true,
      isStreaming: false,
    };

    if (message.conversation_id) {
      setSelectedConversationId(message.conversation_id);
    }

    addMessageToSelectedConversation({
      content: '',
      is_from_human: false,
      conversation_id: message.conversation_id ?? undefined,
      isStreaming: true,
    });

    const generationSource = new EventSource(
      `${apiClient.defaults.baseURL}/chat/generate/${message.id}?access_token=${accessToken}&user_id=${userId}`
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
    let { content } = data;

    if (content.includes('[DONE-STREAMING-APRV-AI]')) {
      markLastMessageAsComplete();
      closeEventSource();
      return;
    }

    // Check for tool start
    if (content.includes('[TOOL_USAGE_APRV_AI]:')) {
      const toolName = content.replace('[TOOL_USAGE_APRV_AI]:', '').trim();
      setCurrentToolInUse(toolName);
    }

    // Check for tool done
    if (content.includes('[TOOL_USAGE_APRV_AI_DONE]:')) {
      setCurrentToolInUse(undefined);
    }

    // For regular content, add to buffer
    if (data) {
      addToBuffer(content);
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
    if (!selectedConversationUserInput || selectedConversationUserInput.trim() === '') return;
    addMessageToSelectedConversation({
      content: selectedConversationUserInput,
      is_from_human: true,
      conversation_id: selectedConversationId,
      isStreaming: false,
    });
    getModelResponseAndStreamTokens(selectedConversationUserInput);
    setSelectedConversationUserInput('');
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="relative flex h-full flex-col p-10">
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto bg-lightBg2 shadow-md [--scrollbar-left:0] dark:bg-darkBg1">
            <PreviousMessages />
          </div>
        </div>
        <div className="sticky bottom-0 mt-auto">
          <Tools />
          <InputSection
            input={selectedConversationUserInput}
            setInput={setSelectedConversationUserInput}
            handleSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
};
