import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = request.cookies
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const response = NextResponse.redirect(new URL(next, origin))
      return response
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?message=Could not authenticate user', origin))
}

export const dynamic = 'force-dynamic'


/*
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      const { error,data } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(new URL('/login?message=Authentication failed', request.url));
      }

      // ✅ 必ず `NextResponse.redirect` に cookie を反映させる
      const response = NextResponse.redirect(new URL(next, request.url));
      // 重要: クライアントの Cookie に正しくセッション情報を渡す
      const {
        access_token,
        refresh_token,
        expires_in,
        token_type,
      } = data.session;

      response.cookies.set('sb-access-token', access_token, {
        path: '/',
        maxAge: expires_in,
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
      });
      response.cookies.set('sb-refresh-token', refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7日
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
      });

      return response;

    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/login?message=Authentication failed', request.url));
    }
  }

  return NextResponse.redirect(new URL('/login?message=Invalid authentication code', request.url));
}

// Prevent caching of this route
export const dynamic = 'force-dynamic';
*/