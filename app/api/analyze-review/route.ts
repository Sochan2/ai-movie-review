import { NextRequest, NextResponse } from "next/server";
import { analyzeReviewWithAI } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { reviewText, rating, emotions } = await req.json();
    const result = await analyzeReviewWithAI(reviewText, rating, emotions);
    // JSON形式かどうかチェック
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      console.error("AI分析結果が不正な形式です", result);
      return NextResponse.json({ error: "AI分析結果が不正な形式です", detail: result }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error("AI分析APIエラー詳細:", e);
    return NextResponse.json({ error: "AI分析に失敗しました", detail: String(e) }, { status: 500 });
  }
} 