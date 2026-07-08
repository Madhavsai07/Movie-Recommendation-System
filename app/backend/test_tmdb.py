import json
from tmdb import fetch_movie

def test_tmdb_movies():
    test_movies = [
        "Toy Story",
        "Avatar",
        "Inception",
        "Interstellar"
    ]
    
    print("==================================================")
    print("Testing TMDB fetch_movie() with test titles...")
    print("==================================================")
    
    for title in test_movies:
        print(f"\nFetching metadata for movie title: '{title}'")
        try:
            result = fetch_movie(title)
            print("Returned Dictionary:")
            print(json.dumps(result, indent=4))
        except Exception as e:
            print(f"Error testing '{title}': {e}")
            
if __name__ == "__main__":
    test_tmdb_movies()
