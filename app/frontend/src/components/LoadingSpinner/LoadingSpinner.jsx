import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      {/* Outer spinning ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-sky-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-slate-400 font-medium text-sm tracking-wide animate-pulse">
        Analyzing tags & calculating recommendations...
      </p>
    </div>
  );
};

export default LoadingSpinner;
