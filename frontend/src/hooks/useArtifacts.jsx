import { useState, useEffect, useCallback, useRef } from 'react';
import useToken from './useToken.jsx';

const useArtifacts = (userId, SERVER_URL, searchValue, tagList) => {
  const [artifacts, setArtifacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMoreArtifacts, setHasMoreArtifacts] = useState(false);
  const initialFetchRef = useRef(false);
  const nextCursorRef = useRef(null);
  const isFetchingRef = useRef(false);
  const cooldownRef = useRef(false);

  const { getFreshToken } = useToken();

  const fetchArtifactsData = useCallback(async ({ reset = false, limit = 5 } = {}) => {
    if (isFetchingRef.current) return;

    console.log("Fetching with search:", searchValue);
    isFetchingRef.current = true;

    if (reset) {
      setArtifacts([]);
      setHasMoreArtifacts(false);
      setIsLoading(true);
      nextCursorRef.current = null;
    }

    const token = await getFreshToken();
    if (!token) return;

    try {
      const base = `${SERVER_URL}/api/artifacts/${userId}`;
      const query = new URLSearchParams({ searchValue });
      query.append('tags', '');
      tagList.forEach(tag => query.append('tags', tag));
      query.append('limit', limit);
      if (!reset && nextCursorRef.current) {
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

      setArtifacts(prev =>
        reset
          ? fetchedArtifacts.map(formatArtifact)
          : [...prev, ...fetchedArtifacts.map(formatArtifact)]
      );
    } catch (err) {
      setError(err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [userId, SERVER_URL, searchValue, tagList, getFreshToken]);

  const formatArtifact = (artifact) => ({
    id: artifact.id,
    title: artifact.title,
    content: artifact.textContent,
    inputType: artifact.fileType,
    tags: artifact.tags || []
  });


  useEffect(() => {
    if (!initialFetchRef.current) {
      fetchArtifactsData();
      initialFetchRef.current = true;
    }
  }, [fetchArtifactsData]);

  useEffect(() => {
    if (initialFetchRef.current) {
      setArtifacts([]);
      setHasMoreArtifacts(false);
      setIsLoading(true);
      nextCursorRef.current = null;
      fetchArtifactsData();
    }
  }, [fetchArtifactsData, searchValue, tagList]);

  const onRemoveTag = async (artifactId, tagId) => {
    const token = await getFreshToken();
    const url = SERVER_URL + "/api/artifacts/" + userId + '/' + artifactId + '/tags/' + tagId;
    const json = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      },

    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Unable to remove tag");
        }
        return res.json()
      });

    setArtifacts(prevArtifacts =>
      prevArtifacts.map(artifact =>
        artifact.id === artifactId
          ? { ...artifact, tags: json.data.tags || [] }
          : artifact
      )
    );
  }

  const onAddTag = async (artifactId, tagName) => {
    const token = await getFreshToken();
    const url = SERVER_URL + "/api/artifacts/" + userId + '/' + artifactId + '/tags';
    const json = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        "tagName": tagName
      })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Unable to add tag");
        }
        return res.json()
      });

    setArtifacts(prevArtifacts =>
      prevArtifacts.map(artifact =>
        artifact.id === artifactId
          ? { ...artifact, tags: json.data.artifact.tags || [] }
          : artifact
      )
    );
  }




  const addArtifact = async ({ type, data }) => {
    const token = await getFreshToken();
    console.log(type)
    if (type === 'TEXT') {
      addTextArtifact(token, data);
    } else if (type === 'FILE') {
      addFileArtifact(token, data);
    }

  };

  const addTextArtifact = async (token, { title, text }) => {
    const url = SERVER_URL + "/api/artifacts/" + userId;
    fetch(url, {
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
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Unable to upload tag");
        }
        return res.json()
      })
      .then(artifactUpload => {
        setArtifacts(prevItems => [{
          id: artifactUpload.data.id,
          title: artifactUpload.data.title,
          content: artifactUpload.data.textContent,
          inputType: artifactUpload.data.fileType,
          tags: artifactUpload.data.tags || []
        }, ...prevItems]);
      });
  }

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
    if (hasMoreArtifacts) fetchArtifactsData({ limit: 1 });
    const token = await getFreshToken();
    const url = SERVER_URL + "/api/artifacts/" + userId + "/" + artifactId;
    fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Could not delete Artifact");
        }
        return res.json()
      })
      .then(json => setArtifacts(prevArtifacts => prevArtifacts.filter(artifact => artifact.id !== json.data.id)));

  };

  const editArtifact = async (artifactId, title, content) => {
    const token = await getFreshToken();
    const url = SERVER_URL + "/api/artifacts/text/" + userId + "/" + artifactId;

    fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`

      },
      body: JSON.stringify({
        "title": title,
        "textContent": content,
      })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Could not edit Artifact");
        }
        return res.json();
      })
      .then(json =>
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
        ));
  }

  useEffect(() => {
    const handleScroll = () => {
      const screenHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const currentHeight = window.scrollY + screenHeight;

      if (
        documentHeight > screenHeight &&
        currentHeight >= documentHeight * 0.99 &&
        hasMoreArtifacts &&
        !cooldownRef.current &&
        !isFetchingRef.current
      ) {
        cooldownRef.current = true;
        fetchArtifactsData();

        setTimeout(() => {
          cooldownRef.current = false;
        }, 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchArtifactsData, hasMoreArtifacts]);

  return { artifacts, isLoading, error, addArtifact, removeArtifact, onRemoveTag, onAddTag, fetchArtifactsData, editArtifact };
};
export default useArtifacts;

