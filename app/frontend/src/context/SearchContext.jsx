import React, { createContext, useState, useEffect, useRef, useCallback, useContext } from "react";
import { recommendMovie, getSearchSuggestions } from "../services/api";
import axios from "axios";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedName, setSearchedName] = useState("");

  // History State
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("cineMatch_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const searchAbortControllerRef = useRef(null);
  const suggestAbortControllerRef = useRef(null);

  // Debouncing Search Query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 450);
    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmedQuery = debouncedQuery.trim();
      if (!trimmedQuery) {
        setSuggestions([]);
        return;
      }

      if (suggestAbortControllerRef.current) {
        suggestAbortControllerRef.current.abort();
      }
      const controller = new AbortController();
      suggestAbortControllerRef.current = controller;

      setSuggestionsLoading(true);
      try {
        const results = await getSearchSuggestions(trimmedQuery, controller.signal);
        setSuggestions(results);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Suggestions fetch error:", err);
        }
      } finally {
        if (suggestAbortControllerRef.current === controller) {
          setSuggestionsLoading(false);
        }
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Search trigger
  const triggerSearch = useCallback(async (movieName) => {
    const trimmedName = movieName.trim();
    if (!trimmedName) return;

    setLoading(true);
    setError(null);
    setSearchedName(trimmedName);
    setQuery(trimmedName);
    setSuggestions([]);

    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    searchAbortControllerRef.current = controller;

    try {
      const data = await recommendMovie(trimmedName, controller.signal);
      setRecommendations(data);

      // Add to search history
      setHistory((prevHistory) => {
        const filtered = prevHistory.filter(
          (item) => item.toLowerCase() !== trimmedName.toLowerCase()
        );
        const updated = [trimmedName, ...filtered].slice(0, 10);
        localStorage.setItem("cineMatch_history", JSON.stringify(updated));
        return updated;
      });

    } catch (err) {
      if (axios.isCancel(err)) {
        return;
      }
      console.error("Recommendation fetch error:", err);
      setRecommendations([]);
      if (err.response && err.response.status === 404) {
        setError("Movie Not Found");
      } else {
        setError("Connection Error");
      }
    } finally {
      if (searchAbortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem("cineMatch_history");
  }, []);

  const removeFromHistory = useCallback((nameToRemove) => {
    setHistory((prevHistory) => {
      const updated = prevHistory.filter((name) => name !== nameToRemove);
      localStorage.setItem("cineMatch_history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setError(null);
    setSearchedName("");
    setQuery("");
  }, []);

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        suggestions,
        suggestionsLoading,
        recommendations,
        loading,
        error,
        searchedName,
        history,
        triggerSearch,
        clearHistory,
        removeFromHistory,
        clearRecommendations,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
