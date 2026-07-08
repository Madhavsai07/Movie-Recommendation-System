import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiFilm, FiGithub, FiInfo, FiX, FiCheck, FiSun, FiMoon, FiHeart } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useFavorites } from "../../context/FavoritesContext";

const Navbar = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { favorites } = useFavorites();
  const location = useLocation();

  const toggleAbout = () => {
    setIsAboutOpen(!isAboutOpen);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-805 shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          
          {/* Logo & Title */}
          <Link to="/" className="flex items-center space-x-2.5 text-slate-800 dark:text-slate-105 hover:text-sky-600 dark:hover:text-sky-400 transition-colors group">
            <div className="p-2 bg-sky-500/10 text-sky-550 dark:text-sky-400 rounded-xl group-hover:bg-sky-500/20 transition-all">
              <FiFilm className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-wide bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-350 bg-clip-text text-transparent group-hover:from-sky-500 group-hover:to-sky-400">
              CineMatch
            </span>
          </Link>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            
            {/* Favorites navigation link */}
            <Link
              to="/favorites"
              className={`flex items-center space-x-1.5 px-3 py-2 text-sm font-semibold rounded-xl transition-all active:scale-95 ${
                location.pathname === "/favorites"
                  ? "bg-red-500/10 text-red-500"
                  : "text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-850"
              }`}
              aria-label="Open saved favorite movies page"
            >
              <FiHeart className={`w-4 h-4 ${location.pathname === "/favorites" ? "fill-red-500" : ""}`} />
              <span className="hidden sm:inline">Favorites</span>
              {favorites.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-red-500 text-white rounded-md">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* About trigger */}
            <button
              onClick={toggleAbout}
              className="flex items-center space-x-1.5 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all active:scale-95 cursor-pointer"
              aria-label="About the system details"
            >
              <FiInfo className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </button>

            {/* Light/Dark Toggle (Feature 11) */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-105 dark:hover:bg-slate-850 rounded-xl transition-all active:scale-95 cursor-pointer"
              title={theme === "dark" ? "Toggle Light Mode" : "Toggle Dark Mode"}
              aria-label="Theme toggle switch"
            >
              {theme === "dark" ? <FiSun className="w-4.5 h-4.5" /> : <FiMoon className="w-4.5 h-4.5" />}
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all active:scale-95"
              aria-label="View source code on GitHub"
            >
              <FiGithub className="w-4.5 h-4.5" />
            </a>

          </div>

        </div>
      </nav>

      {/* Tech Specifications Modal Overlay */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg p-6 bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl animate-scale-up text-left">
            
            {/* Close Button */}
            <button
              onClick={toggleAbout}
              className="absolute top-4 right-4 p-1.5 text-slate-450 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close details modal"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-2.5 mb-4 text-sky-400">
              <FiInfo className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-100">
                About the Recommendation Engine
              </h3>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
              <p>
                CineMatch is a machine learning-powered film discovery engine. It uses a **Content-Based Filtering** algorithm to recommend titles based on semantic similarity of plot vectors.
              </p>
              
              <div className="border-t border-slate-800/80 pt-3 space-y-2">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Technical Architecture:
                </h4>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-start space-x-2">
                    <FiCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>CountVectorizer</strong>: Extracts features from actor, director, genre, and overview tags.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FiCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Cosine Similarity</strong>: Measures similarity between vectorized movie descriptions.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FiCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>TMDB Details Integration</strong>: Enriches recommendations with live posters, ratings, runtimes, and genres.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
