import { useLLMOutput } from '@llm-ui/react';
import React, { memo } from 'react';
import { MarkdownComponent } from './MarkdownComponent';
import { codeBlockLookBack, findCompleteCodeBlock, findPartialCodeBlock } from '@llm-ui/code';
import { markdownLookBack } from '@llm-ui/markdown';

import { CodeBlock } from './CodeBlock';

const MemoizedCodeBlock = memo(CodeBlock);
const MemoizedMarkdownComponent = memo(MarkdownComponent);

export const LLMOutputRenderer: React.FC<{ llmOutput: string }> = ({ llmOutput }) => {
  const { blockMatches } = useLLMOutput({
    llmOutput,
    fallbackBlock: {
      component: MemoizedMarkdownComponent,
      lookBack: markdownLookBack(),
    },
    blocks: [
      {
        component: MemoizedCodeBlock,
        findCompleteMatch: findCompleteCodeBlock(),
        findPartialMatch: findPartialCodeBlock(),
        lookBack: codeBlockLookBack(),
      },
    ],
    isStreamFinished: true,
  });

  return (
    <div className="prose prose-invert">
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return (
          <Component
            key={index}
            blockMatch={blockMatch}
          />
        );
      })}
    </div>
  );
};
