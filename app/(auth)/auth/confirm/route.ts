import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('Auth confirm parameters:', { 
    token_hash: !!token_hash, 
    type, 
    code: !!code, 
    next,
    allParams: Object.fromEntries(searchParams.entries())
  })

  const supabase = await createClient()

  // Handle token_hash and type parameters (standard OTP flow)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    console.log('OTP verification result:', { error })

    if (!error) {
      // Successful verification
      if (type === 'recovery') {
        // For password recovery, redirect to reset password page
        return NextResponse.redirect(new URL('/reset-password', request.url))
      } else {
        // For other types (like signup confirmation), redirect to next URL
        const redirectTo = request.nextUrl.clone()
        redirectTo.pathname = next
        redirectTo.searchParams.delete('token_hash')
        redirectTo.searchParams.delete('type')
        redirectTo.searchParams.delete('next')
        return NextResponse.redirect(redirectTo)
      }
    }
  }

  // Handle code parameter (PKCE flow)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('Code exchange result:', { 
      hasSession: !!data.session, 
      error,
      userId: data.session?.user?.id 
    })

    if (!error && data.session) {
      // Successfully exchanged code for session
      // For password reset, redirect to reset password page
      return NextResponse.redirect(new URL('/reset-password', request.url))
    }
  }

  // If there's an error or missing parameters, redirect to error page
  console.log('Auth confirm failed - redirecting to error page')
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = '/error'
  redirectTo.searchParams.set('message', 'invalid-verification-link')
  return NextResponse.redirect(redirectTo)
}

