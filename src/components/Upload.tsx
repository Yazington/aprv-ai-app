import { useEffect, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { apiClient } from '../services/axiosConfig';
import { useAuthStore } from '../stores/authStore';
import { useConversationStore } from '../stores/conversationsStore';
import { useShallow } from 'zustand/react/shallow';
import { Message } from '../types/Message';

const fileTypes = ['PNG', 'JPG', 'JPEG', 'PDF'];

export default () => {
  const { userId, logout } = useAuthStore(useShallow(state => ({ userId: state.user_id, logout: state.logout })));
  const {
    allUserConversations,
    currentlySelectedConversationId,
    selectedConversation,
    setCurrentConversationId,
    setAllUserConversations,
    setCurrentConversationMessages,
  } = useConversationStore(
    useShallow(state => ({
      currentlySelectedConversationId: state.selectedConversationId,
      allUserConversations: state.allUserConversations,
      setCurrentConversationId: state.setSelectedConversationId,
      setCurrentConversationMessages: state.setSelectedConversationMessages,
      setAllUserConversations: state.setAllUserConversations,
      selectedConversation: state.selectedConversation,
    }))
  );
  const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined);

  const [designFiles, setDesignFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  // TODO: check if we need to save those files on disk instead
  const isDesignAlreadyUploaded = selectedConversation?.design_id ? true : false;
  const isGuidelineAlreadyUploaded = selectedConversation?.contract_id ? true : false;
  // const isLoading = designFiles?.length > 0 && isGuidelineAlreadyUploaded == false;
  console.log('up' + isGuidelineAlreadyUploaded);
  console.log(designFiles?.length);
  useEffect(() => {
    if (userId) {
      apiClient.get(`/conversations?user_id=${userId}`).then(response => setAllUserConversations(response.data));
    }
  }, [userId]);

  //TODO: put this logic in the store instead
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
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!file) continue;
        const formData = new FormData();
        formData.append('file', file);

        let uploadUrl = `/upload/image?conversation_id=${currentlySelectedConversationId}`;
        if (file.type === 'application/pdf') {
          uploadUrl = `/upload/pdf?conversation_id=${currentlySelectedConversationId}`;
        }

        const response = await apiClient.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (isDesign) {
          setDesignFiles([...designFiles, file]);
        } else {
          setOtherFiles([...otherFiles, file]);
        }
        if (response.data) {
          setCurrentConversationId(response.data.conversation_id);
        }
        setIsLoading(false);
        console.log(`File ${i + 1} uploaded successfully!`);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(undefined);
      alert('Failed to upload one or more files.');
    }
  };
  console.log(isLoading);
  // Giving percentage size for this will add sliding window -> we can fix it by making sure the sizes of element within the container arent overflowing
  return (
    <div className="flex min-w-0 basis-[10%]">
      <div className="flex h-screen w-full min-w-0 flex-col content-center justify-center shadow-all-around">
        <div className="flex min-w-0 basis-1/12 items-center justify-center">
          <button
            className="rounded-full bg-darkBg4 px-4 py-2 text-textSecondary shadow-all-around transition delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-slate-900"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
        <div className="flex w-full min-w-0 basis-7/12 overflow-y-auto overflow-x-hidden bg-darkBg2">
          {allUserConversations.length > 0 && (
            <ul className="w-full list-inside list-disc pl-0">
              {allUserConversations.map(conversation => (
                <li
                  key={conversation.id}
                  className="flex list-none flex-col"
                >
                  <button
                    className="w-full overflow-hidden truncate whitespace-nowrap rounded-lg bg-buttonBlack p-2 text-sm font-medium text-textSecondary transition hover:bg-slate-800"
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
          {isDesignAlreadyUploaded && selectedConversation?.design_id}
          {!isDesignAlreadyUploaded && (
            <div>
              <div className="overflow-y-auto">
                {designFiles.length > 0 && (
                  <ul className="w-full list-inside list-disc pl-0">
                    {designFiles.map(file => (
                      <li
                        key={file.lastModified}
                        className="flex list-none flex-col border-[0.5px] border-r-amber-200"
                      >
                        <span>{file.name}</span>
                        <span className="text-gray-500">{file.type}</span>
                        <span className="text-gray-500">{file.size / 1000000} MB</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col content-center justify-center truncate">
                <FileUploader
                  handleChange={(fileList: FileList) => handleFileUpload(fileList, true)}
                  multiple={true}
                  name="design"
                  types={fileTypes}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex w-full min-w-0 basis-2/12 flex-col items-center justify-center truncate">
          <div className="w-full items-center justify-center text-pretty text-center">Guideline Upload</div>
          {isGuidelineAlreadyUploaded && selectedConversation?.contract_id}
          {isLoading && (
            <div
              role="status"
              className="w-full items-center justify-center"
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
          {!isLoading && !isGuidelineAlreadyUploaded && (
            <div>
              <div className="overflow-y-auto">
                {otherFiles.length > 0 && (
                  <ul className="w-full list-inside list-disc pl-0">
                    {otherFiles.map(file => (
                      <li
                        key={file.lastModified}
                        className="flex list-none flex-col border-[0.5px] border-r-amber-200 hover:bg-sky-700"
                      >
                        <span>{file.name}</span>
                        <span>{file.type}</span>
                        <span>{file.size / 1000000} MB</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col content-center justify-center truncate">
                <FileUploader
                  handleChange={(fileList: FileList) => handleFileUpload(fileList, false)}
                  multiple={true}
                  name="guideline"
                  types={fileTypes}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
