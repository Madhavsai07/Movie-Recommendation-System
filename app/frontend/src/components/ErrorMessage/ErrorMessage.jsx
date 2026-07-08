import React from "react";
import { FiAlertTriangle, FiWifiOff, FiSearch } from "react-icons/fi";

const ErrorMessage = ({ errorType, query }) => {
  const isConnectionError = errorType === "Connection Error";

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-slate-800/60 border border-slate-700/80 rounded-2xl shadow-xl backdrop-blur-sm text-center animate-fade-in">
      <div className="flex justify-center mb-4">
        {isConnectionError ? (
          <div className="p-4 bg-red-500/10 text-red-400 rounded-full">
            <FiWifiOff className="w-10 h-10" />
          </div>
        ) : (
          <div className="p-4 bg-sky-500/10 text-sky-400 rounded-full">
            <FiSearch className="w-10 h-10" />
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2">
        {isConnectionError ? "Connection Error" : "Movie Not Found"}
      </h3>

      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        {isConnectionError
          ? "Unable to connect to the recommendation engine. Please verify the backend service is running and try again."
          : `We couldn't find "${query}" in our dataset. Try using search terms like "Toy Story", "Inception", or "Titanic".`}
      </p>

      {isConnectionError && (
        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-left">
          <p className="text-xs text-slate-500 font-mono select-all">
            $ python3 -m uvicorn main:app --reload
          </p>
          <span className="text-[10px] text-slate-600 block mt-1">
            Ensure backend server runs on http://127.0.0.1:8000
          </span>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;
