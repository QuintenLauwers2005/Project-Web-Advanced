// Importeert de API-methodes en constanten uit API.js
import { API_KEY, BASE_URL, fetchPopularMovies, fetchMoviesByGenre, searchMovies, fetchCredits } from './API.js';

// Importeert renderingfunctie uit UI.js, die ervoor zorgen hoe de filmen worden weergegeven
import { renderMovies } from './UI.js';

// Importeert lokale opgeslagen favorieten uit STORAGE.js
import { getFavorites } from './STORAGE.js';

// Selecteren van DOM-elementen die gebruikt gaan worden
const movieContainer = document.getElementById('movie-container');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-options');
const genreButtons = document.querySelectorAll('.genre-btn');
const favoritesBtn = document.getElementById('favorites-btn');
const resetBtn = document.getElementById('reset-btn');

// Bijhouden interne status films
let currentMovies = [];//verandert bij elke zoekopdracht sorteer-actie of genre filter
let originalMovies = [];//lijst van de oorsprokelijke weergegeven films
let currentView = 'popular'; //om te beginnen krijg je de populaire films te zien

// een debug om te bevestig dat het script geladen is
console.log('APP.js is loaded');

// Initialiseren app met de weergave van populaire films
async function init() {
    // Ophalen van populaire films op via API
    const popular = await fetchPopularMovies();

    // Ophalen van regisseur en hoofdacteur van de film
    const enriched = await enrichMoviesWithCredits(popular);

    // Bewaart gekregen lijsten als originele en huidige view
    originalMovies = [...enriched];
    currentMovies = [...enriched];
    currentView = 'popular';

    // Sorteren van films op de geselecteerde optie en de voorbeelden hiervan weergeven
    const sortOption = sortSelect.value;
    const sorted = sortMovies(sortOption, currentMovies);
    renderMovies(sorted, movieContainer);
}

// Zoekformulier, met voorwaardezn dat de ingegeven tekst langer moet zijn dan 2 tekens
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const query = searchInput.value.trim();

    if (query.length < 2) {
        alert("Voer minimaal 2 tekens in voor de zoekopdracht.");
        return;
    }

    // Zoeken van films op basis van titel
    let found = await searchMovies(query);

    // Toevoegen van regisseur en hoofdrol aan zoekresultaten
    found = await enrichMoviesWithCredits(found);
    currentMovies = found;
    currentView = 'search';

    //weergeven van foutmelding bij onbestaande titel
    if (!currentMovies || currentMovies.length === 0) {
        alert("Geen films gevonden met deze titel.");
        return;
    }

    //  Maximaal 24 resultaten tonen
    renderMovies(currentMovies.slice(0, 24), movieContainer);
});

// Klikken op de 'Favorieten' knop toont alle bewaarde favorieten
favoritesBtn.addEventListener('click', async () => {
    const favorites = getFavorites();

    // Voeg credits acteur en regisseur toe aan de favorieten
    const enriched = await enrichMoviesWithCredits(favorites);

    originalMovies = [...enriched];
    currentMovies = [...enriched];
    currentView = 'favorites';

    // Sorteer opties voor de favorieten
    const sortOption = sortSelect.value;
    const sorted = sortMovies(sortOption, currentMovies);
    renderMovies(sorted, movieContainer);
});

// Ophalen van een lijst films met regisseur en hoofdrolspeler vanuit de API
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

// Klikken op een genreknop filtert en haalt films op binnen dat genre
genreButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const genreId = parseInt(button.dataset.id);

        let genreMovies;

        if (currentView === 'favorites' || currentView === 'search') {
            // Filter huidige View lokaal als we niet in de hoofdpagina/home zitten
            genreMovies = filterByGenre(genreId, originalMovies);
        } else {
            // Haalt films van dit genre via de API op
            const fetched = await fetchMoviesByGenre(genreId);
            genreMovies = await enrichMoviesWithCredits(fetched);
        }

        // Foutmelding als er bij bijvoorbeeld favorieten geen films van een bepaald genre inzitten
        if (!genreMovies || genreMovies.length === 0) {
            alert("Geen films gevonden in dit genre.");
            return;
        }
        // Aanpassen van de currentview naar de weergegeven films van dat genre
        currentMovies = genreMovies;
        // Zodat er binnen dat genre ook gesorteerd kan worden
        const sortOption = sortSelect.value;
        const sorted = sortMovies(sortOption, currentMovies);
        renderMovies(sorted, movieContainer);
    });
});

// Resetknop, om naar de homepagina te gaan, roept de populaire films terug op.
if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
        // Ophalen van de films en hun info
        const popular = await fetchPopularMovies();
        const enriched = await enrichMoviesWithCredits(popular);

        // Aanpassen van de currentview
        originalMovies = [...enriched];
        currentMovies = [...enriched];
        currentView = 'popular';

        // Sorteermogelijkheden
        const sortOption = sortSelect.value;
        const sorted = sortMovies(sortOption, currentMovies);
        renderMovies(sorted, movieContainer);
    });
}

// Hier worden de sorteermogelijkheden aangemaakt, met opties: van A-Z, Z-A, meest recent, oudste en beoordeling
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

// Wijzigt sorteervolgorde op dropdown-selectie
sortSelect.addEventListener('change', () => {
    const option = sortSelect.value;
    const sorted = sortMovies(option, currentMovies);
    renderMovies(sorted, movieContainer);
});

// Filtert een lijst films op basis van genre-ID
function filterByGenre(genreId, sourceMovies) {
    return sourceMovies.filter(movie =>
        movie.genre_ids && movie.genre_ids.includes(genreId)
    ).slice(0, 24); // Toont slechts 24 resultaten
}

// Start de applicatie bij het laden
init();


// Scroll observer voor het continu inladen van populaire films
const sentinel = document.getElementById('scroll-sentinel');
let currentPage = 3;

// Observer die detecteert wanneer je bijna onderaan scrolt
const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && currentView === 'popular') {
        console.log("Scroll sentinel is zichtbaar, meer films laden...");

        try {
            // Haalt extra pagina's populaire films op
            const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${currentPage}`);
            const data = await response.json();

            // ophalen nieuwe voorbeelden
            const newMovies = await enrichMoviesWithCredits(data.results);

            // Verwijder duplicaten
            const movieIds = new Set(currentMovies.map(m => m.id));
            const uniqueNewMovies = newMovies.filter(m => !movieIds.has(m.id));

            // toevoegen van nieuwe films aan de huidige lijst
            currentMovies = [...currentMovies, ...uniqueNewMovies];

            // Render de nieuw geladen films
            renderMovies(uniqueNewMovies, movieContainer, true);
            currentPage++;
        } catch (error) {
            console.error("Fout bij lazy loading:", error.message);
        }
    }
}, {
    rootMargin: '200px' // Laadt 200px voor het einde al nieuwe voorbeelden
});

// Start observer
observer.observe(sentinel);
