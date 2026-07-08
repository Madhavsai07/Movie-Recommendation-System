import React from "react";

const SkeletonCard = () => {
  return (
    <div className="flex flex-col bg-slate-800/60 border border-slate-700/40 rounded-2xl overflow-hidden shadow-md animate-pulse">
      {/* Poster skeleton aspect ratio 2/3 */}
      <div className="w-full aspect-[2/3] bg-slate-700/50"></div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title line */}
        <div className="h-4 bg-slate-700/60 rounded-md w-3/4"></div>
        
        {/* Metadata badges line */}
        <div className="flex space-x-3 pt-1">
          <div className="h-3 bg-slate-700/65 rounded w-1/4"></div>
          <div className="h-3 bg-slate-700/65 rounded w-1/4"></div>
        </div>

        {/* Overview text lines */}
        <div className="space-y-1.5 pt-2">
          <div className="h-2.5 bg-slate-700/50 rounded w-full"></div>
          <div className="h-2.5 bg-slate-700/50 rounded w-full"></div>
          <div className="h-2.5 bg-slate-700/50 rounded w-5/6"></div>
        </div>

        {/* Button skeletons */}
        <div className="flex space-x-2 pt-3">
          <div className="h-7 bg-slate-700/60 rounded-lg w-1/2"></div>
          <div className="h-7 bg-slate-700/60 rounded-lg w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => {
  // Generate an array of 5 items for the grid representation
  const skeletonItems = Array.from({ length: 5 });

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col mb-6">
        {/* Placeholder title */}
        <div className="h-6 bg-slate-700/65 rounded-md w-48 mb-2 animate-pulse"></div>
        <div className="w-16 h-1 bg-slate-700/50 rounded mt-1.5 animate-pulse"></div>
      </div>

      {/* Grid container matches responsive Movie Grid columns (Feature 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {skeletonItems.map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
