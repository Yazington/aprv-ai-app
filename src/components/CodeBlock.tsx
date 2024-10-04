// src/components/CodeBlock.tsx
import { LLMOutputComponent } from '@llm-ui/react';
import parseHtml from 'html-react-parser';
import { useCodeBlockToHtml, CodeToHtmlOptions } from '@llm-ui/code';
import { loadHighlighter, allLangs, allLangsAlias } from '@llm-ui/code';
import { getSingletonHighlighter } from 'shiki';
import { bundledLanguagesInfo } from 'shiki/langs';
import { bundledThemes } from 'shiki/themes';
// import getWasm from "shiki/wasm";

const highlighter = loadHighlighter(
  getSingletonHighlighter({
    langs: allLangs(bundledLanguagesInfo),
    langAlias: allLangsAlias(bundledLanguagesInfo),
    themes: Object.values(bundledThemes),
    // loadWasm: getWasm,
  })
);

const codeToHtmlOptions: CodeToHtmlOptions = {
  theme: 'night-owl', // A theme suitable for dark backgrounds
};

export const CodeBlock: LLMOutputComponent = ({ blockMatch }) => {
  const { html, code } = useCodeBlockToHtml({
    markdownCodeBlock: blockMatch.output,
    highlighter,
    codeToHtmlOptions,
  });

  if (!html) {
    // Fallback to <pre> if Shiki is not loaded yet
    return (
      <pre className="shiki">
        <code>{code}</code>
      </pre>
    );
  }
  return <>{parseHtml(html)}</>;
};
