import React from "react";
import MovieCard from "../MovieCard/MovieCard";

const RecommendationGrid = ({
  recommendations,
  isFavorite,
  toggleFavorite,
  onRecommendAgain,
}) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col mb-6">
        <h3 className="text-xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-800 tracking-wide">
          Recommendations For You
        </h3>
        <div className="w-16 h-1 bg-sky-500 rounded mt-1.5"></div>
      </div>

      {/* Grid container matches responsive Movie Grid columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 animate-fade-in">
        {recommendations.map((movie, index) => (
          <MovieCard
            key={`${movie.title}-${index}`}
            movie={movie}
            isFav={isFavorite(movie.title)}
            onFavToggle={toggleFavorite}
            onRecommendAgain={onRecommendAgain}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationGrid;
