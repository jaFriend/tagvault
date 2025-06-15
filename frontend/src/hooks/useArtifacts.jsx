import { useState, useEffect, useCallback } from 'react';
import useToken from './useToken.jsx';

const useArtifacts = (userId, SERVER_URL, searchValue, tagList) => {
  const [artifacts, setArtifacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getFreshToken } = useToken();

  const fetchArtifactsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const fetchArtifacts = async (token) => {
      try {
        const base = `${SERVER_URL}/api/artifacts/${userId}`
        const params = new URLSearchParams({ searchValue })
        params.append('tags', '');
        tagList.forEach(tag => params.append('tags', tag));

        const url = `${base}?${params}`
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unable to get artifact info");
        const json = await res.json();
        setArtifacts(json.data.artifacts.map(artifact => ({
          id: artifact.id,
          title: artifact.title,
          content: artifact.textContent,
          inputType: artifact.fileType,
          tags: artifact.tags || []
        })));
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    const token = await getFreshToken();
    if (token) {
      fetchArtifacts(token);
    }
  }, [userId, SERVER_URL, searchValue, tagList, getFreshToken]);


  useEffect(() => {
    fetchArtifactsData();
  }, [fetchArtifactsData]);


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

  return { artifacts, isLoading, error, addArtifact, removeArtifact, onRemoveTag, onAddTag, fetchArtifactsData, editArtifact };
};
export default useArtifacts;

