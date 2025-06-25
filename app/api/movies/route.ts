import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Server-side cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Use NEXT_PUBLIC_TMDB_API_KEY for server-side as well
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper function to fetch from TMDB API
async function fetchFromTMDB(endpoint: string) {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.');
  }

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=en-US`);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Transform TMDB movie data to our format
function transformTMDbMovie(tmdbMovie: any) {
  return {
    id: tmdbMovie.id.toString(),
    title: tmdbMovie.title,
    year: new Date(tmdbMovie.release_date).getFullYear(),
    rating: tmdbMovie.vote_average,
    posterUrl: tmdbMovie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
      : undefined,
    overview: tmdbMovie.overview,
    genres: tmdbMovie.genre_ids ? [] : [],
    releaseDate: tmdbMovie.release_date,
    streamingServices: [],
    watchProviders: []
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'popular';
    const limit = parseInt(searchParams.get('limit') || '15');
    
    const cacheKey = `${type}_${limit}`;
    const now = Date.now();
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      });
    }
    
    // Fetch fresh data from TMDB
    let endpoint: string;
    switch (type) {
      case 'popular':
        endpoint = '/movie/popular';
        break;
      case 'now-playing':
        endpoint = '/movie/now_playing';
        break;
      case 'top-rated':
        endpoint = '/movie/top_rated';
        break;
      default:
        endpoint = '/movie/popular';
    }
    
    const data = await fetchFromTMDB(endpoint);
    const movies = data.results.slice(0, limit).map(transformTMDbMovie);
    
    // Supabaseに映画データを保存（非同期でOK）
    const supabase = createClient();
    (async () => {
      for (const movie of movies) {
        await supabase.from('movies').upsert({
          id: movie.id,
          title: movie.title,
          genres: movie.genres,
          overview: movie.overview,
          poster_url: movie.posterUrl,
          popularity: movie.rating,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }
    })();
    
    // Cache the result
    cache.set(cacheKey, { data: movies, timestamp: now });
    
    return NextResponse.json(movies, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('API Error:', error.message);
    } else {
      console.error('API Error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch movies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 