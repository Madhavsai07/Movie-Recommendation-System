from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from the .env file in this directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# Base directory of the backend application
BASE_DIR = Path(__file__).resolve().parent

# Directory where the movie recommendation model files are stored
MODEL_DIR = BASE_DIR / "models"

# Paths to the model pickle files
MOVIES_METADATA_PATH = MODEL_DIR / "movies.pkl"
SIMILARITY_MATRIX_PATH = MODEL_DIR / "similarity.pkl"

# TMDB API configurations
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "").strip()

# Verification: check if the key is configured
if not TMDB_API_KEY:
    raise RuntimeError(
        "Configuration Error: TMDB_API_KEY has not been configured. "
        "Please specify a valid TMDB API key in your app/backend/.env file."
    )

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"
