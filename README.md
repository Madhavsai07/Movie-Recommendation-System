# CineMatch: Enterprise Movie Recommendation Platform

CineMatch is a portfolio-grade Movie Recommendation Platform featuring a machine learning similarity engine, a high-performance FastAPI backend, and a modern, responsive React web application.

---

## 📂 Project Architecture

```text
Movie Recommendation System/
├── app/
│   ├── backend/               # FastAPI Server Application
│   │   ├── models/            # Pickle similarity matrices (Git LFS tracked)
│   │   │   ├── movies.pkl
│   │   │   └── similarity.pkl
│   │   ├── main.py            # Entrypoint routing
│   │   ├── recommendation.py  # Cosine matching algorithm
│   │   ├── tmdb.py            # TMDB metadata client & LRU Cache
│   │   ├── config.py          # Environment validators
│   │   ├── requirements.txt   # Python packages list
│   │   └── .env               # Private API keys
│   │
│   └── frontend/              # Vite + React Client Application
│       ├── src/
│       │   ├── context/       # Global contexts (Theme, Favorites, Search)
│       │   ├── pages/         # Page components (Home, Favorites, MovieDetails)
│       │   ├── components/    # Reusable widgets (Navbar, SearchBar, MovieCard)
│       │   ├── services/      # Axios API declarations
│       │   ├── utils/         # JSON/CSV Downloader utilities
│       │   ├── styles/        # CSS variables & animations
│       │   ├── App.jsx        # Routing hooks
│       │   └── main.jsx       # Mount entrypoint
│       ├── vite.config.js
│       └── package.json
│
├── notebooks/                 # Jupyter datasets & cleaning notebooks
├── data/                      # Raw datasets
├── .gitattributes             # Git LFS definitions
├── .gitignore                 # Track excludes
└── README.md                  # Project documentation
```

---

## ⚡ Key Features

### 🧠 Recommendation Engine
* **Content-Based Filtering**: Matches director, cast, genres, keywords, and description tags using vector similarities.
* **Vector Vector Space**: Pre-computed Cosine similarity angles mapping 4,541 database films.
* **Robust Fuzzy Matching**: Ignores casing, whitespace, and year endings (e.g. queries like `toy stor` automatically matches `Toy Story (1995)`).

### 🚀 Enterprise FastAPI Backend
* **Swagger Documentation Autogeneration**: View fully formatted routes, input schemas, and payload examples out-of-the-box.
* **Autocomplete suggestions endpoint**: Query matches on keystrokes (`GET /search`).
* **Detailed movie metadata**: Fetches posters, vote counts, ratings, overview plots, runtime, and language from the TMDB API.
* **Connection Pooling & Cache**: Implements `requests.Session()` pooling and `@lru_cache` to speed up remote metadata retrievals.

### 🎨 Premium React Frontend
* **Vite + TailwindCSS v4**: Compiles CSS-first animations, transition layers, and layouts.
* **Debounced Autocomplete Suggestions**: Shows matching movie titles dynamically as the user types (supports keyboard arrow navigation, ESC to close, and Enter to search).
* **Multi-column Sorting**: Sort recommendations instantly by Highest Rating, Lowest Rating, Most Popular, Newest Release, Oldest Release, Alphabetical (A-Z), and Runtime.
* **Global Context State Management**: Theme variables, Favorites syncing, and Search results are handled cleanly across routes using React Context.
* **Theme Switching**: Toggle between dark and light mode screens seamlessly (persisted in `localStorage`).
* **Saved Favorites Directory (`/favorites`)**: Independent search, sort, and paginated lists (20 cards per page) for saved movies.
* **Interactive Movie Details Page (`/movie/:title`)**: High-fidelity overlays containing full metadata cards, copy-to-clipboard sharing options, "Recently Viewed" history tracking, and a related movie recommendations row.
* **Recently Viewed List**: Local storage cache tracking the last 10 visited movie details pages.
* **Search History Tracking**: Tracks and displays recently searched queries with quick deletion options.
* **Download recommendations**: Exports lists directly as `CSV` or `JSON` formats.
* **Skeleton Placeholders**: Renders pulse skeleton cards for smooth visual transitions during API fetches.





