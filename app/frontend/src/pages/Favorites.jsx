import React, { useState, useMemo } from "react";
import { useFavorites } from "../context/FavoritesContext";
import { useSearch } from "../context/SearchContext";
import MovieCard from "../components/MovieCard/MovieCard";
import { FiHeart, FiSearch, FiTrash2, FiChevronLeft, FiChevronRight, FiGrid } from "react-icons/fi";

const Favorites = () => {
  const { favorites, toggleFavorite, clearFavorites, isFavorite } = useFavorites();
  const { triggerSearch } = useSearch();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Feature 9: Pagination limit

  // Filter and Sort Memoized List
  const processedFavorites = useMemo(() => {
    let result = [...favorites];

    // Local Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.overview.toLowerCase().includes(q) ||
          (m.genres && m.genres.some((g) => g.toLowerCase().includes(q)))
      );
    }

    // Sorting Logic (Feature 2)
    result.sort((a, b) => {
      switch (sortBy) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "rating-desc":
          return (b.rating || 0) - (a.rating || 0);
        case "rating-asc":
          return (a.rating || 0) - (b.rating || 0);
        case "year-desc":
          return new Date(b.release_date || 0) - new Date(a.release_date || 0);
        case "year-asc":
          return new Date(a.release_date || 0) - new Date(b.release_date || 0);
        case "runtime-desc":
          return (b.runtime || 0) - (a.runtime || 0);
        case "runtime-asc":
          return (a.runtime || 0) - (b.runtime || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [favorites, searchQuery, sortBy]);

  // Pagination Logic (Feature 9)
  const totalPages = Math.ceil(processedFavorites.length / itemsPerPage);
  const paginatedFavorites = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return processedFavorites.slice(startIdx, startIdx + itemsPerPage);
  }, [processedFavorites, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRecommendAgain = (title) => {
    // Navigate home or just trigger recommendation
    triggerSearch(title);
    // Smooth scroll/redirect can be handled by setting window hash or let routing trigger home
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-800 transition-colors duration-300 py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-850 dark:border-slate-850 light:border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
              <FiHeart className="w-6 h-6 fill-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Saved Favorites</h1>
              <p className="text-xs font-semibold text-slate-450 dark:text-slate-450 light:text-slate-550 mt-1 uppercase tracking-wider">
                Browse and manage your saved movies
              </p>
            </div>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="px-4 py-2 text-xs font-bold bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-xl transition-all flex items-center space-x-1.5 self-start md:self-auto cursor-pointer"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Clear Favorites List</span>
            </button>
          )}
        </div>

        {favorites.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-850/20 dark:bg-slate-850/20 light:bg-white border border-dashed border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 shadow-sm max-w-lg mx-auto">
            <div className="p-4 bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-105 rounded-full text-slate-600 mb-4 animate-pulse">
              <FiHeart className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-300 dark:text-slate-300 light:text-slate-700">No Favorites Added</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-550 mt-2 max-w-xs leading-relaxed">
              When viewing movie recommendation cards, click the heart icon on the card to save them here for offline access!
            </p>
            <a
              href="/"
              className="mt-6 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-900 text-xs font-bold tracking-wide rounded-xl shadow-md transition-all active:scale-95"
            >
              Discover Movies
            </a>
          </div>
        ) : (
          <>
            {/* Filter & Sort Controls Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-850/30 dark:bg-slate-850/30 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-4 rounded-2xl shadow-sm">
              {/* Search Bar Input inside Favorites */}
              <div className="relative w-full sm:w-72 flex items-center bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-250 rounded-xl focus-within:border-sky-500">
                <FiSearch className="absolute left-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search favorites list..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-transparent text-sm focus:outline-none text-slate-100 dark:text-slate-100 light:text-slate-800 font-semibold"
                />
              </div>

              {/* Sorting Selection (Feature 2) */}
              <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                <span className="text-[10px] uppercase font-bold text-slate-550 hidden md:inline">Sort Favorites By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-48 p-2.5 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-550/5 border border-slate-800 dark:border-slate-800 light:border-slate-250 text-xs font-bold rounded-xl focus:outline-none focus:border-sky-500 text-slate-200 dark:text-slate-200 light:text-slate-750"
                >
                  <option value="rating-desc">Rating: High to Low</option>
                  <option value="rating-asc">Rating: Low to High</option>
                  <option value="year-desc">Release: Newest First</option>
                  <option value="year-asc">Release: Oldest First</option>
                  <option value="title-asc">Title: A-Z</option>
                  <option value="title-desc">Title: Z-A</option>
                  <option value="runtime-desc">Runtime: Longest First</option>
                  <option value="runtime-asc">Runtime: Shortest First</option>
                </select>
              </div>
            </div>

            {processedFavorites.length === 0 ? (
              /* Search Empty State */
              <div className="py-12 text-center text-slate-500 font-semibold text-sm">
                No saved favorites match your search query "{searchQuery}".
              </div>
            ) : (
              /* Favorites Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {paginatedFavorites.map((movie, index) => (
                  <MovieCard
                    key={`fav-${movie.title}-${index}`}
                    movie={movie}
                    isFav={isFavorite(movie.title)}
                    onFavToggle={toggleFavorite}
                    onRecommendAgain={handleRecommendAgain}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls Footer (Feature 9) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-8 border-t border-slate-850 dark:border-slate-850 light:border-slate-200">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2.5 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-250 flex items-center justify-center cursor-pointer ${
                    currentPage === 1
                      ? "text-slate-600 bg-transparent cursor-not-allowed opacity-50"
                      : "text-slate-300 dark:text-slate-300 light:text-slate-700 bg-slate-800/40 hover:bg-slate-750"
                  }`}
                  aria-label="Previous Page"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-1.5">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 font-bold rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? "bg-sky-500 text-slate-900 shadow-md shadow-sky-500/10 scale-105"
                            : "bg-slate-800/40 dark:bg-slate-800/40 light:bg-white hover:bg-slate-750 text-slate-300 dark:text-slate-300 light:text-slate-700 border border-slate-800 dark:border-slate-800 light:border-slate-250"
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
                  className={`p-2.5 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-250 flex items-center justify-center cursor-pointer ${
                    currentPage === totalPages
                      ? "text-slate-600 bg-transparent cursor-not-allowed opacity-50"
                      : "text-slate-300 dark:text-slate-300 light:text-slate-700 bg-slate-800/40 hover:bg-slate-750"
                  }`}
                  aria-label="Next Page"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Favorites;
