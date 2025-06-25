import { getTrendingMovies } from '@/lib/tmdb';
import { createClient } from '../utils/supabase/server';

const supabase = createClient();

async function saveTrendingMovies() {
  for (let page = 1; page <= 25; page++) { // 1ページ20件×25=500件
    await getTrendingMovies(20, page, supabase);
  }
  console.log('トレンド映画500件保存完了');
}

saveTrendingMovies(); 