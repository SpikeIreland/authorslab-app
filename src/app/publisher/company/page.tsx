'use client'

export const dynamic = 'force-dynamic'

/**
 * THE COMPANY TAB — /publisher/company
 *
 * Build brief item ①. A publisher's own standards, held as a versioned record.
 *
 * Why this is the most distinctive surface we own: every vendor says "tailored
 * to you". This is the one place a publisher can put the actual document their
 * staff already work to, see which version is in force, and see every version
 * that ever was. When copy editing enforces it, the difference shows in the
 * first chapter — and until then, this page says so rather than implying
 * otherwise.
 *
 * ─── WHAT THIS PAGE MUST NEVER IMPLY ─────────────────────────────────────────
 * That a document here is being OBEYED. Enforcement inside the editorial
 * stations is `astudio`'s and is in build. A list of stations beside a
 * document reads as a promise that it is governing them, so the promise is
 * qualified in the same breath — and the qualification comes from the API
 * payload rather than this file, because a caveat that lives only in a surface
 * is one refactor from being dropped.
 *
 * ─── UPLOAD IS NOT BUILT, SO UPLOAD IS NOT OFFERED ───────────────────────────
 * The brief asks for "upload or paste". `house_documents` is live and READABLE;
 * no write route exists yet. So there is no upload control on this page. A
 * button that cannot write is the silent-swallow defect waiting to happen, and
 * this lane has already shipped one of those this week.
 *
 * Written empty-first: with zero org_memberships in the estate and no
 * documents supplied, EVERY card on this page is empty today. That is the
 * state it will be walked in, so it is the state it was designed for.
 */

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/chrome/AppShell'
import { PublisherNav } from '../_components/PublisherNav'


interface Version {
  id: string
  seq: number
  title: string
  hasBody: boolean
  hasFile: boolean
  setByLabel: string
  note: string | null
  createdAt: string
}

interface CompanyDocument {
  kind: string
  label: string
  blurb: string
  governs: string[]
  current: (Version & { body: string | null }) | null
  history: Version[]
}

