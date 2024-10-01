import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './index.css'; // Tailwind CSS
import MessageList from './components/MessageList';
import InputSection from './components/InputSection';
import { Message } from './types/Message';

const baseUrl = 'http://localhost:9000';
axios.defaults.baseURL = baseUrl;
axios.defaults.headers.post['Content-Type'] = 'application/json';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserInput, setCurrentUserInput] = useState<string | null>(null);
  const [currentModelOutput, setCurrentModelOutput] = useState<Message | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const generateSourceRef = useRef<EventSource | null>(null);
  // const currentModelOutputRef = useRef<Message | null>(null);
  const bufferRef = useRef<string>(''); // Buffer to accumulate streamed data

  useEffect(() => {
    return () => {
      if (generateSourceRef.current) {
        generateSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      closeEventSource(); // Explicitly call this in case the component unmounts before streaming completes
    };
  }, []);

  // // Adjust closeEventSource to handle both cases of being called inside useEffect and during error handling.
  // const closeEventSource = (eventSource?: EventSource) => {
  //   eventSource?.close();
  // };

  const closeEventSource = (eventSource?: EventSource) => {
    if (!eventSource && generateSourceRef.current) {
      eventSource = generateSourceRef.current;
    }
    eventSource?.close();
  };

  const getModelResponseAndStreamTokens = async (firstPrompt: string): Promise<void> => {
    // console.log(JSON.stringify({ prompt: firstPrompt }));
    const response = await axios.post(
      '/chat/create_prompt',
      { prompt: firstPrompt },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status !== 200) {
      throw new Error('Network response was not ok');
    }

    const { prompt }: { prompt: Message } = await response.data;
    // Use the sessionId to stream responses
    setIsStreaming(true);
    setCurrentModelOutput({ content: '', is_from_human: false });
    const generationSource = new EventSource(`${baseUrl}/chat/generate/${prompt.id}`);
    generateSourceRef.current = generationSource;

    setupEventHandlers(generationSource);
  };

  const setupEventHandlers = (generationSource: EventSource) => {
    generationSource.onmessage = event => handleStreamData(event.data);
    generationSource.onerror = error => handleError(error, generationSource);
  };

  const handleStreamData = (data: string) => {
    // console.log(data);
    if (data === '[DONE]') {
      flushBuffer();
      closeEventSource();
      setIsStreaming(false);
      return;
    }

    bufferRef.current += data; // Accumulate streamed data in the buffer
    setCurrentModelOutput(previousOutput => ({ content: previousOutput?.content + data, is_from_human: false }));
  };
  // console.log(bufferRef);

  const flushBuffer = () => {
    const modelOutput = { content: bufferRef.current, is_from_human: false };
    setCurrentModelOutput(modelOutput);
    setMessages(previousMessages => [...previousMessages, modelOutput]);
    bufferRef.current = ''; // Clear the buffer after flushing it into state
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
    setMessages([...messages, { content: currentUserInput, is_from_human: true }]);
    getModelResponseAndStreamTokens(currentUserInput);
    setCurrentUserInput('');
  };
  // console.log(currentModelOutput?.content);
  return (
    <div className="flex flex-col h-screen w-screen bg-black text-gray-200">
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
}

export default App;
