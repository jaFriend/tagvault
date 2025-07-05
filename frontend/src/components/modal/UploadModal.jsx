import { useState } from 'react';
import styles from './UploadModal.module.css';

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [activeTab, setActiveTab] = useState('TEXT');

  const [textTitleInput, setTextTitleInput] = useState('');
  const [textBodyInput, setTextBodyInput] = useState('');
  const [fileTitleInput, setFileTitleInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) {
    return null;
  }

  const handleTextUpload = () => {
    onUpload({
      type: 'TEXT',
      data: {
        title: textTitleInput,
        text: textBodyInput
      }
    });
    clearForms();
    onClose();
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }
    console.log(selectedFile)
    onUpload({
      type: 'FILE',
      data: {
        title: fileTitleInput,
        file: selectedFile
      }
    });
    clearForms();
    onClose();
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const clearForms = () => {
    setTextTitleInput('');
    setTextBodyInput('');
    setFileTitleInput('');
    setSelectedFile(null);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button
          onClick={handleClose}
          className={styles.modalCloseButton}
          aria-label="Close"
        >
          &times;
        </button>

        <div className={styles.modalTitleBar}>
          <h2 className={styles.modalTitle}>Upload Content</h2>
        </div>

        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'TEXT' ? styles.active : ''}`}
            onClick={() => {
              setActiveTab('TEXT');
            }}
          >
            Text/Code
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'FILE' ? styles.active : ''}`}
            onClick={() => {
              setActiveTab('FILE');
            }}
          >
            File
          </button>
        </div>
        {activeTab === 'TEXT' && (
          <div className={`${styles.tabContent} ${styles.textUploadForm}`}>
            <div className={styles.inputGroup}>
              <label htmlFor="text-title-input" className={styles.inputLabel}>
                Title (Optional)
              </label>
              <input
                id="text-title-input"
                type="TEXT"
                value={textTitleInput}
                onChange={(e) => setTextTitleInput(e.target.value)}
                placeholder="Enter Title here..."
                className={styles.textInputField}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="text-body-input" className={styles.inputLabel}>
                Text / Code / Paragraph
              </label>
              <textarea
                id="text-body-input"
                value={textBodyInput}
                onChange={(e) => {
                  setTextBodyInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                  }

                }}
                placeholder="Enter your text here..."
                rows="8"
                className={`${styles.textInputField} ${styles.textAreaField}`}
              ></textarea>
            </div>

            <div className={styles.uploadButtonContainer}>
              <button
                onClick={handleTextUpload}
                className={styles.uploadButton}
                disabled={!textBodyInput.trim()}
              >
                Upload Text
              </button>
            </div>
          </div>
        )}

        {activeTab === 'FILE' && (
          <div className={`${styles.tabContent} ${styles.fileUploadForm}`}>
            <div className={styles.inputGroup}>
              <label htmlFor="file-title-input" className={styles.inputLabel}>
                Title (Optional)
              </label>
              <input
                id="file-title-input"
                type="TEXT"
                value={fileTitleInput}
                onChange={(e) => setFileTitleInput(e.target.value)}
                placeholder="Enter Title for file..."
                className={styles.textInputField}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="file-upload-input" className={styles.inputLabel}>
                Select File
              </label>
              <input
                id="file-upload-input"
                type="FILE"
                onChange={handleFileChange}
                className={styles.fileInputField}
              />
              {selectedFile && (
                <p className={styles.selectedFileInfo}>Selected: {selectedFile.name}</p>
              )}
            </div>

            <div className={styles.uploadButtonContainer}>
              <button
                onClick={handleFileUpload}
                className={styles.uploadButton}
                disabled={!selectedFile}
              >
                Upload File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
