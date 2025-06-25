import { Movie } from '@/types/movie';
import { supabase } from './supabase';
import { getJustWatchUrl, transformWatchProviders, JustWatchProvider } from './justwatch';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Cache for API responses (in-memory cache)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached data or fetch from API
async function fetchWithCache(url: string, cacheKey: string) {
  const cached = cache.get(cacheKey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  cache.set(cacheKey, { data, timestamp: now });
  return data;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.');
  }

  const cacheKey = `search_${query}`;
  const data = await fetchWithCache(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
    cacheKey
  );
  
  const movies = data.results.map(transformTMDbMovie);
  await syncMoviesToDatabase(movies);
  return movies;
}

export async function getPopularMovies(limit: number = 10): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.');
  }

  const cacheKey = 'popular_movies';
  const data = await fetchWithCache(
    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1&language=en-US`,
    cacheKey
  );
  
  // Limit the number of movies and only fetch basic data for list view
  const movies = data.results.slice(0, limit).map(transformTMDbMovieBasic);
  await syncMoviesToDatabase(movies);
  return movies;
}

export async function getMoviesByGenre(genreId: number, limit: number = 20): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.');
  }

  const cacheKey = `genre_${genreId}`;
  const data = await fetchWithCache(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=1&language=en-US`,
    cacheKey
  );
  
  const movies = data.results.slice(0, limit).map(transformTMDbMovieBasic);
  await syncMoviesToDatabase(movies);
  return movies;
}

export async function getTopRatedMovies(limit: number = 20): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.');
  }

  const cacheKey = 'top_rated_movies';
  const data = await fetchWithCache(
    `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=1&language=en-US`,
    cacheKey
  );
  
  const movies = data.results.slice(0, limit).map(transformTMDbMovieBasic);
  await syncMoviesToDatabase(movies);
  return movies;
}

export async function getNowPlayingMovies(limit: number = 20): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.');
  }

  const cacheKey = 'now_playing_movies';
  const data = await fetchWithCache(
    `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=1&language=en-US`,
    cacheKey
  );
  
  const movies = data.results.slice(0, limit).map(transformTMDbMovieBasic);
  await syncMoviesToDatabase(movies);
  return movies;
}

export async function getMovieDetails(id: string): Promise<Movie> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.');
  }

  const cacheKey = `movie_details_${id}`;
  const data = await fetchWithCache(
    `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,watch/providers`,
    cacheKey
  );
  
  const movie = transformTMDbMovie(data);
  await syncMoviesToDatabase([movie]);
  return movie;
}

//get the movies that are trending today
export async function getTrendingMovies(limit: number = 20, page: number = 1): Promise<Movie[]> {
  if (!TMDB_API_KEY) throw new Error('TMDB API key is not configured.');
  const cacheKey = `trending_movies_page_${page}`;
  const data = await fetchWithCache(
    `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${page}`,
    cacheKey
  );
  const movies = data.results.slice(0, limit).map(transformTMDbMovieBasic);
  await syncMoviesToDatabase(movies);
  return movies;
}

async function syncMoviesToDatabase(movies: Movie[]) {
  for (const movie of movies) {
    const { error } = await supabase
      .from('movies')
      .upsert({
        id: movie.id,
        title: movie.title,
        genres: movie.genres,
        overview: movie.overview,
        poster_url: movie.posterUrl,
        providers: movie.streamingServices,
        popularity: movie.rating,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error syncing movie to database:', error);
    }
  }
}

// Optimized transform function for list views (without heavy data)
function transformTMDbMovieBasic(tmdbMovie: any): Movie {
  return {
    id: tmdbMovie.id.toString(),
    title: tmdbMovie.title,
    year: new Date(tmdbMovie.release_date).getFullYear(),
    rating: tmdbMovie.vote_average,
    posterUrl: tmdbMovie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
      : undefined,
    overview: tmdbMovie.overview,
    genres: tmdbMovie.genre_ids ? [] : [], // We'll fetch genres separately if needed
    features: tmdbMovie.features || [],
    emotions: tmdbMovie.emotions || [],
    themes: tmdbMovie.themes || [],
    releaseDate: tmdbMovie.release_date,
    justWatchUrl: getJustWatchUrl(tmdbMovie.title, new Date(tmdbMovie.release_date).getFullYear()),
    streamingServices: [],
    watchProviders: [] // 今はロゴ等を含めずテキストのみ
  };
}

function transformTMDbMovie(tmdbMovie: any): Movie {
  const watchProviders = transformWatchProviders(tmdbMovie['watch/providers']?.results?.US);
  const streamingServices = watchProviders.map(provider => provider.name); // サービス名のみ利用
  
  return {
    id: tmdbMovie.id.toString(),
    title: tmdbMovie.title,
    year: new Date(tmdbMovie.release_date).getFullYear(),
    rating: tmdbMovie.vote_average,
    runtime: tmdbMovie.runtime,
    posterUrl: tmdbMovie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
      : undefined,
    backdropUrl: tmdbMovie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${tmdbMovie.backdrop_path}`
      : undefined,
    overview: tmdbMovie.overview,
    genres: tmdbMovie.genres?.map((g: any) => g.name) || [],
    director: tmdbMovie.credits?.crew?.find((c: any) => c.job === 'Director')?.name,
    streamingServices: streamingServices, // サービス名のみ利用
    releaseDate: tmdbMovie.release_date,
    languages: tmdbMovie.spoken_languages?.map((l: any) => l.english_name) || [],
    justWatchUrl: getJustWatchUrl(tmdbMovie.title, new Date(tmdbMovie.release_date).getFullYear()),
    cast: tmdbMovie.credits?.cast?.slice(0, 10).map((actor: any) => ({
      name: actor.name,
      character: actor.character,
      profileUrl: actor.profile_path 
        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
        : undefined
    })),
    // Add watch providers data for detailed display (今はテキストのみ)
    watchProviders: watchProviders
  };
}

// Genre mapping for better user experience
export const genreMap: { [key: string]: number } = {
  'Action': 28,
  'Adventure': 12,
  'Animation': 16,
  'Comedy': 35,
  'Crime': 80,
  'Documentary': 99,
  'Drama': 18,
  'Family': 10751,
  'Fantasy': 14,
  'History': 36,
  'Horror': 27,
  'Music': 10402,
  'Mystery': 9648,
  'Romance': 10749,
  'Science Fiction': 878,
  'TV Movie': 10770,
  'Thriller': 53,
  'War': 10752,
  'Western': 37
};