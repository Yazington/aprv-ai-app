// src/App.tsx
import React, { useState } from 'react';
import { useLLMOutput } from '@llm-ui/react';
import {
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
} from '@llm-ui/code';
import { markdownLookBack } from '@llm-ui/markdown';
import { MarkdownComponent } from './components/MarkdownComponent';
import { CodeBlock } from './components/CodeBlock';
import './index.css'; // Tailwind CSS

interface Message {
  sender: 'user' | 'assistant';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  // Simulate LLM response (replace this with actual API call)
  const getLLMResponse = async (prompt: string): Promise<string> => {
    // Placeholder response
    return `You said: ${prompt}\n\n## Example Code\n\n\`\`\`typescript\nconsole.log('Hello, llm-ui!');\n\`\`\``;
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', content: input }]);
    setInput('');

    // Get LLM response
    const response = await getLLMResponse(input);

    // Add assistant message
    setMessages((prev) => [...prev, { sender: 'assistant', content: response }]);
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="flex-1 overflow-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.sender === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {message.sender === 'assistant' ? (
                <LLMOutputRenderer llmOutput={message.content} />
              ) : (
                <span>{message.content}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            className="flex-1 border rounded px-4 py-2"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Component to render LLM output
const LLMOutputRenderer: React.FC<{ llmOutput: string }> = ({ llmOutput }) => {
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
    isStreamFinished: true, // Since we have the full response
  });

  return (
    <div>
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};

export default App;
