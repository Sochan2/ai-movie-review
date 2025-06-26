import { NextRequest, NextResponse } from "next/server";
import { analyzeReviewWithAI } from "@/lib/ai";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, reviewText, rating, emotions } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    // プロファイル取得
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('ai_analysis_count, last_analysis_date')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // 日付が違えばリセット
    let ai_analysis_count = profile.ai_analysis_count;
    let last_analysis_date = profile.last_analysis_date;
    if (last_analysis_date !== today) {
      ai_analysis_count = 0;
      await supabase.from('user_profiles').update({
        ai_analysis_count: 0,
        last_analysis_date: today
      }).eq('user_id', userId);
    }

    // 制限チェック
    const maxDailyRequests = 3;
    if (ai_analysis_count >= maxDailyRequests) {
      return NextResponse.json({ error: "You have exceeded the maximum number of AI requests for today." }, { status: 429 });
    }

    // AI分析
    const result = await analyzeReviewWithAI(reviewText, rating, emotions);

    // カウントアップ
    await supabase.from('user_profiles').update({
      ai_analysis_count: ai_analysis_count + 1,
      last_analysis_date: today
    }).eq('user_id', userId);

    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      return NextResponse.json({ error: "AI分析結果が不正な形式です", detail: result }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "AI分析に失敗しました", detail: String(e) }, { status: 500 });
  }
} 