// src/App.tsx
import React, { useState, useRef } from "react";
import { useLLMOutput } from "@llm-ui/react";
import {
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
} from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";
import { MarkdownComponent } from "./components/MarkdownComponent";
import { CodeBlock } from "./components/CodeBlock";
import "./index.css"; // Tailwind CSS
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

interface Message {
  id: number;
  sender: "user" | "assistant";
  content: string;
  isStreamFinished?: boolean;
}

const baseUrl = "http://localhost:8000";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messageIdRef = useRef(0);

  const getLLMResponse = async (
    prompt: string,
    onData: (data: string) => void
  ): Promise<void> => {
    const response = await fetch(`${baseUrl}/chat/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: prompt }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader!.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value);
        onData(chunk);
      }
    }
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    // Generate unique IDs for messages
    const userMessageId = messageIdRef.current++;
    const assistantMessageId = messageIdRef.current++;

    // Add user message
    const userMessage: Message = {
      id: userMessageId,
      sender: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Add assistant message with empty content
    const assistantMessage: Message = {
      id: assistantMessageId,
      sender: "assistant",
      content: "",
      isStreamFinished: false,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    // Get LLM response and handle streaming data
    await getLLMResponse(input, (chunk) => {
      // Update assistant message content
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId
            ? { ...message, content: message.content + chunk }
            : message
        )
      );
    });

    // Mark the stream as finished
    setMessages((prev) =>
      prev.map((message) =>
        message.id === assistantMessageId
          ? { ...message, isStreamFinished: true }
          : message
      )
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen w-screen bg-black text-gray-200">
        <div className="flex-1 overflow-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg max-w-xl ${
                  message.sender === "user"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                {message.sender === "assistant" ? (
                  <LLMOutputRenderer
                    llmOutput={message.content}
                    isStreamFinished={message.isStreamFinished || false}
                  />
                ) : (
                  <span>{message.content}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-700">
          <div className="flex">
            <input
              type="text"
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              className="ml-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

// Component to render LLM output
const LLMOutputRenderer: React.FC<{
  llmOutput: string;
  isStreamFinished: boolean;
}> = ({ llmOutput, isStreamFinished }) => {
  const { blockMatches } = useLLMOutput({
    llmOutput,
    fallbackBlock: {
      component: MarkdownComponent,
      lookBack: markdownLookBack(),
    },
    blocks: [
      {
        component: CodeBlock,
        findCompleteMatch: findCompleteCodeBlock(),
        findPartialMatch: findPartialCodeBlock(),
        lookBack: codeBlockLookBack(),
      },
    ],
    isStreamFinished,
  });

  return (
    <div className="prose prose-invert">
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};

export default App;
