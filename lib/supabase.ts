import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('DEBUG SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('DEBUG SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  throw new Error('Missing Supabase environment variables')
}

// Helper to get the site URL
const getSiteUrl = () => {
  let url = process.env.NEXT_PUBLIC_SITE_URL
  
  // In the browser, use the current origin
  if (typeof window !== 'undefined') {
    url = window.location.origin
  }
  
  // Fallback to localhost
  return url || 'http://localhost:3000'
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    debug: true // Temporarily enable debug mode to help diagnose issues
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
})

export type AuthError = {
  message: string
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  })

  if (error) throw error
  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    }
  })

  if (error) throw error
  return data
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`,
  })

  if (error) throw error
}

/*
export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signUp({
    options: {
      data: {
       // is_anonymous: true
      }
    }
  })
  

  if (error) throw error
  return data
}
  */

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function createOrUpdateUser(userData: {
  id: string
  display_name?: string
  is_anonymous?: boolean
  selected_subscriptions?: string[]
}) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userData.id,
      display_name: userData.display_name,
      is_anonymous: userData.is_anonymous,
      selected_subscriptions: userData.selected_subscriptions,
      last_login: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}