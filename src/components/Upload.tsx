import axios from 'axios';
import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';

const fileTypes = ['PNG', 'JPG', 'JPEG', 'PDF'];

export default () => {
  const [designFiles, setDesignFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);

  const handleFileUpload = async (fileList: FileList, isDesign: boolean) => {
    if (!fileList || fileList.length === 0) return;

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!file) continue;
        console.log(file);
        const formData = new FormData();
        formData.append('file', file);

        let uploadUrl = '/upload/image';
        if (file.type === 'application/pdf') {
          uploadUrl = '/upload/pdf';
        }

        await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (isDesign) {
          setDesignFiles([...designFiles, file]);
        } else {
          setOtherFiles([...otherFiles, file]);
        }

        console.log(`File ${i + 1} uploaded successfully!`);
      }
      alert('All files uploaded successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to upload one or more files.');
    }
  };
  return (
    <div className="flex flex-col h-screen justify-center content-center border-gray-700 border-l rounded-xl divide-y grid-cols-1">
      <div className="flex flex-col flex-1 p-4">
        <h4 className="text-center text-pretty text-4xl p-4">Design Upload</h4>
        <div className="max-h-[200px] overflow-y-auto">
          {designFiles.length > 0 && (
            <ul className="list-disc pl-6">
              {designFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex list-none flex-col border-r-amber-200 border-b-[0.5px] border-t-[0.5px]"
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
            handleChange={(fileList: FileList) => handleFileUpload(fileList, true)}
            multiple={true}
            name="file"
            types={fileTypes}
          />
        </div>
      </div>
      <div className="flex flex-col flex-1 p-4">
        <div className="text-center text-pretty text-4xl p-4">Other Upload</div>
        <div className="max-h-[200px] overflow-y-auto">
          {otherFiles.length > 0 && (
            <ul className="list-disc pl-6">
              {otherFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex list-none flex-col border-r-amber-200 border-b-[0.5px] border-t-[0.5px]"
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
