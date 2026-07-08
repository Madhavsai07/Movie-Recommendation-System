import { useState, useCallback } from "react";
import { recommendMovie } from "../services/api";

export const useRecommendation = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedName, setSearchedName] = useState("");

  const fetchRecommendations = useCallback(async (movieName) => {
    if (!movieName || !movieName.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSearchedName(movieName.trim());

    try {
      const data = await recommendMovie(movieName);
      setRecommendations(data);
    } catch (err) {
      console.error("Error fetching recommendations in hook:", err);
      setRecommendations([]);
      
      // Determine the error type based on the response status
      if (err.response) {
        if (err.response.status === 404) {
          setError("Movie Not Found");
        } else {
          setError("Connection Error");
        }
      } else {
        // Network error, timeout, or server offline
        setError("Connection Error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearState = useCallback(() => {
    setRecommendations([]);
    setError(null);
    setSearchedName("");
  }, []);

  return {
    recommendations,
    loading,
    error,
    searchedName,
    fetchRecommendations,
    clearState,
  };
};
