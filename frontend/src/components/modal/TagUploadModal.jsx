import React, { useState } from 'react';
import './TagUploadModal.css';

const TagUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [titleInput, setLinkInput] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleUpload = () => {
    onUpload({ title: titleInput });
    setLinkInput('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          onClick={onClose}
          className="modal-close-button"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="modal-title-bar">
          <h2 className="modal-title">Upload Content</h2>
        </div>
        <div className="input-group">
          <label htmlFor="link-input" className="input-label">
            Title
          </label>
          <input
            id="link-input"
            type="text"
            value={titleInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="Enter Title here..."
            className="text-input-field"
          />
        </div>

        <div className="upload-button-container">
          <button
            onClick={handleUpload}
            className="upload-button"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagUploadModal;
