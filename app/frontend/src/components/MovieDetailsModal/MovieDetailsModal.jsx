import React, { useEffect } from "react";
import { FiX, FiStar, FiCalendar, FiGlobe, FiClock, FiTrendingUp, FiCheckCircle } from "react-icons/fi";

const MovieDetailsModal = ({ movie, onClose }) => {
  const {
    title,
    poster,
    overview,
    rating,
    release_date,
    language,
    vote_count,
    popularity,
    genres,
    runtime,
  } = movie;

  // Keyboard shortcut ESC to close (Feature 6 & Feature 16)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Click outside to close handler (Feature 6)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getReleaseYear = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getFullYear()) ? "N/A" : date.getFullYear();
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-100 bg-slate-950/40 hover:bg-slate-800/80 rounded-xl transition-all"
          aria-label="Close details modal"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Left Side: Poster (hidden or stacked on mobile, full side on desktop) */}
        <div className="w-full md:w-2/5 aspect-[2/3] md:aspect-auto bg-slate-950 relative">
          {poster ? (
            <img
              src={poster}
              alt={`${title} Poster`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-500">
              <span className="text-sm font-bold text-center">{title}</span>
              <span className="text-xs text-slate-700 mt-1">No Poster Available</span>
            </div>
          )}
        </div>

        {/* Right Side: Movie Details Content */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Title & Release Year */}
            <div className="flex flex-wrap items-baseline gap-2 mb-2 pr-8">
              <h2 className="text-2xl font-black text-slate-100 tracking-tight leading-tight">
                {title}
              </h2>
              <span className="text-sm font-bold text-sky-400">
                ({getReleaseYear(release_date)})
              </span>
            </div>

            {/* Ratings & Metadata Summary */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-450 mb-5">
              {rating !== undefined && rating !== null && (
                <div className="flex items-center space-x-1 text-amber-400 bg-amber-400/5 border border-amber-400/10 px-2 py-0.5 rounded-md">
                  <FiStar className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{Number(rating).toFixed(1)}/10</span>
                  {vote_count && (
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({vote_count.toLocaleString()} votes)
                    </span>
                  )}
                </div>
              )}
              {runtime && (
                <div className="flex items-center space-x-1">
                  <FiClock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{runtime} min</span>
                </div>
              )}
              {language && (
                <div className="flex items-center space-x-1 uppercase">
                  <FiGlobe className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language}</span>
                </div>
              )}
              {popularity && (
                <div className="flex items-center space-x-1">
                  <FiTrendingUp className="w-3.5 h-3.5 text-slate-500" />
                  <span>{Math.round(popularity).toLocaleString()} popularity</span>
                </div>
              )}
            </div>

            {/* Genres Tag Badges */}
            {genres && genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2.5 py-1 bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px] font-bold rounded-lg"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Overview / Storyline */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Storyline
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed max-h-40 overflow-y-auto pr-2">
                {overview || "No plot description available for this title."}
              </p>
            </div>
          </div>

          {/* Technical Verification badge */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center space-x-2 text-[10px] font-bold text-slate-650 tracking-wider uppercase mt-4">
            <FiCheckCircle className="w-4 h-4 text-emerald-500" />
            <span>TMDB ENRICHED METADATA CARD</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MovieDetailsModal;
