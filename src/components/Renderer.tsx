import { useLLMOutput } from '@llm-ui/react';
import { MarkdownComponent } from './MarkdownComponent';
import { codeBlockLookBack, findCompleteCodeBlock, findPartialCodeBlock } from '@llm-ui/code';
import { markdownLookBack } from '@llm-ui/markdown';

import { CodeBlock } from './CodeBlock';

export const LLMOutputRenderer: React.FC<{ llmOutput: string }> = ({ llmOutput }) => {
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
    isStreamFinished: false,
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
