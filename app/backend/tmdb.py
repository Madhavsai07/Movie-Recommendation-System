import logging
import re
import requests
from typing import Dict, Any, Optional
from functools import lru_cache
from config import TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL

# Configure logging
logger = logging.getLogger(__name__)

# Reusable Requests Session for connection pooling (Task 10)
session = requests.Session()

# Timeout constant (Task 10)
TIMEOUT_SECONDS = 10.0

def search_movie(movie_name: str) -> Optional[Dict[str, Any]]:
    """
    Searches for a movie on TMDB and returns the first matching result.
    
    Handles parsing of release year (e.g., 'Toy Story (1995)') to improve search accuracy,
    and falls back to search without year filter if no results are found.
    
    Parameters:
        movie_name (str): Movie title, possibly containing a release year in parentheses.
        
    Returns:
        Optional[Dict[str, Any]]: The first movie match dictionary from TMDB, or None if not found/error.
    """
    if not TMDB_API_KEY:
        logger.error("TMDB API Key is missing. Cannot execute search.")
        return None

    # Parse title and year (e.g. "Toy Story (1995)" -> query="Toy Story", year="1995")
    match = re.search(r"^(.*?)\s*\((\d{4})\)$", movie_name)
    if match:
        query = match.group(1).strip()
        year = match.group(2).strip()
    else:
        query = movie_name.strip()
        year = None

    url = f"{TMDB_BASE_URL}/search/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "query": query,
        "language": "en-US"
    }
    
    if year:
        params["primary_release_year"] = year

    try:
        logger.info(f"Searching TMDB for: '{query}' (Year: {year})")
        response = session.get(url, params=params, timeout=TIMEOUT_SECONDS)
        
        # Check for invalid API key (401) or other HTTP failures
        if response.status_code == 401:
            logger.error("TMDB API Key is invalid or unauthorized (HTTP 401).")
            return None
        response.raise_for_status()
        
        data = response.json()
        results = data.get("results", [])
        
        if results:
            return results[0]
            
        # Fallback: if search with year yielded no results, try searching without the year filter
        if year:
            logger.warning(f"No results found with year constraint '{year}'. Trying search without year...")
            params.pop("primary_release_year", None)
            fallback_response = session.get(url, params=params, timeout=TIMEOUT_SECONDS)
            fallback_response.raise_for_status()
            fallback_data = fallback_response.json()
            fallback_results = fallback_data.get("results", [])
            if fallback_results:
                return fallback_results[0]

        logger.info(f"No movie results found on TMDB for query: '{movie_name}'")
        return None

    except requests.exceptions.Timeout:
        logger.error(f"Timeout occurred (>{TIMEOUT_SECONDS}s) while calling TMDB search for: '{movie_name}'")
        return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error while connecting to TMDB search for '{movie_name}': {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error in search_movie for '{movie_name}': {e}")
        return None


@lru_cache(maxsize=1024)
def fetch_movie_details(tmdb_id: int) -> Dict[str, Any]:
    """
    Queries TMDB f"/movie/{tmdb_id}" to get full details like genres and runtime.
    """
    if not TMDB_API_KEY or not tmdb_id:
        return {"genres": [], "runtime": None}
        
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
    params = {
        "api_key": TMDB_API_KEY,
        "language": "en-US"
    }
    
    try:
        response = session.get(url, params=params, timeout=TIMEOUT_SECONDS)
        response.raise_for_status()
        data = response.json()
        
        genres_data = data.get("genres", [])
        genres = [g.get("name") for g in genres_data if g.get("name")]
        runtime = data.get("runtime")
        
        return {
            "genres": genres,
            "runtime": runtime
        }
    except Exception as e:
        logger.error(f"Error fetching detailed movie metadata for ID {tmdb_id}: {e}")
        return {"genres": [], "runtime": None}


@lru_cache(maxsize=1024)
def fetch_movie(movie_name: str) -> Dict[str, Any]:
    """
    Fetches details and poster path for a movie and returns a standardized metadata dictionary.
    This function is cached to prevent redundant API queries.
    
    Parameters:
        movie_name (str): Movie title to fetch.
        
    Returns:
        Dict[str, Any]: Standardized dictionary containing title, poster, and other metadata.
                        If TMDB search fails, returns a safe fallback dictionary.
    """
    # Define fallback dictionary structure (Task 6)
    fallback_data = {
        "title": movie_name,
        "poster": None,
        "overview": "",
        "rating": None,
        "release_date": "",
        "tmdb_id": None,
        "popularity": None,
        "language": "",
        "vote_count": None,
        "genres": [],
        "runtime": None
    }
    
    # Clean input
    cleaned_name = movie_name.strip() if movie_name else ""
    if not cleaned_name:
        return fallback_data

    movie_data = search_movie(cleaned_name)
    
    if not movie_data:
        return fallback_data
        
    try:
        poster_path = movie_data.get("poster_path")
        poster_url = f"{TMDB_IMAGE_BASE_URL}/w500{poster_path}" if poster_path else None
        tmdb_id = movie_data.get("id")
        
        # Fetch extra metadata details (genres and runtime)
        details = fetch_movie_details(tmdb_id) if tmdb_id else {"genres": [], "runtime": None}
        
        return {
            "title": movie_data.get("title") or movie_data.get("original_title") or cleaned_name,
            "poster": poster_url,
            "overview": movie_data.get("overview", ""),
            "rating": movie_data.get("vote_average"),
            "release_date": movie_data.get("release_date", ""),
            "tmdb_id": tmdb_id,
            "popularity": movie_data.get("popularity"),
            "language": movie_data.get("original_language", ""),
            "vote_count": movie_data.get("vote_count"),
            "genres": details.get("genres", []),
            "runtime": details.get("runtime")
        }
    except Exception as e:
        logger.error(f"Error parsing movie metadata for '{cleaned_name}': {e}")
        # Make sure to return fallback on parsing errors to prevent crashes
        return fallback_data
