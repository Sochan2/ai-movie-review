"use client";

import { useEffect, useState } from 'react';
import { MovieCard } from '@/components/movie-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/user-context';
import { createClient } from '@/utils/supabase/client';
import type { Movie } from '@/types/movie';
import { Search, Filter } from 'lucide-react';
import { getPopularMovies, searchMovies } from '@/lib/tmdb';

export default function MoviePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading } = useUser();
  const supabase = createClient();
  const [authChecked, setAuthChecked] = useState(false);

  // Get all unique genres and streaming services
  const allGenres = Array.from(new Set(movies.flatMap(movie => movie.genres || [])));
  const allServices = Array.from(new Set(movies.flatMap(movie => movie.streamingServices || [])));

  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!authChecked) return;
    const fetchMovies = async () => {
      try {
        setLoading(true);
        console.log('fetchMovies start', { user });
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('selected_subscriptions')
            .eq('id', user.id)
            .single();
          if (userError) {
            console.error('Error fetching user data:', userError);
            setSelectedServices([]);
          } else {
            setSelectedServices(userData?.selected_subscriptions || []);
          }
        }
        const movieData = await getPopularMovies(10, supabase);
        console.log('getPopularMovies result', movieData);
        setMovies(movieData);
        setFilteredMovies(movieData);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError('Failed to load movies: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        setLoading(false);
        console.log('fetchMovies end');
      }
    };
    fetchMovies();
  }, [user, authChecked, supabase]);

  // Filter movies based on search query, genres, and streaming services
  useEffect(() => {
    let filtered = movies;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.overview?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by genres
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(movie =>
        movie.genres?.some(genre => selectedGenres.includes(genre))
      );
    }

    // Filter by streaming services
    if (selectedServices.length > 0) {
      filtered = filtered.filter(movie =>
        movie.streamingServices?.some(service =>
          selectedServices.map(s => s.toLowerCase()).includes(service.toLowerCase())
        )
      );
    }

    setFilteredMovies(filtered);
  }, [movies, searchQuery, selectedGenres, selectedServices]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenres([]);
    setSelectedServices([]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If search is empty, fetch popular movies
      const popularMovies = await getPopularMovies(10, supabase);
      setMovies(popularMovies);
      setFilteredMovies(popularMovies);
      return;
    }

    try {
      setLoading(true);
      const searchResults = await searchMovies(searchQuery, supabase);
      setMovies(searchResults);
      setFilteredMovies(searchResults);
    } catch (error) {
      console.error('Error searching movies:', error);
      setError('Failed to search movies');
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">Loading movies...</div>
      </div>
    );
  }

  if (authChecked && !user) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
          <p className="text-muted-foreground mb-4">Sign in to see your personalized movie list.</p>
          <Button variant="default" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading movies...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Movies</h1>
          <p className="text-muted-foreground">
            Discover and explore our collection of movies
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search movies by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            {/* Genre Filters */}
            <div className="flex flex-wrap gap-2">
              {allGenres.slice(0, 8).map((genre) => (
                <Badge
                  key={genre}
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>

            {/* Streaming Service Filters */}
            <div className="flex flex-wrap gap-2">
              {allServices.slice(0, 6).map((service) => (
                <Badge
                  key={service}
                  variant={selectedServices.includes(service) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleService(service)}
                >
                  {service}
                </Badge>
              ))}
            </div>

            {(searchQuery || selectedGenres.length > 0 || selectedServices.length > 0) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredMovies.length} of {movies.length} movies
          </p>
        </div>

        {/* Movie Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              No movies found matching your criteria.
            </p>
            <Button onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 