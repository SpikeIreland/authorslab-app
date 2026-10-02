'use client'

// THE DESIGN STATION — publisher shell, High Line demo (design lane).
//
// Brief (sysadmin RULING 2026-10-02 §6): Design tab, simulated; language
// addressed to a PROFESSIONAL DESIGNER, not an author; no Photoshop/Adobe
// integration and no implication of one; the cover intake engine is the
// foundation; R9 marker required.
//
// WHAT IS REAL AND WHAT IS SAMPLE. The plumbing is real: this component
// reads and writes the live cover intake engine
// (/api/publisher/projects/[id]/covers/intake — membership-gated, versioned,
// attributed). The DATA on a demo book is seeded, and the R9 marker says so.
// Simulation here means staged records, never painted controls — every
// control on this surface does what it claims or is not shown (affordance
// rule; the Company tab's deliberately absent upload button is the
// precedent).
//
// NO AI STATION ON THIS SURFACE. Taylor does not appear — no persona, no
// gold token, no "generate" control. On the trade side the designer is the
// supply and the intake is the product; a human's work is never filed under
// an AI station, and this screen is the place that promise is kept visibly.
//
// R7: the noun is Books. This component says "book", takes `bookId`, and
// leaves the /projects URL spelling to the route that mounts it (the URL is
// not the vocabulary).
//
// MOUNTING. Owned surface-wise by the shell (`ux`) — mount contract in the
// 2026-10-02 courier: <DesignStation bookId={…} bookTitle={…} />. It renders
// its own R9 marker so no mounting surface can forget it.
//
// ONE ROOM (publisher ruling, 2026-10-02 §5): supply and decision share a
// screen so an approval is never made one click away from the thing being
// approved. The seam is SUPPLY vs DECISION — everything up to "here is
// version 3, supplied by <name> on <date>" is this pane; the one control
// that says approved / revisions-requested is `publisher`'s, mounted through
// `renderApproval`. The render-prop receives the CURRENT asset, so the
// control is bound to the exact version on screen and cannot be rendered
// against a stale one. This component never renders an approval control of
// its own — a pane that supplied the artwork must not also sign for it.

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import SimulationMarker from '@/components/preview/SimulationMarker'

export interface SuppliedAsset {
  id: string
  url: string | null
  storagePath: string
  origin: string
  suppliedBy: { membershipId: string | null; label: string | null }
  supersedesAssetId: string | null
  rightsConfirmed: boolean
  createdAt: string
  isCurrent: boolean
}

type LoadState =
  | { phase: 'loading' }
  | { phase: 'ready'; assets: SuppliedAsset[]; isDemo: boolean }
  // The two refusals a seat can meet, kept distinct (403 is about the
  // person, 503/500 is about us) — a surface reports state, not intent.
  | { phase: 'refused'; message: string }
  | { phase: 'unavailable'; message: string }

const DATE_FMT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }

