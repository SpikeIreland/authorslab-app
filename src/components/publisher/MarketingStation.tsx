'use client'

// THE MARKETING STATION — publisher shell, High Line demo (marketing-hub lane).
//
// Brief (sysadmin RULING 2026-10-02 §6): Marketing Hub, simulated. Show only.
// R9 marker required.
//
// WHAT "SHOW ONLY" MEANS HERE, and why it is the right call rather than a
// limitation: the verb test (pivot §1.1) says that publisher-facing, the
// system may prepare, check, record, surface and hand off — it may NOT write,
// edit, design, publish or decide. A "Generate pack" button on this screen
// would be the system offering to write a publisher's jacket copy on demand,
// which is the exact claim the conflict ruling of 2026-09-30 settled against.
// So there is no generate control, no regenerate, no edit. The engine
// prepares; this surface surfaces.
//
// THE PLUMBING IS REAL. This reads the live engine
// (GET /api/projects/[id]/asset-pack — authorised by RLS can_read_manuscript,
// which admits a publisher's staff through org_memberships and imprint
// scoping). If a real pack exists for the book, the real pack renders. The
// sample is the FALLBACK, not the content, so the day the store lands and a
// pack is prepared, this screen shows it with no redesign.
//
// R9 IS CONDITIONAL ON THE DATA, DELIBERATELY. The ruling requires the marker
// on every simulated view; it does not require a marker on real data, and its
// own reasoning is that "the marker protects the true part". A banner reading
// "sample data, not your titles" hard-coded above a publisher's actual pack
// would be the inverse defect — a false disclosure, and the first one he
// catches teaches him to disregard the rest. So the marker is mounted when
// the data IS sample, which on demo day is always. Diverging from the letter
// of a ruling is couriered, not quietly done: see the 2026-10-02 note.
//
// TWO MARKS ON THIS SCREEN AND THEY ARE NOT THE SAME MARK:
//
//   R9 BANNER      is about the DATA  — these are not your titles.
//                  It comes off when the data is real.
//   DRAFT CHIP     is about the AUTHORITY — this prose was prepared by a
//                  machine for a person to rewrite. It is TRUE OF REAL PACKS
//                  TOO, and comes off only when a named person rewrites the
//                  text (DraftArtefact.rewrittenBy).
//
// They are kept visually and verbally distinct on purpose. If both read as
// "preview chrome", then the day the banner goes the draft chip looks like it
// went with it, and the system starts presenting machine prose as finished —
// which is the whole thing the mark exists to prevent.
//
// R7: the noun is Books. This component says "book" and takes `bookId`; the
// /projects URL spelling is left to the route that mounts it.
//
// MOUNTING (contract for `ux`): <MarketingStation bookId={…} bookTitle={…} />
// It renders its own R9 marker so no mounting surface can forget it.

import { useCallback, useEffect, useState } from 'react'
import SimulationMarker from '@/components/preview/SimulationMarker'
import type { AssetPack, DraftArtefact } from '@/app/api/projects/[id]/asset-pack/route'
import { SAMPLE_PACK, SAMPLE_BOOK_TITLE } from '@/lib/marketing/samplePack'

// The five prose artefacts, in the order a marketer meets them. Keyed to the
// engine's own `drafts` keys — a key the engine stops producing simply does
// not render, rather than rendering an empty card that implies a gap.
const DRAFT_ORDER: Array<{ key: string; label: string; note: string }> = [
  { key: 'jacket', label: 'Jacket copy', note: 'Back of jacket, 120–170 words' },
  { key: 'retailerShort', label: 'Retailer — short', note: 'Listing tile, ~50 words' },
  { key: 'retailerMedium', label: 'Retailer — standard', note: 'Product description, ~120 words' },
  { key: 'retailerLong', label: 'Retailer — long', note: 'Full page, ~250 words' },
  { key: 'salesSheet', label: 'Sales-sheet blurb', note: 'For a rep to read to a buyer' },
]

type Source =
  // The pack is this book's own, prepared by the engine.
  | { kind: 'real'; pack: AssetPack; generatedAt: string | null }
  // Sample shown because there is nothing real to show. `because` is carried
  // so the surface can say WHICH absence it is standing in for — a store that
  // is not deployed and a book with no pack yet are different facts, and
  // collapsing them is the defect shape this lane has now reported five times.
  | { kind: 'sample'; because: 'store_not_deployed' | 'no_pack_yet' }

type LoadState =
  | { phase: 'loading' }
  | { phase: 'ready'; source: Source }
  | { phase: 'refused'; message: string }
  | { phase: 'unavailable'; message: string }

const DATE_FMT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }

