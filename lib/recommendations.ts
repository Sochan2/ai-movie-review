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
  const { data: profile } = await supabase.from('user_profiles').select('likes, dislikes').eq('user_id', userId).single();
  if (!profile) return [];

  // 2. 観た映画ID・レビュー取得
  const { data: reviews } = await supabase.from('reviews').select('*').eq('user_id', userId);
  const watchedIds = (reviews || []).map((r: { movie_id: string }) => r.movie_id);

  // 3. 映画リスト取得（features, emotions, themesがmoviesテーブルにある前提）
  const { data: movies } = await supabase.from('movies').select('*');
  if (!movies) return [];

  const moviesWithPosterUrl = movies.map((m: any) => ({
    ...m,
    posterUrl: m.poster_url,
  }));
  

  /**
   * 👇 コールドスタート対策：
   * ユーザーのレビューが1本以下の場合は、
   * 高評価（rating >= 4）をつけた映画のタグ（features, emotions, themes）と
   * Jaccard類似度が高い映画をおすすめとして返す。
   * 類似度 = 共通タグ数 / (ユーザー映画タグ数 + 候補映画タグ数 - 共通タグ数)
   */
  if ((reviews || []).length <= 1) {
    // 高評価レビューを抽出
    const highRated = (reviews || []).filter((r: { rating: number }) => r.rating >= 4);
    if (highRated.length === 0) {
      // 高評価レビューがなければ人気映画を返す
      return moviesWithPosterUrl.slice(0, 20);
    }
    // 高評価映画のタグを集約
    let userTags = new Set<string>();
    for (const r of highRated) {
      const movie = moviesWithPosterUrl.find((m: any) => m.id === r.movie_id);
      if (movie) {
        for (const tag of [
          ...(movie.features || []),
          ...(movie.emotions || []),
          ...(movie.themes || [])
        ]) {
          userTags.add(tag);
        }
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
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20); // 上位20件
    return recommendations;
  }

  // 4. スコア計算＆観た映画除外（通常ロジック）
  const recommended = (moviesWithPosterUrl as Movie[])
    .filter((movie: Movie) => !watchedIds.includes(movie.id))
    .map((movie: Movie) => {
      // 映画のタグ配列を用意（features, emotions, themesを合算）
      const tags = [
        ...(movie.features || []),
        ...(movie.emotions || []),
        ...(movie.themes || [])
      ];
      const score = calculateScore(profile.likes, profile.dislikes, tags);
      return { ...movie, score };
    })
    .sort((a: Movie & { score: number }, b: Movie & { score: number }) => b.score - a.score);

  return recommended;
}


// --- TEST for AI review analysis to score ---
if (require.main === module) {
  // AIのjson出力例
  const aiResult = {
    features: ['Family', 'Action'],
    emotions: ['Exciting'],
    themes: ['Destiny'],
    tag_sentiment: {
      'Family': 'positive',
      'Action': 'positive',
      'Exciting': 'positive',
      'Destiny': 'negative'
    } as Record<string, string>
  };

  // likes/dislikesを生成
  let likes: Record<string, number> = {};
  let dislikes: Record<string, number> = {};
  for (const tag of [...aiResult.features, ...aiResult.emotions, ...aiResult.themes]) {
    if (aiResult.tag_sentiment[tag] === 'positive') {
      likes[tag] = (likes[tag] || 0) + 1;
    } else if (aiResult.tag_sentiment[tag] === 'negative') {
      dislikes[tag] = (dislikes[tag] || 0) + 1;
    }
  }

  // 映画のタグ例
  const movieTags = ['Family', 'Action', 'Destiny', 'Exciting'];
  // スコア計算
  const score = calculateScore(likes, dislikes, movieTags);

  console.log('AI likes:', likes);       // { Family: 1, Action: 1, Exciting: 1 }
  console.log('AI dislikes:', dislikes); // { Destiny: 1 }
  console.log('Score:', score);          // 1+1+1-(1*2) = 1+1+1-2 = 1
}
