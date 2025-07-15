import React, { useCallback, useState } from 'react';
import styles from './MainUserPage.module.css';
import { useUser } from '@clerk/clerk-react'
import SearchInput from '../SearchInput';
import UploadModal from '../modal/UploadModal';
import TagUploadModal from '../modal/TagUploadModal';
import TagItem from '../TagItem'
import ArtifactList from '../ArtifactList';
import useArtifacts from '../../hooks/useArtifacts';
import useTags from '../../hooks/useTags';
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const MainUserPage = () => {
  const { user } = useUser();
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const handleFileModalOpen = () => { setIsFileModalOpen(true); };
  const handleFileModalClose = () => { setIsFileModalOpen(false); };
  const [searchValue, setSearchValue] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);


  const { tags, isLoadingTags, tagError,
    addTag, removeTag, fetchTagsData } = useTags(user.id, SERVER_URL);
  const { artifacts, isLoadingArtifacts, artifactError,
    addArtifact, removeArtifact, onRemoveTag,
    onAddTag, fetchArtifactsData, editArtifact } = useArtifacts(user.id, SERVER_URL, searchValue, selectedTagIds);

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const handleTagModalOpen = () => { setIsTagModalOpen(true); };
  const handleTagModalClose = () => { setIsTagModalOpen(false); };

  const fetchTagsDataOnAddTag = useCallback(async (artifactId, tagName) => {
    await onAddTag(artifactId, tagName);
    fetchTagsData();
  }, [onAddTag, fetchTagsData]);

  const fetchTagsDataOnRemoveTag = useCallback(async (artifactId, tagId) => {
    await onRemoveTag(artifactId, tagId);
    fetchTagsData();
  }, [onRemoveTag, fetchTagsData]);

  const fetchArtifactsOnRemoveTag = async (tagId) => {
    addRemoveSelectedTag(tagId, false);
    await removeTag(tagId);
    fetchArtifactsData();
  }

  const searchSubmit = (value) => {
    setSearchValue(value);
  }


  const addRemoveSelectedTag = (id, next) => {
    if (next)
      setSelectedTagIds(prev => prev.includes(id) ? prev : [...prev, id]);
    else
      setSelectedTagIds(prev => prev.includes(id) ? prev.filter(tag => tag !== id) : prev);
  };

  return (
    <div className={styles.mainContainer}>
      <h1>Welcome to your TagVault Dashboard!</h1>
      <SearchInput onSearchSubmit={searchSubmit} />
      <button
        onClick={handleFileModalOpen}
        className={styles.uploadButton}
      >
        Upload New Artifact
      </button>
      <button
        onClick={handleTagModalOpen}
        className={styles.uploadButton}
      >
        Upload New Tag
      </button>

      <div className={styles.contentContainer}>
        <h2>Your Tags</h2>
        {isLoadingTags && <p>Loading tags...</p>}
        {tagError && <p className={styles.errorMessage}>Error loading tags: {tagError}</p>}
        {!isLoadingTags && !tagError && tags.length === 0 && (
          <p>No tags created yet. Click "Upload New Tag" to add some!</p>
        )}
        <div className={styles.tagGrid}>
          {!isLoadingTags && !tagError && tags.map((tag) => (
            <TagItem
              key={tag.id}
              name={tag.name}
              id={tag.id}
              enableHighlight={true}
              addRemoveSelectedTag={addRemoveSelectedTag}
              onRemove={() => fetchArtifactsOnRemoveTag(tag.id)}
            />
          ))}
        </div>
        <h2>Your Artifacts</h2>
        {isLoadingArtifacts && <p>Loading artifacts...</p>}
        {artifactError && <p className={styles.errorMessage}>Error loading artifacts: {artifactError}</p>}
        {!isLoadingArtifacts && !artifactError && artifacts.length === 0 && (
          <p>You haven't uploaded any text artifacts yet. Click "Upload New Artifact" to add some!</p>
        )}
        <div className={styles.artifactGrid}>
          {!isLoadingArtifacts && !artifactError && (
            <ArtifactList
              artifacts={artifacts}
              onRemoveArtifact={removeArtifact}
              onAddTag={fetchTagsDataOnAddTag}
              onRemoveTag={fetchTagsDataOnRemoveTag}
              onEditArtifact={editArtifact}
            />
          )}
        </div>
      </div>

      <UploadModal
        isOpen={isFileModalOpen}
        onClose={handleFileModalClose}
        onUpload={addArtifact}
      />
      <TagUploadModal
        isOpen={isTagModalOpen}
        onClose={handleTagModalClose}
        onUpload={addTag}
      />
    </div>
  );
};

export default MainUserPage;
