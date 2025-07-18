"use client";

import { useEffect, useState, useMemo } from 'react';
import { MovieCard } from '@/components/movie-card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/user-context';
import { createClient } from '@/utils/supabase/client';
import { getPopularMovies, getMoviesByGenre, getTopRatedMovies, getNowPlayingMovies, genreMap } from '@/lib/tmdb';
import type { Movie } from '@/types/movie';
import { useRouter } from 'next/navigation';
import { genreOptions } from '@/lib/mock-data'; // 追加

function normalizeGenre(genre: string): string {
  const found = genreOptions.find(g => g.id === genre);
  return found ? found.name : genre;
}

export default function RecommendationsPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const { user, isLoading } = useUser();
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user === null) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading) setAuthChecked(true);
  }, [isLoading]);

  useEffect(() => {
    if (!authChecked) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        let userFavoriteGenres: string[] = [];
        let userSelectedServices: string[] = [];
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('selected_subscriptions, favorite_genres')
            .eq('user_id', user.id)
            .single();
          const isRealError =
            profileError && (
              (typeof profileError === 'string' && (profileError as string).length > 0) ||
              (typeof profileError === 'object' && profileError !== null && 'message' in profileError && (profileError as any).message)
            );
          if (!isRealError) {
            userSelectedServices = profileData?.selected_subscriptions || [];
            userFavoriteGenres = profileData?.favorite_genres || [];
            setSelectedServices(userSelectedServices);
            setFavoriteGenres(userFavoriteGenres);
          } else {
            setSelectedServices([]);
            setFavoriteGenres([]);
          }
        }
        let recommendedData: Movie[] = [];
        if (userFavoriteGenres.length > 0) {
          const genreMovies = await Promise.all(
            userFavoriteGenres.slice(0, 3).map(async (genre) => {
              const genreId = genreMap[normalizeGenre(genre)];
              if (genreId) {
                try {
                  return await getMoviesByGenre(genreId, undefined, supabase);
                } catch {
                  return [];
                }
              }
              return [];
            })
          );
          const allGenreMovies = genreMovies.flat();
          const uniqueMovies = allGenreMovies.filter((movie, index, self) =>
            index === self.findIndex(m => m.id === movie.id)
          );
          recommendedData = uniqueMovies;
        } else {
          recommendedData = await getTopRatedMovies(undefined, supabase);
        }
        // 配信サービスでの絞り込みは一時的に無効化（watchProvidersが空配列のため）
        // if (selectedServices.length > 0) {
        //   recommendedData = recommendedData.filter(movie => 
        //     (movie.watchProviders ?? []).some(provider => 
        //       selectedServices.map(s => s.toLowerCase()).includes(provider.name.toLowerCase())
        //     )
        //   );
        // }
        setRecommendedMovies(recommendedData);
      } catch {
        setError('Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authChecked, user, supabase]);

  if (!authChecked) {
    return (
      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-muted rounded mx-auto"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || loading) {
    return (
      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-muted rounded mx-auto"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authChecked && !user) {
    return (
      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
            <p className="text-muted-foreground mb-4">Sign in to get personalized recommendations.</p>
            <Button variant="default" onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2">Recommended For You</h1>
            {favoriteGenres.length > 0 && (
              <p className="text-muted-foreground mb-1">
                Based on your favorite genres: {favoriteGenres.join(', ')}
              </p>
            )}
            {selectedServices.length > 0 && (
              <p className="text-muted-foreground">
                Available on {selectedServices.join(', ')}
              </p>
            )}
          </div>
          <Button 
            variant="outline" 
            className="mt-4 md:mt-0"
            onClick={() => window.location.href = '/dashboard'}
          >
            Update Preferences
          </Button>
        </div>
        {recommendedMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendedMovies.slice(0, 10).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No recommendations found. Please update your preferences in the dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}