// utils/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in environment variables.');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in environment variables.');
  }
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookiesStore = await cookieStore;
          return cookiesStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookiesStore = await cookieStore;
          try {
            cookiesStore.set({ name, value, ...options });
          } catch (error) {
            if (error instanceof Error) {
              console.error('Cookie set error:', error.message);
            } else {
              console.error('Cookie set error:', error);
            }
          }
        },
        async remove(name: string, options: CookieOptions) {
          const cookiesStore = await cookieStore;
          try {
            cookiesStore.set({ name, value: '', ...options });
          } catch (error) {
            if (error instanceof Error) {
              console.error('Cookie remove error:', error.message);
            } else {
              console.error('Cookie remove error:', error);
            }
          }
        },
      },
    }
  )
}


/*
export const createClient = () => {
  return createServerComponentClient({ cookies })
  // utils/supabase/server.ts
  
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting error
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie removal error
          }
        },
      },
      auth: {
        flowType: 'pkce',
        persistSession: true
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