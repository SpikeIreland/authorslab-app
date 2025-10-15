import Link from 'next/link'
import { ReactNode } from 'react'

interface AuthFormWrapperProps {
  children: ReactNode
  title: string
  subtitle: string
  badge?: string
  footerText?: string
  footerLink?: string
  footerLinkText?: string
}

export function AuthFormWrapper({
  children,
  title,
  subtitle,
  badge,
  footerText,
  footerLink,
  footerLinkText
}: AuthFormWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                📚 AuthorLab.ai
              </div>
            </Link>
          </div>

          {/* Badge */}
          {badge && (
            <div className="mb-6 text-center">
              <span className="inline-block px-4 py-2 bg-yellow-100 border-2 border-yellow-400 text-yellow-700 rounded-full text-sm font-bold">
                {badge}
              </span>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          {/* Form content */}
          {children}

          {/* Footer link */}
          {footerText && footerLink && footerLinkText && (
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                {footerText}{' '}
                <Link href={footerLink} className="text-blue-900 font-semibold hover:underline">
                  {footerLinkText}
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Security badges */}
        <div className="mt-6 flex justify-center gap-6 text-white text-sm opacity-90">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  )
}