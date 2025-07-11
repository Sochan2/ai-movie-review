import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies as nextCookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") ?? "signup"
  // nextパラメータは無視する

  console.log('Auth confirm called with:', { 
    hasTokenHash: !!token_hash, 
    type
  })

  const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`

  if (!token_hash || !type) {
    console.log('Invalid token_hash or type')
    return NextResponse.redirect(`${baseUrl}/login?message=Invalid%20link`)
  }

  const cookieStore = nextCookies()
  console.log('Available cookies:', Array.from(cookieStore.getAll()).map(c => c.name))
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.verifyOtp({
    type: type as any,
    token_hash,
  })
  console.log('verifyOtp result:', { 
    hasData: !!data, 
    hasSession: !!data?.session, 
    hasUser: !!data?.user,
    error: error?.message 
  });
  
  if (error) {
    console.error('verifyOtp error:', error)
    return NextResponse.redirect(`${baseUrl}/login?message=${encodeURIComponent(error.message)}`)
  }

  // 成功時は必ず/auth/verifiedにリダイレクト
  const verifiedUrl = `${baseUrl}/auth/verified`
  const response = NextResponse.redirect(verifiedUrl)
  
  // セッションが存在する場合、クッキーを設定
  if (data.session) {
    const { access_token, refresh_token, expires_in } = data.session
    
    console.log('Setting auth cookies for user:', data.user?.email)
    
    response.cookies.set('sb-access-token', access_token, {
      path: '/',
      maxAge: expires_in,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    
    response.cookies.set('sb-refresh-token', refresh_token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7日
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
  } else {
    console.log('No session data available')
  }
  
  return response
}

