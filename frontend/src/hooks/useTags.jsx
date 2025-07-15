import { useState, useEffect, useCallback } from 'react';
import useToken from './useToken.jsx';

const _fakeTimeout = async (ms = 500) => await new Promise(resolve => setTimeout(resolve, ms));
const useTags = (userId, SERVER_URL) => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getFreshToken } = useToken();

  const fetchTagsData = useCallback(async () => {
    const token = await getFreshToken();
    if (!token) return;

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
      setTags(json?.data?.tags?.map(tag => ({
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

  const insertTagSorted = (tags, newTag) => {
    const insertIndex = tags.findIndex(tag => newTag.name.localeCompare(tag.name) < 0);

    if (insertIndex === -1) {
      return [...tags, newTag];
    } else {
      return [
        ...tags.slice(0, insertIndex),
        newTag,
        ...tags.slice(insertIndex)
      ];
    }
  };

  const addTag = async ({ title }) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const tempTag = {
      id: tempId,
      name: title,
    };
    setTags(prevTags => insertTagSorted(prevTags, tempTag));

    const token = await getFreshToken();
    if (!token) return;

    try {
      const url = SERVER_URL + "/api/tags/" + userId;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ "tagName": title })
      });

      if (!res.ok) throw new Error("Unable to upload tag");
      const tagUpload = await res.json();
      const tagsWithoutTemp = tags.filter(tag => tag.id !== tempId);
      const realTag = {
        id: tagUpload.data.id,
        name: tagUpload.data.name
      };

      setTags(insertTagSorted(tagsWithoutTemp, realTag));
    } catch (err) {
      setTags(prevTags => prevTags.filter(tag => tag.id !== tempId));
      setError(err.message || "Failed to add tag");
      console.log("Failed to add tag: " + err);
    }
  };

  const removeTag = async (tagId) => {
    const index = tags.findIndex(item => item.id === tagId);
    const originalTag = index !== -1 ? tags[index] : undefined;
    setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));

    const token = await getFreshToken();
    if (!token) return;

    try {
      const url = SERVER_URL + "/api/tags/" + userId + "/" + tagId;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Could not delete Tag");

    } catch (err) {
      setTags(prevTags => {
        const newArray = [...prevTags];
        if (originalTag) {
          newArray.splice(index, 0, originalTag);
        }
        return newArray;
      });
      setError(err.message || "Failed to remove tag");
      console.log("Failed to remove tag: " + err);
    }
  };
  return { tags, isLoading, error, addTag, removeTag, fetchTagsData };
}
export default useTags;
