'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function login(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(
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
          cookiesStore.set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          const cookiesStore = await cookieStore;
          cookiesStore.set({ name, value: '', ...options });
        },
      },
    }
  )

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  redirect('/')

}

export async function signup(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(
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
          cookiesStore.set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          const cookiesStore = await cookieStore;
          cookiesStore.set({ name, value: '', ...options });
        },
      },
    }
  )

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/`,
    },
  })

  if (error) {
    redirect('/login?message=Could not create user')
  }

  redirect('/login?message=Check email to continue sign in process')
}