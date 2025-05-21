// Haalt de API-key op van het .env document
export const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Basispad voor de TMDB API data
export const BASE_URL = 'https://api.themoviedb.org/3';

// Dit wordt gebruikt voor het ophalen van de afbeeldingen van de films
export const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Dit is voor debugs, het toon de API-key in de Dev-tools console
console.log("API key:", API_KEY);

// Haalt de populaire films op, die worden weergegeven op de home/inkom pagina
export async function fetchPopularMovies() {
  try {
    // API-call voor de populaire films te ontvangen, dit is voor pagina 1 
    const response1 = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
    const data1 = await response1.json();

    // API-call voor de populaire films te ontvangen, dit is voor pagina 2, omdat ze per pagina maar 20 resultaten terugsturen  
    const response2 = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=2`);
    const data2 = await response2.json();

    // het combineren van resultaten van beide pagina’s 
    const combined = [...data1.results, ...data2.results];

    // Verwijderen van identieke films op basis van unieke ID
    const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());

    // de eerste 24 voorbeelden terugsturen, zodat exact 4 rijen worden afgebeeld
    return unique.slice( 0, 24);
  } catch (error) {
    console.error("Fout bij ophalen populaire films:", error);
    return [];
  }
}

// Haalt 24 films op per genre
export async function fetchMoviesByGenre(genreId) {
  try {
    // API-call naar films van het gekozen genre, voor de eerste pagina
    const response1 = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&page=1`);
    const data1 = await response1.json();

    // API-call naar films van het gekozen genre, voor de tweede pagina, omdat er slechts 20 per pagina worden getoond
    const response2 = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&page=2`);
    const data2 = await response2.json();

    // Combineert beide resultaten en toont 24 films
    const combined = [...data1.results, ...data2.results];
    return combined.slice(0, 24);
  } catch (error) {
    console.error("Fout bij ophalen genrefilms:", error);
    return [];
  }
}

// Haalt de regisseur en hoofdacteur op van een specifieke film
export async function fetchCredits(movieId) {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
    const data = await response.json();

    // Zoekt de regisseur uit de crew op basis van job soort
    const director = data.crew.find(person => person.job === 'Director');

    // Neemt de eerste acteur als hoofdrolspeler
    const leadActor = data.cast[0];

    // Geeft namen van acteur en regisseur terug of laat 'Onbekend' zien als er een fout is bij het ophalen van de data
    return {
      director: director ? director.name : 'Onbekend',
      actor: leadActor ? leadActor.name : 'Onbekend'
    };
  } catch (error) {
    console.error(`Fout bij ophalen credits voor film ${movieId}:`, error);
    return {
      director: 'Onbekend',
      actor: 'Onbekend'
    };
  }
}

// Dit laat het toe om te zoeken op titel
export async function searchMovies(query) {
  const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`);
  const data = await response.json();
  return data.results;
}