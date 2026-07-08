import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("backend_main")

# Import the recommendation logic safely
try:
    import recommendation
except Exception as e:
    logger.critical(f"Recommendation module initialization error: {e}")
    recommendation = None

# Initialize FastAPI application
app = FastAPI(
    title="Movie Recommendation System API",
    description=(
        "Production-ready FastAPI backend serving content-based recommendations "
        "enriched with TMDB API metadata (posters, ratings, overview, etc.)."
    ),
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware to allow requests from any frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define Pydantic response models for Swagger documentation auto-generation (Task 7)
class MovieRecommendation(BaseModel):
    title: str = Field(..., description="The title of the movie.")
    poster: Optional[str] = Field(None, description="The absolute URL of the movie poster from TMDB.")
    overview: str = Field("", description="A brief overview or description of the movie.")
    rating: Optional[float] = Field(None, description="The average voter rating from TMDB.")
    release_date: str = Field("", description="The theatrical release date of the movie.")
    language: str = Field("", description="The original language of the movie.")
    vote_count: Optional[int] = Field(None, description="The total number of voter reviews on TMDB.")
    popularity: Optional[float] = Field(None, description="The popularity index score on TMDB.")
    genres: List[str] = Field([], description="List of movie genres.")
    runtime: Optional[int] = Field(None, description="The movie runtime in minutes.")
    tmdb_url: Optional[str] = Field(None, description="Direct URL link to TMDB page.")

class RecommendationResponse(BaseModel):
    recommendations: List[MovieRecommendation]

@app.get("/", status_code=status.HTTP_200_OK)
def health_check() -> Dict[str, str]:
    """
    Service health check endpoint.
    """
    return {"status": "Running"}

@app.get("/search", status_code=status.HTTP_200_OK)
def search_movies(q: str = "") -> Dict[str, List[str]]:
    """
    Search endpoint to return autocomplete movie suggestions.
    """
    if (
        recommendation is None or 
        recommendation.movies_df is None
    ):
        return {"results": []}
        
    cleaned_query = q.strip().lower()
    if not cleaned_query:
        return {"results": []}
        
    # Case-insensitive partial matching (contains)
    matches = recommendation.movies_df[
        recommendation.movies_df['title'].str.lower().str.contains(cleaned_query, regex=False)
    ]['title'].head(10).tolist()
    
    return {"results": matches}

@app.get(
    "/recommend/{movie_name}", 
    response_model=RecommendationResponse, 
    status_code=status.HTTP_200_OK
)
def get_movie_recommendations(movie_name: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Returns the top 5 movie recommendations for a given movie title,
    enriched with TMDB details (posters, overview, ratings, popularity, etc.).
    """
    # Check for empty request
    cleaned_movie_name = movie_name.strip()
    if not cleaned_movie_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Movie name query parameter cannot be empty or whitespace."
        )

    # Check for missing recommendation engine models
    if (
        recommendation is None or 
        recommendation.movies_df is None or 
        recommendation.similarity_matrix is None
    ):
        logger.error("API requested but recommendation engine models are not loaded.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Recommendation model files are currently unavailable on the server."
        )
        
    try:
        # Find the best match in the database using robust search logic
        matched_title = recommendation.find_best_match(cleaned_movie_name)
        
        if not matched_title:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Movie '{cleaned_movie_name}' not found."
            )
            
        # Generate recommendations using the exact matched title
        results = recommendation.recommend(matched_title)
        return {"recommendations": results}
        
    except HTTPException:
        # Re-raise explicit HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Internal server error while recommending for '{movie_name}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating recommendations."
        )


@app.get(
    "/movie/details", 
    response_model=MovieRecommendation, 
    status_code=status.HTTP_200_OK
)
def get_movie_details(title: str) -> Dict[str, Any]:
    """
    Returns complete metadata details for a specific movie in the dataset.
    """
    if (
        recommendation is None or 
        recommendation.movies_df is None
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Recommendation system is not initialized."
        )
        
    cleaned_title = title.strip()
    if not cleaned_title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title parameter cannot be empty."
        )
        
    # Search for movie in local database using find_best_match
    matched_title = recommendation.find_best_match(cleaned_title)
    if not matched_title:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movie '{cleaned_title}' not found in database."
        )
        
    try:
        # Fetch detailed metadata from TMDB
        from tmdb import fetch_movie
        movie_details = fetch_movie(matched_title)
        
        # Build the tmdb_url
        tmdb_id = movie_details.get("tmdb_id")
        tmdb_url = f"https://www.themoviedb.org/movie/{tmdb_id}" if tmdb_id else None
        
        return {
            "title": movie_details.get("title", matched_title),
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
        }
    except Exception as e:
        logger.error(f"Error fetching movie details for '{matched_title}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching movie details."
        )
