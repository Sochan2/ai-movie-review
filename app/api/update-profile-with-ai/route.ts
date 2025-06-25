import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfileWithAIResult } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { userId, aiResult, rating, selectedEmotions } = await req.json();
    await updateUserProfileWithAIResult(userId, aiResult, rating, selectedEmotions);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
} 