export default function MarketingStation({
  bookId,
  bookTitle,
}: {
  bookId: string
  bookTitle?: string
}) {
  const [state, setState] = useState<LoadState>({ phase: 'loading' })

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${bookId}/asset-pack`)
      const body = (await res.json().catch(() => ({}))) as {
        pack?: AssetPack | null
        generatedAt?: string | null
        error?: string
      }

      if (res.ok) {
        setState(
          body.pack
            ? { phase: 'ready', source: { kind: 'real', pack: body.pack, generatedAt: body.generatedAt ?? null } }
            : { phase: 'ready', source: { kind: 'sample', because: 'no_pack_yet' } },
        )
        return
      }

      // The engine names its states rather than forwarding Postgres strings,
      // so this surface can route on a name instead of a substring.
      if (body.error === 'store_not_deployed') {
        setState({ phase: 'ready', source: { kind: 'sample', because: 'store_not_deployed' } })
        return
      }
      if (res.status === 401 || res.status === 403 || res.status === 404) {
        setState({
          phase: 'refused',
          message:
            'This seat cannot read marketing for this book. Check the imprint scope on the People tab.',
        })
        return
      }
      setState({
        phase: 'unavailable',
        message: 'Could not read the marketing pack just now. This is our end, not yours.',
      })
    } catch {
      setState({
        phase: 'unavailable',
        message: 'Could not read the marketing pack just now. This is our end, not yours.',
      })
    }
  }, [bookId])

  useEffect(() => {
    void load()
  }, [load])

  if (state.phase === 'loading') {
    return (
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl px-6 py-8">
          <p className="text-sm text-stone-500">Reading the marketing pack…</p>
        </div>
      </section>
    )
  }

  if (state.phase === 'refused' || state.phase === 'unavailable') {
    return (
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl px-6 py-8">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            {state.message}
          </div>
        </div>
      </section>
    )
  }

  const { source } = state
  const isSample = source.kind === 'sample'
  const pack = isSample ? SAMPLE_PACK : source.pack
  const shownTitle = isSample ? SAMPLE_BOOK_TITLE : bookTitle
  const generatedAt = isSample ? SAMPLE_PACK.generatedAt : source.generatedAt

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* R9 — mounted only when the data is in fact sample. See the header. */}
      {isSample && (
        <SimulationMarker
          detail={
            source.because === 'store_not_deployed'
              ? 'Marketing packs are not stored yet, so this is a worked example on a sample book.'
              : 'No pack has been prepared for this book yet, so this is a worked example on a sample book.'
          }
        />
      )}

      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">
            Marketing{shownTitle ? ` — ${shownTitle}` : ''}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
            The slow half of a marketing pack, done before your marketer sits down:
            where the book sits, what it sits beside, and what readers of it search
            for. The prose below it is a first draft for them to rewrite — it says so
            about itself, and keeps saying so until one of your people puts their name
            to it.
          </p>
          {generatedAt && (
            <p className="mt-2 text-xs text-stone-500">
              Prepared {new Date(generatedAt).toLocaleDateString('en-GB', DATE_FMT)}
            </p>
          )}
        </header>

        {/* ── RESEARCH LEADS. Permitted outright by the verb test, and the half
            a publisher's marketer cannot do quickly. ─────────────────────── */}

        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Positioning
        </h2>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-base leading-relaxed text-stone-900">
            {pack.positioning.statement}
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Audience
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-stone-700">
                {pack.positioning.audience}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Why now
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-stone-700">
                {pack.positioning.whyNow}
              </dd>
            </div>
          </dl>
        </div>

        <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Comparable titles
        </h2>
        {pack.comps.length === 0 ? (
          <p className="text-sm text-stone-500">No comparables were identified.</p>
        ) : (
          <ul className="space-y-3">
            {pack.comps.map((c) => (
              <li
                key={`${c.title}-${c.author}`}
                className="rounded-lg border border-stone-200 bg-white p-4"
              >
                <p className="text-sm font-medium text-stone-900">
                  {c.title}
                  <span className="font-normal text-stone-600"> · {c.author}</span>
                  {c.publisher && (
                    <span className="font-normal text-stone-500"> · {c.publisher}</span>
                  )}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-stone-700">{c.why}</p>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Keyword metadata
        </h2>
        {pack.keywords.length === 0 ? (
          <p className="text-sm text-stone-500">No keywords were identified.</p>
        ) : (
          <ul className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white">
            {pack.keywords.map((k) => (
              <li key={k.term} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3">
                <span className="text-sm font-medium text-stone-900">{k.term}</span>
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-600">
                  {k.kind}
                </span>
                <span className="basis-full text-sm text-stone-600 sm:basis-auto sm:flex-1">
                  {k.note}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* ── DRAFTS. Each one wears its own mark, which is NOT the R9 mark. ── */}

        <h2 className="mb-1 mt-10 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Copy — drafts for your marketer
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-stone-600">
          Nothing here is finished copy, and the system will not call it finished.
          Each piece stays marked as a draft until one of your people rewrites it and
          their name goes on it.
        </p>

        <div className="space-y-4">
          {DRAFT_ORDER.map((spec) => {
            const artefact = pack.drafts[spec.key] as DraftArtefact | undefined
            if (!artefact) return null
            return (
              <article key={spec.key} className="rounded-lg border border-stone-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-5 py-3">
                  <div>
                    <h3 className="text-sm font-medium text-stone-900">{spec.label}</h3>
                    <p className="text-xs text-stone-500">{spec.note}</p>
                  </div>
                  <DraftMark artefact={artefact} />
                </div>
                <div className="space-y-3 px-5 py-4">
                  {artefact.text.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed text-stone-800">
                      {para}
                    </p>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

        {/* SHOW ONLY. No generate, no regenerate, no edit — see the header. The
            one thing worth saying is where the act lives instead, in the
            passive voice the verb test permits. */}
        <p className="mt-8 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
          Packs are prepared from the book&rsquo;s own pages, not from its title and
          genre. Rewriting a draft, and taking the draft mark off it, is a person&rsquo;s
          act and is recorded against their name.
        </p>
      </div>
    </section>
  )
}

// The authority mark. Slate, not amber: it must not read as part of the
// preview chrome, because it outlives the preview.
function DraftMark({ artefact }: { artefact: DraftArtefact }) {
  if (artefact.rewrittenBy) {
    return (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900">
        Rewritten by {artefact.rewrittenBy}
      </span>
    )
  }
  return (
    <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      Draft — prepared by {artefact.preparedBy}, for your marketer to rewrite
    </span>
  )
}
