import 'dotenv/config';
import { getMovieDetails } from '../lib/tmdb';
import { createClient } from '../utils/supabase/server';
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabase = createClient();

async function saveMoviesByIdRange(startId: number, endId: number) {
  for (let id = startId; id <= endId; id++) {
    try {
      await getMovieDetails(id.toString(), supabase);
      console.log(`映画ID ${id} を保存しました`);
    } catch (e) {
      console.log(`映画ID ${id} はスキップ`);
    }
    // 0.1秒待つ（1秒10リクエストペース）
    await new Promise(res => setTimeout(res, 100));
  }
  console.log('ID範囲の映画保存が完了しました');
}

// 例: 1〜10000まで保存. Nex is from 4511
saveMoviesByIdRange(4511, 10000); 