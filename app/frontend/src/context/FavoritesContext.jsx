import React, { createContext, useState, useContext, useCallback } from "react";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("cineMatch_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = useCallback((movie) => {
    setFavorites((prevFavorites) => {
      const isAlreadyFav = prevFavorites.some(
        (fav) => fav.title.toLowerCase() === movie.title.toLowerCase()
      );
      let updated;
      if (isAlreadyFav) {
        updated = prevFavorites.filter(
          (fav) => fav.title.toLowerCase() !== movie.title.toLowerCase()
        );
      } else {
        updated = [movie, ...prevFavorites];
      }
      localStorage.setItem("cineMatch_favorites", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback((movieTitle) => {
    return favorites.some((fav) => fav.title.toLowerCase() === movieTitle.toLowerCase());
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem("cineMatch_favorites");
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
