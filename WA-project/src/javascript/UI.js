import { saveFavorite, removeFavorite, isFavorite } from './STORAGE.js';
import { IMG_BASE_URL } from './API.js';

export function renderMovies(movies, container) {
    container.innerHTML = '';
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.setAttribute('data-genres', JSON.stringify(movie.genre_ids || []));
        card.innerHTML = `
            <img src="${IMG_BASE_URL}${movie.poster_path}" alt="${movie.title}">
            <div>
            <h3>${movie.title}</h3>
            <p><strong>Release:</strong><br>${movie.release_date}</p>
            <p><strong>Score:</strong><br>${movie.vote_average}</p>
            <button class="favorite-btn" data-id="${movie.id}">
            ${isFavorite(movie.id) ? '❤️ Verwijderen' : '🤍 Favoriet'}
            </button>
            </div>`;
            
        container.appendChild(card);
    });

    attachFavoriteButtons();
}

function attachFavoriteButtons() {
    const buttons = document.querySelectorAll('.favorite-btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const movieId = parseInt(e.target.getAttribute('data-id'));
            if (isFavorite(movieId)) {
                removeFavorite(movieId);
            } else {
                const movie = getMovieFromDOM(button);
                saveFavorite(movie);
            }
            
            button.textContent = isFavorite(movieId) ? '❤️ Verwijderen' : '🤍 Favoriet';
        });
    });
}

function getMovieFromDOM(button) {
    const card = button.closest('.movie-card');
    const title = card.querySelector('h3').innerText;
    const releaseText = card.querySelector('p:nth-of-type(1)').innerText.replace('Release:', '').trim();
    const scoreText = card.querySelector('p:nth-of-type(2)').innerText.replace('Score:', '').trim();
    const img = card.querySelector('img').getAttribute('src');
    const genreIds = JSON.parse(card.getAttribute('data-genres') || '[]');

    const movieObj = {
        id: parseInt(button.getAttribute('data-id')),
        title,
        release_date: releaseText,
        vote_average: parseFloat(scoreText),
        poster_path: img.replace(IMG_BASE_URL, ''),
        genre_ids: genreIds
    };

    console.log("getMovieFromDOM geeft terug:", movieObj);
    return movieObj;
}