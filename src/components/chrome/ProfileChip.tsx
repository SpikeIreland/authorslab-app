'use client'

/**
 * ProfileChip — avatar initial + first name + chevron dropdown
 *
 * Replaces the plain-text "Signed in as {name}" pattern on the current app
 * headers. Dropdown items per AL-UX-004 §2.1: account / billing / sign out.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ProfileChipProps {
  firstName?: string
}

export function ProfileChip({ firstName }: ProfileChipProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState<string>(firstName ?? '')
  const ref = useRef<HTMLDivElement>(null)

  // Lightweight self-fetch so pages don't have to pass firstName if they don't have it.
  useEffect(() => {
    if (name) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata || {}
      const derived: string =
        meta.first_name || meta.firstName || meta.name?.split(' ')?.[0] || data.user?.email?.split('@')?.[0] || ''
      if (derived) setName(derived)
    })
  }, [name])

  // Close on click-outside.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const initial = (name || '?').slice(0, 1).toUpperCase()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 hover:bg-white/10 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-medium"
          style={{ background: 'var(--color-sage-deep)', color: 'var(--color-paper)' }}
        >
          {initial}
        </span>
        <span className="text-[13px] text-white/90">{name || 'Account'}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" className="text-white/60">
          <path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] min-w-[180px] rounded-lg overflow-hidden shadow-lg"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
          role="menu"
        >
          <MenuItemDisabled title="Account settings — coming soon">Account</MenuItemDisabled>
          <MenuItemDisabled title="Billing — coming soon">Billing</MenuItemDisabled>
          <div style={{ borderTop: '1px solid var(--color-line-soft)' }} />
          <button
            type="button"
            onClick={signOut}
            className="w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--color-ivory)] transition-colors"
            style={{ color: 'var(--color-ink)' }}
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function MenuItem({ href, onClick, children }: { href: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2 text-[13px] hover:bg-[var(--color-ivory)] transition-colors"
      style={{ color: 'var(--color-ink)' }}
      role="menuitem"
    >
      {children}
    </Link>
  )
}

function MenuItemDisabled({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="block px-3 py-2 text-[13px] cursor-not-allowed select-none"
      style={{ color: 'var(--color-faint)' }}
      title={title}
      role="menuitem"
      aria-disabled="true"
    >
      {children}
    </div>
  )
}
