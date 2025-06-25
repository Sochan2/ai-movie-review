export interface Movie {
  id: string;
  title: string;
  year: number;
  rating: number;
  runtime?: number;
  poster?: string;
  posterUrl?: string;
  backdropUrl?: string;
  overview?: string;
  genres?: string[];
  director?: string;
  streamingServices?: string[]; // ストリーミングサービス名のみ（テキスト）を格納。将来的にロゴ追加可。
  releaseDate?: string;
  languages?: string[];
  justWatchUrl?: string;
  cast?: {
    name: string;
    character: string;
    profileUrl?: string;
  }[];
  watchProviders?: {
    id: number;
    name: string; // サービス名のみ利用。ロゴは今は使わない。
    // logoUrl?: string; // 将来的にロゴを追加したい場合はこのプロパティを利用
    type: 'flatrate' | 'free' | 'ads' | 'rent' | 'buy';
  }[];
  features?: any; // jsonb: 映画の特徴タグ
  emotions?: any; // jsonb: 映画の感情タグ
  themes?: any;   // jsonb: 映画のテーマタグ
}

export interface StreamingService {
  id: string;
  name: string; // サービス名のみ利用。ロゴは今は使わない。
  // logoUrl?: string; // 将来的にロゴを追加したい場合はこのプロパティを利用
}

export interface Genre {
  id: string;
  name: string;
}

export interface EmotionTag {
  id: string;
  label: string;
  color: string;
}

export interface MovieReview {
  id: string;
  movieId: string;
  userId: string;
  rating: number;
  text: string;
  emotions: string[];
  createdAt: string;
  tag_sentiment?: Record<string, 'positive' | 'negative'>;
}

export interface UserPreferences {
  genres: string[];
  tags: string[];
  subscriptions: string[];
}