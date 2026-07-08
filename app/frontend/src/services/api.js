import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Checks the health status of the FastAPI backend.
 * @returns {Promise<boolean>} True if running, false otherwise.
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get("/");
    return response.status === 200 && response.data?.status === "Running";
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};

/**
 * Fetches movie recommendations from the backend.
 * Supports aborting requests via AbortSignal to avoid duplicate queries.
 * 
 * @param {string} movieName - Movie to query.
 * @param {AbortSignal} [signal] - Optional signal for cancelling queries.
 * @returns {Promise<Array>} The list of recommendation cards.
 */
export const recommendMovie = async (movieName, signal) => {
  const encodedName = encodeURIComponent(movieName.trim());
  const response = await apiClient.get(`/recommend/${encodedName}`, { signal });
  return response.data?.recommendations || [];
};

/**
 * Fetches autocomplete search suggestions from the backend.
 * Supports aborting requests via AbortSignal for debouncing.
 * 
 * @param {string} query - Typings to complete.
 * @param {AbortSignal} [signal] - Optional signal for cancelling queries.
 * @returns {Promise<Array>} List of matching titles.
 */
export const getSearchSuggestions = async (query, signal) => {
  if (!query || !query.trim()) {
    return [];
  }
  const response = await apiClient.get("/search", {
    params: { q: query.trim() },
    signal,
  });
  return response.data?.results || [];
};

/**
 * Fetches complete movie metadata details for a specific movie title.
 * 
 * @param {string} title - Movie title.
 * @param {AbortSignal} [signal] - Optional signal for cancelling queries.
 * @returns {Promise<Object>} Movie metadata card.
 */
export const getMovieDetails = async (title, signal) => {
  const response = await apiClient.get("/movie/details", {
    params: { title: title.trim() },
    signal,
  });
  return response.data;
};

export default apiClient;
