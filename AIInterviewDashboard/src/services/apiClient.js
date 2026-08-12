import axios from "axios";

/**
 * Central Axios client used for communication with the backend API.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

export default apiClient;