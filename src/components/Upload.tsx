import { useEffect, useState } from 'react';
import { apiClient } from '../services/axiosConfig';
import { useAuthStore } from '../stores/authStore';
import { useConversationStore } from '../stores/conversationsStore';
import { useShallow } from 'zustand/react/shallow';
import { Message } from '../types/Message';
import CustomFileUploader from './CustomFileUploader';
import { IoCreateOutline } from 'react-icons/io5';

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
    setCurrentConversationId,
    setAllUserConversations,
    setCurrentConversationMessages,
    createNewConversation,
  } = useConversationStore(
    useShallow(state => ({
      selectedConversationId: state.selectedConversationId,
      allUserConversations: state.allUserConversations,
      setCurrentConversationId: state.setSelectedConversationId,
      setCurrentConversationMessages: state.setSelectedConversationMessages,
      setAllUserConversations: state.setAllUserConversations,
      createNewConversation: state.createNewConversation,
    }))
  );

  const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined);
  const [designFiles, setDesignFiles] = useState<File[] | null>([]);
  const [otherFiles, setOtherFiles] = useState<File[] | null>([]);

  useEffect(() => {
    if (userId) {
      apiClient
        .get(`/conversations?user_id=${userId}`)
        .then(response => setAllUserConversations(response.data))
        .catch(console.error);
    }
  }, [userId]);

  useEffect(() => {
    // get all files
    if (selectedConversationId) {
      apiClient
        .get(`/upload?conversation_id=${selectedConversationId}`)
        .then(response => response.data)
        .then(data => {
          setDesignFiles([data.design]);
          setOtherFiles(data.guidelines);
        });
    } else {
      setDesignFiles(null);
      setOtherFiles(null);
    }
  }, [selectedConversationId]);

  const loadConversation = async (selectedConversationId: string | undefined) => {
    if (!selectedConversationId) {
      return;
    }
    setCurrentConversationId(selectedConversationId);
    const messages = await apiClient.get(`/conversations/conversation-messages?conversation_id=${selectedConversationId}`);
    setCurrentConversationMessages(messages.data.map((message: Message) => ({ ...message, isStreaming: false })));
  };

  const handleFileUpload = async (fileList: FileList, isDesign: boolean) => {
    if (!fileList || fileList.length === 0) return;
    setIsLoading(true);
    try {
      // for (let i = 0; i < fileList.length; i++) {
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
      if (isDesign) {
        if (designFiles) setDesignFiles([...designFiles, file]);
      } else {
        if (otherFiles) setOtherFiles([...otherFiles, file]);
      }
      if (response.data) {
        setCurrentConversationId(response.data.conversation_id);
      }
      setIsLoading(false);
      // }
    } catch (error) {
      console.error(error);
      setIsLoading(undefined);
      alert('Failed to upload one or more files.');
    }
  };

  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="flex h-full flex-col space-y-4">
        <div className="bg-lightBg2/90 flex items-center justify-between rounded-lg p-4 backdrop-blur-sm dark:bg-darkBg2/80">
          <button
            className="bg-lightBg3/50 hover:bg-lightBg4/50 rounded-xl p-3 text-textSecondary backdrop-blur-sm transition-all duration-300 hover:text-textPrimary hover:shadow-lg dark:bg-darkBg3/50 dark:text-textTert dark:hover:bg-darkBg4/50 dark:hover:text-textSecondary"
            onClick={createNewConversation}
            aria-label="Create New Conversation"
          >
            <IoCreateOutline size={'20px'} />
          </button>

          <div className="flex min-w-[100px] basis-1/12 items-center justify-center">
            <button
              className="bg-lightBg4/20 hover:bg-lightBg4/30 rounded-xl px-4 py-2 text-sm font-medium text-textSecondary backdrop-blur-sm transition-all duration-300 hover:text-textPrimary dark:bg-darkBg4/20 dark:hover:bg-darkBg4/30"
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="scrollbar-thin bg-lightBg3/30 flex-1 overflow-y-auto rounded-lg p-2 backdrop-blur-sm dark:bg-darkBg3/30">
          {allUserConversations.length > 0 && (
            <ul className="space-y-2">
              {allUserConversations.map(conversation => (
                <li
                  key={conversation.id}
                  className="flex list-none flex-col"
                >
                  <button
                    className={`w-full overflow-hidden truncate rounded-lg p-3 text-sm font-medium transition-all duration-300 ${
                      conversation.id === selectedConversationId
                        ? 'bg-lightBg4/20 text-textPrimary shadow-md dark:bg-darkBg4/20 dark:text-textSecondary'
                        : 'bg-lightBg3/50 hover:bg-lightBg4/50 text-textSecondary hover:text-textPrimary dark:bg-darkBg3/50 dark:text-textTert dark:hover:bg-darkBg4/50 dark:hover:text-textSecondary'
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

        <div className="bg-lightBg3/30 flex-shrink-0 rounded-lg p-4 backdrop-blur-sm dark:bg-darkBg3/30">
          <h3 className="mb-4 text-center text-base font-semibold text-textPrimary dark:text-textSecondary">Design Upload</h3>

          <div className="w-full overflow-y-auto">
            {designFiles && designFiles.length > 0 && (
              <ul className="mb-4 space-y-2">
                {designFiles
                  .filter(file => file !== null) // Filter out null values
                  .map((file, index) => (
                    <li
                      key={(file.lastModified || '') + '' + index + 'other'}
                      className="bg-lightBg4/50 hover:bg-lightBg4/70 flex flex-col space-y-1 rounded-lg p-3 text-sm text-textSecondary transition-all duration-300 dark:bg-darkBg3/50 dark:text-textTert dark:hover:bg-darkBg4/50"
                    >
                      <span>{truncateMiddle(file.name, 15)}</span>
                      <span>{truncateMiddle(file.type, 15)}</span>
                      <span>{(file.size / 1000000).toFixed(2)} MB</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div>
            <div className="flex min-w-0 flex-1 flex-col content-center justify-center truncate">
              <CustomFileUploader
                handleChange={(fileList: FileList) => handleFileUpload(fileList, true)}
                multiple={true}
                name="design"
                types={fileTypes}
                className="bg-lightBg3/30 hover:border-lightBg4/30 hover:bg-lightBg4/30 border-lightBg4/30 flex min-h-[50px] w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-4 text-center text-textSecondary transition-all duration-300 hover:text-textPrimary dark:border-darkBg4/50 dark:bg-darkBg3/30 dark:text-textTert dark:hover:text-textSecondary"
              />
            </div>
          </div>
        </div>

        <div className="bg-lightBg3/30 flex-shrink-0 rounded-lg p-4 backdrop-blur-sm dark:bg-darkBg3/30">
          <h3 className="mb-4 text-center text-base font-semibold text-textPrimary dark:text-textSecondary">Guideline Upload</h3>
          <div className="w-full overflow-y-auto">
            {otherFiles !== null && otherFiles.length > 0 && (
              <ul className="mb-4 space-y-2">
                {otherFiles
                  .filter(file => file !== null)
                  .map((file, index) => (
                    <li
                      key={file.lastModified + index + 'other'}
                      className="bg-lightBg4/50 hover:bg-lightBg4/70 flex flex-col space-y-1 rounded-lg p-3 text-sm text-textSecondary transition-all duration-300 dark:bg-darkBg3/50 dark:text-textTert dark:hover:bg-darkBg4/50"
                    >
                      <span>{truncateMiddle(file.name, 15)}</span>
                      <span>{truncateMiddle(file.type, 15)}</span>
                      <span>{file.size / 1000000} MB</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          {!isLoading && (
            <div className="w-full">
              <div className="w-full min-w-0 flex-1 flex-col content-center justify-center truncate">
                <CustomFileUploader
                  handleChange={(fileList: FileList) => handleFileUpload(fileList, false)}
                  multiple={true}
                  name="guideline"
                  types={['PDF']}
                  className="bg-lightBg3/30 hover:border-lightBg4/30 hover:bg-lightBg4/30 border-lightBg4/30 flex min-h-[50px] w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-4 text-center text-textSecondary transition-all duration-300 hover:text-textPrimary dark:border-darkBg4/50 dark:bg-darkBg3/30 dark:text-textTert dark:hover:text-textSecondary"
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
