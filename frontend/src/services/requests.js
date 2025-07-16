import axios from 'axios';
import vaultURL from './config';

const client = axios.create({
  baseURL: vaultURL, headers: {
    'Content-Type': 'application/json',
  }
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
      const status = error.response.status;
      if (status === 401) {
        throw new Error("Unauthorized - check your token");
      } else if (status === 404) {
        throw new Error("Resource not found");
      } else if (status >= 500) {
        throw new Error("Server error - please try again later");
      } else {
        throw new Error(`Unable to get artifact info: ${error.response.statusText}`);
      }
    } else if (error.request) {
      throw new Error("Network error - please check your connection");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
}

export default vaultRequest;
export { vaultRequests }
