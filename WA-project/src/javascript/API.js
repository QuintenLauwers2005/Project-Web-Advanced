export const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

console.log("API key:", API_KEY);

export async function fetchPopularMovies() {
  try {
    const response1 = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
    const data1 = await response1.json();

    const response2 = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=2`);
    const data2 = await response2.json();

    const combined = [...data1.results, ...data2.results];
    const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());

    return unique.slice(0, 24);
  } catch (error) {
    console.error("Fout bij ophalen populaire films:", error);
    return [];
  }
}

  export async function fetchMoviesByGenre(genreId) {
    try {
      const response1 = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&page=1`);
      const data1 = await response1.json();

      const response2 = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&page=2`);
      const data2 = await response2.json();

      const combined = [...data1.results, ...data2.results];
      return combined.slice(0, 24);
  } catch (error) {
      console.error("Fout bij ophalen genrefilms:", error);
      return [];
  }
}

export async function fetchCredits(movieId) {
  try {
      const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
      const data = await response.json();

      const director = data.crew.find(person => person.job === 'Director');
      const leadActor = data.cast[0];

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


export async function searchMovies(query) {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`);
    const data = await response.json();
    return data.results;
}