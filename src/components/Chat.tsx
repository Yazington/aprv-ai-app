import { useEffect, useRef, useState } from 'react';
import { Message } from '../types/Message';
import InputSection from './InputSection';
import { UploadedFiles } from './UploadedFiles';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
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

  // Cleanup when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      // Clean up event source
      if (generateSourceRef.current) {
        generateSourceRef.current.close();
        generateSourceRef.current = null;
      }
      
      // Reset all states
      setCurrentToolInUse(undefined);
      setIsStreaming(false);
      setIsLoading(false);
      
      // Clear any incomplete messages
      useConversationStore.setState(state => ({
        selectedConversationMessages: state.selectedConversationMessages.filter(msg => !msg.isStreaming)
      }));
    };
  }, [selectedConversationId, setCurrentToolInUse]);

  useEffect(() => {
    let mounted = true;

    const loadConversationData = async () => {
      // Skip if no ID, already loading, or unmounted
      if (!selectedConversationId || isLoading || !mounted) {
        if (mounted) {
          // Clear state if no conversation selected
          useConversationStore.setState({
            selectedConversationMessages: [],
            selectedConversation: undefined,
            selectedConversationUserInput: undefined,
            currentToolInUse: undefined
          });
          setIsStreaming(false);
          setCurrentToolInUse(undefined);
        }
        return;
      }

      // Reset states and clear messages
      if (mounted) {
        setIsLoading(true);
        setIsStreaming(false);
        setCurrentToolInUse(undefined);

        // Close any existing stream
        if (generateSourceRef.current) {
          generateSourceRef.current.close();
          generateSourceRef.current = null;
        }

        // Clear messages before loading new ones
        useConversationStore.setState({ selectedConversationMessages: [] });
      }

      try {
        // First get conversation details
        const conversationResponse = await apiClient.get(
          `/conversations/conversation?conversation_id=${selectedConversationId}`
        );

        // Validate conversation response
        if (conversationResponse.status !== 200 || !conversationResponse.data) {
          throw new Error('Conversation not found');
        }

        // Process conversation data
        const conversation = conversationResponse.data;
        const normalizedConversation = {
          ...conversation,
          id: typeof conversation.id === 'object' ? conversation.id?._id || conversation.id : conversation.id,
          user_id: typeof conversation.user_id === 'object' ? 
            conversation.user_id?._id || conversation.user_id : 
            conversation.user_id,
          all_messages_ids: conversation.all_messages_ids?.map((msgId: any) => 
            typeof msgId === 'object' ? msgId?._id || msgId : msgId
          )
        };
        
        if (mounted) {
          // Set conversation first
          setSelectedConversation(normalizedConversation);

          // Then get messages
          const messagesResponse = await apiClient.get(
            `/conversations/conversation-messages?conversation_id=${selectedConversationId}`
          );

          if (!mounted) return;

          if (messagesResponse.status !== 200 || !messagesResponse.data) {
            throw new Error('Failed to load messages');
          }

          // Process and set messages
          const messages = messagesResponse.data.map((message: any) => ({
            ...message,
            isStreaming: false,
            id: typeof message.id === 'object' ? message.id?._id || message.id : message.id,
            conversation_id: typeof message.conversation_id === 'object' ? 
              message.conversation_id?._id || message.conversation_id : 
              message.conversation_id
          }));

          // Set messages after conversation is set
          useConversationStore.setState({ selectedConversationMessages: messages });
        }
      } catch (error) {
        console.error('Error loading conversation data:', error);
        if (mounted) {
          // Clear all conversation state on error
          useConversationStore.setState({
            selectedConversationMessages: [],
            selectedConversation: undefined,
            selectedConversationUserInput: undefined,
            currentToolInUse: undefined
          });
          // Reset UI state
          setIsStreaming(false);
          setCurrentToolInUse(undefined);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadConversationData();

    return () => {
      mounted = false;
      if (generateSourceRef.current) {
        generateSourceRef.current.close();
        generateSourceRef.current = null;
      }
    };
  }, [selectedConversationId, setSelectedConversation, isLoading]);

  const closeEventSource = (eventSource?: EventSource) => {
    if (!eventSource && generateSourceRef.current) {
      eventSource = generateSourceRef.current;
    }
    eventSource?.close();
  };

  const getModelResponseAndStreamTokens = async (firstPrompt: string): Promise<void> => {
    let mounted = true;

    // Cleanup function to ensure proper state reset
    const cleanup = () => {
      if (generateSourceRef.current) {
        generateSourceRef.current.close();
        generateSourceRef.current = null;
      }
      if (mounted) {
        setCurrentToolInUse(undefined);
        setIsStreaming(false);
      }
    };

    // Close any existing stream before starting a new one
    cleanup();

    try {
      if (!mounted) return;
      setIsStreaming(true);
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

      // Normalize response data
      const messageId = typeof response.data.message_id === 'object' ? 
        response.data.message_id?._id || response.data.message_id : 
        response.data.message_id;
      const conversationId = typeof response.data.conversation_id === 'object' ? 
        response.data.conversation_id?._id || response.data.conversation_id : 
        response.data.conversation_id;

      const message: Message = {
        id: messageId,
        conversation_id: conversationId,
        content: response.data.prompt,
        is_from_human: true,
        isStreaming: false,
      };

      if (conversationId) {
        setSelectedConversationId(conversationId);
      }

      // Add the user's message first
      addMessageToSelectedConversation({
        content: firstPrompt,
        is_from_human: true,
        conversation_id: message.conversation_id ?? undefined,
        isStreaming: false,
      });

      // Then add the assistant's message that will stream
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
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove both messages if there was an error
      useConversationStore.setState(state => ({
        selectedConversationMessages: state.selectedConversationMessages.slice(0, -2)
      }));
      setCurrentToolInUse(undefined);
    } finally {
      setIsStreaming(false);
    }
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
      setIsStreaming(false);
      setCurrentToolInUse(undefined);
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
      console.error('Generation source failed:', event.message);
    } else {
      console.error('Generation source failed:', event);
    }

    // Clean up UI state
    setCurrentToolInUse(undefined);
    markLastMessageAsComplete();
    setIsStreaming(false);
    
    // Remove the streaming message if it exists
    useConversationStore.setState(state => ({
      selectedConversationMessages: state.selectedConversationMessages.filter(msg => !msg.isStreaming)
    }));

    // Close the event source
    generationSource.close();
    generateSourceRef.current = null;
  };

  const handleSend = async () => {
    const input = selectedConversationUserInput?.trim();
    if (!input) return;

    // Clear input immediately to prevent double sends
    setSelectedConversationUserInput('');

    try {
      // Store input before sending in case we need to restore it on error
      const originalInput = input;

      await getModelResponseAndStreamTokens(input);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore input on error so user doesn't lose their message
      setSelectedConversationUserInput(input);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="relative flex h-full flex-col p-10">
        <UploadedFiles />
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto bg-lightBg2 shadow-md [--scrollbar-left:0] dark:bg-darkBg1">
            {isLoading && !isStreaming ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-8 w-8 animate-spin text-textPrimary dark:text-textSecondary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-textSecondary dark:text-textTert">Loading messages...</span>
                </div>
              </div>
            ) : (
              <PreviousMessages />
            )}
          </div>
        </div>
        <div className="sticky bottom-0 mt-auto">
          <InputSection
            input={selectedConversationUserInput}
            setInput={setSelectedConversationUserInput}
            handleSend={handleSend}
            isLoading={isLoading || isStreaming}
          />
        </div>
      </div>
    </div>
  );
};
