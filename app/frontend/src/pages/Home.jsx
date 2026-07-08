import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearch } from "../hooks/useSearch";
import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import SearchBar from "../components/SearchBar/SearchBar";
import MovieCard from "../components/MovieCard/MovieCard";
import LoadingSkeleton from "../components/LoadingSkeleton/LoadingSkeleton";
import ErrorMessage from "../components/ErrorMessage/ErrorMessage";
import { downloadJSON, downloadCSV } from "../utils/exportUtils";
import { 
  FiFilm, FiTrash2, FiHeart, FiSearch, FiArrowLeft, 
  FiDownload, FiSliders, FiClock, FiChevronLeft, FiChevronRight,
  FiBookOpen, FiArrowRight, FiX
} from "react-icons/fi";

const Home = () => {
  const {
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
  } = useSearch();

  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { theme } = useTheme();

  const [sortBy, setSortBy] = useState("rating-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Recently Viewed State (Feature 8)
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  
  const resultsRef = useRef(null);

  // Popular searches suggestions
  const popularMovies = ["Toy Story", "Inception", "Titanic", "Batman", "Interstellar", "Avatar"];

  // Fetch recently viewed list from localStorage on mount & update
  const loadRecentlyViewed = () => {
    try {
      const saved = localStorage.getItem("cineMatch_recent");
      if (saved) {
        setRecentlyViewed(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load recently viewed list:", err);
    }
  };

  useEffect(() => {
    loadRecentlyViewed();
    // Add event listener to capture updates if opened in multiple pages
    window.addEventListener("storage", loadRecentlyViewed);
    return () => window.removeEventListener("storage", loadRecentlyViewed);
  }, []);

  // Scroll to results when recommendations load
  useEffect(() => {
    if (recommendations.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [recommendations]);

  const handleSearch = (movieName) => {
    triggerSearch(movieName);
  };

  // Sorted Recommendations
  const processedRecommendations = useMemo(() => {
    let result = [...recommendations];

    // Sorting (Feature 2)
    result.sort((a, b) => {
      switch (sortBy) {
        case "rating-desc":
          return (b.rating || 0) - (a.rating || 0);
        case "rating-asc":
          return (a.rating || 0) - (b.rating || 0);
        case "popularity-desc":
          return (b.popularity || 0) - (a.popularity || 0);
        case "year-desc":
          return new Date(b.release_date || 0) - new Date(a.release_date || 0);
        case "year-asc":
          return new Date(a.release_date || 0) - new Date(b.release_date || 0);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "runtime-desc":
          return (b.runtime || 0) - (a.runtime || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [recommendations, sortBy]);

  // Pagination Logic (Feature 9)
  const totalPages = Math.ceil(processedRecommendations.length / itemsPerPage);
  const paginatedRecommendations = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return processedRecommendations.slice(startIdx, startIdx + itemsPerPage);
  }, [processedRecommendations, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Download Exports (Feature 7)
  const handleExportJSON = () => {
    downloadJSON(processedRecommendations, `${searchedName}_recommendations.json`);
  };

  const handleExportCSV = () => {
    downloadCSV(processedRecommendations, `${searchedName}_recommendations.csv`);
  };

  const hasSearchStarted = searchedName !== "";

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 dark:bg-slate-900 light:bg-slate-50 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 bg-gradient-to-b from-sky-950/10 via-slate-900 to-slate-900 dark:via-slate-900 dark:to-slate-900 light:from-sky-500/5 light:via-slate-50 light:to-slate-50 text-center px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto z-10 relative">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900 animate-fade-in leading-tight">
            Movie Recommendation <span className="bg-gradient-to-r from-sky-400 to-sky-300 dark:from-sky-400 dark:to-sky-300 light:from-sky-600 light:to-sky-500 bg-clip-text text-transparent">System</span>
          </h1>

          <p className="mt-4 text-sm md:text-base text-slate-400 dark:text-slate-400 light:text-slate-600 font-medium max-w-xl mx-auto leading-relaxed animate-fade-in delay-75">
            Search your favorite movie to calculate closest vectorized similarity matching genres, tags, and reviews instantly.
          </p>

          {/* Autocomplete SearchBar Input */}
          <SearchBar
            query={query}
            setQuery={setQuery}
            suggestions={suggestions}
            onSearch={handleSearch}
            loading={loading}
            suggestionsLoading={suggestionsLoading}
          />

          {/* Popular Searches badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto animate-fade-in delay-150">
            <span className="text-[10px] text-slate-500 dark:text-slate-500 light:text-slate-450 font-extrabold uppercase tracking-wider mr-1">
              Popular:
            </span>
            {popularMovies.map((name) => (
              <button
                key={name}
                onClick={() => handleSearch(name)}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-850 dark:bg-slate-850 light:bg-white text-slate-350 dark:text-slate-350 light:text-slate-700 hover:text-sky-400 dark:hover:text-sky-400 light:hover:text-sky-600 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-xl text-xs font-bold tracking-wide transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              >
                {name}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-grow pb-24">
        
        {/* Loading skeleton wrapper */}
        {loading && <LoadingSkeleton />}

        {/* Error message displays */}
        {!loading && error && (
          <div className="px-4 py-8">
            <ErrorMessage errorType={error} query={searchedName} />
          </div>
        )}

        {/* Search Results Workspace */}
        {!loading && !error && hasSearchStarted && (
          <div ref={resultsRef} className="max-w-7xl mx-auto px-4 md:px-6 pt-4 scroll-mt-20">
            
            {/* Header control buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 mb-6">
              <button
                onClick={clearRecommendations}
                className="flex items-center space-x-2 text-xs font-bold text-slate-450 dark:text-slate-450 light:text-slate-550 hover:text-sky-450 transition-colors uppercase tracking-wider"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Return Dashboard</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                {/* Download Recommendations controls (Feature 7) */}
                {processedRecommendations.length > 0 && (
                  <div className="flex items-center space-x-2 border-r border-slate-800 dark:border-slate-800 light:border-slate-200 pr-3">
                    <button
                      onClick={handleExportJSON}
                      className="px-3 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-white hover:bg-slate-700 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="px-3 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-white hover:bg-slate-700 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                  </div>
                )}
                
                <span className="text-xs font-bold text-slate-500">
                  Searched: <strong className="text-slate-300 dark:text-slate-300 light:text-slate-800 font-bold">"{searchedName}"</strong>
                </span>
              </div>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center text-slate-500 font-semibold py-12">
                No recommendations generated. Try another search query.
              </div>
            ) : (
              /* Full-width layout (Filters are positioned beside the search bar) */
              <div className="space-y-6 w-full animate-fade-in">
                
                {/* Sorting row header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-850/40 dark:bg-slate-850/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl">
                  <span className="text-xs font-bold text-slate-400">
                    Showing {processedRecommendations.length} recommendations
                  </span>

                  {/* Sorting Selection (Feature 2) */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <span className="text-[10px] uppercase font-bold text-slate-500 hidden sm:inline">
                      Sort By:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full sm:w-44 p-2 bg-slate-900 dark:bg-slate-900 light:bg-slate-55 border border-slate-800 dark:border-slate-800 light:border-slate-250 text-xs font-bold rounded-xl focus:outline-none focus:border-sky-500 text-slate-200 dark:text-slate-200 light:text-slate-850"
                    >
                      <option value="rating-desc">Rating: Highest First</option>
                      <option value="rating-asc">Rating: Lowest First</option>
                      <option value="popularity-desc">Popularity: Most Popular</option>
                      <option value="year-desc">Release: Newest First</option>
                      <option value="year-asc">Release: Oldest First</option>
                      <option value="title-asc">Title: A-Z</option>
                      <option value="title-desc">Title: Z-A</option>
                      <option value="runtime-desc">Runtime: Longest First</option>
                    </select>
                  </div>
                </div>

                {processedRecommendations.length === 0 ? (
                  <div className="text-center text-slate-500 italic py-12 border border-dashed border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl bg-slate-950/20">
                    No recommendations match your active filters. Try adjusting rating ranges or genre selectors.
                  </div>
                ) : (
                  /* Movie Cards Grid - Full 5-columns width (Feature 10) */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {paginatedRecommendations.map((movie, index) => (
                      <MovieCard
                        key={`${movie.title}-${index}`}
                        movie={movie}
                        isFav={isFavorite(movie.title)}
                        onFavToggle={toggleFavorite}
                        onRecommendAgain={handleSearch}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination controls (Feature 9) */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-8 border-t border-slate-850 dark:border-slate-850 light:border-slate-200">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-205 flex items-center justify-center cursor-pointer ${
                        currentPage === 1
                          ? "text-slate-600 cursor-not-allowed opacity-40"
                          : "text-slate-355 bg-slate-805 hover:bg-slate-700"
                      }`}
                      aria-label="Previous Page"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-9 h-9 font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                              currentPage === pageNum
                                ? "bg-sky-500 text-slate-900 scale-105"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-800 dark:border-slate-800 light:border-slate-200"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-205 flex items-center justify-center cursor-pointer ${
                        currentPage === totalPages
                          ? "text-slate-605 cursor-not-allowed opacity-40"
                          : "text-slate-355 bg-slate-805 hover:bg-slate-700"
                      }`}
                      aria-label="Next Page"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* Dashboard landing rows (Shown when no search is active) */}
        {!loading && !error && !hasSearchStarted && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12 py-8 animate-fade-in">
            
            {/* Split Grid: History & Recently Viewed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Recent Searches */}
              <div className="lg:col-span-4 bg-slate-850/20 dark:bg-slate-850/20 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 h-fit shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-850 dark:border-slate-850 light:border-slate-100">
                  <h3 className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-850 uppercase tracking-widest flex items-center space-x-2">
                    <FiSearch className="w-4 h-4 text-sky-400" />
                    <span>Recent Searches</span>
                  </h3>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-[10px] font-bold text-red-400/80 hover:text-red-400 flex items-center space-x-0.5 uppercase cursor-pointer"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">No recent searches</p>
                ) : (
                  <ul className="space-y-2">
                    {history.map((name) => (
                      <li key={name} className="group/item flex items-center justify-between">
                        <button
                          onClick={() => handleSearch(name)}
                          className="text-slate-350 dark:text-slate-350 light:text-slate-600 hover:text-sky-400 text-sm font-semibold truncate text-left pr-4 cursor-pointer"
                        >
                          {name}
                        </button>
                        <button
                          onClick={() => removeFromHistory(name)}
                          className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-550 hover:text-red-450 rounded-md hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-100 transition-all cursor-pointer"
                          title="Remove item"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Right Column: Recently Viewed (Feature 8) */}
              <div className="lg:col-span-8 space-y-6">
                
                {recentlyViewed.length > 0 && (
                  <div className="bg-slate-850/10 dark:bg-slate-850/10 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center space-x-2 mb-5 pb-2 border-b border-slate-850 dark:border-slate-850 light:border-slate-100">
                      <FiBookOpen className="w-4 h-4 text-sky-400" />
                      <h3 className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-850 uppercase tracking-widest">
                        Recently Viewed ({recentlyViewed.length})
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {recentlyViewed.slice(0, 3).map((movie, index) => (
                        <MovieCard
                          key={`recent-${movie.title}-${index}`}
                          movie={movie}
                          isFav={isFavorite(movie.title)}
                          onFavToggle={toggleFavorite}
                          onRecommendAgain={handleSearch}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Landings Dashboard Info banner */}
                <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl py-14 text-center px-4 bg-slate-900/40 dark:bg-slate-900/40 light:bg-white/40 shadow-inner">
                  <div className="p-4 bg-slate-850 dark:bg-slate-850 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-full text-slate-650 mb-3 animate-pulse">
                    <FiFilm className="w-9 h-9" />
                  </div>
                  <h3 className="text-base font-bold text-slate-350 dark:text-slate-350 light:text-slate-700">
                    Find Recommendations
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                    Query a movie title inside the input box to instantly retrieve similar items calculated by cosine angles.
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom Favorites Horizontal Section (Feature 3) */}
            {favorites.length > 0 && (
              <section className="bg-slate-850/10 dark:bg-slate-850/10 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5 pb-2 border-b border-slate-850 dark:border-slate-850 light:border-slate-100">
                  <div className="flex items-center space-x-2">
                    <FiHeart className="w-4 h-4 text-red-500 fill-red-500" />
                    <h3 className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-805 uppercase tracking-widest">
                      Saved Favorites Row
                    </h3>
                  </div>
                  <Link
                    to="/favorites"
                    className="text-xs font-bold text-sky-400 hover:text-sky-350 flex items-center space-x-1 tracking-wider uppercase"
                  >
                    <span>View All</span>
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {favorites.slice(0, 5).map((movie, index) => (
                    <MovieCard
                      key={`home-fav-${movie.title}-${index}`}
                      movie={movie}
                      isFav={true}
                      onFavToggle={toggleFavorite}
                      onRecommendAgain={handleSearch}
                    />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

      </main>

    </div>
  );
};

export default Home;
