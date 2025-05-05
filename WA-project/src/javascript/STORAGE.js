const FAVORITES_KEY = 'favoriteMovies';

export function getFavorites() {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
}

export function saveFavorite(movie) {
    const favorites = getFavorites();
    favorites.push(movie);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function removeFavorite(movieId) {
    let favorites = getFavorites();
    favorites = favorites.filter(movie => movie.id !== movieId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(movieId) {
    const favorites = getFavorites();
    return favorites.some(movie => movie.id === movieId);
}