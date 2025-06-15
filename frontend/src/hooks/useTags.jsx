import { useState, useEffect, useCallback } from 'react';
import useToken from './useToken.jsx';

const useTags = (userId, SERVER_URL) => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getFreshToken } = useToken();

  const fetchTagsData = useCallback(async () => {
    const token = await getFreshToken();

    setIsLoading(true);
    setError(null);
    try {
      const url = `${SERVER_URL}/api/tags/${userId}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        },

      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Unable to get tag info");
      }
      const json = await res.json();
      setTags(json.data.tags.map(tag => ({
        id: tag.id,
        name: tag.name
      })));
    } catch (err) {
      console.error("Error fetching tags:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, SERVER_URL, getFreshToken]);



  useEffect(() => {
    fetchTagsData();
  }, [fetchTagsData]);



  const addTag = async ({ title }) => {
    const token = await getFreshToken();
    const url = SERVER_URL + "/api/tags/" + userId;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ "tagName": title })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Unable to upload tag");
        }
        return res.json()
      })
      .then(tagUpload => {
        const newTag = {
          id: tagUpload.data.id,
          name: tagUpload.data.name
        };
        setTags(prevItems => [...prevItems, newTag]);
      })
      .catch(err => {
        setError(err);
      });
  };

  const removeTag = async (tagId) => {
    const token = await getFreshToken();
    const url = SERVER_URL + "/api/tags/" + userId + "/" + tagId;
    fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Could not delete Tag");
        }
        return res.json()
      })
      .then(json => setTags(prevTags => prevTags.filter(tag => tag.id !== json.data.id)))
      .catch(err => {
        setError(err);
      });

  };

  return { tags, isLoading, error, addTag, removeTag, fetchTagsData };
}
export default useTags;