export default function DesignStation({
  bookId,
  bookTitle,
  renderApproval,
}: {
  bookId: string
  bookTitle?: string
  /** `publisher`'s decision control, rendered beneath the current cover and
   *  bound to it. Receives the current asset (null when nothing is filed) —
   *  the control decides; this pane only supplies. */
  renderApproval?: (current: SuppliedAsset | null) => ReactNode
}) {
  const [state, setState] = useState<LoadState>({ phase: 'loading' })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [rightsConfirmed, setRightsConfirmed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/publisher/projects/${bookId}/covers/intake`)
      if (res.ok) {
        const data = (await res.json()) as { assets: SuppliedAsset[]; isDemo?: boolean }
        setState({ phase: 'ready', assets: data.assets, isDemo: data.isDemo === true })
        return
      }
      const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
      if (res.status === 403 || res.status === 409) {
        setState({
          phase: 'refused',
          message:
            body.message ??
            'This seat cannot file artwork for this book. Check the imprint scope on the People tab.',
        })
      } else {
        setState({
          phase: 'unavailable',
          message: 'Could not read the artwork record just now. This is our end, not yours.',
        })
      }
    } catch {
      setState({
        phase: 'unavailable',
        message: 'Could not read the artwork record just now. This is our end, not yours.',
      })
    }
  }, [bookId])

  useEffect(() => {
    void load()
  }, [load])

  const current =
    state.phase === 'ready' ? state.assets.find((a) => a.isCurrent) ?? null : null
  const history =
    state.phase === 'ready' ? state.assets.filter((a) => !a.isCurrent) : []

  async function handleUpload(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const form = new FormData()
      form.set('file', file)
      form.set('rightsConfirmed', 'true')
      // A new upload supersedes the current version by default — versioning
      // is a chain, and nothing is destroyed.
      if (current) form.set('supersedes', current.id)
      const res = await fetch(`/api/publisher/projects/${bookId}/covers/intake`, {
        method: 'POST',
        body: form,
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
        setUploadError(body.message ?? body.error ?? 'The upload was not recorded.')
      } else {
        setRightsConfirmed(false)
        if (fileRef.current) fileRef.current.value = ''
        await load()
      }
    } catch {
      setUploadError('The upload could not be sent. Nothing was recorded.')
    } finally {
      setUploading(false)
    }
  }

  // R9 AS AMENDED (2026-10-02, publisher's correction ruled): marking is PER
  // ROW from manuscripts.is_demo, and a marker over a publisher's real book
  // "disclaims work that did" — it teaches them to ignore markers. This view
  // shows ONE book, so the mix collapses to one bit: a seeded book wears the
  // ruled sentence; a real book wears NOTHING AT ALL; and while we do not yet
  // know, we claim nothing. Normalisation of the mark across stations is
  // marketing-hub's to propose (AMENDMENT 2 §4) — this stays on the shared
  // component so their proposal lands in one place.
  const showMarker = state.phase === 'ready' && state.isDemo

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {showMarker ? (
        <SimulationMarker detail="Uploads on this screen file into the live, versioned record." />
      ) : null}

      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">
            Cover artwork{bookTitle ? ` — ${bookTitle}` : ''}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
            Your designers keep their own tools. AuthorsLab gives their work somewhere
            to live: every version of this book&rsquo;s cover, filed under the person
            who supplied it, with nothing overwritten and nothing lost.
          </p>
        </header>

        {state.phase === 'loading' && (
          <p className="text-sm text-stone-500">Reading the artwork record…</p>
        )}

        {state.phase === 'refused' && (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            {state.message}
          </div>
        )}

        {state.phase === 'unavailable' && (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            {state.message}
          </div>
        )}

        {state.phase === 'ready' && (
          <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            {/* Current cover */}
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                Current cover
              </h2>
              {current ? (
                <figure>
                  <div className="overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm">
                    {current.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={current.url}
                        alt={`Current cover artwork${bookTitle ? ` for ${bookTitle}` : ''}`}
                        className="block w-full"
                      />
                    ) : (
                      <div className="flex aspect-[2/3] items-center justify-center p-6 text-center text-sm text-stone-500">
                        The record exists but the image could not be fetched just now.
                      </div>
                    )}
                  </div>
                  <figcaption className="mt-2 text-sm text-stone-600">
                    {/* Station-mark rule: a name only where one was captured. The
                        intake engine guarantees a supplier on every supplied
                        asset, but this surface still refuses to invent one. */}
                    {current.suppliedBy.label ? (
                      <>
                        Filed by{' '}
                        <span className="font-medium text-stone-800">
                          {current.suppliedBy.label}
                        </span>
                      </>
                    ) : (
                      <span>Supplier not recorded</span>
                    )}
                    {' · '}
                    {new Date(current.createdAt).toLocaleDateString('en-GB', DATE_FMT)}
                  </figcaption>
                </figure>
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-sm text-stone-500">
                  No artwork has been filed for this book yet. The first upload
                  becomes the current cover.
                </div>
              )}
              {renderApproval ? (
                <div className="mt-4">{renderApproval(current)}</div>
              ) : null}
            </div>

            {/* Upload + history */}
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                File a new version
              </h2>
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <p className="text-sm text-stone-600">
                  JPEG, PNG or WebP, up to 20MB.{' '}
                  {current
                    ? 'It will supersede the current cover; every earlier version stays on record.'
                    : 'It will be recorded as version one.'}
                </p>
                <label className="mt-3 flex items-start gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={rightsConfirmed}
                    onChange={(e) => setRightsConfirmed(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>The house holds the rights to this artwork.</span>
                </label>
                <div className="mt-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={!rightsConfirmed || uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) void handleUpload(f)
                    }}
                    className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-800 file:px-3 file:py-1.5 file:text-sm file:text-white file:disabled:bg-stone-300"
                  />
                  {!rightsConfirmed && (
                    <p className="mt-1 text-xs text-stone-500">
                      Confirm the rights above to enable the upload.
                    </p>
                  )}
                </div>
                {uploading && (
                  <p className="mt-2 text-sm text-stone-500">Filing the upload…</p>
                )}
                {uploadError && (
                  <p className="mt-2 text-sm text-rose-700">{uploadError}</p>
                )}
              </div>

              <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-stone-500">
                Version history
              </h2>
              {history.length === 0 ? (
                <p className="text-sm text-stone-500">
                  {current
                    ? 'One version on record — nothing has been superseded.'
                    : 'Nothing on record yet.'}
                </p>
              ) : (
                <ul className="space-y-3">
                  {history.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-2"
                    >
                      <div className="h-16 w-11 shrink-0 overflow-hidden rounded bg-stone-100">
                        {a.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.url}
                            alt="Superseded cover version"
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 text-sm text-stone-600">
                        <p>
                          {a.suppliedBy.label ? (
                            <>
                              Filed by{' '}
                              <span className="font-medium text-stone-800">
                                {a.suppliedBy.label}
                              </span>
                            </>
                          ) : (
                            <span>Supplier not recorded</span>
                          )}
                        </p>
                        <p className="text-xs text-stone-500">
                          {new Date(a.createdAt).toLocaleDateString('en-GB', DATE_FMT)} ·
                          superseded
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
