// utils/supabase/client.ts
import { createClient as createServerClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// グローバル変数をwindowにアタッチしてシングルトン化
export function createClient() {
  if (typeof window !== 'undefined') {
    if (!(window as any)._supabase) {
      (window as any)._supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    return (window as any)._supabase as SupabaseClient;
  } else {
    // SSRでは@supabase/supabase-jsのcreateClientを使う
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}

// For backward compatibility
export const supabase = createClient()



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