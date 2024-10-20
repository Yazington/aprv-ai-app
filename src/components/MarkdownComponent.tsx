// src/components/MarkdownComponent.tsx
import ReactMarkdown from 'react-markdown';
import { LLMOutputComponent } from '@llm-ui/react';

export const MarkdownComponent: LLMOutputComponent = ({ blockMatch }) => {
  const markdown = blockMatch.output;
  return <ReactMarkdown>{markdown}</ReactMarkdown>;
};
