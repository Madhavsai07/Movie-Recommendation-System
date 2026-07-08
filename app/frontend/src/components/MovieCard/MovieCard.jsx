import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiFilm, FiStar, FiCalendar, FiHeart, FiMaximize2, FiRefreshCw, FiExternalLink } from "react-icons/fi";

const MovieCard = ({ movie, isFav, onFavToggle, onRecommendAgain }) => {
  const { title, poster, overview, rating, release_date, language, genres, tmdb_url } = movie;
  const [imgLoaded, setImgLoaded] = useState(false);

  const getReleaseYear = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getFullYear()) ? "N/A" : date.getFullYear();
  };

  const formatRating = (val) => {
    if (val === undefined || val === null) return "N/A";
    return Number(val).toFixed(1);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavToggle(movie);
  };

  const handleRecommendClick = (e) => {
    e.stopPropagation();
    onRecommendAgain(title);
  };

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-sky-500/5 hover:border-sky-500/30 dark:hover:border-sky-500/30 transition-all duration-300 transform hover:-translate-y-2 select-none">
      
      {/* Poster Image Overlay Wrapper */}
      <div className="relative aspect-[2/3] w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {poster ? (
          <>
            <img
              src={poster}
              alt={`${title} Poster`}
              onLoad={() => setImgLoaded(true)}
              loading="lazy"
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-850 animate-pulse"></div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-5 bg-gradient-to-br from-slate-100 to-slate-250 dark:from-slate-850 dark:to-slate-950 text-slate-400 dark:text-slate-500">
            <FiFilm className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-650" />
            <span className="text-xs font-bold text-center text-slate-600 dark:text-slate-400 break-words w-full px-2">
              {title}
            </span>
          </div>
        )}

        {/* Favorite Icon Overlay */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 left-3 p-2 bg-white/90 dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-950/95 border border-slate-200 dark:border-slate-800/55 rounded-xl transition-all shadow-md backdrop-blur-sm active:scale-95 cursor-pointer"
          aria-label={isFav ? "Remove from Favorites" : "Add to Favorites"}
        >
          <FiHeart
            className={`w-4 h-4 transition-all ${
              isFav ? "fill-red-500 text-red-500 scale-110" : "text-slate-400 dark:text-slate-450"
            }`}
          />
        </button>

        {/* Rating Badge Overlay */}
        {rating !== undefined && rating !== null && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 bg-white/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/55 text-amber-500 dark:text-amber-400 text-xs font-bold rounded-lg shadow-md backdrop-blur-sm">
            <FiStar className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
            <span>{formatRating(rating)}</span>
          </div>
        )}
      </div>

      {/* Card Content Container */}
      <div className="flex flex-col flex-grow p-4">
        
        {/* Title Link to details page */}
        <Link
          to={`/movie/${encodeURIComponent(title)}`}
          className="text-sm font-extrabold text-slate-850 dark:text-slate-105 line-clamp-1 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          title={title}
        >
          {title}
        </Link>

        {/* Year & Genres metadata summary */}
        <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
          <div className="flex items-center space-x-0.5">
            <FiCalendar className="w-3 h-3" />
            <span>{getReleaseYear(release_date)}</span>
          </div>
          {genres && genres.length > 0 && (
            <>
              <span>•</span>
              <span className="text-slate-500 dark:text-slate-400 font-semibold max-w-[120px] truncate">
                {genres.join(", ")}
              </span>
            </>
          )}
        </div>

        {/* Description Overview */}
        {overview && (
          <p className="mt-2.5 text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
            {overview}
          </p>
        )}

        {/* Interactive Action Control Buttons */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-805">
          
          <Link
            to={`/movie/${encodeURIComponent(title)}`}
            className="flex-1 py-2 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-all active:scale-95"
            title="View full description and details"
          >
            <FiMaximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Details</span>
          </Link>

          <button
            onClick={handleRecommendClick}
            className="flex-1 py-2 bg-sky-550/10 dark:bg-sky-500/10 hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-slate-900 dark:hover:text-slate-900 text-sky-600 dark:text-sky-400 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer"
            title="Find movies similar to this"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Similar</span>
          </button>

          {tmdb_url && (
            <a
              href={tmdb_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-100 dark:bg-slate-750/35 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-205 rounded-lg transition-colors flex items-center justify-center"
              title="Open Movie page on TMDB website"
              aria-label="Open Movie page on TMDB website"
            >
              <FiExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

        </div>

      </div>

    </div>
  );
};

export default MovieCard;
