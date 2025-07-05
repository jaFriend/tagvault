import { useState, useRef, useEffect } from 'react';
import styles from './ArtifactFileItem.module.css';
import TagItem from '../TagItem';

const ArtifactFileItem = ({ artifactId, title, filename, fileSize, onRemove, tags, onAddTag, onRemoveTag, onEditArtifact }) => {
  const [showAddTagInput, setShowAddTagInput] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const tagsScrollContainerRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [newFile, setNewFile] = useState(null);

  useEffect(() => {
    if (tagsScrollContainerRef.current && showAddTagInput) {
      tagsScrollContainerRef.current.scrollLeft = tagsScrollContainerRef.current.scrollWidth;
    }
  }, [tags, showAddTagInput]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAddTag = () => {
    if (newTagValue.trim() !== '') {
      onAddTag(artifactId, newTagValue.trim());
      setNewTagValue('');
      setShowAddTagInput(false);
    } else {
      setNewTagValue('');
      setShowAddTagInput(false);
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowAddTagInput(false);
      setNewTagValue('');
    }
  };

  const handleInputBlur = () => {
    if (newTagValue.trim() === '') {
      setShowAddTagInput(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedTitle(title);
    setNewFile(null);
  };

  const handleFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  const handleSaveEdit = () => {
    onEditArtifact(artifactId, editedTitle.trim(), newFile);
    setIsEditing(false);
    setNewFile(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(title);
    setNewFile(null);
  };

  return (
    <div className={styles.artifactCard}>
      <div className={styles.cardActions}>
        {!isEditing && (
          <button
            className={`${styles.actionButton} ${styles.editButton}`}
            onClick={handleEditClick}
            aria-label="Edit file artifact"
          >
            Edit
          </button>
        )}
        {onRemove && (
          <button className={`${styles.actionButton} ${styles.removeButton}`} onClick={onRemove} aria-label="Remove artifact">
            &times;
          </button>
        )}
      </div>

      <div className={styles.artifactHeader}>
        {isEditing ? (
          <input
            type="text"
            className={styles.editTitleInput}
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="File Title"
            aria-label="Edit file artifact title"
          />
        ) : (
          title && title.trim() !== '' && (
            <h3 className={styles.title}>{title}</h3>
          )
        )}
      </div>

      {isEditing ? (
        <div className={styles.fileEditSection}>
          <label htmlFor="file-input-replace" className={styles.fileInputLabel}>
            Replace File (Optional):
          </label>
          <input
            id="file-input-replace"
            type="file"
            onChange={handleFileChange}
            className={styles.fileInputReplace}
          />
          {newFile ? (
            <p className={styles.newFileInfo}>New file selected: {newFile.name}</p>
          ) : (
            <p className={styles.currentFileInfo}>Current file: {filename} ({formatFileSize(fileSize)})</p>
          )}
        </div>
      ) : (
        <div className={styles.fileInfo}>
          <p className={styles.filename}>Filename: {filename}</p>
          <p className={styles.fileSize}>Size: {formatFileSize(fileSize)}</p>
        </div>
      )}

      {isEditing && (
        <div className={styles.editButtonsBottom}>
          <button className={`${styles.actionButton} ${styles.saveButton}`} onClick={handleSaveEdit}>Save</button>
          <button className={`${styles.actionButton} ${styles.cancelButton}`} onClick={handleCancelEdit}>Cancel</button>
        </div>
      )}

      <div className={styles.tagsSeparator}>
        Tags:
      </div>

      <div className={styles.tagsContainer} ref={tagsScrollContainerRef}>
        {tags.map((tag) => (
          <TagItem key={tag.id} name={tag.name} onRemove={() => onRemoveTag(artifactId, tag.id)} />
        ))}
        {!showAddTagInput ? (
          <button
            className={styles.addTagButton}
            onClick={() => setShowAddTagInput(true)}
            aria-label="Add new tag"
          >
            +
          </button>
        ) : (
          <input
            type="text"
            className={styles.newTagInput}
            value={newTagValue}
            onChange={(e) => setNewTagValue(e.target.value)}
            onKeyPress={handleInputKeyPress}
            onBlur={handleInputBlur}
            placeholder="New tag..."
            autoFocus
          />
        )}
      </div>
    </div>
  );
};

export default ArtifactFileItem;
