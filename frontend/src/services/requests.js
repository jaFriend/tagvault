import axios from 'axios';
import { vaultURL } from './config';
import { authTokenManager } from './authTokenManager';

const client = axios.create({
  baseURL: vaultURL, headers: {
    'Content-Type': 'application/json',
  }
});

client.interceptors.request.use(async (config) => {
  const token = await authTokenManager.getFreshToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => {
  return Promise.reject(error);
});

const vaultRequests = {
  GET: `GET`,
  POST: `POST`,
  PUT: `PUT`,
  PATCH: `PATCH`,
  DELETE: `DELETE`,
}

const vaultRequest = async ({ method = vaultRequests.GET, path = '', payload = {}, headers = {} }) => {
  try {
    const options = {
      method,
      headers,
      url: path,
      data: payload,
    }
    return await client(options);
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || error.response.statusText || "An unexpected error occurred";

      throw new Error(message);
    } else if (error.request) {
      throw new Error("Network error - please check your connection");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
}

export default vaultRequest;
export { vaultRequests }
