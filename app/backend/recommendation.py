import logging
import pickle
import re
import difflib
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from config import MOVIES_METADATA_PATH, SIMILARITY_MATRIX_PATH
from tmdb import fetch_movie

# Configure logging
logger = logging.getLogger(__name__)

# Global variables to store the loaded models
movies_df: pd.DataFrame = None
similarity_matrix: np.ndarray = None

def load_models() -> None:
    """
    Loads the movie metadata and similarity matrix from pickle files.
    This function should run once during application startup.
    """
    global movies_df, similarity_matrix
    
    logger.info("Initializing movie recommendation models...")
    
    if not MOVIES_METADATA_PATH.exists():
        raise FileNotFoundError(f"Movies metadata file not found at: {MOVIES_METADATA_PATH}")
    if not SIMILARITY_MATRIX_PATH.exists():
        raise FileNotFoundError(f"Similarity matrix file not found at: {SIMILARITY_MATRIX_PATH}")
        
    try:
        with open(MOVIES_METADATA_PATH, "rb") as f:
            movies_df = pickle.load(f)
        # Requirement 11: Log number of movies loaded
        logger.info(
            f"Successfully loaded movies DataFrame. Shape: {movies_df.shape}. "
            f"Movies loaded count: {len(movies_df)}"
        )
    except Exception as e:
        logger.error(f"Error loading movies dataframe: {e}")
        raise e
        
    try:
        with open(SIMILARITY_MATRIX_PATH, "rb") as f:
            similarity_matrix = pickle.load(f)
        logger.info(f"Successfully loaded similarity matrix. Shape: {similarity_matrix.shape}")
    except Exception as e:
        logger.error(f"Error loading similarity matrix: {e}")
        raise e

# Pre-load models at import time to ensure they are cached during application startup.
try:
    load_models()
except Exception as e:
    logger.critical(f"Failed to load recommendation models during startup initialization: {e}")


def clean_title(title: str) -> str:
    """
    Helper function to remove release year at the end of a movie title,
    e.g., 'Toy Story (1995)' -> 'Toy Story'.
    """
    if not title:
        return ""
    # Regex to match year in parentheses at the end of title
    cleaned = re.sub(r"\s*\(\d{4}\)$", "", title)
    return cleaned.strip()


def find_best_match(query: str) -> Optional[str]:
    """
    Performs a robust, case-insensitive fuzzy match to find the closest movie title in the database.
    
    Parameters:
        query (str): The search input from the user.
        
    Returns:
        Optional[str]: The exact matched title from movies_df, or None if no match is found.
    """
    if movies_df is None:
        logger.error("Movies dataset is not loaded. Cannot perform search.")
        return None
        
    query_clean = query.strip().lower()
    if not query_clean:
        return None
        
    # Requirement 11: Log searched movie name
    logger.info(f"Searching database for movie name query: '{query}'")
    
    titles_list = movies_df['title'].tolist()
    
    # 1. Exact match (case-insensitive, stripped)
    for title in titles_list:
        if title.strip().lower() == query_clean:
            movie_idx = titles_list.index(title)
            # Requirement 11: Log match info
            logger.info(f"Exact match found. Matches: 1. Selected Title: '{title}', Index: {movie_idx}")
            return title
            
    # 2. Exact match against cleaned titles (without year, case-insensitive)
    exact_clean_matches = []
    for title in titles_list:
        if clean_title(title).lower() == query_clean:
            exact_clean_matches.append(title)
            
    if exact_clean_matches:
        matched_title = exact_clean_matches[0]
        movie_idx = titles_list.index(matched_title)
        # Requirement 11: Log match info
        logger.info(
            f"Exact clean title match found. Matches: {len(exact_clean_matches)}. "
            f"Selected Title: '{matched_title}', Index: {movie_idx}"
        )
        return matched_title
        
    # 3. Partial match (cleaned title contains query)
    partial_matches = []
    for title in titles_list:
        c_title = clean_title(title).lower()
        if query_clean in c_title:
            score = difflib.SequenceMatcher(None, query_clean, c_title).ratio()
            partial_matches.append((title, score))
            
    if partial_matches:
        # Sort by SequenceMatcher score descending
        partial_matches.sort(key=lambda x: x[1], reverse=True)
        matched_title = partial_matches[0][0]
        movie_idx = titles_list.index(matched_title)
        # Requirement 11: Log match info
        logger.info(
            f"Partial match found. Matches: {len(partial_matches)}. "
            f"Selected Title: '{matched_title}', Index: {movie_idx}"
        )
        return matched_title
        
    # 4. Fuzzy match using SequenceMatcher ratio on cleaned titles
    fuzzy_matches = []
    for title in titles_list:
        c_title = clean_title(title).lower()
        score = difflib.SequenceMatcher(None, query_clean, c_title).ratio()
        if score > 0.4:
            fuzzy_matches.append((title, score))
            
    if fuzzy_matches:
        fuzzy_matches.sort(key=lambda x: x[1], reverse=True)
        matched_title = fuzzy_matches[0][0]
        movie_idx = titles_list.index(matched_title)
        # Requirement 11: Log match info
        logger.info(
            f"Fuzzy match found. Matches: {len(fuzzy_matches)}. "
            f"Selected Title: '{matched_title}', Index: {movie_idx}"
        )
        return matched_title
        
    # 5. Last fallback: difflib.get_close_matches on original titles
    close_matches = difflib.get_close_matches(query, titles_list, n=1, cutoff=0.4)
    if close_matches:
        matched_title = close_matches[0]
        movie_idx = titles_list.index(matched_title)
        # Requirement 11: Log match info
        logger.info(f"Close match fallback found. Selected Title: '{matched_title}', Index: {movie_idx}")
        return matched_title
        
    # Requirement 11: Log no matches found
    logger.warning(f"No match found in database for query: '{query}'")
    return None


