import { useEffect, useRef } from 'react';
import { Message } from '../types/Message';
import InputSection from './InputSection';
import { apiClient } from '../services/axiosConfig';
import { useShallow } from 'zustand/react/shallow';
import { useConversationStore } from '../stores/conversationsStore';
import { useAuthStore } from '../stores/authStore';
import { useBufferedStreaming } from '../hooks/useBufferedStreaming';
import ReactMarkdown from 'react-markdown';

interface StreamedContent {
  content: string;
}

// Component to render all previous messages
const PreviousMessages = ({ messages }: { messages: Message[] }) => {
  return (
    <div className="flex max-h-full min-w-0 flex-col overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={'previous-messages-' + index}
          className={`flex basis-full p-5 ${message.is_from_human ? 'justify-end' : ''}`}
        >
          <div className={`p-5 ${message.is_from_human ? 'rounded-2xl bg-darkBg3 shadow-all-around' : ''} min-w-0 break-words`}>
            <ReactMarkdown
              key={index + 'message'}
              className={`message ${message.is_from_human ? 'justify-end text-end' : 'justify-start text-start'} leading-tight tracking-tight`}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
};

// // Component to render the last message
// const LastMessage = ({ message }: { message: Message }) => {
//   if (message) {
//     return (
//       <div className="flex flex-col">
//         <div className={`flex basis-full p-5 ${message.is_from_human ? 'justify-end' : ''} `}>
//           <div className={`w-[100%] p-5 ${message.is_from_human ? '' : ''} leading-tight tracking-tight`}>
//             <ReactMarkdown
//               className="last-message"
//               // remarkPlugins={[remarkGfm]}
//             >
//               {message.content}
//             </ReactMarkdown>
//           </div>
//         </div>
//       </div>
//     );
//   }
//   return <div></div>;
// };

export const Chat = () => {
  const {
    selectedConversationId,
    selectedConversationUserInput,
    setSelectedConversationId,
    addMessageToSelectedConversation,
    setSelectedConversationUserInput,
    markLastMessageAsComplete,
    setSelectedConversation,
  } = useConversationStore(
    useShallow(state => ({
      addMessageToSelectedConversation: state.addMessageToSelectedConversation,
      selectedConversationId: state.selectedConversationId,
      setSelectedConversationId: state.setSelectedConversationId,
      selectedConversationUserInput: state.selectedConversationUserInput,
      setSelectedConversationUserInput: state.setSelectedConversationUserInput,
      markLastMessageAsComplete: state.markLastMessageAsComplete,
      setSelectedConversation: state.setSelectedConversation,
    }))
  );

  const { addToBuffer, previousMessages } = useBufferedStreaming();

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
    const { content } = data;

    if (content.includes('[DONE-STREAMING-APRV-AI]')) {
      markLastMessageAsComplete();
      closeEventSource();
      return;
    }
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
    <div className="flex min-w-0 basis-[80%]">
      <div className="flex w-full min-w-0 flex-col">
        <div className="flex w-full min-w-0 flex-grow overflow-y-hidden">
          <div className="flex w-full min-w-0 flex-col overflow-y-auto overflow-x-hidden">
            <PreviousMessages messages={previousMessages} />
            {/* <LastMessage message={lastMessage} /> */}
          </div>
        </div>
        <InputSection
          input={selectedConversationUserInput}
          setInput={setSelectedConversationUserInput}
          handleSend={handleSend}
        />
      </div>
    </div>
  );
};
