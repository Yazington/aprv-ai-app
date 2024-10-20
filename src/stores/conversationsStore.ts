import { create } from 'zustand';
import type {} from '@redux-devtools/extension'; // required for devtools typing
import { Message } from '../types/Message';
import { Conversation } from '../types/Conversation';

interface ConversationStore {
  selectedConversationId?: string;
  allUserConversations: Conversation[];
  selectedConversationMessages: Message[]; // last message is the one potentially streaming
  selectedConversationUserInput?: string;

  setSelectedConversationId: (conversationId?: string) => Promise<void>;
  setAllUserConversations: (allUserConversations: Conversation[]) => Promise<void>;
  setSelectedConversationMessages: (messages: Message[]) => Promise<void>;
  setSelectedConversationUserInput: (input?: string) => Promise<void>;

  addMessageToSelectedConversation: (newMessage: Message) => Promise<void>;
  markLastMessageAsComplete: () => Promise<void>;
  concatTextToLastMessage: (text: string) => Promise<void>;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  selectedConversationId: undefined,
  allUserConversations: [],
  selectedConversationMessages: [],
  selectedConversationUserInput: undefined,

  setSelectedConversationId: async (currentConversationId?: string) => {
    set({ selectedConversationId: currentConversationId });
  },

  setAllUserConversations: async (allUserConversations: Conversation[]) => {
    set({ allUserConversations });
  },

  setSelectedConversationMessages: async (messages: Message[]) => {
    set({ selectedConversationMessages: messages });
  },

  setSelectedConversationUserInput: async (input?: string) => {
    set({ selectedConversationUserInput: input });
  },

  addMessageToSelectedConversation: async (newMessage: Message) => {
    set(state => ({ selectedConversationMessages: [...state.selectedConversationMessages, newMessage] }));
  },
  markLastMessageAsComplete: async () => {
    set(state => {
      const updatedMessages = [...state.selectedConversationMessages];

      updatedMessages[updatedMessages.length - 1] = {
        ...updatedMessages[updatedMessages.length - 1],
        isStreaming: false,
      };

      if (updatedMessages[updatedMessages.length - 1].content.includes('[DONE-STREAMING-APRV-AI]')) {
        updatedMessages[updatedMessages.length - 1].content.replace('[DONE-STREAMING-APRV-AI]', '');
      }

      return { ...state, selectedConversationMessages: updatedMessages };
    });
  },
  concatTextToLastMessage: async (text: string) => {
    set(state => {
      const lastMessageIndex = state.selectedConversationMessages.length - 1;
      const lastMessage = state.selectedConversationMessages[lastMessageIndex];

      // Update the last message's content
      const updatedMessages = [...state.selectedConversationMessages];
      updatedMessages[lastMessageIndex] = {
        ...lastMessage,
        content: lastMessage.content.concat(text), // More explicit concatenation
      };

      return { ...state, selectedConversationMessages: updatedMessages };
    });
  },
}));
