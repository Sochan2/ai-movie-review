// utils/supabase/client.ts
import { createClient as createServerClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

declare global {
  interface Window {
    _supabase?: SupabaseClient;
  }
}

// グローバル変数をwindowにアタッチしてシングルトン化
export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in environment variables.');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in environment variables.');
  }
  if (typeof window !== 'undefined') {
    if (!window._supabase) {
      window._supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    return window._supabase;
  } else {
    // SSRでは@supabase/supabase-jsのcreateClientを使う
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}

// For backward compatibility
// export const supabase = createClient()



/*
export const createClient = () => {
  return createBrowserClient(
    
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        detectSessionInUrl: true,
        autoRefreshToken: true
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web'
        }
      }
    }
    
  )

  }
*/