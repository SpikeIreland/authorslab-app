'use client'

export const dynamic = 'force-dynamic'

/**
 * /profile — the Author Profile (ux, Paul-directed 2026-09-23).
 *
 * The account-level "you" layer: bio, pen name, photo, website — entered once,
 * inherited by every book. Publishing's back-matter bio step pre-fills from
 * here instead of asking per book (see courier
 * ux-to-identity-billing+publishing-author-profile-layer-2026-09-23.md).
 *
 * Save path is the author's own RLS-scoped update; affected-row count is
 * checked per House Rules (RLS rejection is rows=0, error=null).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/chrome/AppShell'

interface ProfileForm {
  first_name: string
  last_name: string
  pen_name: string
  bio: string
  website_url: string
  profile_image_url: string | null
}

const EMPTY: ProfileForm = {
  first_name: '',
  last_name: '',
  pen_name: '',
  bio: '',
  website_url: '',
  profile_image_url: null,
}

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [form, setForm] = useState<ProfileForm>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const authUserId = useRef<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      authUserId.current = user.id
      const { data, error: readError } = await supabase
        .from('author_profiles')
        .select('first_name, last_name, pen_name, bio, website_url, profile_image_url')
        .eq('auth_user_id', user.id)
        .single()
      if (cancelled) return
      if (readError) {
        setError('Could not load your profile. Please try again.')
      } else if (data) {
        setForm({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          pen_name: data.pen_name ?? '',
          bio: data.bio ?? '',
          website_url: data.website_url ?? '',
          profile_image_url: data.profile_image_url ?? null,
        })
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (key: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      setSavedAt(null)
    }

  const handlePhoto = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !authUserId.current) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setUploading(true)
    setError(null)
    const fileName = `${authUserId.current}/profile-${Date.now()}.${file.name.split('.').pop()}`
    const { error: upErr } = await supabase.storage
      .from('author-profiles')
      .upload(fileName, file, { upsert: true, contentType: file.type })
    if (upErr) {
      setError('Photo upload failed. Please try again.')
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage
      .from('author-profiles')
      .getPublicUrl(fileName)
    setForm(f => ({ ...f, profile_image_url: publicUrl }))
    setSavedAt(null)
    setUploading(false)
  }, [supabase])

  const save = useCallback(async () => {
    if (!authUserId.current) return
    setSaving(true)
    setError(null)
    const { data, error: writeError } = await supabase
      .from('author_profiles')
      .update({
        first_name: form.first_name.trim() || null,
        last_name: form.last_name.trim() || null,
        pen_name: form.pen_name.trim() || null,
        bio: form.bio.trim() || null,
        website_url: form.website_url.trim() || null,
        profile_image_url: form.profile_image_url,
      })
      .eq('auth_user_id', authUserId.current)
      .select('id')
    setSaving(false)
    if (writeError || !data || data.length === 0) {
      setError('Save failed. Please try again.')
      return
    }
    setSavedAt(Date.now())
  }, [form, supabase])

  const publishingName =
    form.pen_name.trim() || [form.first_name, form.last_name].filter(Boolean).join(' ')

  return (
    <AppShell>
      <div className="min-h-full" style={{ background: 'var(--color-ivory)' }}>
        <div className="max-w-2xl mx-auto px-6 py-10">
          <p className="kicker" style={{ color: 'var(--color-sage-deep)' }}>Author Profile</p>
          <h1
            className="text-[28px] mt-1"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
          >
            This is you, across every book.
          </h1>
          <p className="text-[14px] mt-2 mb-8" style={{ color: 'var(--color-muted)' }}>
            Your bio, name and photo live here once — every project&rsquo;s publishing
            step starts from them, so you never retype yourself per book.
          </p>

          {loading ? (
            <p className="text-[14px]" style={{ color: 'var(--color-muted)' }}>Loading your profile…</p>
          ) : (
            <div
              className="rounded-lg p-6 flex flex-col gap-6"
              style={{
                background: 'var(--color-paper)',
                border: '1px solid var(--color-line)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            >
              {/* Photo + names */}
              <div className="flex gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--color-line-soft)', border: '1px solid var(--color-line)' }}
                  >
                    {form.profile_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.profile_image_url} alt="Author photo" className="w-full h-full object-cover" />
                    ) : (
                      <span
                        className="text-[28px]"
                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-faint)' }}
                      >
                        {(form.first_name || 'A').charAt(0)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={uploading}
                    className="text-[12px] hover:underline disabled:opacity-50"
                    style={{ color: 'var(--color-sage-deep)' }}
                  >
                    {uploading ? 'Uploading…' : form.profile_image_url ? 'Change photo' : 'Add photo'}
                  </button>
                  <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First name" value={form.first_name} onChange={set('first_name')} />
                  <Field label="Last name" value={form.last_name} onChange={set('last_name')} />
                  <div className="sm:col-span-2">
                    <Field
                      label="Pen name"
                      hint="Only if you publish under a different name."
                      value={form.pen_name}
                      onChange={set('pen_name')}
                      placeholder={[form.first_name, form.last_name].filter(Boolean).join(' ') || 'e.g. C G Lyons'}
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <FieldLabel label="Bio" hint="Written once, offered to every book's back matter." />
                <textarea
                  value={form.bio}
                  onChange={set('bio')}
                  rows={6}
                  placeholder="A few sentences about you as a writer — where you're from, what you write, what readers should know."
                  className="w-full rounded-md px-3 py-2 text-[14px] leading-relaxed resize-y focus:outline-none"
                  style={{
                    background: 'var(--color-paper-warm)',
                    border: '1px solid var(--color-line)',
                    color: 'var(--color-ink)',
                  }}
                />
              </div>

              {/* Website */}
              <Field
                label="Website"
                hint="Shown in back matter and marketing pages when present."
                value={form.website_url}
                onChange={set('website_url')}
                placeholder="https://…"
              />

              {/* Save row */}
              <div
                className="flex items-center justify-between pt-4"
                style={{ borderTop: '1px solid var(--color-line-soft)' }}
              >
                <p className="text-[12px]" style={{ color: 'var(--color-muted)' }}>
                  {publishingName
                    ? <>Publishing as <span style={{ color: 'var(--color-ink)' }}>{publishingName}</span></>
                    : 'Add your name so your books know their author.'}
                </p>
                <div className="flex items-center gap-3">
                  {savedAt && (
                    <span className="text-[12px]" style={{ color: 'var(--color-sage-deep)' }}>✓ Saved</span>
                  )}
                  {error && (
                    <span className="text-[12px]" style={{ color: 'var(--color-high, #B85C48)' }}>{error}</span>
                  )}
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving || loading}
                    className="px-5 py-2 rounded-md text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'var(--color-sage-deep)' }}
                  >
                    {saving ? 'Saving…' : 'Save profile'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <span className="text-[12px] font-medium" style={{ color: 'var(--color-ink)' }}>{label}</span>
      {hint && <span className="text-[11px]" style={{ color: 'var(--color-faint)' }}>{hint}</span>}
    </div>
  )
}

function Field({
  label, hint, value, onChange, placeholder,
}: {
  label: string
  hint?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md px-3 py-2 text-[14px] focus:outline-none"
        style={{
          background: 'var(--color-paper-warm)',
          border: '1px solid var(--color-line)',
          color: 'var(--color-ink)',
        }}
      />
    </div>
  )
}
