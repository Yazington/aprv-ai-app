import { useEffect, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { apiClient } from '../services/axiosConfig';
import { Conversation } from '../types/Conversation';

const fileTypes = ['PNG', 'JPG', 'JPEG', 'PDF'];

interface Props {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export default ({ setIsLoggedIn }: Props) => {
  const [designFiles, setDesignFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const userId = localStorage.getItem('user_id');
  // console.log(conversations);
  useEffect(() => {
    if (userId) {
      apiClient.get(`/conversations?user_id=${userId}`).then(response => setConversations(response.data));
    }
  }, [userId]);

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('exp');
    localStorage.removeItem('user_id');
  };
  const handleFileUpload = async (fileList: FileList, isDesign: boolean) => {
    if (!fileList || fileList.length === 0) return;

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!file) continue;
        const formData = new FormData();
        formData.append('file', file);

        let uploadUrl = `/upload/image?conversation_id=${localStorage.getItem('current_conversation_id')}`;
        if (file.type === 'application/pdf') {
          uploadUrl = `/upload/pdf?conversation_id=${localStorage.getItem('current_conversation_id')}`;
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
          localStorage.setItem('current_conversation_id', response.data.conversation_id);
        }

        console.log(`File ${i + 1} uploaded successfully!`);
      }
      alert('All files uploaded successfully!');
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
      <div className="flex max-h-[200px] overflow-y-auto">
        {conversations.length > 0 && (
          <ul className="w-full list-inside list-disc pl-0">
            {conversations.map((conversation, index) => (
              <li
                key={`conversation ${index}`}
                className="flex list-none flex-col border-[0.5px] border-r-amber-200 hover:bg-sky-700"
              >
                <button className="rounded-full bg-buttonBlack px-4 py-2 font-bold text-textSecondary transition delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-slate-900">
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
              {designFiles.map((file, index) => (
                <li
                  key={index}
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
              {otherFiles.map((file, index) => (
                <li
                  key={index}
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
