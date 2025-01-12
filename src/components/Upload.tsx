import { useEffect, useState } from 'react';
import { apiClient } from '../services/axiosConfig';
import { useAuthStore } from '../stores/authStore';
import { useConversationStore } from '../stores/conversationsStore';
import { useShallow } from 'zustand/react/shallow';
import { Message } from '../types/Message';
import { Conversation } from '../types/Conversation';
import CustomFileUploader from './CustomFileUploader';
import { IoCreateOutline } from 'react-icons/io5';
import { DarkModeToggle } from './DarkModeToggle';

const fileTypes = ['PNG', 'JPG', 'JPEG', 'PDF'];

/**
 * Upload component for handling file uploads and managing conversations.
 *
 * This component allows users to upload design files and guideline files,
 * manage conversations, and display uploaded files.
 */
export default function Upload() {
  const { userId, logout } = useAuthStore(useShallow(state => ({ userId: state.user_id, logout: state.logout })));
  const {
    allUserConversations,
    selectedConversationId,
    setSelectedConversationId,
    setAllUserConversations,
    setSelectedConversationMessages,
    setSelectedConversation,
    createNewConversation,
  } = useConversationStore(
    useShallow(state => ({
      selectedConversationId: state.selectedConversationId,
      allUserConversations: state.allUserConversations,
      setSelectedConversationId: state.setSelectedConversationId,
      setSelectedConversationMessages: state.setSelectedConversationMessages,
      setAllUserConversations: state.setAllUserConversations,
      setSelectedConversation: state.setSelectedConversation,
      createNewConversation: state.createNewConversation,
    }))
  );

  const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined);

  const fetchConversations = async () => {
    if (userId) {
      try {
        const response = await apiClient.get(`/conversations?user_id=${userId}`);
        // Normalize conversation IDs
        const normalizedConversations = response.data.map((conv: any): Conversation => ({
          ...conv,
          id: typeof conv.id === 'object' ? conv.id?._id || conv.id : conv.id,
          user_id: typeof conv.user_id === 'object' ? 
            conv.user_id?._id || conv.user_id : 
            conv.user_id,
          all_messages_ids: conv.all_messages_ids?.map((msgId: any) => 
            typeof msgId === 'object' ? msgId?._id || msgId : msgId
          )
        }));
        setAllUserConversations(normalizedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setAllUserConversations([]);
      }
    }
  };

  useEffect(() => {
    if (userId) {
      fetchConversations();
    } else {
      setAllUserConversations([]);
    }
  }, [userId]);

  // Refresh conversations after file upload or new conversation
  useEffect(() => {
    if (selectedConversationId && userId) {
      fetchConversations();
    }
  }, [selectedConversationId]);

  const loadConversation = async (conversationId: string | undefined) => {
    if (!conversationId) return;
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // First verify the conversation exists
      const response = await apiClient.get(`/conversations/conversation?conversation_id=${conversationId}`);
      
      if (response.status === 200 && response.data) {
        // Clear previous state first
        await setSelectedConversationId(conversationId);
      } else {
        console.error('Failed to verify conversation:', conversationId);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (fileList: FileList, isDesign: boolean) => {
    if (!fileList || fileList.length === 0) return;
    setIsLoading(true);
    try {
      const file = fileList[fileList.length - 1];
      if (!file) {
        setIsLoading(undefined);
        return;
      }
      const formData = new FormData();
      formData.append('file', file);

      let uploadUrl = `/upload/image?conversation_id=${selectedConversationId}`;
      if (file.type === 'application/pdf') {
        uploadUrl = `/upload/pdf?conversation_id=${selectedConversationId}`;
      }

      const response = await apiClient.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data) {
        setSelectedConversationId(response.data.conversation_id);
        await fetchConversations(); // Refresh conversations after upload
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(undefined);
      alert('Failed to upload one or more files.');
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-lightBg3 bg-lightBg2 p-4 dark:border-darkBg3 dark:bg-darkBg2">
          <div className="flex items-center space-x-2">
            <button
              className="rounded-xl bg-lightBg3 p-3 text-textSecondary transition-all duration-300 hover:bg-lightBg4 hover:text-textPrimary hover:shadow-lg dark:bg-darkBg3 dark:text-textTert dark:hover:bg-darkBg4 dark:hover:text-textSecondary"
              onClick={async () => {
                await createNewConversation();
                await fetchConversations();
              }}
              aria-label="Create New Conversation"
            >
              <IoCreateOutline size={'20px'} />
            </button>
            <DarkModeToggle />
          </div>

          <div className="flex min-w-[100px] basis-1/12 items-center justify-center">
            <button
              className="rounded-xl bg-lightBg4 px-4 py-2 text-sm font-medium text-textSecondary transition-all duration-300 hover:bg-lightBg4 hover:text-textPrimary dark:bg-darkBg4 dark:hover:bg-darkBg4"
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto bg-lightBg3 p-2 [--scrollbar-left:0] dark:bg-darkBg3">
          {allUserConversations.length > 0 && (
            <ul className="space-y-2">
              {allUserConversations.map(conversation => (
                <li
                  key={conversation.id}
                  className="flex list-none flex-col"
                >
                  <button
                    className={`w-full overflow-hidden truncate p-3 text-sm font-medium transition-all duration-300 ${
                      conversation.id === selectedConversationId
                        ? 'bg-lightBg4/20 text-textPrimary shadow-md dark:bg-darkBg4/20 dark:text-textSecondary'
                        : 'bg-lightBg3/50 text-textSecondary hover:bg-lightBg4/50 hover:text-textPrimary dark:bg-darkBg3/50 dark:text-textTert dark:hover:bg-darkBg4/50 dark:hover:text-textSecondary'
                    }`}
                    onClick={() => loadConversation(conversation.id)}
                  >
                    {conversation.thumbnail_text}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-lightBg4 bg-lightBg3 p-4 dark:border-darkBg4 dark:bg-darkBg3">
          <h3 className="mb-4 text-center text-base font-semibold text-textPrimary dark:text-textSecondary">Design Upload</h3>
          <div>
            <div className="flex min-w-0 flex-1 flex-col content-center justify-center truncate">
              <CustomFileUploader
                handleChange={(fileList: FileList) => handleFileUpload(fileList, true)}
                multiple={true}
                name="design"
                types={fileTypes}
                className="flex min-h-[50px] w-full cursor-pointer items-center justify-center border-2 border-dashed border-lightBg4 bg-lightBg3 p-4 text-center text-textSecondary transition-all duration-300 hover:border-lightBg4 hover:bg-lightBg4 hover:text-textPrimary dark:border-darkBg4 dark:bg-darkBg3 dark:text-textTert dark:hover:text-textSecondary"
              />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-lightBg4 bg-lightBg3 p-4 dark:border-darkBg4 dark:bg-darkBg3">
          <h3 className="mb-4 text-center text-base font-semibold text-textPrimary dark:text-textSecondary">Guideline Upload</h3>
          {!isLoading && (
            <div className="w-full">
              <div className="w-full min-w-0 flex-1 flex-col content-center justify-center truncate">
                <CustomFileUploader
                  handleChange={(fileList: FileList) => handleFileUpload(fileList, false)}
                  multiple={true}
                  name="guideline"
                  types={['PDF']}
                  className="flex min-h-[50px] w-full cursor-pointer items-center justify-center border-2 border-dashed border-lightBg4 bg-lightBg3 p-4 text-center text-textSecondary transition-all duration-300 hover:border-lightBg4 hover:bg-lightBg4 hover:text-textPrimary dark:border-darkBg4 dark:bg-darkBg3 dark:text-textTert dark:hover:text-textSecondary"
                />
              </div>
            </div>
          )}
          {isLoading && (
            <div
              role="status"
              className="flex w-full items-center justify-center"
            >
              <svg
                aria-hidden="true"
                className="h-10 w-10 animate-spin text-textPrimary dark:text-textSecondary"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function truncateMiddle(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  const endLength = Math.floor(maxLength / 2);
  return `${text.slice(0, endLength)}...${text.slice(-endLength)}`;
}
