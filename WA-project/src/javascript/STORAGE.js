const FAVORITES_KEY = 'favoriteMovies';

export function getFavorites() {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
}

export function saveFavorite(movie) {
    console.log("saveFavorite aangeroepen met:", movie);
    const favorites = getFavorites();

    if (!movie.genre_ids || movie.genre_ids.length === 0) {
        const card = document.querySelector(`.favorite-btn[data-id="${movie.id}"]`).closest('.movie-card');
        const genres = JSON.parse(card.getAttribute('data-genres') || '[]');
        movie.genre_ids = genres;
    }

    favorites.push(movie);
    localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
    console.log("Nieuwe favorietenlijst opgeslagen:", favorites); 
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