import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMovieDetails, recommendMovie } from "../services/api";
import { useFavorites } from "../context/FavoritesContext";
import { useSearch } from "../context/SearchContext";
import MovieCard from "../components/MovieCard/MovieCard";
import LoadingSkeleton from "../components/LoadingSkeleton/LoadingSkeleton";
import { 
  FiArrowLeft, FiStar, FiCalendar, FiGlobe, FiClock, 
  FiTrendingUp, FiHeart, FiShare2, FiExternalLink, FiFilm 
} from "react-icons/fi";
import axios from "axios";

const MovieDetails = () => {
  const { title } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { triggerSearch } = useSearch();

  const [movie, setMovie] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareText, setShareText] = useState("Share Movie");
  const [shareSuccess, setShareSuccess] = useState(false);

  const abortControllerRef = useRef(null);

  // Fetch Movie Details & Related recommendations
  useEffect(() => {
    const loadMovieDetails = async () => {
      setLoading(true);
      setRelatedLoading(true);
      setError(null);
      setMovie(null);
      setRelated([]);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        // Step 1: Fetch main movie metadata details
        const movieData = await getMovieDetails(decodeURIComponent(title), controller.signal);
        setMovie(movieData);
        setLoading(false);

        // Track recently viewed list in localStorage (Feature 8)
        try {
          const recentSaved = localStorage.getItem("cineMatch_recent");
          let recentList = recentSaved ? JSON.parse(recentSaved) : [];
          // Deduplicate
          recentList = recentList.filter(
            (m) => m.title.toLowerCase() !== movieData.title.toLowerCase()
          );
          // Limit to top 10 items
          const updated = [movieData, ...recentList].slice(0, 10);
          localStorage.setItem("cineMatch_recent", JSON.stringify(updated));
        } catch (recentErr) {
          console.error("Failed to update recently viewed:", recentErr);
        }

        // Step 2: Fetch related recommendations ("You May Also Like") (Feature 5)
        const recommendationsData = await recommendMovie(movieData.title, controller.signal);
        // Exclude current movie if returned
        const filteredRelated = recommendationsData.filter(
          (m) => m.title.toLowerCase() !== movieData.title.toLowerCase()
        );
        setRelated(filteredRelated);
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }
        console.error("MovieDetails page loading error:", err);
        if (err.response && err.response.status === 404) {
          setError("Movie Not Found");
        } else {
          setError("Connection Error");
        }
      } finally {
        setRelatedLoading(false);
      }
    };

    loadMovieDetails();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [title]);

  const handleShareClick = () => {
    // Copy movie link to clipboard (Feature 6)
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setShareText("Link Copied!");
        setShareSuccess(true);
        setTimeout(() => {
          setShareText("Share Movie");
          setShareSuccess(false);
        }, 3000);
      })
      .catch((err) => {
        console.error("Clipboard copy error:", err);
        setShareText("Copy Failed");
      });
  };

  const handleRecommendAgain = (recTitle) => {
    triggerSearch(recTitle);
    navigate("/");
  };

  const getReleaseYear = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getFullYear()) ? "N/A" : date.getFullYear();
  };

  if (loading) {
    return (
      <div className="py-20 bg-slate-900 min-h-screen">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-6">
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-full text-slate-500 mb-4 animate-pulse">
          <FiFilm className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-slate-200">
          {error === "Movie Not Found" ? "Movie Details Not Found" : "Connection Error"}
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
          {error === "Movie Not Found"
            ? "We couldn't retrieve detailed records for this specific movie title."
            : "Check your local server processes running FastAPI backend on http://127.0.0.1:8000."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-900 text-xs font-bold tracking-wide rounded-xl shadow-md transition-all active:scale-95"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const isMovieFav = isFavorite(movie.title);

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-800 transition-colors duration-300">
      
      {/* Backdrop Hero Container */}
      <div className="relative w-full h-[50vh] md:h-[65vh] bg-slate-950 overflow-hidden">
        {movie.poster ? (
          <div className="absolute inset-0 select-none">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover blur-md opacity-25 scale-105"
            />
            {/* Dark gradient mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-slate-950"></div>
        )}

        {/* Floating Back Control */}
        <div className="absolute top-6 left-4 md:left-8 z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900/60 dark:bg-slate-900/60 light:bg-white/80 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-100 text-slate-200 dark:text-slate-200 light:text-slate-800 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-xl transition-all shadow-md backdrop-blur-sm active:scale-95 cursor-pointer font-bold text-xs"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      {/* Main Info Block Layer Offset */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-36 md:-mt-52 relative z-20 pb-16">
        
        {/* Info Layout */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Movie Poster Image (Task Poster Card) */}
          <div className="w-full sm:w-64 md:w-80 shrink-0 aspect-[2/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 dark:border-slate-800 light:border-slate-250 shadow-2xl relative select-none">
            {movie.poster ? (
              <img
                src={movie.poster}
                alt={`${movie.title} Poster`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900 text-slate-500">
                <FiFilm className="w-12 h-12 mb-2 text-slate-650" />
                <span className="text-sm font-bold text-slate-400 text-center">{movie.title}</span>
              </div>
            )}
          </div>

          {/* Details Content Block */}
          <div className="flex-grow space-y-6 pt-4 md:pt-16">
            
            {/* Title & Date */}
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900 leading-tight">
                  {movie.title}
                </h1>
                <span className="text-lg font-bold text-sky-400">
                  ({getReleaseYear(movie.release_date)})
                </span>
              </div>
              
              {/* Genres Tag list */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3.5">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-300/40 text-[10px] font-extrabold rounded-lg uppercase tracking-wider"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Ratings & Metadata Summary Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 bg-slate-850/40 dark:bg-slate-850/40 light:bg-slate-105 border border-slate-800 dark:border-slate-800 light:border-slate-200 p-3 rounded-2xl">
              
              {movie.rating !== undefined && movie.rating !== null && (
                <div className="flex items-center space-x-1 text-amber-400 bg-amber-400/5 dark:bg-amber-400/5 px-2.5 py-1 border border-amber-400/10 rounded-lg">
                  <FiStar className="w-4 h-4 fill-amber-400" />
                  <span>{Number(movie.rating).toFixed(1)}/10</span>
                  {movie.vote_count && (
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({movie.vote_count.toLocaleString()} votes)
                    </span>
                  )}
                </div>
              )}

              {movie.runtime && (
                <div className="flex items-center space-x-1.5 border-l border-slate-800/80 pl-3">
                  <FiClock className="w-4 h-4 text-slate-500" />
                  <span>{movie.runtime} Min</span>
                </div>
              )}

              {movie.language && (
                <div className="flex items-center space-x-1.5 border-l border-slate-800/80 pl-3 uppercase">
                  <FiGlobe className="w-4 h-4 text-slate-500" />
                  <span>{movie.language}</span>
                </div>
              )}

              {movie.popularity && (
                <div className="flex items-center space-x-1.5 border-l border-slate-800/80 pl-3">
                  <FiTrendingUp className="w-4 h-4 text-slate-500" />
                  <span>{Math.round(movie.popularity).toLocaleString()} Popularity</span>
                </div>
              )}
            </div>

            {/* Overview Plot Block */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-500 light:text-slate-450 uppercase tracking-widest">
                Storyline
              </h3>
              <p className="text-slate-300 dark:text-slate-300 light:text-slate-700 text-sm md:text-base leading-relaxed">
                {movie.overview || "No plot synopsis exists for this movie entry."}
              </p>
            </div>

            {/* Interactive Control Row */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-850 dark:border-slate-850 light:border-slate-200">
              
              <button
                onClick={() => toggleFavorite(movie)}
                className={`px-5 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer flex items-center space-x-2 border ${
                  isMovieFav
                    ? "bg-red-500/10 text-red-500 border-red-500/25"
                    : "bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700/60"
                }`}
              >
                <FiHeart className={`w-4 h-4 ${isMovieFav ? "fill-red-500" : ""}`} />
                <span>{isMovieFav ? "Remove Favorite" : "Save Favorite"}</span>
              </button>

              <button
                onClick={handleShareClick}
                className={`px-5 py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-200 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer flex items-center space-x-2 ${
                  shareSuccess ? "text-emerald-400 border-emerald-500/25 bg-emerald-500/5" : ""
                }`}
              >
                <FiShare2 className="w-4 h-4" />
                <span>{shareText}</span>
              </button>

              {movie.tmdb_url && (
                <a
                  href={movie.tmdb_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-sky-500 hover:bg-sky-400 text-slate-900 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 active:scale-95 flex items-center space-x-2 shadow-md shadow-sky-500/5"
                >
                  <FiExternalLink className="w-4 h-4" />
                  <span>Open on TMDB</span>
                </a>
              )}
            </div>

          </div>

        </div>

        {/* You May Also Like Section (Feature 5) */}
        <section className="mt-16 pt-8 border-t border-slate-850 dark:border-slate-850 light:border-slate-200">
          <div className="flex flex-col mb-6">
            <h2 className="text-xl font-black text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-wide">
              You May Also Like
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-550 mt-1 font-semibold uppercase tracking-wider">
              Recommendations based on "{movie.title}"
            </p>
            <div className="w-16 h-1 bg-sky-500 rounded mt-1.5"></div>
          </div>

          {relatedLoading ? (
            <div className="py-4 text-xs text-slate-500 italic">Finding related titles...</div>
          ) : related.length === 0 ? (
            <div className="py-4 text-xs text-slate-500 italic">No recommendations found for this title.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {related.map((recMovie, index) => (
                <MovieCard
                  key={`related-${recMovie.title}-${index}`}
                  movie={recMovie}
                  isFav={isFavorite(recMovie.title)}
                  onFavToggle={toggleFavorite}
                  onRecommendAgain={handleRecommendAgain}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default MovieDetails;
