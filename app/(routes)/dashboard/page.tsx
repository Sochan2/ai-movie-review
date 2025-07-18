"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PreferenceVisualization } from '@/components/preference-visualization';
import { StarRating } from '@/components/star-rating';
import { useUser } from '@/context/user-context';
import { createClient } from '@/utils/supabase/client';
import { MovieReview } from '@/types/movie';
import { availableStreamingServices, genreOptions } from '@/lib/mock-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getRecommendedMoviesForUser } from '@/lib/recommendations';
import { MovieCard } from '@/components/movie-card';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [reviews, setReviews] = useState<(MovieReview & { movie?: { id: string; title: string } })[]>([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [recommendedMovies, setRecommendedMovies] = useState<any[]>([]);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [genreLoading, setGenreLoading] = useState(false);
  const [genreError, setGenreError] = useState<string | null>(null);
  const [genreSuccess, setGenreSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return; // ローディング中は何もしない
    if (user === null) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    const fetchUserData = async () => {
      try {
        // Fetch user's reviews (join movies table)
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*, movie:movies(id, title)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (reviewsError) throw reviewsError;
        setReviews((reviewsData || []).map((r: any) => ({
          id: r.id,
          movieId: r.movie_id,
          userId: r.user_id,
          rating: r.rating,
          text: r.review_text,
          emotions: r.emotions,
          createdAt: r.created_at,
          tag_sentiment: r.tag_sentiment,
          movie: r.movie,
        })));
        // Fetch user's subscriptions and favorite genres from user_profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('selected_subscriptions, favorite_genres')
          .eq('user_id', user.id)
          .single();
        if (profileError) throw profileError;
        setSelectedSubscriptions(profileData?.selected_subscriptions || []);
        setFavoriteGenres(profileData?.favorite_genres || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user, isLoading, supabase]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    // おすすめ映画を取得
    const fetchRecommendations = async () => {
      const recs = await getRecommendedMoviesForUser(user.id, supabase);
      setRecommendedMovies(recs.slice(0, 5)); // 上位5件だけ表示
    };
    fetchRecommendations();
  }, [user, isLoading, supabase]);

  const handleSubscriptionChange = async (serviceId: string) => {
    if (!user) return; // Guard against null user
    const updatedSubscriptions = selectedSubscriptions.includes(serviceId)
      ? selectedSubscriptions.filter(id => id !== serviceId)
      : [...selectedSubscriptions, serviceId];

    setSelectedSubscriptions(updatedSubscriptions);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, selected_subscriptions: updatedSubscriptions, favorite_genres: favoriteGenres });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating subscriptions:', error);
    }
  };

  const handleGenreToggle = (genreId: string) => {
    setFavoriteGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((g) => g !== genreId)
        : [...prev, genreId]
    );
  };
  const handleSaveGenres = async () => {
    if (!user) return;
    setGenreLoading(true);
    setGenreError(null);
    setGenreSuccess(null);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, selected_subscriptions: selectedSubscriptions, favorite_genres: favoriteGenres });
      if (error) throw error;
      setGenreSuccess('Complete genre storing');
    } catch (e) {
      setGenreError('fail to genre storing');
    } finally {
      setGenreLoading(false);
    }
  };

  if (isLoading || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>

      {/* あなたへのおすすめセクション */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your recommendation</h2>
        {recommendedMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recommendedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground">There is no recommendation</div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Type</p>
                <p className="font-medium">
                  {user?.app_metadata?.provider || 'Email'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(user?.created_at || '').toLocaleDateString()}
                </p>
              </div>
              {/* Preferences編集UIをここに統合 */}
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-2">Streaming Services</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {availableStreamingServices.map((service) => (
                    <div key={service.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={selectedSubscriptions.includes(service.id)}
                        onCheckedChange={() => handleSubscriptionChange(service.id)}
                      />
                      <Label
                        htmlFor={`service-${service.id}`}
                        className="font-normal"
                      >
                        {service.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <h3 className="text-lg font-medium mb-2">Favorite Genres</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {genreOptions.map((genre) => (
                    <div key={genre.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`genre-${genre.id}`}
                        checked={favoriteGenres.includes(genre.id)}
                        onCheckedChange={() => handleGenreToggle(genre.id)}
                      />
                      <Label htmlFor={`genre-${genre.id}`}>{genre.name}</Label>
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-4"
                  onClick={handleSaveGenres}
                  disabled={genreLoading}
                >
                  {genreLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
                {genreError && <div className="text-red-500 text-sm mt-2">{genreError}</div>}
                {genreSuccess && <div className="text-green-600 text-sm mt-2">{genreSuccess}</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="space-y-6">
            <PreferenceVisualization reviews={reviews} />
            
            <Card>
              <CardHeader>
                <CardTitle>Your Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{review.movie?.title || review.movieId}</h3>
                        <StarRating rating={review.rating} readOnly size="sm" onChange={() => {}} />
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {review.text}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {review.emotions.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}