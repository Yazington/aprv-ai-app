import { useEffect, useState } from 'react';
import { apiClient } from '../services/axiosConfig';
import { useConversationStore } from '../stores/conversationsStore';
import { useShallow } from 'zustand/react/shallow';
import { IoImageOutline, IoDocumentTextOutline, IoTimeOutline } from 'react-icons/io5';

interface FileInfo {
  name: string;
  type?: string | null;
  size: number;
}

export const UploadedFiles = () => {
  const { selectedConversationId } = useConversationStore(
    useShallow(state => ({
      selectedConversationId: state.selectedConversationId,
    }))
  );

  const [designFile, setDesignFile] = useState<FileInfo | null>(null);
  const [guidelineFiles, setGuidelineFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!selectedConversationId) {
        setDesignFile(null);
        setGuidelineFiles([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiClient.get(`/upload?conversation_id=${selectedConversationId}`);
        const { design, guidelines } = response.data;
        setDesignFile(design || null);
        setGuidelineFiles(Array.isArray(guidelines) ? guidelines : guidelines ? [guidelines] : []);
      } catch (error) {
        console.error('Error fetching files:', error);
        setDesignFile(null);
        setGuidelineFiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [selectedConversationId]);

  if (isLoading) {
    return (
      <div className="sticky top-0 z-10 border-b border-lightBg3 bg-lightBg2/95 p-4 backdrop-blur-sm dark:border-darkBg3 dark:bg-darkBg2/95">
        <div className="flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-lightBg4 border-t-textPrimary dark:border-darkBg4 dark:border-t-textSecondary"></div>
        </div>
      </div>
    );
  }

  if (!designFile && guidelineFiles.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 space-y-2 border-b border-lightBg3 bg-lightBg2/95 p-4 backdrop-blur-sm dark:border-darkBg3 dark:bg-darkBg2/95">
      {/* Design File Section */}
      {designFile && (
        <div className="rounded-lg bg-lightBg3 p-3 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-darkBg3">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-textPrimary dark:text-textSecondary">
            <IoImageOutline className="h-4 w-4" />
            Design
          </h4>
          <div className="text-xs text-textSecondary dark:text-textTert">
            <div className="flex items-center justify-between">
              <p className="max-w-[200px] truncate font-medium">{designFile.name}</p>
              <p className="dark:text-textTert/80 ml-2 text-textTert">{(designFile.size / 1000000).toFixed(2)} MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Section */}
      {guidelineFiles.length > 0 && (
        <div className="rounded-lg bg-lightBg3 p-3 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-darkBg3">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-textPrimary dark:text-textSecondary">
            <IoDocumentTextOutline className="h-4 w-4" />
            Guidelines ({guidelineFiles.length})
          </h4>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {guidelineFiles.map((file, index) => (
              <div
                key={index}
                className="flex flex-col justify-between rounded-md bg-lightBg2/50 p-2 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-darkBg2/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="max-w-[200px] truncate text-xs font-medium text-textSecondary dark:text-textTert">{file.name}</p>
                  <div className="dark:text-textTert/80 flex items-center text-[10px] text-textTert">
                    <IoTimeOutline className="mr-1 h-3 w-3" />
                    {index + 1}/{guidelineFiles.length}
                  </div>
                </div>
                <p className="dark:text-textTert/80 mt-1 text-right text-[10px] text-textTert">{(file.size / 1000000).toFixed(2)} MB</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
