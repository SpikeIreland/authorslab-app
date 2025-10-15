'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Calculate password strength
    if (name === 'password') {
      let strength = 0
      if (value.length >= 8) strength++
      if (value.match(/[a-z]+/)) strength++
      if (value.match(/[A-Z]+/)) strength++
      if (value.match(/[0-9]+/)) strength++
      if (value.match(/[^a-zA-Z0-9]+/)) strength++
      setPasswordStrength(strength)
    }
  }

  const getPasswordStrengthLabel = () => {
    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['', 'text-red-600', 'text-red-500', 'text-yellow-600', 'text-green-500', 'text-green-600']
    return { label: labels[passwordStrength], color: colors[passwordStrength] }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            marketing_emails: marketingEmails,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.user) {
        // Success! Redirect to onboarding
        router.push('/onboarding')
        router.refresh()
      }
    } catch (err) {
      const error = err as Error
      console.error('Signup error:', error)
      setError(error.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const strengthInfo = getPasswordStrengthLabel()

  return (
    <AuthFormWrapper
      title="Create Your Author Account"
      subtitle="Set up your professional author portal to begin your manuscript transformation journey"
      badge="🎉 WELCOME TO YOUR AUTHOR PORTAL"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign in here"
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="password">Create Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="mt-2"
          />
          {formData.password && (
            <p className={`mt-1 text-sm ${strengthInfo.color}`}>
              Password strength: {strengthInfo.label}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="mt-2"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
              className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <a href="/terms" className="text-blue-900 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-900 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="marketing"
              type="checkbox"
              checked={marketingEmails}
              onChange={(e) => setMarketingEmails(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
            />
            <label htmlFor="marketing" className="text-sm text-gray-600">
              I&apos;d like to receive updates about new features, writing tips, and publishing opportunities
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create My Author Portal'}
        </Button>
      </form>
    </AuthFormWrapper>
  )
}