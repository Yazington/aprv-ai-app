import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

interface CustomFileUploaderProps {
  handleChange: (files: FileList) => void;
  multiple?: boolean;
  name?: string;
  types?: string[];
  className?: string;
}

const CustomFileUploader: React.FC<CustomFileUploaderProps> = ({ handleChange, multiple = false, name, types = [], className = '' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleChange(e.target.files);
    }
  };

  const acceptedTypes = types.length ? types.map(type => `.${type.toLowerCase()}`).join(',') : undefined;

  return (
    <div
      className={`${className} ${dragActive ? 'drag-active' : ''} text-sm`}
      onClick={onButtonClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ cursor: 'pointer' }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        name={name}
        accept={acceptedTypes}
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      <div
        className="uploader-content"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <FontAwesomeIcon
          icon={faUpload}
          size="lg"
        />
      </div>
    </div>
  );
};

export default CustomFileUploader;
