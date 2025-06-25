import { useState, useEffect, useCallback, useMemo } from 'react';
import { Movie } from '@/types/movie';

interface UseMoviesOptions {
  limit?: number;
  enabled?: boolean;
}

interface UseMoviesReturn {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// In-memory cache for movie data
const movieCache = new Map<string, { data: Movie[]; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Function to fetch movies from our API
async function fetchMoviesFromAPI(type: string, limit: number): Promise<Movie[]> {
  const response = await fetch(`/api/movies?type=${type}&limit=${limit}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.details || `Failed to fetch ${type} movies (${response.status})`);
  }
  
  return response.json();
}

export function useMovies(type: 'popular' | 'now-playing' | 'top-rated', options: UseMoviesOptions = {}): UseMoviesReturn {
  const { limit = 15, enabled = true } = options;
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `${type}_${limit}`;

  const fetchMovies = useCallback(async () => {
    if (!enabled) return;

    // Check cache first
    const cached = movieCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setMovies(cached.data);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await fetchMoviesFromAPI(type, limit);

      // Cache the result
      movieCache.set(cacheKey, { data, timestamp: now });
      setMovies(data);
    } catch (err) {
      console.error(`Error fetching ${type} movies:`, err);
      setError(`Failed to load ${type} movies. Please try again later.`);
    } finally {
      setLoading(false);
    }
  }, [type, limit, enabled, cacheKey]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const refetch = useCallback(async () => {
    // Clear cache for this type
    movieCache.delete(cacheKey);
    await fetchMovies();
  }, [fetchMovies, cacheKey]);

  return {
    movies,
    loading,
    error,
    refetch,
  };
}

// Hook for filtered movies based on streaming services
export function useFilteredMovies(
  movies: Movie[],
  streamingServices: string[]
) {
  return useMemo(() => {
    if (streamingServices.length === 0) {
      return movies;
    }
    return movies.filter(movie => {
      // streamingServices配列の一致
      const hasService = movie.streamingServices?.some(service =>
        streamingServices.map(s => s.toLowerCase()).includes(service.toLowerCase())
      );
      // watchProvidersのnameの一致
      const hasProvider = movie.watchProviders?.some(provider =>
        streamingServices.map(s => s.toLowerCase()).includes(provider.name.toLowerCase())
      );
      return hasService || hasProvider;
    });
  }, [movies, streamingServices]);
} 