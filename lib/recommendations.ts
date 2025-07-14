import { Movie, UserPreferences, MovieReview } from '@/types/movie';
import { getPopularMovies } from './tmdb';
import type { SupabaseClient } from '@supabase/supabase-js';

// このモジュールはサーバー/クライアント両対応。
// supabaseクライアントは必ず呼び出し元で分離して渡すこと（SSR: utils/supabase/server, CSR: utils/supabase/client）。
// 直接importせず、型引数で受け取る設計を徹底すること。

export async function getRecommendedMovies(
  preferences: UserPreferences,
  userReviews: MovieReview[],
  supabase: SupabaseClient
): Promise<Movie[]> {
  // Get popular movies as base
  const movies = await getPopularMovies(10, supabase);
  
  // Filter by user preferences
  return movies.filter(movie => {
    // Match genres
    const hasMatchingGenre = movie.genres?.some(genre => 
      preferences.genres.includes(genre.toLowerCase())
    );
    
    // Match streaming services
    const hasAvailableService = movie.streamingServices?.some(service =>
      preferences.subscriptions.includes(service.toLowerCase())
    );
    
    return hasMatchingGenre && hasAvailableService;
  });
}

export function analyzeEmotions(reviews: MovieReview[]): Record<string, number> {
  const emotionCounts: Record<string, number> = {};
  
  reviews.forEach(review => {
    review.emotions.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
  });
  
  return emotionCounts;
}

export function calculateUserPreferenceVector(reviews: MovieReview[]): number[] {
  // Simple example - in production this would use more sophisticated analysis
  const emotions = ['excited', 'happy', 'sad', 'scared', 'funny'];
  
  return emotions.map(emotion => {
    const relevantReviews = reviews.filter((r: MovieReview) => r.emotions.includes(emotion));
    const averageRating = relevantReviews.reduce((sum: number, r: MovieReview) => sum + r.rating, 0) / 
      (relevantReviews.length || 1);
    
    return averageRating;
  });

}

/**
 * ユーザーの好みプロファイルと映画のタグからスコアを算出
 * @param userLikes { [tag: string]: number }
 * @param userDislikes { [tag: string]: number }
 * @param movieTags string[]
 * @returns number
 */
export function calculateScore(
  userLikes: Record<string, number>,
  userDislikes: Record<string, number>,
  movieTags: string[]
): number {
  let score = 0;
  for (let tag of movieTags) {
    if (userLikes[tag]) score += userLikes[tag];
    if (userDislikes[tag]) score -= userDislikes[tag] * 2;
  }
  return score;
}

/**
 * ユーザーの好みプロファイル・観た映画・映画リストからおすすめ映画を返す
 * @param userId string
 * @param supabase Supabaseクライアント
 * @returns おすすめ映画リスト（スコア順）
 */
