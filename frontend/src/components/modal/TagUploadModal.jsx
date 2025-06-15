import React, { useState } from 'react';
import './TagUploadModal.css';

// Define the color palette for easy reference
/**
 * TextUploadModal Component
 * A modal for users to input either a single-line link or multi-line text/code.
 * It features rounded borders, placeholders, and an upload button,
 * styled with a custom color palette using plain CSS.
 *
 * @param {object} props - Component props
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {function} props.onUpload - Callback function when the upload button is clicked.
 */
const TagUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [titleInput, setLinkInput] = useState('');

  // If the modal is not open, don't render anything
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
