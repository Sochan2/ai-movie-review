import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash') || searchParams.get('token');
  const type = searchParams.get('type') as EmailOtpType | null

  // Debug logging
  console.log('Supabase email confirmation:', { token_hash, type })

  if (token_hash && type) {
    const supabase = createClient(cookies())
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      return NextResponse.redirect(`${origin}/auth/verified`)
    } else {
      // Log the error for debugging
      console.error('OTP verification failed:', error.message)
    }
  }

  return NextResponse.redirect(`${origin}/error?error=Invalid or expired confirmation link`)
}