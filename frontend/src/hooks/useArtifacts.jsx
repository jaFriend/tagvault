import { useState, useEffect, useCallback, useRef } from 'react';
import useToken from './useToken.jsx';

const formatArtifact = (artifact) => ({
  id: artifact.id,
  title: artifact.title,
  content: artifact.textContent,
  inputType: artifact.fileType,
  tags: artifact.tags || []
});
const _fakeTimeout = async (ms = 500) => await new Promise(resolve => setTimeout(resolve, ms));
const useArtifacts = (userId, SERVER_URL, searchValue, tagList) => {
  const [artifacts, setArtifacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMoreArtifacts, setHasMoreArtifacts] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [initialFetch, setInitialFetch] = useState(false);
  const isFetchingRef = useRef(false);
  const nextCursorRef = useRef(null);

  const { getFreshToken } = useToken();

  const fetchArtifactsData = useCallback(async ({ limit = 5, isNewSearch = false } = {}) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const token = await getFreshToken();
    if (!token) return;

    try {
      const base = `${SERVER_URL}/api/artifacts/${userId}`;
      const query = new URLSearchParams({ searchValue });
      query.append('tags', '');
      tagList.forEach(tag => query.append('tags', tag));
      query.append('limit', limit);
      if (nextCursorRef.current) {
        query.append('cursor', nextCursorRef.current);
      }

      const url = `${base}?${query}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Unable to get artifact info");
      const json = await res.json();

      const fetchedArtifacts = json.data.artifacts || [];
      nextCursorRef.current = json.data.nextCursor;
      setHasMoreArtifacts(json.data.hasMoreArtifacts);
      if (isNewSearch) setArtifacts([]);
      setArtifacts(prev =>
        [...prev, ...fetchedArtifacts.map(formatArtifact)]
      );
    } catch (err) {
      setError(err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [userId, SERVER_URL, searchValue, tagList, getFreshToken]);

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

    const token = await getFreshToken();
    if (!token) return;

    try {
      const url = SERVER_URL + "/api/artifacts/" + userId + '/' + artifactId + '/tags/' + tagId;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      if (!res.ok) throw new Error("Unable to remove tag");

      const json = await res.json();

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
      console.log("Failed to remove tag: " + err);
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

    const token = await getFreshToken();
    if (!token) return;

    try {
      const url = SERVER_URL + "/api/artifacts/" + userId + '/' + artifactId + '/tags';
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          "tagName": tagName
        })
      });

      if (!res.ok) throw new Error("Unable to add tag");

      const json = await res.json();

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
      console.log("Failed to add tag: " + err);
    }
  }; const addArtifact = async ({ type, data }) => {
    const token = await getFreshToken();
    if (!token) return;

    if (type === 'TEXT') {
      addTextArtifact(token, data);
    } else if (type === 'FILE') {
      addFileArtifact(token, data);
    }

  };

  const addTextArtifact = async (token, { title, text }) => {
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
      const url = SERVER_URL + "/api/artifacts/" + userId;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`

        },
        body: JSON.stringify({
          "title": title,
          "textContent": text,
          "fileType": "TEXT"
        })
      });

      if (!res.ok) throw new Error("Unable to upload tag");

      const artifactJSON = await res.json();

      setArtifacts(prevItems => [
        {
          id: artifactJSON.data.id,
          title: artifactJSON.data.title,
          content: artifactJSON.data.textContent,
          inputType: artifactJSON.data.fileType,
          tags: artifactJSON.data.tags || []
        },
        ...prevItems.slice(1),
      ]);


    } catch (err) {
      setArtifacts(prevItems => prevItems.slice(1))
      console.log("Failed to upload Artifact: " + err);
    }

  }

  // TODO: Implement this function later,
  // everything in this function is incomplete and needs changing
  const addFileArtifact = async (token, { title, data }) => {
    const url = SERVER_URL + "/api/artifacts/" + userId;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`

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
      console.log("Unable to find Artifact");
      return;
    }
    setArtifacts(prev => prev.filter(item => item.id !== artifactId));

    const token = await getFreshToken();
    if (!token) return;

    try {
      const url = SERVER_URL + "/api/artifacts/" + userId + "/" + artifactId;

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error("Could not delete Artifact");

    } catch (err) {
      setArtifacts(prev => {
        const newArray = [...prev];
        newArray.splice(index, 0, artifact);
        return newArray;
      });
      console.log("Failed to remove Artifact: " + err);
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

    const token = await getFreshToken();
    if (!token) return;

    try {
      const url = SERVER_URL + "/api/artifacts/text/" + userId + "/" + artifactId;
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          "title": title,
          "textContent": content,
        })
      });

      if (!res.ok) throw new Error("Could not edit Artifact");

      const json = await res.json();

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
      console.log("Failed to edit Artifact: " + err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const screenHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const currentHeight = window.scrollY + screenHeight;

      if (
        documentHeight > screenHeight &&
        currentHeight >= documentHeight * 0.99 &&
        hasMoreArtifacts &&
        !cooldown
      ) {
        setCooldown(true);
        fetchArtifactsData();

        setTimeout(() => {
          setCooldown(false);
        }, 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchArtifactsData, cooldown, hasMoreArtifacts]);

  return { artifacts, isLoading, error, addArtifact, removeArtifact, onRemoveTag, onAddTag, fetchArtifactsData, editArtifact };
};
export default useArtifacts;

