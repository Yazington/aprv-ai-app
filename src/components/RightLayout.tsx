import { useState, useEffect } from 'react';
import { apiClient } from '../services/axiosConfig';
import { useConversationStore } from '../stores/conversationsStore';
import CustomFileUploader from './CustomFileUploader';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

const fileTypes = ['PNG', 'JPG', 'JPEG', 'PDF'];

function truncateMiddle(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  const endLength = Math.floor(maxLength / 2);
  return `${text.slice(0, endLength)}...${text.slice(-endLength)}`;
}

export default function RightLayout() {
  const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined);
  const [designFiles, setDesignFiles] = useState<File[] | null>([]);
  const [otherFiles, setOtherFiles] = useState<File[] | null>([]);
  const selectedConversationId = useConversationStore(store => store.selectedConversationId);
  const setCurrentConversationId = useConversationStore(store => store.setSelectedConversationId);

  useEffect(() => {
    if (selectedConversationId) {
      apiClient
        .get(`/upload?conversation_id=${selectedConversationId}`)
        .then(response => response.data)
        .then(data => {
          setDesignFiles([data.design]);
          setOtherFiles(data.guidelines);
        })
        .catch(error => {
          console.error('Error loading files:', error);
          setDesignFiles(null);
          setOtherFiles(null);
        });
    } else {
      setDesignFiles(null);
      setOtherFiles(null);
    }
  }, [selectedConversationId]);

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
        headers: { 'Content-Type': 'multipart/form-data' },
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
    } catch (error) {
      console.error(error);
      setIsLoading(undefined);
      alert('Failed to upload one or more files.');
    }
  };
  return (
    <Card className="flex h-full flex-col bg-card text-card-foreground">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border bg-card p-4">
          <h2 className="text-base font-semibold">Files</h2>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Design Upload</h3>
              <div className="w-full overflow-hidden">
                {designFiles && designFiles.length > 0 && (
                  <ul className="mb-2 space-y-1">
                    {designFiles
                      .filter(file => file !== null)
                      .map((file, index) => (
                        <li
                          key={(file.lastModified || '') + '' + index + 'other'}
                          className="group relative rounded-lg border border-border bg-muted p-1.5 text-xs"
                        >
                          <div className="flex flex-col space-y-0.5">
                            <span className="font-medium text-foreground">
                              {truncateMiddle(file.name, 15)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {truncateMiddle(file.type, 15)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {(file.size / 1000000).toFixed(2)} MB
                            </span>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
                <CustomFileUploader
                  handleChange={(fileList: FileList) => handleFileUpload(fileList, true)}
                  multiple={true}
                  name="design"
                  types={fileTypes}
                  className="flex h-7 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 p-1 text-center text-xs text-muted-foreground transition-all hover:border-border/80 hover:bg-muted"
                />
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Guideline Upload</h3>
              <div className="w-full overflow-hidden">
                {otherFiles !== null && otherFiles.length > 0 && (
                  <ul className="mb-2 space-y-1">
                    {otherFiles
                      .filter(file => file !== null)
                      .map((file, index) => (
                        <li
                          key={file.lastModified + index + 'other'}
                          className="group relative rounded-lg border border-border bg-muted p-1.5 text-xs"
                        >
                          <div className="flex flex-col space-y-0.5">
                            <span className="font-medium text-foreground">
                              {truncateMiddle(file.name, 15)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {truncateMiddle(file.type, 15)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {(file.size / 1000000).toFixed(2)} MB
                            </span>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
                {!isLoading ? (
                  <CustomFileUploader
                    handleChange={(fileList: FileList) => handleFileUpload(fileList, false)}
                    multiple={true}
                    name="guideline"
                    types={['PDF']}
                    className="flex h-7 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 p-1 text-center text-xs text-muted-foreground transition-all hover:border-border/80 hover:bg-muted"
                  />
                ) : (
                  <div
                    role="status"
                    className="flex h-7 w-full items-center justify-center"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin text-muted-foreground"
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
        </ScrollArea>
      </div>
    </Card>
  );
};
