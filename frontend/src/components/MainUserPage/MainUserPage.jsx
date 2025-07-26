import React, { useCallback, useEffect, useState } from 'react';
import styles from './MainUserPage.module.css';
import SearchInput from '../SearchInput';
import UploadModal from '../modal/UploadModal';
import TagUploadModal from '../modal/TagUploadModal';
import TagItem from '../TagItem'
import ArtifactList from '../ArtifactList';
import useArtifacts from '../../hooks/useArtifacts';
import useTags from '../../hooks/useTags';
import ErrorBanner from '../ErrorBanner/ErrorBanner';

const MainUserPage = () => {
  const [error, setError] = useState(null);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const {
    tags,
    isLoading: isLoadingTags,
    error: tagError,
    addTag,
    removeTag,
    fetchTagsData
  } = useTags();
  const {
    artifacts,
    error: artifactError,
    addArtifact,
    removeArtifact,
    onRemoveTag,
    onAddTag,
    fetchArtifactsData,
    editArtifact,
    hasMoreArtifacts,
    downloadFileArtifact
  } = useArtifacts(searchValue, selectedTagIds);
  const handleTagModalOpen = () => { setIsTagModalOpen(true); };
  const handleTagModalClose = () => { setIsTagModalOpen(false); };
  const handleFileModalOpen = () => { setIsFileModalOpen(true); };
  const handleFileModalClose = () => { setIsFileModalOpen(false); };

  useEffect(() => {
    if (artifactError) {
      setError(artifactError);
    } else if (tagError) {
      setError(tagError);
    }
  }, [artifactError, tagError]);

  const fetchTagsDataOnAddTag = useCallback(async (artifactId, tagName) => {
    await onAddTag(artifactId, tagName);
    fetchTagsData();
  }, [onAddTag, fetchTagsData]);

  const fetchTagsDataOnRemoveTag = useCallback(async (artifactId, tagId) => {
    await onRemoveTag(artifactId, tagId);
    fetchTagsData();
  }, [onRemoveTag, fetchTagsData]);

  const fetchTagsDataOnRemoveArtifact = useCallback(async (artifactId) => {
    await removeArtifact(artifactId);
    fetchTagsData();

  }, [fetchTagsData, removeArtifact]);

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
        <h2 className={styles.boldText}>Your Tags</h2>
        {tags.length === 0 && (
          <p>No tags created yet. Click "Upload New Tag" to add some!</p>
        )}
        <div className={styles.tagGrid}>
          {!isLoadingTags && tags.map((tag) => (
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
        <h2 className={styles.boldText}>Your Artifacts</h2>
        {artifacts.length === 0 && selectedTagIds.length === 0 && searchValue === "" && (
          <p>You haven't uploaded any text artifacts yet. Click "Upload New Artifact" to add some!</p>
        )}
        {(searchValue !== "" || selectedTagIds.length > 0 || (searchValue === "" && selectedTagIds.length === 0)) && (artifacts.length > 0 || searchValue !== "" || selectedTagIds.length > 0) && (
          <div className={styles.artifactGrid}>
            <ArtifactList
              artifacts={artifacts}
              fetchArtifactsData={fetchArtifactsData}
              onRemoveArtifact={fetchTagsDataOnRemoveArtifact}
              onAddTag={fetchTagsDataOnAddTag}
              onRemoveTag={fetchTagsDataOnRemoveTag}
              onEditArtifact={editArtifact}
              hasMoreItems={hasMoreArtifacts}
              downloadFileArtifact={downloadFileArtifact}
            />
          </div>
        )}
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
      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
    </div>
  );
};

export default MainUserPage;
