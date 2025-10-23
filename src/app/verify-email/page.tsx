'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md text-center">
        <div className="text-6xl mb-6">📧</div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Check Your Email
        </h1>
        
        <p className="text-gray-600 mb-6">
          We've sent a verification link to:
        </p>
        
        <p className="text-lg font-semibold text-blue-600 mb-8">
          {email}
        </p>
        
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-bold text-gray-900 mb-3">Next Steps:</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">1.</span>
              <span>Check your email inbox (and spam folder)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">2.</span>
              <span>Click the verification link in the email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">3.</span>
              <span>You'll be redirected back to log in</span>
            </li>
          </ol>
        </div>

        <div className="text-sm text-gray-600">
          <p className="mb-4">Didn't receive the email?</p>
          <Link 
            href="/signup" 
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Try signing up again
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link 
            href="/login"
            className="text-gray-600 hover:text-gray-900 text-sm"
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