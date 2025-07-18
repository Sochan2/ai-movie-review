import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL('/', request.url);
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  const secure = !isLocalhost;

  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('sb-access-token', '', { path: '/', maxAge: 0, secure, sameSite: 'lax', httpOnly: true });
  response.cookies.set('sb-refresh-token', '', { path: '/', maxAge: 0, secure, sameSite: 'lax', httpOnly: true });
  response.cookies.set('sb-wagamgdhdofdpxgnzrud-auth-token', '', { path: '/', maxAge: 0, secure, sameSite: 'lax', httpOnly: true });

  return response;
} 