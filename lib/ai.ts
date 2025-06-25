import { log } from "console";
import OpenAI from "openai";

console.log("ai.ts loaded");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);




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