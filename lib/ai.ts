// このファイルはサーバー専用（SSR/Node.js専用）。クライアントでimportしてはならない。
// クライアントでimportされた場合は即エラーになります。
import { log } from "console";
import OpenAI from "openai";

// SSR/Node.js専用。クライアントでimportされた場合は即エラー
if (typeof window !== 'undefined') {
  throw new Error('lib/ai.ts is server-only and must not be imported on the client.');
}

console.log("ai.ts loaded");
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables.');
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
if (process.env.NODE_ENV !== 'production') {
  console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);
}




/**
 * レビュー内容をAIで分析し、特徴・感情・テーマ、タグごとの好意的/否定的判定を抽出する
 * @param reviewText レビュー本文
 * @param rating 星評価
 * @param emotions 感情タグ
 * @returns { features: string[], emotions: string[], themes: string[], tag_sentiment: Record<string, "positive" | "negative"> }
 */
export async function analyzeReviewWithAI(
  reviewText: string,
  rating: number,
  emotions: string[]
): Promise<{ features: string[]; emotions: string[]; themes: string[]; tag_sentiment: Record<string, "positive" | "negative"> }> {
  // プロンプト例
  const prompt = `
You are a movie review analysis AI.
You canextract[features],[emotions] and[theme] from the review. Furthermore, you can judge
whether the user is positive or negative from each tag(features, emotions and themes) and return back JSON.

Review: ${reviewText}
Rating: ${rating}
Emotions: ${emotions.join(", ")}

Output example:
{
  "features": ["Aggressive", "Brothers' Bond", "nostalgic atmosphere"],
  "emotions": ["Emotion", "Exciting"],
  "themes": ["Family", "Revenge", "Destiny"],
  "tag_sentiment": {
    "Aggressive": "positive",
    "Family": "positive",
    "Destiny": "negative"
  }
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  // レスポンスからJSON部分を抽出・パース
  const content = response.choices[0].message?.content ?? "";
  const jsonStart = content.indexOf("{");
  const jsonEnd = content.lastIndexOf("}");
  const jsonString = content.slice(jsonStart, jsonEnd + 1);
  return JSON.parse(jsonString);
}

//update user profile with AI result such as like and dislike
export async function updateUserProfileWithAIResult(
  userId: string,
  aiResult: { features: string[]; emotions: string[]; themes: string[]; tag_sentiment: Record<string, "positive" | "negative"> },
  rating: number,
  selectedEmotions: string[],
  movieId: string
) {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = createClient();
  // 1. 既存プロファイル取得
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('likes, dislikes')
    .eq('user_id', userId)
    .single();

  // 2. likes/dislikesを更新
  const tags = [...aiResult.features, ...aiResult.emotions, ...aiResult.themes];
  let likes = (profile?.likes as Record<string, number>) || {};
  let dislikes = (profile?.dislikes as Record<string, number>) || {};
  const sentiment = aiResult.tag_sentiment || {};

  // Record<string, number>として扱う
  const getLikeCount = (obj: Record<string, number>, tag: string) =>
    typeof obj?.[tag] === 'number' ? obj[tag] : 0;

  if (rating >= 4) {
    for (const tag in sentiment) {
      if (sentiment[tag] === 'positive') {
        likes[tag] = getLikeCount(likes, tag) + 1;
      }
    }
    // 手動選択の感情タグで、tag_sentimentに含まれていないものもlikesに加算
    for (const tag of selectedEmotions) {
      if (!(tag in sentiment)) {
        likes[tag] = getLikeCount(likes, tag) + 1;
      }
    }
  }
  if (rating <= 3) {
    for (const tag in sentiment) {
      if (sentiment[tag] === 'negative') {
        dislikes[tag] = getLikeCount(dislikes, tag) + 1;
      }
    }
    // 手動選択の感情タグで、tag_sentimentに含まれていないものもdislikesに加算
    for (const tag of selectedEmotions) {
      if (!(tag in sentiment)) {
        dislikes[tag] = getLikeCount(dislikes, tag) + 1;
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

  // --- 集約ロジック追加 ---
  if (movieId) {
    // 1. その映画の全レビューを取得
    const { data: reviews } = await supabase
      .from('reviews')
      .select('features, emotions, themes')
      .eq('movie_id', movieId);
    // 2. features, emotions, themesごとに頻度集計
    const safeReviews = reviews || [];
    const countTags = (arrs: any[], key: string) => {
      const counts: Record<string, number> = {};
      for (const row of arrs) {
        for (const tag of row[key] || []) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      }
      return counts;
    };
    const featuresCount = countTags(safeReviews, 'features');
    const emotionsCount = countTags(safeReviews, 'emotions');
    const themesCount = countTags(safeReviews, 'themes');
    // 3. 頻度順に上位10件だけ抽出
    const topN = (counts: Record<string, number>) => Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
    const topFeatures = topN(featuresCount);
    const topEmotions = topN(emotionsCount);
    const topThemes = topN(themesCount);
    // 4. moviesテーブルをupdate
    await supabase.from('movies').update({
      features: topFeatures,
      emotions: topEmotions,
      themes: topThemes
    }).eq('id', movieId);
  }
} 