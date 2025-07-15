import { useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react'

const useToken = () => {
  const tokenRef = useRef(null);
  const tokenExpiresRef = useRef(null);
  const { getToken } = useAuth();

  const fetchClerkToken = useCallback(async () => {
    try {
      return await getToken({ template: 'tagvault-backend' });

    } catch (err) {
      console.error("Failed to get Clerk token:", err);
      return null;
    }
  }, [getToken]);

  const isValidToken = () => {
    const now = Math.floor(Date.now() / 1000);
    return tokenRef.current && tokenExpiresRef.current && now < tokenExpiresRef.current;
  }

  const getFreshToken = useCallback(async () => {
    if (isValidToken()) {
      return tokenRef.current;
    }
    const token = await fetchClerkToken();
    tokenRef.current = token;
    tokenExpiresRef.current = Math.floor((Date.now() / 1000) + 59);

    return tokenRef.current;
  }, [fetchClerkToken]);

  return { getFreshToken };
}


export default useToken;
