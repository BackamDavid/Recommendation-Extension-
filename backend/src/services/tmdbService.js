const axios = require('axios');

// Base TMDB config
const TMDB_API_KEY = 'b2d628638eabca815ebaf12fde556b51';
const BASE_URL = 'https://api.themoviedb.org/3';

// -----------------------------
// Discover movies by genre(s)
// -----------------------------
async function discoverMoviesByGenre(genreIds = [], providerId = null, region = 'US', sortBy = 'popularity.desc') {
    try {
        const params = {
            api_key: TMDB_API_KEY,
            with_genres: genreIds.join(','),
            region,
            sort_by: sortBy
        };

        if (providerId) {
            params.with_watch_providers = providerId;
            params.watch_region = region;
        }

        const response = await axios.get(`${BASE_URL}/discover/movie`, { params });
        return response.data.results || [];
    } catch (err) {
        console.error('❌ discoverMoviesByGenre error:', err.message);
        return [];
    }
}

// -----------------------------
// Get popular movies (fallback)
// -----------------------------
async function getPopularMovies(region = 'US') {
    try {
        const params = {
            api_key: TMDB_API_KEY,
            sort_by: 'popularity.desc',
            region
        };
        const response = await axios.get(`${BASE_URL}/movie/popular`, { params });
        return response.data.results || [];
    } catch (err) {
        console.error('❌ getPopularMovies error:', err.message);
        return [];
    }
}

// ✅ Export functions
module.exports = {
    discoverMoviesByGenre,
    getPopularMovies
};
