'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md text-center">
        <div className="text-6xl mb-6"></div>

        <h1 className="text-3xl font-bold text-ink mb-4">
          Check Your Email
        </h1>
        
        <p className="text-muted mb-6">
          We&apos;ve sent a verification link to:
        </p>

        <p className="text-lg font-semibold text-sage-deep mb-8">
          {email}
        </p>
        
        <div className="bg-sage-bg border-2 border-sage/40 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-bold text-ink mb-3">Next Steps:</h3>
          <ol className="space-y-2 text-sm text-ink">
            <li className="flex items-start gap-2">
              <span className="font-bold text-sage-deep">1.</span>
              <span>Check your email inbox (and spam folder)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-sage-deep">2.</span>
              <span>Click the verification link in the email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-sage-deep">3.</span>
              <span>You&apos;ll be redirected back to log in</span>
            </li>
          </ol>
        </div>

        <div className="text-sm text-muted">
          <p className="mb-4">Didn&apos;t receive the email?</p>
          <Link
            href="/signup"
            className="text-sage-deep hover:text-sage-deep/80 font-semibold"
          >
            Try signing up again
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-line">
          <Link
            href="/login"
            className="text-muted hover:text-ink text-sm"
          >
            Already verified? Log in →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}