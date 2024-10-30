import { useEffect, useState } from 'react';
import { apiClient } from '../services/axiosConfig';
import { useAuthStore } from '../stores/authStore';
import { useConversationStore } from '../stores/conversationsStore';
import { useShallow } from 'zustand/react/shallow';
import { Message } from '../types/Message';
import CustomFileUploader from './CustomFileUploader';
import { IoCreateOutline } from 'react-icons/io5';

const fileTypes = ['PNG', 'JPG', 'JPEG', 'PDF'];

export default () => {
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
    <div className="flex min-w-0 basis-[10%] bg-darkBg4">
      <div className="flex h-screen w-full min-w-0 basis-[100%] flex-col content-center justify-center shadow-all-around">
        <div className="flex max-h-[100px] w-full basis-1/12 flex-row items-center justify-evenly">
          <button
            className="rounded-full bg-darkBg4 p-2 text-textSecondary shadow-all-around transition delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:text-gray-200 hover:shadow-lg"
            onClick={createNewConversation}
            aria-label="Create New Conversation"
          >
            <IoCreateOutline size={'25px'} />
          </button>

          <div className="flex min-w-[100px] basis-1/12 items-center justify-center">
            <button
              className="rounded-full bg-darkBg4 px-4 py-2 text-textSecondary shadow-all-around transition delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:text-gray-200 hover:shadow-lg"
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="flex w-full min-w-0 basis-7/12 overflow-y-auto overflow-x-hidden">
          {allUserConversations.length > 0 && (
            <ul className="w-full list-inside list-disc pl-0">
              {allUserConversations.map(conversation => (
                <li
                  key={conversation.id}
                  className="flex list-none flex-col"
                >
                  <button
                    className={`w-full overflow-hidden truncate whitespace-nowrap p-2 text-sm font-medium transition ${
                      conversation.id === selectedConversationId
                        ? 'text-highlightText bg-sky-700' // Add your styles for the selected conversation here
                        : 'bg-buttonBlack text-textSecondary hover:bg-slate-800'
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

        <div className="flex min-w-0 basis-2/12 flex-col truncate">
          <div className="min-w-0 truncate text-pretty text-center">Design Upload</div>

          <div className="w-full overflow-y-auto">
            {designFiles && designFiles.length > 0 && (
              <ul className="w-full list-inside list-disc pl-0">
                {designFiles
                  .filter(file => file !== null) // Filter out null values
                  .map((file, index) => (
                    <li
                      key={(file.lastModified || '') + '' + index + 'other'}
                      className="flex list-none flex-col border-[0.5px] text-sm text-textTert hover:bg-sky-700"
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
                className="flex min-h-[50px] w-full items-center justify-center border-2 border-dashed bg-darkBg2 text-center"
              />
            </div>
          </div>
        </div>

        <div className="flex w-full min-w-0 basis-2/12 flex-col items-center justify-center truncate">
          <div className="w-full items-center justify-center text-pretty text-center">Guideline Upload</div>
          <div className="w-full overflow-y-auto">
            {otherFiles !== null && otherFiles.length > 0 && (
              <ul className="w-full list-inside list-disc pl-0">
                {otherFiles &&
                  otherFiles.length > 0 &&
                  otherFiles
                    .filter(file => file !== null) // Filter out null values
                    .map((file, index) => (
                      <li
                        key={file.lastModified + index + 'other'}
                        className="flex list-none flex-col border-[0.5px] text-sm text-textTert hover:bg-sky-700"
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
                  className="flex min-h-[50px] w-full items-center justify-center border-2 border-dashed bg-darkBg2 text-center"
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
                className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
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
};
function truncateMiddle(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  const endLength = Math.floor(maxLength / 2);
  return `${text.slice(0, endLength)}...${text.slice(-endLength)}`;
}
