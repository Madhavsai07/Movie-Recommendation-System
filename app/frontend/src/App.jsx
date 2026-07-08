import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import MovieDetails from "./pages/MovieDetails";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./context/ThemeContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { SearchProvider } from "./context/SearchContext";

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <SearchProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-100 antialiased font-sans selection:bg-sky-500/20 selection:text-sky-300 transition-colors duration-300">
              
              {/* Navigation Bar */}
              <Navbar />

              {/* Dynamic Route Pages */}
              <div className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/movie/:title" element={<MovieDetails />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>

              {/* Footer */}
              <Footer />

            </div>
          </Router>
        </SearchProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;
