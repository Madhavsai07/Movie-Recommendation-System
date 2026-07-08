import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiX, FiFilm } from "react-icons/fi";

const SearchBar = ({ query, setQuery, suggestions, onSearch, loading, suggestionsLoading }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Auto-focus input on mount (Feature 14)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Keyboard Navigation inside suggestions (Feature 16)
  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIdx((prevIdx) => 
        prevIdx < suggestions.length - 1 ? prevIdx + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIdx((prevIdx) => 
        prevIdx > 0 ? prevIdx - 1 : suggestions.length - 1
      );
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
      setActiveSuggestionIdx(-1);
    } else if (e.key === "Enter") {
      if (activeSuggestionIdx >= 0 && activeSuggestionIdx < suggestions.length) {
        e.preventDefault();
        const selected = suggestions[activeSuggestionIdx];
        setQuery(selected);
        setShowDropdown(false);
        setActiveSuggestionIdx(-1);
        onSearch(selected);
      }
    }
  };

  // Close dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
        setActiveSuggestionIdx(-1);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      setShowDropdown(false);
      setActiveSuggestionIdx(-1);
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery("");
    setShowDropdown(false);
    setActiveSuggestionIdx(-1);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSuggestionClick = (selectedTitle) => {
    setQuery(selectedTitle);
    setShowDropdown(false);
    setActiveSuggestionIdx(-1);
    onSearch(selectedTitle);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 relative z-30">
      <form onSubmit={handleSubmit} className="relative w-full">
        
        {/* Search Bar Input Container */}
        <div className="relative flex items-center bg-slate-800 border border-slate-700/80 rounded-2xl shadow-lg transition-all duration-300 focus-within:border-sky-500/85 focus-within:ring-2 focus-within:ring-sky-500/25 focus-within:shadow-sky-500/5">
          
          <FiSearch className="absolute left-5 w-5 h-5 text-slate-400 pointer-events-none" />

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
              setActiveSuggestionIdx(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(true)}
            placeholder="Enter a movie title (e.g. Toy Story, Inception, Avatar...)"
            className="w-full pl-14 pr-24 py-4 bg-transparent text-slate-100 placeholder-slate-450 text-base font-semibold rounded-2xl focus:outline-none"
            disabled={loading}
            aria-label="Search movie recommendations"
            autoComplete="off"
          />

          {/* Controls */}
          <div className="absolute right-3 flex items-center space-x-2">
            {/* Clear Input X Button (Feature 15) */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-450 hover:text-slate-200 rounded-full hover:bg-slate-700 transition-colors"
                disabled={loading}
                aria-label="Clear search input"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
                !query.trim() || loading
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-sky-500 hover:bg-sky-400 text-slate-900 shadow-md shadow-sky-500/10 active:scale-95"
              }`}
            >
              {loading ? "Searching" : "Recommend"}
            </button>
          </div>

        </div>
      </form>

      {/* Autocomplete Dropdown List Overlay (Feature 1) */}
      {showDropdown && (query.trim() !== "") && (suggestions.length > 0 || suggestionsLoading) && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-2 bg-slate-850/95 border border-slate-750/90 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md animate-fade-in"
        >
          {suggestionsLoading && suggestions.length === 0 ? (
            <div className="p-4 text-xs text-slate-400 font-semibold flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-slate-650 border-t-sky-500 rounded-full animate-spin"></div>
              <span>Searching matches...</span>
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto divide-y divide-slate-800/40">
              {suggestions.map((title, idx) => (
                <li key={`${title}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(title)}
                    className={`w-full text-left px-5 py-3 text-sm font-semibold flex items-center space-x-3 transition-colors ${
                      idx === activeSuggestionIdx
                        ? "bg-sky-500/10 text-sky-400 border-l-4 border-sky-500"
                        : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                    }`}
                  >
                    <FiFilm className="w-4 h-4 text-slate-500" />
                    <span className="line-clamp-1">{title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
