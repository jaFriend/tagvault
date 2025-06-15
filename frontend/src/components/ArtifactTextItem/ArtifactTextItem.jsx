import { useState, useRef, useEffect } from 'react';
import styles from './ArtifactTextItem.module.css';
import TagItem from '../TagItem';

const ArtifactTextItem = ({ artifactId, title, content, onRemove, tags, onAddTag, onRemoveTag, onEditArtifact }) => {
  const [showAddTagInput, setShowAddTagInput] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const tagsScrollContainerRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  useEffect(() => {
    if (tagsScrollContainerRef.current && showAddTagInput) {
      tagsScrollContainerRef.current.scrollLeft = tagsScrollContainerRef.current.scrollWidth;
    }
  }, [tags, showAddTagInput]);

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
    setEditedContent(content);
  };

  const handleSaveEdit = () => {
    onEditArtifact(artifactId, editedTitle.trim(), editedContent.trim());
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(title);
    setEditedContent(content);
  };

  return (
    <div className={styles.artifactCard}>
      <div className={styles.cardActions}>
        {!isEditing && (
          <button
            className={`${styles.actionButton} ${styles.editButton}`}
            onClick={handleEditClick}
            aria-label="Edit artifact"
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
            placeholder="Title"
            aria-label="Edit artifact title"
          />
        ) : (
          title && title.trim() !== '' && (
            <h3 className={styles.title}>{title}</h3>
          )
        )}
      </div>

      {isEditing ? (
        <textarea
          className={styles.editContentTextarea}
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          placeholder="Content"
          aria-label="Edit artifact content"
        />
      ) : (
        <p className={styles.content}>{content}</p>
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
}

export default ArtifactTextItem;
