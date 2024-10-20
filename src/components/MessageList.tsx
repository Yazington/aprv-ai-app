// import { useEffect, useRef } from 'react';
// import { Message } from '../types/Message';
// import { LLMOutputRenderer } from './Renderer';
// import { useConversationStore } from '../stores/conversationsStore';
// import { useShallow } from 'zustand/react/shallow';

// interface Props {
//   messages: Message[];
//   isStreaming: boolean;
//   currentModelOutput: Message | null;
// }

// const MessagesSection = ({ messages, isStreaming, currentModelOutput }: Props) => {
//   const messageContainerRef = useRef<HTMLDivElement>(null);
//   const { currentlySelectedConversationId } = useConversationStore(
//     useShallow(state => ({
//       currentlySelectedConversationId: state.currentlySelectedConversationId,
//     }))
//   );
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       if (messageContainerRef.current) {
//         messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
//       }
//     }, 100); // Adjust time for smoother behavior

//     return () => clearTimeout(timeout); // Cleanup on unmount
//   }, [messages, currentModelOutput]);

//   return (
//     <div
//       key={'messages of : ' + currentlySelectedConversationId}
//       ref={messageContainerRef}
//       className="flex basis-full flex-col overflow-auto p-4"
//     >
//       {messages.map(message => (
//         <div
//           key={message.id}
//           className={`mb-4 ${message.is_from_human ? 'justify-end' : 'justify-start'}`}
//         >
//           <div
//             key={message.id + 'div1'}
//             className={`flex basis-full rounded-lg px-4 py-2 ${message.is_from_human ? 'bg-gray-700 text-white' : 'text-gray-200'}`}
//           >
//             <LLMOutputRenderer
//               llmOutput={message.content}
//               isStreamFinished={!isStreaming}
//             />
//           </div>
//         </div>
//       ))}
//       {isStreaming && currentModelOutput && (
//         <div className="mb-4 text-left">
//           <div className="flex basis-full rounded-lg px-4 py-2 text-gray-200">
//             <LLMOutputRenderer
//               llmOutput={currentModelOutput.content}
//               isStreamFinished={!isStreaming}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MessagesSection;
