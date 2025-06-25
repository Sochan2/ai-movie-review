"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, Heart, Star, AlertTriangle, CheckCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MovieReviewForm } from '@/components/movie-review-form';
import { EmotionTagSelector } from '@/components/emotion-tag-selector';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/user-context';
import { Movie } from '@/types/movie';
import { getMovieDetails } from '@/lib/tmdb';
import { getJustWatchUrl, getProviderJustWatchUrl } from '@/lib/justwatch';

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [isMasterpiece, setIsMasterpiece] = useState(false);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasWatched, setHasWatched] = useState(false);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);
  const supabase = createClient();
  const [notification, setNotification] = useState('');
  
  useEffect(() => {
    if (isLoading) return;
    const fetchMovieData = async () => {
      try {
        // 1. Supabaseからキャッシュ取得
        const { data: cachedMovie } = await supabase
          .from('movies')
          .select('id, title, poster_url, overview, genres, features, emotions, themes, rating, streamingServices, justWatchUrl, year, director, releaseDate, runtime, watchProviders')
          .eq('id', params.id)
          .single();
        if (cachedMovie) {
          // Supabaseのカラム名とMovie型のプロパティ名を合わせる
          setMovie({
            ...cachedMovie,
            posterUrl: cachedMovie.poster_url,
          });
          setLoading(false);
          return;
        }
        // 2. なければTMDB APIから取得
        const movieData = await getMovieDetails(params.id);
        setMovie(movieData);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        
        // Check if it's a TMDB API key error
        if (error instanceof Error && error.message.includes('TMDB API key')) {
          console.error('TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.');
        }
        
        // Use fallback data on error
        const fallbackMovie: Movie = {
          id: params.id,
          title: 'Sample Movie',
          year: 2024,
          rating: 8.5,
          posterUrl: 'https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          overview: 'This is a sample movie description for testing purposes. The movie follows an exciting story with compelling characters and an engaging plot.',
          genres: ['Action', 'Adventure', 'Drama'],
          streamingServices: ['Netflix', 'Amazon Prime'],
          director: 'Sample Director',
          releaseDate: '2024-01-01',
          runtime: 120,
          justWatchUrl: 'https://www.justwatch.com',
          watchProviders: [
            { id: 8, name: 'Netflix', type: 'flatrate' },
            { id: 119, name: 'Amazon Prime', type: 'flatrate' },
            { id: 15, name: 'Hulu', type: 'flatrate' }
          ]
        };
        setMovie(fallbackMovie);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [params.id, user, supabase, isLoading]);

  // Check if this movie is already a masterpiece for the user
  useEffect(() => {
    if (!user || !params.id) return;
    const checkMasterpiece = async () => {
      const { data, error } = await supabase
        .from('masterpieces')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', params.id)
        .single();
      if (data) setIsMasterpiece(true);
      else setIsMasterpiece(false);
    };
    checkMasterpiece();
  }, [user, params.id, supabase]);

  const toggleMasterpiece = async () => {
    if (!user || !movie) return;
    setMpLoading(true);
    try {
      if (!isMasterpiece) {
        // Add to masterpieces
        const { error } = await supabase.from('masterpieces').upsert({
          user_id: user.id,
          movie_id: movie.id,
        });
        if (error) throw error;
        setIsMasterpiece(true);
      } else {
        // Remove from masterpieces
        const { error } = await supabase.from('masterpieces').delete().eq('user_id', user.id).eq('movie_id', movie.id);
        if (error) throw error;
        setIsMasterpiece(false);
      }
    } catch (err) {
      console.error('Failed to update masterpiece:', err);
      alert('Failed to update masterpiece.');
    } finally {
      setMpLoading(false);
    }
  };

  const handleWatchClick = () => {
    // Open JustWatch in new tab
    if (movie?.justWatchUrl) {
      window.open(movie.justWatchUrl, '_blank');
    }
  };

  const handleReportError = () => {
    // Open JustWatch error reporting (you can customize this URL)
    const reportUrl = `https://www.justwatch.com/contact?subject=Incorrect%20Information&movie=${encodeURIComponent(movie?.title || '')}`;
    window.open(reportUrl, '_blank');
  };

  const handleProviderClick = (providerName: string) => {
    if (movie) {
      const providerUrl = getProviderJustWatchUrl(movie.title, providerName, movie.year);
      window.open(providerUrl, '_blank');
    }
  };


  
//if user submitted the review, analyze the review with AI and save the result to the database  
const handleSubmitReview = async () => {
  if (!user || !movie) {
    console.warn('user or movie missing', { user, movie });
    return;
  }
  setIsSubmitting(true);
  try {
    console.log('レビュー送信開始');

    // 送信データをまとめて変数に
    const reviewData = {
      movie_id: movie.id,
      user_id: user.id,
      review_text: review,
      rating: rating,
      emotions: selectedEmotions,
      created_at: new Date().toISOString(),
    };
    // ここで送信データを出力
    console.log('送信データ:', reviewData);

    const { error } = await supabase.from('reviews').upsert(reviewData);
    console.log('Supabase upsert完了', error);

    console.log('AI分析開始');
    // --- ここからAPI Route経由でAI分析 ---
    const res = await fetch("/api/analyze-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewText: review,
        rating,
        emotions: selectedEmotions,
      }),
    });
    const aiResult = await res.json();
    console.log('AI分析完了', aiResult);

    // ここでプロファイルも更新
    await updateUserProfileWithAIResult(user.id, aiResult, rating, selectedEmotions);

    // スコア計算用に最新プロファイルを取得し、点数をconsole出力
    const { data: updatedProfile } = await supabase
      .from('user_profiles')
      .select('likes, dislikes')
      .eq('user_id', user.id)
      .single();
    if (updatedProfile) {
      // 映画のタグ配列（AI結果）
      const tags = [
        ...(aiResult.features || []),
        ...(aiResult.emotions || []),
        ...(aiResult.themes || [])
      ];
      // スコア計算
      const { calculateScore } = await import('@/lib/recommendations');
      const score = calculateScore(updatedProfile.likes, updatedProfile.dislikes, tags);
      console.log('この映画のあなた向けスコア:', score);
    }

    //update the movie with the ai result
    if (aiResult && movie?.id) {
      const { error: updateError } = await supabase
        .from('movies')
        .update({
          features: aiResult.features,
          emotions: aiResult.emotions,
          themes: aiResult.themes,
        })
        .eq('id', movie.id);
    
      if (updateError) {
        console.error('映画タグの保存エラー:', updateError);
      } else {
        console.log('映画タグの保存成功');
      }
    }

    // AI分析完了後、tag_sentimentを含めてレビューを再保存
    if (aiResult && aiResult.tag_sentiment) {
      const reviewUpdateData = {
        movie_id: movie.id,
        user_id: user.id,
        review_text: review,
        rating: rating,
        emotions: selectedEmotions,
        tag_sentiment: aiResult.tag_sentiment,
        created_at: reviewData.created_at,
      };
      const { error: reviewUpdateError } = await supabase.from('reviews').upsert(reviewUpdateData);
      if (reviewUpdateError) {
        console.error('tag_sentiment付きレビュー保存エラー:', reviewUpdateError);
      } else {
        console.log('tag_sentiment付きレビュー保存成功');
      }
    }
    // --- ここまで ---
    setNotification('Updated review!');
    setReview('');
    setRating(0);
    setSelectedEmotions([]);
  } catch (error) {
    console.error('Error submitting review:', error);
  } finally {
    console.log('finally reached');
    setIsSubmitting(false);
  }
};

  if (isLoading || loading || !movie) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p>Loading movie details...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-16">
      {/* Header with Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Fixed Photo and Description */}
          <div className="lg:w-1/2">
            <div className="sticky top-20">
              {/* Movie Poster */}
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-6">
                <Image
                  src={movie.posterUrl || "https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Movie Info */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span>{movie.rating}/10</span>
                    </div>
                    <span>{movie.year}</span>
                    {movie.runtime && <span>{movie.runtime} min</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres?.map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {movie.overview}
                  </p>
                </div>

                {/* Movie Details */}
                <div className="space-y-3">
                  {movie.director && (
                    <div>
                      <span className="text-sm text-muted-foreground">Director: </span>
                      <span>{movie.director}</span>
                    </div>
                  )}
                  {movie.releaseDate && (
                    <div>
                      <span className="text-sm text-muted-foreground">Release Date: </span>
                      <span>{movie.releaseDate}</span>
                    </div>
                  )}
                  {movie.languages && movie.languages.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Languages: </span>
                      <span>{movie.languages.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Streaming Services */}
                {movie.watchProviders && movie.watchProviders.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Available On</h3>
                    <div className="space-y-3">
                      {/* Subscription Services */}
                      {movie.watchProviders.filter(p => p.type === 'flatrate').length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Subscription</h4>
                          <div className="flex flex-wrap gap-2">
                            {movie.watchProviders
                              .filter(provider => provider.type === 'flatrate')
                              .map((provider) => (
                                <div
                                  key={provider.id}
                                  className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                                  onClick={() => handleProviderClick(provider.name)}
                                >
                                  {/* ロゴは商用利用の都合で今は表示しません。将来的にimgタグでロゴを追加可能 */}
                                  <span className="text-sm font-medium">{provider.name}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Free Services */}
                      {movie.watchProviders.filter(p => p.type === 'free').length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Free</h4>
                          <div className="flex flex-wrap gap-2">
                            {movie.watchProviders
                              .filter(provider => provider.type === 'free')
                              .map((provider) => (
                                <div
                                  key={provider.id}
                                  className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                                  onClick={() => handleProviderClick(provider.name)}
                                >
                                  {/* ロゴは商用利用の都合で今は表示しません。将来的にimgタグでロゴを追加可能 */}
                                  <span className="text-sm font-medium">{provider.name}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Ad-Supported Services */}
                      {movie.watchProviders.filter(p => p.type === 'ads').length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Ad-Supported</h4>
                          <div className="flex flex-wrap gap-2">
                            {movie.watchProviders
                              .filter(provider => provider.type === 'ads')
                              .map((provider) => (
                                <div
                                  key={provider.id}
                                  className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                                  onClick={() => handleProviderClick(provider.name)}
                                >
                                  {/* ロゴは商用利用の都合で今は表示しません。将来的にimgタグでロゴを追加可能 */}
                                  <span className="text-sm font-medium">{provider.name}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Rent/Buy Services */}
                      {(movie.watchProviders.filter(p => p.type === 'rent').length > 0 || 
                        movie.watchProviders.filter(p => p.type === 'buy').length > 0) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Rent or Buy</h4>
                          <div className="flex flex-wrap gap-2">
                            {movie.watchProviders
                              .filter(provider => provider.type === 'rent' || provider.type === 'buy')
                              .map((provider) => (
                                <div
                                  key={provider.id}
                                  className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                                  onClick={() => handleProviderClick(provider.name)}
                                >
                                  {/* ロゴは商用利用の都合で今は表示しません。将来的にimgタグでロゴを追加可能 */}
                                  <span className="text-sm font-medium">{provider.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {provider.type === 'rent' ? 'Rent' : 'Buy'}
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Available On</h3>
                    <div className="text-sm text-muted-foreground mb-3">
                      Check JustWatch for current streaming availability
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2">
                        <span className="text-sm font-medium">Netflix</span>
                      </div>
                      <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2">
                        <span className="text-sm font-medium">Amazon Prime</span>
                      </div>
                      <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2">
                        <span className="text-sm font-medium">Hulu</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Review Section */}
          <div className="lg:w-1/2 space-y-6">
            {notification && (
              <div className="mb-4 text-green-600 font-semibold text-center">
                {notification}
              </div>
            )}
            {/* Watch Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Watch This Movie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {movie.watchProviders && movie.watchProviders.length > 0 ? (
                  <>
                    <div className="text-sm text-muted-foreground mb-3">
                      This movie is available on {movie.watchProviders.length} streaming service{movie.watchProviders.length !== 1 ? 's' : ''}.
                    </div>
                    
                    {/* Streaming Provider Logos */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Available on:</h4>
                      <div className="flex flex-wrap gap-2">
                        {movie.watchProviders.slice(0, 6).map((provider) => (
                          <div
                            key={provider.id}
                            className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                            onClick={() => handleProviderClick(provider.name)}
                          >
                            {/* ロゴは商用利用の都合で今は表示しません。将来的にimgタグでロゴを追加可能 */}
                            <span className="text-xs font-medium">{provider.name}</span>
                          </div>
                        ))}
                        {movie.watchProviders.length > 6 && (
                          <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              +{movie.watchProviders.length - 6} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleWatchClick}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View All Options on JustWatch
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-3">
                      Check JustWatch for availability
                    </p>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleWatchClick}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Check on JustWatch
                    </Button>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleReportError}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Incorrect Information
                </Button>
              </CardContent>
            </Card>

            {/* Review Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {hasWatched ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Your Review
                    </>
                  ) : (
                    <>
                      <Star className="h-5 w-5" />
                      Write Your Review
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasWatched ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Watch the movie first, then come back to share your thoughts!
                    </p>
                    <div className="space-y-2">
                      <Button onClick={handleWatchClick} disabled={!movie.justWatchUrl}>
                        <Play className="mr-2 h-4 w-4" />
                        Watch Now
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setHasWatched(true)}
                        className="w-full"
                      >
                        I&apos;ve Already Watched This
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Rating */}
                    <div>
                      <Label htmlFor="rating">Your Rating</Label>
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-1"
                          >
                            <Star
                              className={cn(
                                "h-6 w-6",
                                star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              )}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {rating}/5
                        </span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <Label htmlFor="review">Your Review</Label>
                      <Textarea
                        id="review"
                        placeholder="Share your thoughts about this movie..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="mt-2 min-h-[120px]"
                      />
                    </div>

                    {/* Emotion Tags */}
                    <div>
                      <Label>How did this movie make you feel?</Label>
                      <EmotionTagSelector
                        emotions={[
                          { id: 'excited', label: 'Excited', color: 'red' },
                          { id: 'moved', label: 'Moved', color: 'blue' },
                          { id: 'inspired', label: 'Inspired', color: 'green' },
                          { id: 'entertained', label: 'Entertained', color: 'yellow' },
                          { id: 'thoughtful', label: 'Thoughtful', color: 'purple' },
                          { id: 'amused', label: 'Amused', color: 'pink' },
                          { id: 'sad', label: 'Sad', color: 'blue' },
                          { id: 'scared', label: 'Scared', color: 'red' },
                          { id: 'romantic', label: 'Romantic', color: 'pink' },
                          { id: 'thrilled', label: 'Thrilled', color: 'orange' }
                        ]}
                        selectedEmotions={selectedEmotions}
                        onChange={setSelectedEmotions}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={isSubmitting || rating === 0}
                      className="w-full"
                    >
                      {isSubmitting ? "Saving..." : "Save Review"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Masterpiece Collection */}
            <Card>
              <CardHeader>
                <CardTitle>Add to Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant={isMasterpiece ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    isMasterpiece && "bg-primary"
                  )}
                  onClick={toggleMasterpiece}
                  disabled={mpLoading}
                >
                  <Heart className={cn(
                    "mr-2 h-4 w-4",
                    isMasterpiece && "fill-current"
                  )} />
                  {isMasterpiece ? "Added to Masterpieces" : "Add to Masterpieces"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

//update user profile with AI result such as like and dislike
export async function updateUserProfileWithAIResult(
  userId: string,
  aiResult: { features: string[]; emotions: string[]; themes: string[]; tag_sentiment: Record<string, "positive" | "negative"> },
  rating: number,
  selectedEmotions: string[]
) {
  const supabase = createClient();
  // 1. 既存プロファイル取得
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('likes, dislikes')
    .eq('user_id', userId)
    .single();

  // 2. likes/dislikesを更新
  const tags = [...aiResult.features, ...aiResult.emotions, ...aiResult.themes];
  let likes = profile?.likes || {};
  let dislikes = profile?.dislikes || {};
  const sentiment = aiResult.tag_sentiment || {};

  if (rating >= 4) {
    for (const tag in sentiment) {
      if (sentiment[tag] === 'positive') {
        likes[tag] = (likes[tag] || 0) + 1;
      }
    }
    // 手動選択の感情タグで、tag_sentimentに含まれていないものもlikesに加算
    for (const tag of selectedEmotions) {
      if (!(tag in sentiment)) {
        likes[tag] = (likes[tag] || 0) + 1;
      }
    }
  }
  if (rating <= 3) {
    for (const tag in sentiment) {
      if (sentiment[tag] === 'negative') {
        dislikes[tag] = (dislikes[tag] || 0) + 1;
      }
    }
    // 手動選択の感情タグで、tag_sentimentに含まれていないものもdislikesに加算
    for (const tag of selectedEmotions) {
      if (!(tag in sentiment)) {
        dislikes[tag] = (dislikes[tag] || 0) + 1;
      }
    }
  }

  // 3. プロファイルをupsert
  await supabase.from('user_profiles').upsert({
    user_id: userId,
    likes,
    dislikes,
    updated_at: new Date().toISOString()
  });
}