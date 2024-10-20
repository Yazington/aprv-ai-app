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
  const { allUserConversations, currentlySelectedConversationId, setCurrentConversationId, setAllUserConversations, setCurrentConversationMessages } =
    useConversationStore(
      useShallow(state => ({
        currentlySelectedConversationId: state.selectedConversationId,
        allUserConversations: state.allUserConversations,
        setCurrentConversationId: state.setSelectedConversationId,
        setCurrentConversationMessages: state.setSelectedConversationMessages,
        setAllUserConversations: state.setAllUserConversations,
      }))
    );
  const [designFiles, setDesignFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  // TODO: check if we need to save those files on disk instead

  useEffect(() => {
    if (userId) {
      apiClient.get(`/conversations?user_id=${userId}`).then(response => setAllUserConversations(response.data));
    }
  }, [userId]);

  //TODO: put this logic in the store instead
  const loadConversation = async (selectedConversationId: string | null) => {
    if (!selectedConversationId) {
      return;
    }
    setCurrentConversationId(selectedConversationId);
    const messages = await apiClient.get(`/conversations/conversation-messages?conversation_id=${selectedConversationId}`);
    setCurrentConversationMessages(messages.data.map((message: Message) => ({ ...message, isStreaming: false })));
  };

  const handleFileUpload = async (fileList: FileList, isDesign: boolean) => {
    if (!fileList || fileList.length === 0) return;

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

        console.log(`File ${i + 1} uploaded successfully!`);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to upload one or more files.');
    }
  };
  // Giving percentage size for this will add sliding window -> we can fix it by making sure the sizes of element within the container arent overflowing
  return (
    <div className="flex h-screen grid-cols-1 flex-col content-center justify-center rounded-xl shadow-lg shadow-black">
      <div className="flex flex-[0.5] items-center justify-center">
        <button
          className="rounded-full bg-buttonBlack px-4 py-2 font-bold text-textSecondary transition delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-slate-900"
          onClick={logout}
        >
          Log Out
        </button>
      </div>
      <div className="flex max-h-[200px] overflow-y-auto bg-darkBg2">
        {allUserConversations.length > 0 && (
          <ul className="w-full list-inside list-disc pl-0">
            {allUserConversations.map(conversation => (
              <li
                key={conversation.id}
                className="mb-2 flex list-none flex-col"
              >
                <button
                  className="transform rounded-lg bg-buttonBlack px-3 py-1 text-sm font-medium text-textSecondary transition hover:bg-slate-800"
                  onClick={() => loadConversation(conversation.id)}
                >
                  conversation id: {conversation.id}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="text-pretty p-4 text-center text-4xl">Design Upload</div>
        <div className="max-h-[200px] overflow-y-auto">
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
        <div className="flex flex-1 flex-col content-center justify-center">
          <FileUploader
            handleChange={(fileList: FileList) => handleFileUpload(fileList, true)}
            multiple={true}
            name="file"
            types={fileTypes}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-pretty p-4 text-center text-4xl">Contract Upload</div>
        <div className="max-h-[200px] overflow-y-auto">
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
        <div className="flex flex-1 flex-col content-center justify-center">
          <FileUploader
            handleChange={(fileList: FileList) => handleFileUpload(fileList, false)}
            multiple={true}
            name="file"
            types={fileTypes}
          />
        </div>
      </div>
    </div>
  );
};