interface Payload {
  organisation?: { name: string }
  documents?: CompanyDocument[]
  enforcement_disclosure?: string
  available?: false
  reason?: string
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function DocumentCard({ doc }: { doc: CompanyDocument }) {
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E5E5E3' }}>
      <div className="px-5 py-4" style={{ borderBottom: doc.current ? '1px solid #F0F0EE' : undefined }}>
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h2
            className="text-[17px]"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
          >
            {doc.label}
          </h2>
          {doc.current ? (
            <span className="text-[11.5px]" style={{ color: 'var(--color-muted)' }}>
              version {doc.current.seq} · set by {doc.current.setByLabel} ·{' '}
              {formatWhen(doc.current.createdAt)}
            </span>
          ) : (
            <span className="text-[11.5px]" style={{ color: 'var(--color-muted)' }}>
              not supplied
            </span>
          )}
        </div>

        <p className="text-[13px] mt-1.5 max-w-[62ch]" style={{ color: 'var(--color-muted)' }}>
          {doc.blurb}
        </p>

        {/* Which stations it governs — a claim about our line, and qualified
            below by the disclosure that comes from the payload. */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
            Governs
          </span>
          {doc.governs.map((g) => (
            <span
              key={g}
              className="text-[11.5px] px-2 py-0.5 rounded"
              style={{ background: '#F5F5F3', color: '#4B4B48', border: '1px solid #E8E8E4' }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {doc.current ? (
        <div className="px-5 py-4">
          {doc.current.body ? (
            <pre
              className="text-[13px] leading-[1.6] whitespace-pre-wrap max-h-[220px] overflow-y-auto"
              style={{ color: '#2A2A2A', fontFamily: 'inherit' }}
            >
              {doc.current.body}
            </pre>
          ) : (
            <p className="text-[13px]" style={{ color: 'var(--color-muted)' }}>
              Supplied as a file.
            </p>
          )}

          {doc.current.note && (
            <p className="text-[12px] mt-3" style={{ color: 'var(--color-muted)' }}>
              {doc.current.note}
            </p>
          )}

          {doc.history.length > 0 && (
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid #F0F0EE' }}>
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                className="text-[12px] cursor-pointer"
                style={{ color: '#4B4B48' }}
              >
                {showHistory ? 'Hide' : 'Show'} {doc.history.length} earlier{' '}
                {doc.history.length === 1 ? 'version' : 'versions'}
              </button>

              {/* History is the point, not a nicety. If a station enforces a
                  style sheet, "which version governed this pass?" is the first
                  question an editor asks when they disagree with a correction.
                  Nothing here is ever edited or removed. */}
              {showHistory && (
                <ul className="mt-3 space-y-2">
                  {doc.history.map((v) => (
                    <li key={v.id} className="text-[12px]" style={{ color: 'var(--color-muted)' }}>
                      version {v.seq} · {v.title} · set by {v.setByLabel} ·{' '}
                      {formatWhen(v.createdAt)}
                      {v.note ? <> — {v.note}</> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="px-5 py-5">
          <p className="text-[13px] max-w-[62ch]" style={{ color: 'var(--color-muted)' }}>
            Your house has not supplied this yet. When it does, the version in
            force sits here and every earlier version stays on the record
            beneath it.
          </p>
        </div>
      )}
    </div>
  )
}

export default function PublisherCompanyPage() {
  const [payload, setPayload] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refusal, setRefusal] = useState<{ heading: string; body: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/publisher/company')
        // The caller's own seat decides which house this is, so both of these
        // are answers rather than failures — see the Lobby's note.
        if (res.status === 403) {
          if (!cancelled) {
            setRefusal({
              heading: 'You do not hold a seat in a publisher organisation',
              body:
                'This page belongs to one house, and which house it is comes from ' +
                'your own seat. Your account has no active seat, so there is nothing ' +
                'here to show you — and showing you another house instead would be ' +
                'the wrong answer rather than a helpful one.',
            })
          }
          return
        }
        if (res.status === 503) {
          // WE COULD NOT CHECK, which is ours and not theirs. Distinguished
          // from 403 because the two sentences are opposites and only one of
          // them is ever true at a time.
          const j = await res.json().catch(() => null)
          if (!cancelled) {
            setRefusal({
              heading: 'We could not check your seat just now',
              body:
                (typeof j?.message === 'string'
                  ? j.message
                  : 'Could not check your seat just now. This is our end, not yours.') +
                ' Nothing is wrong with your access — reload in a moment and it should answer.',
            })
          }
          return
        }
        if (res.status === 409) {
          const j = await res.json().catch(() => null)
          if (!cancelled) {
            setRefusal({
              heading: 'Which house are you looking at?',
              body:
                typeof j?.message === 'string'
                  ? j.message
                  : 'You hold a seat in more than one house and there is no way yet to choose between them.',
            })
          }
          return
        }
        if (!res.ok) throw new Error(`Unavailable (${res.status})`)
        const json = (await res.json()) as Payload
        if (!cancelled) setPayload(json)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const documents = payload?.documents ?? []
  const supplied = documents.filter((d) => d.current !== null).length

  return (
    <AppShell modeLabel="Publisher" firstName={payload?.organisation?.name}>
      <PublisherNav />
      <div className="flex-1 overflow-y-auto h-[calc(100vh-100px)]">
        <div className="max-w-[860px] mx-auto px-6 py-10">

          <div className="mb-7">
            <h1
              className="text-[32px] leading-tight mb-1.5"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
            >
              Your house
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--color-muted)' }}>
              {payload?.organisation?.name ?? '—'}
              {!loading && documents.length > 0 && (
                <> · {supplied} of {documents.length} documents supplied</>
              )}
            </p>
          </div>

          {loading && (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted)' }}>
              Reading your documents…
            </p>
          )}

          {error && (
            <div
              className="px-4 py-3 mb-4 rounded-md text-sm"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}
            >
              {error}
            </div>
          )}

          {/* A REFUSAL IS NOT A FAULT, so it is not drawn as one. Red means
              something is broken; "you hold no seat here" is the estate
              working. The Lobby carries the long form of this note. */}
          {refusal && (
            <div
              className="rounded-lg px-6 py-8 mb-4"
              style={{ background: '#FFFFFF', border: '1px dashed #D8D8D4' }}
            >
              <p
                className="text-[17px] mb-2"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
              >
                {refusal.heading}
              </p>
              <p className="text-[13.5px] max-w-xl" style={{ color: 'var(--color-muted)' }}>
                {refusal.body}
              </p>
            </div>
          )}


          {payload?.available === false && (
            <div
              className="px-4 py-3 mb-4 rounded-md text-sm"
              style={{ background: '#FEFCE8', border: '1px solid #FEF08A', color: '#854D0E' }}
            >
              The house-documents record is not in place on this environment yet.
            </div>
          )}

          {!loading && !error && documents.length > 0 && (
            <>
              <p className="text-[13.5px] mb-5 max-w-[68ch]" style={{ color: 'var(--color-muted)' }}>
                The standards your staff already work to. Held here once, versioned
                every time they change, so the question{' '}
                <em>which version governed this pass?</em> always has an answer.
              </p>

              <div className="space-y-4">
                {documents.map((d) => (
                  <DocumentCard key={d.kind} doc={d} />
                ))}
              </div>

              {/* From the payload, deliberately. */}
              {payload?.enforcement_disclosure && (
                <p
                  className="text-[12.5px] mt-6 px-4 py-3 rounded-md"
                  style={{ background: '#FAFAF9', border: '1px solid #EFEFEC', color: '#6B6B6B' }}
                >
                  {payload.enforcement_disclosure}
                </p>
              )}

              {/* No upload control: the write route does not exist. Said out
                  loud rather than left as a gap the eye has to explain. */}
              <p className="text-[12.5px] mt-3" style={{ color: 'var(--color-muted)' }}>
                Supplying and replacing documents from this screen is in build.
                Until then we load them for you.
              </p>
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
