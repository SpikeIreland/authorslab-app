import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Shared signed-URL resolver for an author's own stored artefacts.
 *
 * Assigned to `publishing` by `sysadmin` (2026-09-29) as shared infrastructure,
 * so that the storage buckets can stop being public. Pattern lifted from
 * `design`'s two existing signed-URL routes rather than invented:
 * `api/projects/[id]/design/assets` and `api/publisher/projects/[id]/covers`.
 *
 * ── Why the caller cannot name a bucket or a path ────────────────────────────
 * A generic "sign whatever I ask for" endpoint is an object-store traversal
 * waiting to happen. Here the client names a KIND. The server resolves that
 * kind to a location out of a row it has already ownership-checked, so the only
 * objects reachable are ones this author's own rows point at.
 *
 * ── Why it accepts legacy public URLs ────────────────────────────────────────
 * 37 rows across four columns currently persist full `/object/public/…` URLs
 * (counted by `sysadmin`, 2026-09-29). Those stop resolving the moment their
 * bucket goes private. Rather than gate the flip on migrating them,
 * `resolveLocation` reads EITHER shape — a `{bucket, path}` object or a legacy
 * public URL it parses the path back out of — and signs either. That means a
 * bucket can be made private BEFORE the columns are cleaned up, and the cleanup
 * becomes tidying rather than a blocker.
 */

const SIGNED_URL_TTL_SECONDS = 60 * 60 // one hour; these are downloads, not embeds

type Location = { bucket: string; path: string }

/** Kinds a caller may ask for, and where each one lives. */
const KINDS = ['docx', 'pdf', 'report', 'plan'] as const
type Kind = (typeof KINDS)[number]

function isKind(v: string | null): v is Kind {
  return v !== null && (KINDS as readonly string[]).includes(v)
}

/**
 * Accepts what our columns actually hold today:
 *   - `{ bucket, path }`            — what 6.1 writes now
 *   - `"https://…/object/public/<bucket>/<path>"` — legacy, 37 rows
 *   - `"https://…/object/sign/<bucket>/<path>?…"` — an already-signed URL
 * Anything else resolves to null and is treated as "not generated yet".
 */
export function resolveLocation(value: unknown): Location | null {
  if (!value) return null

  if (typeof value === 'object') {
    const o = value as Record<string, unknown>
    if (typeof o.bucket === 'string' && typeof o.path === 'string' && o.bucket && o.path) {
      return { bucket: o.bucket, path: o.path }
    }
    // Legacy objects that only carried a url.
    if (typeof o.url === 'string') return resolveLocation(o.url)
    return null
  }

  if (typeof value === 'string') {
    const m = value.match(/\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?|$)/)
    if (!m) return null
    return { bucket: m[1], path: decodeURIComponent(m[2]) }
  }

  return null
}

// GET /api/projects/[id]/files?kind=docx|pdf|report|plan
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const kind = req.nextUrl.searchParams.get('kind')

  if (!isKind(kind)) {
    return NextResponse.json(
      { error: 'invalid_kind', allowed: KINDS },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Ownership, stated rather than assumed. RLS scopes these reads too, but an
  // explicit check turns "forbidden" into 404 rather than an empty result that
  // reads like "not generated yet".
  const { data: profile } = await supabase
    .from('author_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) {
    return NextResponse.json({ error: 'no_profile' }, { status: 401 })
  }

  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('id', id)
    .eq('author_id', profile.id)
    .single()
  if (!manuscript) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }

  // Resolve the kind to a location out of this author's own rows.
  let location: Location | null = null

  if (kind === 'docx' || kind === 'pdf' || kind === 'plan') {
    const { data: progress } = await supabase
      .from('publishing_progress')
      .select('formatted_files, plan_pdf_url')
      .eq('manuscript_id', id)
      .maybeSingle()

    if (kind === 'plan') {
      location = resolveLocation(progress?.plan_pdf_url)
    } else {
      const files = (progress?.formatted_files ?? {}) as Record<string, unknown>
      location = resolveLocation(files[kind])
    }
  }

  if (kind === 'report') {
    // Phase-1 editorial report. Column still holds a legacy public URL on every
    // existing row; resolveLocation copes with both shapes.
    const { data: phase } = await supabase
      .from('editing_phases')
      .select('report_pdf_url')
      .eq('manuscript_id', id)
      .eq('phase_number', 1)
      .maybeSingle()
    location = resolveLocation(phase?.report_pdf_url)
  }

  if (!location) {
    return NextResponse.json({ error: 'not_generated', kind }, { status: 404 })
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(location.bucket)
    .createSignedUrl(location.path, SIGNED_URL_TTL_SECONDS)

  if (signError || !signed?.signedUrl) {
    return NextResponse.json(
      { error: signError?.message ?? 'sign_failed', kind },
      { status: 500 }
    )
  }

  return NextResponse.json({
    kind,
    bucket: location.bucket,
    path: location.path,
    url: signed.signedUrl,
    expiresInSeconds: SIGNED_URL_TTL_SECONDS,
  })
}
