import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // クッキー一覧を出力
  console.log('middleware cookies:', [...request.cookies]);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // セッション取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 取得したユーザー情報を出力
  console.log('middleware user:', user);

  const { pathname } = request.nextUrl

  // Public routes that do not require authentication
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/signup/check-email' ||
    pathname === '/auth/verified' ||
    pathname === '/auth/callback' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname === '/error'
  ) {
    return response
  }

  // If user is not logged in, redirect to login page.
  if (!user) {
    console.log('No user found, redirecting to login');
    return NextResponse.redirect(new URL('/login?message=Please sign in to continue', request.url))
  }

  // If user is not email-verified, redirect to check-email page
  if (!user.email_confirmed_at) {
    console.log('User email not confirmed, redirecting to check-email');
    // サインアップ直後のメールアドレスをクエリに含めてリダイレクト
    const email = encodeURIComponent(user.email || '')
    return NextResponse.redirect(new URL(`/signup/check-email?email=${email}`, request.url))
  }

  console.log('User authenticated and verified, allowing access');
  return response
}

export const config = {
  matcher: ['/((?!_next/|api/|favicon.ico).*)'],
}

