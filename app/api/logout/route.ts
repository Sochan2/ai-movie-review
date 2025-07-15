import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 絶対URLでリダイレクト
  const url = new URL('/', request.url);
  const response = NextResponse.redirect(url.toString());
  response.cookies.set('sb-access-token', '', { path: '/', maxAge: 0, secure: true, sameSite: 'lax' });
  response.cookies.set('sb-refresh-token', '', { path: '/', maxAge: 0, secure: true, sameSite: 'lax' });
  return response;
} 