"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MovieCard } from '@/components/movie-card';
import { useUser } from '@/context/user-context';
import { createClient } from '@/utils/supabase/client';
import { getRecommendedMoviesForUser } from '@/lib/recommendations';
import type { Movie } from '@/types/movie';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Movie型を拡張してscoreやsimilarityを許容
interface MovieWithScoreOrSimilarity extends Movie {
  score?: number;
  similarity?: number;
}

export function RecommendationSection() {
  const [activeTab, setActiveTab] = useState('trending');
  const { user, isLoading } = useUser();
  const supabase = createClient();
  const [authChecked, setAuthChecked] = useState(false);

  // For You (AI)
  const [recommendedMovies, setRecommendedMovies] = useState<MovieWithScoreOrSimilarity[]>([]);
  const [forYouLoading, setForYouLoading] = useState(true);
  const [forYouError, setForYouError] = useState<string | null>(null);

  // Trending/New
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [newMovies, setNewMovies] = useState<Movie[]>([]);
  const [newLoading, setNewLoading] = useState(true);
  const [newError, setNewError] = useState<string | null>(null);

  // User preferences
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [preferredGenres, setPreferredGenres] = useState<string[]>([]);

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  // 初期レンダリング時にuser, isLoadingの状態を出力
  useEffect(() => {
    console.log('RecommendationSection mount:', { user, isLoading });
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  useEffect(() => {
    console.log('RecommendationSection user:', user, 'isLoading:', isLoading);
  }, [user, isLoading]);

  // Fetch user preferences (subscriptions, genres)
  const fetchUserPreferences = useCallback(async () => {
    console.log('fetchUserPreferences user:', user);
    if (!user) return;
    try {
      // サブスクとジャンルはuser_profilesテーブルから取得
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('selected_subscriptions, favorite_genres')
        .eq('user_id', user.id)
        .single();
      console.log('fetchUserPreferences profileData:', profileData, 'profileError:', profileError);
      if (profileError) {
        console.error('fetchUserPreferences profileError:', profileError);
        setSelectedServices([]);
        setPreferredGenres([]);
        return;
      }
      if (!profileData) {
        console.warn('fetchUserPreferences: profileData is null or undefined');
        setSelectedServices([]);
        setPreferredGenres([]);
        return;
      }
      setSelectedServices(
        Array.isArray(profileData.selected_subscriptions)
          ? profileData.selected_subscriptions
          : []
      );
      if (profileData && Array.isArray(profileData.favorite_genres)) {
        setPreferredGenres(profileData.favorite_genres);
      } else {
        setPreferredGenres([]);
      }
    } catch (error) {
      console.error('fetchUserPreferences error:', error);
      setSelectedServices([]);
      setPreferredGenres([]);
    }
  }, [user, supabase]);

  // Fetch Trending movies (public fallback for not logged in)
  const fetchTrendingMovies = useCallback(async () => {
    setTrendingLoading(true);
    setTrendingError(null);
    try {
      // Always use public fallback: fetch trending movies without filters
      const res = await supabase.from('movies')
        .select('id, title, poster_url, genres, providers, popularity')
        .order('popularity', { ascending: false })
        .limit(10);
      const data = res.data, error = res.error;
      if (error) throw error;
      setTrendingMovies((data || []).map((m: any) => ({ ...m, posterUrl: m.poster_url })));
    } catch (e: any) {
      console.error('fetchTrendingMovies error:', e, e.message, e.code);
      setTrendingError(e.message || 'Failed to load trending movies.');
    } finally {
      setTrendingLoading(false);
    }
  }, [supabase]);

  // Fetch New movies (public fallback for not logged in)
  const fetchNewMovies = useCallback(async () => {
    setNewLoading(true);
    setNewError(null);
    try {
      // Always use public fallback: fetch new movies by created_at
      const res = await supabase.from('movies')
      .select('id, title, poster_url, genres, providers, popularity, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      const data = res.data, error = res.error;
      if (error) throw error;
      setNewMovies((data || []).map((m: any) => ({ ...m, posterUrl: m.poster_url })));
    } catch (e: any) {
      console.error('fetchNewMovies error:', e, e.message, e.code);
      setNewError(e.message || 'Failed to load new movies.');
    } finally {
      setNewLoading(false);
    }
  }, [supabase]);

  // Fetch user preferences first, then fetch movies
  useEffect(() => {
    if (!isLoading && user) {
      fetchUserPreferences();
    }
  }, [user, isLoading, fetchUserPreferences]);

  // Ensure selectedServices/preferredGenres are always set from userData/profileData
  useEffect(() => {
    if (!isLoading && user) {
      supabase
        .from('user_profiles')
        .select('selected_subscriptions, favorite_genres')
        .eq('user_id', user.id)
        .single()
        .then(({ data: profileData }) => {
          setSelectedServices(
            profileData && Array.isArray(profileData.selected_subscriptions)
              ? profileData.selected_subscriptions
              : []
          );
          if (profileData && Array.isArray(profileData.favorite_genres)) {
            setPreferredGenres(profileData.favorite_genres);
          } else {
            setPreferredGenres([]);
          }
        });
    }
  }, [user, isLoading, supabase]);

  useEffect(() => {
    if (isLoading) return;
    if (typeof user === 'undefined') return;
    fetchTrendingMovies();
    fetchNewMovies();
  }, [user, isLoading, fetchTrendingMovies, fetchNewMovies]);

  // For You (AI) fetch
  useEffect(() => {
    if (isLoading) return;
    if (typeof user === 'undefined') return;
    if (!user) return;
    const fetchRecommendations = async () => {
      setForYouLoading(true);
      setForYouError(null);
      try {
        // デバッグ用ログ
        console.log('user.id:', user.id);
        console.log('selectedServices:', selectedServices);
        console.log('preferredGenres:', preferredGenres);
        let movies = await getRecommendedMoviesForUser(user.id, supabase);
        // Fallback: if no recommendations, show trending movies
        if (!movies || movies.length === 0) {
          const trending = await supabase.from('movies')
            .select('id, title, poster_url, genres, providers, popularity')
            .order('popularity', { ascending: false })
            .limit(5);
          movies = (trending.data || []).map((m: any) => ({ ...m, posterUrl: m.poster_url }));
        }
        setRecommendedMovies((movies || []).slice(0, 5));
      } catch (e) {
        console.error('fetchRecommendations error:', e);
        setForYouError('Failed to load recommendations.');
      } finally {
        setForYouLoading(false);
      }
    };
    fetchRecommendations();
  }, [user, isLoading, supabase, selectedServices, preferredGenres]);

  useEffect(() => {
    console.log('selectedServices:', selectedServices);
  }, [selectedServices]);

  useEffect(() => {
    console.log('recommendedMovies:', recommendedMovies);
  }, [recommendedMovies]);

  // isLoading中はローディングUIのみ表示
  if (isLoading) {
    return (
      <section className="py-24 bg-background">
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
      </section>
    );
  }

  if (authChecked && !user) {
    // 未ログインUI
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
            <p className="text-muted-foreground mb-4">Sign in to get personalized recommendations.</p>
            <Button variant="default" onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (trendingError || newError || forYouError) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              {trendingError || newError || forYouError}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Recommendations</h2>
            {selectedServices.length > 0 && user && (
              <p className="text-muted-foreground">
                Movies available on {selectedServices.join(', ')}
              </p>
            )}
          </div>
          <Button 
            variant="outline" 
            className="mt-4 md:mt-0"
            onClick={() => user ? window.location.href = '/dashboard' : setLoginDialogOpen(true)}
          >
            Update Preferences
          </Button>
        </div>
        <Tabs defaultValue="trending" onValueChange={(val) => {
          if (val === 'for-you' && !user) {
            setLoginDialogOpen(true);
            return;
          }
          setActiveTab(val);
        }} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="for-you">For You</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
          </TabsList>

          {/* Trending Tab */}
          <TabsContent value="trending" className="w-full">
            {isLoading || trendingLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : trendingError ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{trendingError}</p>
                <Button onClick={fetchTrendingMovies} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {trendingMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} onRequireLogin={() => setLoginDialogOpen(true)} requireLogin={!user} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* For You Tab (AI) */}
          <TabsContent value="for-you" className="w-full">
            {!user ? (
              <div className="text-center py-12">
                <p className="text-lg mb-4">If you log-in you can find recommendation </p>
                <Button onClick={() => setLoginDialogOpen(true)} variant="default">
                  Login and see AI Recommendation
                </Button>
              </div>
            ) : forYouLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : forYouError ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{forYouError}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {recommendedMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} score={movie.score} onRequireLogin={() => setLoginDialogOpen(true)} requireLogin={!user} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* New Tab */}
          <TabsContent value="new" className="w-full">
            {newLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : newError ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{newError}</p>
                <Button onClick={fetchNewMovies} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {newMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} onRequireLogin={() => setLoginDialogOpen(true)} requireLogin={!user} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Need Login</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center">
              <p className="mb-4">Login to activate this function</p>
              <Button onClick={() => window.location.href = '/login'} variant="default" className="w-full">Go to Login page</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}