import { useState, useEffect, useCallback } from 'react';
import vaultRequest, { vaultRequests } from '../services/requests';
import useToken from './useToken.jsx';

const useTags = (userId) => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getFreshToken } = useToken();

  const fetchTagsData = useCallback(async () => {
    const token = await getFreshToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const url = `/api/tags/${userId}`;
      const res = await vaultRequest({
        method: vaultRequests.GET,
        path: url,
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = res.data;
      setTags(json?.data?.tags?.map(tag => ({
        id: tag.id,
        name: tag.name
      })));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, getFreshToken]);

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
      const url = "/api/tags/" + userId;
      const res = await vaultRequest({
        method: vaultRequests.POST,
        path: url,
        headers: { Authorization: `Bearer ${token}` },
        payload: { tagName: title }
      });
      const tagUpload = res.data;
      const tagsWithoutTemp = tags.filter(tag => tag.id !== tempId);
      const realTag = {
        id: tagUpload.data.id,
        name: tagUpload.data.name
      };

      setTags(insertTagSorted(tagsWithoutTemp, realTag));
    } catch (err) {
      setTags(prevTags => prevTags.filter(tag => tag.id !== tempId));
      setError(err.message || "Failed to add tag");
    }
  };

  const removeTag = async (tagId) => {
    const index = tags.findIndex(item => item.id === tagId);
    const originalTag = index !== -1 ? tags[index] : undefined;
    setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));

    const token = await getFreshToken();
    if (!token) return;

    try {
      const url = "/api/tags/" + userId + "/" + tagId;
      await vaultRequest({
        method: vaultRequests.DELETE,
        path: url,
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      setTags(prevTags => {
        const newArray = [...prevTags];
        if (originalTag) {
          newArray.splice(index, 0, originalTag);
        }
        return newArray;
      });
      setError(err.message || "Failed to remove tag");
    }
  };


  useEffect(() => {
    if (error) setError(null);
  }, [error])

  return { tags, isLoading, error, addTag, removeTag, fetchTagsData };
}
export default useTags;