def recommend(movie_name: str) -> List[Dict[str, Any]]:
    """
    Recommends top 5 movies similar to the given movie name and fetches
    metadata (overview, poster, rating, etc.) from TMDB for each recommendation.
    
    Parameters:
        movie_name (str): Name of the movie to find recommendations for.
        
    Returns:
        List[Dict[str, Any]]: A list containing recommended movie metadata cards.
                              Returns an empty list if the movie is not found, or in case of failures.
    """
    # Safeguard checks for empty query
    if not movie_name or not isinstance(movie_name, str):
        logger.warning("Empty or invalid movie name query received.")
        return []
        
    # Safeguard check for uninitialized models
    if movies_df is None or similarity_matrix is None:
        logger.error("Recommendation system is not initialized: models are missing.")
        return []
        
    try:
        # Perform robust matching to find the exact database title
        matched_title = find_best_match(movie_name)
        if not matched_title:
            return []
            
        # Get index of the matched movie
        matching_movies = movies_df[movies_df['title'] == matched_title]
        movie_idx = matching_movies.index[0]
        
        # Get similarity scores for this movie index
        similarity_scores = similarity_matrix[movie_idx]
        
        # Sort indices based on similarity score descending, keeping track of the original index
        sorted_scores = sorted(list(enumerate(similarity_scores)), key=lambda x: x[1], reverse=True)
        
        recommendations = []
        for idx, score in sorted_scores:
            # Exclude the queried movie itself
            if idx == movie_idx:
                continue
                
            rec_title = movies_df.iloc[idx]['title']
            
            # Fetch movie details from TMDB (utilizing caching and connection sessions)
            # Safe call: if TMDB fails, it returns fallback metadata instead of crashing
            movie_details = fetch_movie(rec_title)
            
            tmdb_id = movie_details.get("tmdb_id")
            tmdb_url = f"https://www.themoviedb.org/movie/{tmdb_id}" if tmdb_id else None
            
            recommendations.append({
                "title": movie_details.get("title", rec_title),
                "poster": movie_details.get("poster"),
                "overview": movie_details.get("overview", ""),
                "rating": movie_details.get("rating"),
                "release_date": movie_details.get("release_date", ""),
                "language": movie_details.get("language", ""),
                "vote_count": movie_details.get("vote_count"),
                "popularity": movie_details.get("popularity"),
                "genres": movie_details.get("genres", []),
                "runtime": movie_details.get("runtime"),
                "tmdb_url": tmdb_url
            })
            
            # Retrieve only the top 5 recommendations
            if len(recommendations) == 5:
                break
                
        return recommendations
        
    except Exception as e:
        logger.error(f"Unexpected error in recommend function for '{movie_name}': {e}")
        return []
