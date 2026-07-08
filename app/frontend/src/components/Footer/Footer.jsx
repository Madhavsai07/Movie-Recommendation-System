import React from "react";
import { FiHeart, FiGithub } from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs font-semibold space-y-4 md:space-y-0">
        
        {/* Attribution */}
        <div className="flex items-center space-x-1 tracking-wide">
          <span>Made with</span>
          <FiHeart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
          <span>using React, FastAPI, and Cosine Similarity.</span>
        </div>

        {/* Tech Badges */}
        <div className="flex items-center space-x-3 text-[10px] text-slate-650 tracking-wider font-bold">
          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">REACT</span>
          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">FASTAPI</span>
          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">SCIKIT-LEARN</span>
          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">TMDB API</span>
        </div>

        {/* Copyright and links */}
        <div className="flex items-center space-x-4">
          <span>&copy; {currentYear} CineMatch. All rights reserved.</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-sky-400 transition-colors"
            aria-label="Source code GitHub repository"
          >
            <FiGithub className="w-4 h-4" />
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
