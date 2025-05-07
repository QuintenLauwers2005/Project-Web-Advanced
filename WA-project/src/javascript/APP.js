import { fetchPopularMovies, searchMovies, fetchMoviesByGenre } from './API.js';
import { renderMovies } from './UI.js';
import { getFavorites } from './STORAGE.js';

const movieContainer = document.getElementById('movie-container');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-options');
const genreButtons = document.querySelectorAll('.genre-btn');
let currentMovies = [];

console.log('APP.js is loaded');

async function init() {
    currentMovies = await fetchPopularMovies();
    console.log("Fetched movies:", currentMovies);
    renderMovies(currentMovies, movieContainer);
}

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    currentMovies = await searchMovies(query);

    if (!currentMovies || currentMovies.length === 0) {
        alert("Geen films gevonden met deze titel.");
        return;
    }
    renderMovies(currentMovies, movieContainer);
});

init();

genreButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const genreId = button.dataset.id;
        const movies = await fetchMoviesByGenre(genreId);
        renderMovies(movies, movieContainer);
    });
});

function sortMovies(option, movies) {
    const sorted = [...movies];
    switch(option) {
        case 'az':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'za':
            sorted.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'recent':
            sorted.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
            break;
        case 'rating':
            sorted.sort((a, b) => b.vote_average - a.vote_average);
            break;
    }
    return sorted;
}

sortSelect.addEventListener('change', async () => {
    const option = sortSelect.value;

    if (option === 'favorites') {
        const favoriteMovies = getFavorites();
        renderMovies(favoriteMovies, movieContainer);
    } else {
        const sorted = sortMovies(option, currentMovies);
        renderMovies(sorted, movieContainer);
    }
});