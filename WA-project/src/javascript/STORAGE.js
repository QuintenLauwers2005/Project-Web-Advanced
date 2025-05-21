// Sleutelnaam voor het opslaan van favorieten in localStorage
const FAVORITES_KEY = 'favoriteMovies';

// Haalt de lijst van opgeslagen favoriete films op uit localStorage
export function getFavorites() {
    // Leest de waarde  vanuit de localStorage
    const favorites = localStorage.getItem(FAVORITES_KEY);
    
    // Parse json als er iets is opgeslagen, anders wordt er een lege array geretourneerd
    return favorites ? JSON.parse(favorites) : [];
}

// Opslagen van een nieuwe film als favoriet in localStorage
export function saveFavorite(movie) {
    console.log("saveFavorite aangeroepen met:", movie);

    // Haalt huidige favorieten op
    const favorites = getFavorites();

    // Controleert of genre ids ontbreken bij ophalen uit DOM
    if (!movie.genre_ids || movie.genre_ids.length === 0) {
        // Vind de bijbehorende kaart in de DOM via de data-id
        const card = document.querySelector(`.favorite-btn[data-id="${movie.id}"]`).closest('.movie-card');

        // Haal genres uit het data-attribuut van de kaart
        const genres = JSON.parse(card.getAttribute('data-genres') || '[]');

        // Voeg genre_ids toe aan de film
        movie.genre_ids = genres;
    }

    // Voeg de film toe aan de lijst
    favorites.push(movie);

    // Opnieuw opslagen van de bijgewerkte lijst in de localStorage
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

    console.log("Nieuwe favorietenlijst opgeslagen:", favorites); 
}

// Verwijdert een film op basis van ID uit de favorietenlijst
export function removeFavorite(movieId) {
    // Haalt huidige lijst op
    let favorites = getFavorites();

    // Filteren van de lijst: verwijdert de film met de opgegeven ID
    favorites = favorites.filter(movie => movie.id !== movieId);

    // Slaat de nieuwe lijst op
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// Controleert of een film al in de favorietenlijst zit
export function isFavorite(movieId) {
    const favorites = getFavorites();

    // Zoekt of er een film is met dit ID
    return favorites.some(movie => movie.id === movieId);
}