// Importeert functies voor opslagbeheer van favorieten
import { saveFavorite, removeFavorite, isFavorite } from './STORAGE.js';

// Importeert de link naar filmafbeeldingen van de API
import { IMG_BASE_URL } from './API.js';

//Functie om een lijst van films weer te geven in een container
export function renderMovies(movies, container, append = false) {
    // Als het niet toegevoegd moet worden, eerst de container leegmaken
    if (!append) {
        container.innerHTML = '';
    }

    console.log("Renderen van films:", movies.length, "films. Append?", append);

    // Voor elke film in de lijst
    movies.forEach(movie => {
        // Dit maakt een nieuw div element aan voor de filmkaart
        const card = document.createElement('div');
        card.className = 'movie-card';

        // Voegt genre informatie toe als data attribuut voor filtering
        card.setAttribute('data-genres', JSON.stringify(movie.genre_ids || []));

        // Stelt de HTML in voor de kaart met info en favorietknop
        card.innerHTML = `
            <img src="${IMG_BASE_URL}${movie.poster_path}" alt="${movie.title}">
            <div>
            <h3>${movie.title}</h3>
            <p><strong>Release:</strong><br>${movie.release_date}</p>
            <p><strong>Score:</strong><br>${movie.vote_average}</p>
            <p><strong>Director:</Strong><br>${movie.director_name}</p>
            <p><strong>Actor:</Strong><br>${movie.actor_name}</p>
            <button class="favorite-btn" data-id="${movie.id}">
            ${isFavorite(movie.id) ? '❤️ Verwijderen' : '🤍 Favoriet'}
            </button>
            </div>`;
            
        // Voegt de film kaart toe aan de container
        container.appendChild(card);
    });

    // Koppelt klik-events aan alle favorietknoppen
    attachFavoriteButtons();
}

// Voegt eventlisteners toe aan alle favorietknoppen
function attachFavoriteButtons() {
    const buttons = document.querySelectorAll('.favorite-btn');

    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const movieId = parseInt(e.target.getAttribute('data-id'));

            // Als het al een favoriet is, wordt het verwijderen uit opslag
            if (isFavorite(movieId)) {
                removeFavorite(movieId);
            } else {
                // Anders haalt het de info van de film op en sla op als favoriet
                const movie = getMovieFromDOM(button);
                saveFavorite(movie);
            }

            // Past de tekst en de kleur van het icoon aan na klikken
            button.textContent = isFavorite(movieId) ? '❤️ Verwijderen' : '🤍 Favoriet';
        });
    });
}

// Haalt filmgegevens op uit DOM, voor opslag in localStorage
function getMovieFromDOM(button) {
    const card = button.closest('.movie-card');

    // Haalt data op uit DOM elementen
    const title = card.querySelector('h3').innerText;
    const releaseText = card.querySelector('p:nth-of-type(1)').innerText.replace('Release:', '').trim();
    const scoreText = card.querySelector('p:nth-of-type(2)').innerText.replace('Score:', '').trim();
    const img = card.querySelector('img').getAttribute('src');

    // Parse genre-IDs uit data attribuut halen
    const genreIds = JSON.parse(card.getAttribute('data-genres') || '[]');

    // Bouwt een object dat geschikt is voor opslag in favorieten
    const movieObj = {
        id: parseInt(button.getAttribute('data-id')),
        title,
        release_date: releaseText,
        vote_average: parseFloat(scoreText),
        poster_path: img.replace(IMG_BASE_URL, ''), // Maakt een relatief pad aan
        genre_ids: genreIds
    };

    console.log("getMovieFromDOM geeft terug:", movieObj);
    return movieObj;
}
