import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center bg-slate-900 dark:bg-slate-900 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-800 transition-colors duration-300">
      <div className="max-w-md p-8 bg-slate-850/30 dark:bg-slate-850/30 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl shadow-xl flex flex-col items-center">
        
        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full mb-6 animate-pulse">
          <FiAlertTriangle className="w-12 h-12" />
        </div>

        <h1 className="text-7xl font-black text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight leading-none">
          404
        </h1>
        <h2 className="text-lg font-extrabold text-slate-350 dark:text-slate-350 light:text-slate-500 mt-2.5 uppercase tracking-wide">
          Page Not Found
        </h2>
        
        <p className="text-slate-450 dark:text-slate-450 light:text-slate-600 text-xs mt-3 leading-relaxed max-w-xs">
          The routing path you specified could not be resolved to an active page layout.
        </p>

        <Link
          to="/"
          className="flex items-center space-x-2 mt-8 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-900 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-sky-500/10 active:scale-95 transition-all"
        >
          <FiHome className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
