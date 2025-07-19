import { useState, useEffect, useCallback, useRef } from 'react';
import vaultRequest, { vaultRequests } from '../services/requests';
import sasCache from '../services/sasCache';

const formatTextArtifact = (artifact) => ({
  id: artifact.id,
  title: artifact.title,
  content: artifact.textContent,
  inputType: artifact.fileType,
  tags: artifact.tags || []
});

const formatFileArtifact = (artifact) => ({
  id: artifact.id,
  title: artifact.title,
  filename: artifact.fileName,
  fileURL: artifact.fileUrl,
  fileSize: artifact.fileSize,
  inputType: artifact.fileType,
  tags: artifact.tags || [],
  isImage: artifact.isImage
});

const useArtifacts = (searchValue, tagList) => {
  const [artifacts, setArtifacts] = useState([
    {
      id: "123413-551",
      title: "Test",
      filename: "coolage.txt",
      fileURL: "https://example.com/",
      fileSize: 1024 * 1024 * 1024,
      inputType: "FILE",
      tags: [],
      isImage: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMoreArtifacts, setHasMoreArtifacts] = useState(false);
  const [initialFetch, setInitialFetch] = useState(false);
  const isFetchingRef = useRef(false);
  const nextCursorRef = useRef(null);

  const fetchArtifactsData = useCallback(async ({ limit = 6, isNewSearch = false } = {}) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const base = '/api/artifacts/';
      const query = new URLSearchParams({ searchValue });
      query.append('tags', '');
      tagList.forEach(tag => query.append('tags', tag));
      query.append('limit', limit);
      if (nextCursorRef.current) {
        query.append('cursor', nextCursorRef.current);
      }

      const res = await vaultRequest({
        method: vaultRequests.GET,
        path: `${base}?${query}`,
      });

      const json = res.data;
      const fetchedArtifacts = json.data.artifacts || [];
      nextCursorRef.current = json.data.nextCursor;
      setHasMoreArtifacts(json.data.hasMoreArtifacts);
      if (isNewSearch) setArtifacts([]);
      setArtifacts(prev =>
        [...prev, ...fetchedArtifacts.map(formatTextArtifact)]
      );
    } catch (err) {
      setError(err.message);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [searchValue, tagList]);

  useEffect(() => {
    if (!initialFetch) {
      setInitialFetch(true);
      fetchArtifactsData();
    } else {
      setHasMoreArtifacts(false);
      setIsLoading(true);
      nextCursorRef.current = null;
      fetchArtifactsData({ isNewSearch: true });
    }

  }, [fetchArtifactsData, initialFetch, searchValue]);

  const onRemoveTag = async (artifactId, tagId) => {
    const index = artifacts.findIndex(item => item.id === artifactId);
    const originalArtifact = index !== -1 ? artifacts[index] : undefined;

    setArtifacts(prevArtifacts =>
      prevArtifacts.map(artifact =>
        artifact.id === artifactId
          ? { ...artifact, tags: artifact.tags.filter(tag => tag.id !== tagId) }
          : artifact
      )
    );


    try {
      const url = `/api/artifacts/${artifactId}/tags/${tagId}`;

      const res = await vaultRequest({
        method: vaultRequests.DELETE,
        path: url,
      });

      const json = res.data;

      setArtifacts(prevArtifacts =>
        prevArtifacts.map(artifact =>
          artifact.id === artifactId
            ? { ...artifact, tags: json.data.tags || [] }
            : artifact
        )
      );
    } catch (err) {
      setArtifacts(prev => {
        const newArray = [...prev];
        if (originalArtifact) {
          newArray[index] = originalArtifact;
        }
        return newArray;
      });
      setError(err.message);
    }
  };

  const onAddTag = async (artifactId, tagName) => {
    const index = artifacts.findIndex(item => item.id === artifactId);
    const originalArtifact = index !== -1 ? artifacts[index] : undefined;
    const tempTag = {
      id: `temp-${Date.now()}`,
      name: tagName,
    };

    setArtifacts(prevArtifacts =>
      prevArtifacts.map(artifact =>
        artifact.id === artifactId
          ? { ...artifact, tags: [...artifact.tags, tempTag] }
          : artifact
      )
    );

    try {
      const url = `/api/artifacts/${artifactId}/tags`;
      const res = await vaultRequest({
        method: vaultRequests.POST,
        path: url,
        payload: {
          "tagName": tagName
        },
      });
      const json = res.data;

      setArtifacts(prevArtifacts =>
        prevArtifacts.map(artifact =>
          artifact.id === artifactId
            ? { ...artifact, tags: json.data.artifact.tags || [] }
            : artifact
        )
      );
    } catch (err) {
      setArtifacts(prev => {
        const newArray = [...prev];
        if (originalArtifact) {
          newArray[index] = originalArtifact;
        }
        return newArray;
      });
      setError(err.message);
    }
  }; const addArtifact = async ({ type, data }) => {

    if (type === 'TEXT') {
      addTextArtifact(data);
    } else if (type === 'FILE') {
      addFileArtifact(data);
    }

  };

  const addTextArtifact = async ({ title, text }) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const tempArtifact = {
      id: tempId,
      title: title,
      content: text,
      inputType: "TEXT",
      tags: []
    }
    setArtifacts(prevItems => [tempArtifact, ...prevItems]);
    try {
      const url = `/api/artifacts/`;
      const res = await vaultRequest({
        method: vaultRequests.POST,
        path: url,
        payload: {
          "title": title,
          "textContent": text,
          "fileType": "TEXT"
        },
      });
      const json = res.data;

      setArtifacts(prevItems => [
        {
          id: json.data.id,
          title: json.data.title,
          content: json.data.textContent,
          inputType: json.data.fileType,
          tags: json.data.tags || []
        },
        ...prevItems.slice(1),
      ]);
    } catch (err) {
      setArtifacts(prevItems => prevItems.slice(1))
      setError(err.message);
    }
  }

  // TODO: Implement this function later,
  // everything in this function is incomplete and needs changing
  const addFileArtifact = async ({ title, data }) => {
    const url = `/api/artifacts/`;
    fetch(url, {
      method: vaultRequests.POST,
      headers: {
        "Content-Type": "application/json",

      },
      body: JSON.stringify({
        "title": title,
        "data": data,
        "fileType": "FILE"
      })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Unable to upload tag");
        }
        return res.json()
      })
      .then(artifactUpload => {
        setArtifacts(prevItems => [...prevItems, {
          id: artifactUpload.data.id,
          title: artifactUpload.data.title,
          filename: artifactUpload.data.fileName,
          fileURL: artifactUpload.data.fileUrl,
          inputType: artifactUpload.data.fileType,
          tags: artifactUpload.data.tags || [],
          isImage: artifactUpload.data.isImage
        }]);
      });
  }

  const removeArtifact = async (artifactId) => {
    const index = artifacts.findIndex(item => item.id === artifactId);
    const artifact = artifacts.find(item => item.id === artifactId);
    if (!artifact) {
      return;
    }
    setArtifacts(prev => prev.filter(item => item.id !== artifactId));

    try {
      const url = `/api/artifacts/${artifactId}`;
      await vaultRequest({
        method: vaultRequests.DELETE,
        path: url,
      });
    } catch (err) {
      setArtifacts(prev => {
        const newArray = [...prev];
        newArray.splice(index, 0, artifact);
        return newArray;
      });
      setError(err.message);
    } finally {
      if (hasMoreArtifacts) fetchArtifactsData({ limit: 1 });
    }

  };
  const editArtifact = async (artifactId, title, content) => {
    const index = artifacts.findIndex(item => item.id === artifactId);
    const originalArtifact = index !== -1 ? artifacts[index] : undefined;

    setArtifacts(prevArtifacts =>
      prevArtifacts.map(artifact =>
        artifact.id === artifactId
          ? {
            ...artifact,
            title: title,
            content: content,
          }
          : artifact
      )
    );

    try {
      const url = `/api/artifacts/text/${artifactId}`;

      const res = await vaultRequest({
        method: vaultRequests.PATCH,
        path: url,
        payload: {
          "title": title,
          "textContent": content,
        },
      });
      const json = res.data;

      setArtifacts(prevArtifacts =>
        prevArtifacts.map(artifact =>
          artifact.id === artifactId
            ? {
              ...artifact,
              title: json.data.title || '',
              content: json.data.textContent || '',
              inputType: json.data.fileType,
              tags: json.data.tags || artifact.tags
            }
            : artifact
        )
      );
    } catch (err) {

      setArtifacts(prev => {
        const newArray = [...prev];
        if (originalArtifact) {
          newArray[index] = originalArtifact;
        }
        return newArray;
      });
      setError(err.message);
    }
  };


  useEffect(() => {
    if (error) setError(null);
  }, [error]);

  return { artifacts, isLoading, error, addArtifact, removeArtifact, onRemoveTag, onAddTag, fetchArtifactsData, editArtifact, hasMoreArtifacts };
};
export default useArtifacts;

