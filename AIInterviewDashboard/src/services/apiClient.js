import axios from "axios";

/**
 * Central Axios client used for communication with the backend API.
 */
const apiClient = axios.create({
  baseURL: "https://localhost:7026/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default apiClient;