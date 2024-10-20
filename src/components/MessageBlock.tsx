// import { MarkdownComponent } from './MarkdownComponent';
// import { CodeBlock } from './CodeBlock';
// import { useConversationStore } from '../stores/conversationsStore';
// import React from 'react';

// const MessageBlock = React.memo(function MessageBlock({ isStreamFinished }: { isStreamFinished: boolean }) {
//   const selectedConversationStreamingLLMOutput = useConversationStore(state => state.selectedConversationStreamingLLMOutput);

//   const llmOutputContent = selectedConversationStreamingLLMOutput?.content ?? '';

//   return (
//     <div className="m-5">
//       {blockMatches.map((blockMatch, i) => {
//         const Component = blockMatch.block.component;
//         return (
//           <Component
//             key={i}
//             blockMatch={blockMatch}
//           />
//         );
//       })}
//     </div>
//   );
// });

// export default MessageBlock;
