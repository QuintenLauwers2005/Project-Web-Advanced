import { API_KEY, BASE_URL, fetchPopularMovies, fetchMoviesByGenre, searchMovies, fetchCredits } from './API.js';
import { renderMovies } from './UI.js';
import { getFavorites } from './STORAGE.js';

const movieContainer = document.getElementById('movie-container');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-options');
const genreButtons = document.querySelectorAll('.genre-btn');
const favoritesBtn = document.getElementById('favorites-btn');
const resetBtn = document.getElementById('reset-btn');

let currentMovies = [];
let originalMovies = [];
let currentView = 'popular';

console.log('APP.js is loaded');

async function init() {
    const popular = await fetchPopularMovies();
    const enriched = await enrichMoviesWithCredits(popular);

    originalMovies = [...enriched];
    currentMovies = [...enriched];
    currentView = 'popular';

    const sortOption = sortSelect.value;
    const sorted = sortMovies(sortOption, currentMovies);
    renderMovies(sorted, movieContainer);
}

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
        alert("Voer minimaal 2 tekens in voor de zoekopdracht.");
        return;
    }
    
    let found = await searchMovies(query);
    found = await enrichMoviesWithCredits(found);
    currentMovies = found;
    currentView = 'search';

    if (!currentMovies || currentMovies.length === 0) {
        alert("Geen films gevonden met deze titel.");
        return;
    }

    renderMovies(currentMovies.slice(0, 24), movieContainer);
});

favoritesBtn.addEventListener('click', async () => {
    const favorites = getFavorites();
    const enriched = await enrichMoviesWithCredits(favorites);

    originalMovies = [...enriched];
    currentMovies = [...enriched];
    currentView = 'favorites';

    const sortOption = sortSelect.value;
    const sorted = sortMovies(sortOption, currentMovies);
    renderMovies(sorted, movieContainer);
});

async function enrichMoviesWithCredits(movies) {
    return await Promise.all(
        movies.map(async (movie) => {
            const credits = await fetchCredits(movie.id);
            return {
                ...movie,
                director_name: credits.director,
                actor_name: credits.actor
            };
        })
    );
}


genreButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const genreId = parseInt(button.dataset.id);

        let genreMovies;
        if (currentView === 'favorites' || currentView === 'search') {
            genreMovies = filterByGenre(genreId, originalMovies);
        } else {
            const fetched = await fetchMoviesByGenre(genreId);
            genreMovies = await enrichMoviesWithCredits(fetched);
        }

        if (!genreMovies || genreMovies.length === 0) {
            alert("Geen films gevonden in dit genre.");
            return;
        }

        currentMovies = genreMovies;

        const sortOption = sortSelect.value;
        const sorted = sortMovies(sortOption, currentMovies);
        renderMovies(sorted, movieContainer);
    });
});

if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
        const popular = await fetchPopularMovies();
        const enriched = await enrichMoviesWithCredits(popular);
    
        originalMovies = [...enriched];
        currentMovies = [...enriched];
        currentView = 'popular';
    
        const sortOption = sortSelect.value;
        const sorted = sortMovies(sortOption, currentMovies);
        renderMovies(sorted, movieContainer);
    });
}

function sortMovies(option, movies) {
    const sorted = [...movies];
    switch (option) {
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

sortSelect.addEventListener('change', () => {
    const option = sortSelect.value;
    const sorted = sortMovies(option, currentMovies);
    renderMovies(sorted, movieContainer);
});

function filterByGenre(genreId, sourceMovies) {
    return sourceMovies.filter(movie =>
        movie.genre_ids && movie.genre_ids.includes(genreId)
    ).slice(0, 24);
}

init();


const sentinel = document.getElementById('scroll-sentinel');
let currentPage = 3;

const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && currentView === 'popular') {
      console.log("Scroll sentinel is zichtbaar, meer films laden...");
  
      const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${currentPage}`);
      const data = await response.json();
  
      const newMovies = await enrichMoviesWithCredits(data.results);
  
      const movieIds = new Set(currentMovies.map(m => m.id));
      const uniqueNewMovies = newMovies.filter(m => !movieIds.has(m.id));
  
      currentMovies = [...currentMovies, ...uniqueNewMovies];
  
      renderMovies(uniqueNewMovies, movieContainer, true);
      currentPage++;
    }
  }, {
    rootMargin: '200px'
  });
  
  observer.observe(document.getElementById('scroll-sentinel'));
observer.observe(sentinel);