export async function getRecommendedMoviesForUser(userId: string, supabase: SupabaseClient) {
  // 1. プロファイル取得
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('likes, dislikes, favorite_genres, selected_subscriptions')
    .eq('user_id', userId)
    .single();
  if (!profile) return [];

  const selectedSubscriptions = profile.selected_subscriptions || [];
  const preferredGenres = profile.favorite_genres || [];

  // 3. 観た映画ID・レビュー取得
  const { data: reviews } = await supabase.from('reviews').select('*').eq('user_id', userId);
  const watchedIds = (reviews || []).map((r: { movie_id: string }) => r.movie_id);

  // 4. 映画リスト取得
  const { data: movies } = await supabase.from('movies').select('*');
  if (!movies) return [];
  const moviesWithPosterUrl = movies.map((m: any) => ({ ...m, posterUrl: m.poster_url }));

  // --- Stage 1: レビュー0本 ---
  if (!reviews || reviews.length === 0) {
    // ジャンル・サブスクで絞った人気映画
    let filtered = moviesWithPosterUrl;
    let filteredByGenre = filtered;
    let filteredBySub = filtered;
    if (preferredGenres.length > 0) {
      filteredByGenre = filtered.filter((movie: any) =>
        (movie.genres || []).some((g: string) => preferredGenres.includes(g))
      );
    }
    // サブスクフィルタ: ユーザーのselectedSubscriptionsをmovie.providersの値（例: "Amazon Video" など）に合わせて完全一致で比較
    filteredBySub = filtered.filter((movie: any) =>
      (movie.streamingServices || movie.providers || []).some((provider: string) => selectedSubscriptions.includes(provider))
    );
    // AND条件
    let filteredBoth = filteredByGenre;
    if (selectedSubscriptions.length > 0) {
      filteredBoth = filteredByGenre.filter((movie: any) =>
        (movie.streamingServices || movie.providers || []).some((s: string) =>
          selectedSubscriptions.some((sub: string) =>
            s.toLowerCase().includes(sub.toLowerCase()) || sub.toLowerCase().includes(s.toLowerCase())
          )
        )
      );
    }
    console.log('filteredBoth.length:', filteredBoth.length);
    // 優先順位: AND→ジャンルのみ→サブスクのみ→全件
    let result = filteredBoth;
    if (result.length === 0 && preferredGenres.length > 0) {
      result = filteredByGenre;
    }
    if (result.length === 0 && selectedSubscriptions.length > 0) {
      result = filteredBySub;
    }
    if (result.length === 0) {
      result = moviesWithPosterUrl;
    }
    result = result.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));
    return result.slice(0, 20);
  }

  // --- Stage 2: レビュー1本 ---
  if (reviews.length === 1) {
    const review = reviews[0];
    // レビューした映画のタグを集約
    const movie = moviesWithPosterUrl.find((m: any) => m.id === review.movie_id);
    let userTags = new Set<string>();
    if (movie) {
      for (const tag of [
        ...(movie.features || []),
        ...(movie.emotions || []),
        ...(movie.themes || [])
      ]) {
        userTags.add(tag);
      }
    }
    // 類似度計算
    const recommendations = (moviesWithPosterUrl as Movie[])
      .filter((movie: Movie) => !watchedIds.includes(movie.id))
      .map((movie: Movie) => {
        const tags = [
          ...(movie.features || []),
          ...(movie.emotions || []),
          ...(movie.themes || [])
        ];
        const movieTagSet = new Set(tags);
        const intersection = new Set(Array.from(userTags).filter(tag => movieTagSet.has(tag)));
        const union = new Set([...Array.from(userTags), ...Array.from(movieTagSet)]);
        const jaccard = union.size === 0 ? 0 : intersection.size / union.size;
        return { ...movie, similarity: jaccard };
      })
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, 20);
    return recommendations;
  }

  // --- Stage 3: レビュー2本以上 ---
  let recommended = (moviesWithPosterUrl as Movie[])
    .map((movie: Movie) => {
      const tags = [
        ...(movie.features || []),
        ...(movie.emotions || []),
        ...(movie.themes || [])
      ];
      // 自分がレビューした映画なら、自分のレビューのタグも加える
      let userReviewTags: string[] = [];
      const userReview = (reviews || []).find((r: any) => r.movie_id === movie.id);
      if (userReview) {
        userReviewTags = [
          ...(userReview.features || []),
          ...(userReview.emotions || []),
          ...(userReview.themes || [])
        ];
      }
      // タグのユニオン
      const allTags = Array.from(new Set([...tags, ...userReviewTags]));
      const score = calculateScore(profile.likes, profile.dislikes, allTags);
      return { ...movie, score };
    });

  // スコア>0の映画
  let scored = recommended.filter(m => m.score && m.score > 0);
  // スコア0の映画
  let zeroScored = recommended.filter(m => !m.score || m.score === 0);

  // 2. スコア0の中でpreferredGenresやselectedSubscriptionsに合致する映画を優先
  let genreOrSubMatched = zeroScored.filter(m => {
    const genreMatch = (preferredGenres.length === 0) ? false : (m.genres || []).some((g: string) => preferredGenres.includes(g));
    const subMatch = (selectedSubscriptions.length === 0)
      ? false
      : (Array.isArray(m.streamingServices)
          ? m.streamingServices.some((provider: string) => selectedSubscriptions.includes(provider))
          : false);
    return genreMatch || subMatch;
  });
  // 残りのスコア0
  let restZeroScored = zeroScored.filter(m => !genreOrSubMatched.includes(m));

  // 3. スコア0の中から高評価・人気映画を数件ピックアップ（例: 3件）
  let trending = restZeroScored
    .sort((a, b) => {
      const popA = typeof (a as any).popularity === 'number' ? (a as any).popularity : 0;
      const popB = typeof (b as any).popularity === 'number' ? (b as any).popularity : 0;
      return popB - popA;
    })
    .slice(0, 3);

  // 合体して重複を除外
  let allRecommended = [...scored, ...genreOrSubMatched, ...trending];
  const seen = new Set();
  const uniqueRecommended = allRecommended.filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  // 最大20件返す
  return uniqueRecommended.slice(0, 5);
}
