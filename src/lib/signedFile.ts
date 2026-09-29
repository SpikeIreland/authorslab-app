/**
 * One-line adoption of the shared signed-URL route, so no reader in the estate
 * needs to hold a storage URL or know a bucket name.
 *
 * Built by `publishing` (2026-09-29) because reader adoption — not the data
 * migration — is the last gate on making `manuscript-reports` and
 * `manuscript-versions` private (`sysadmin`, same day). Every reader that today
 * does `window.open(row.some_pdf_url)` can become `openSignedFile(...)` without
 * changing its data fetch: the column it already reads stays where it is, and
 * the route parses the bucket and path back out of whatever shape it holds.
 *
 * Signed URLs expire (one hour), so a link must be fetched at the moment of use
 * rather than rendered into an href when the page loads. `openSignedFile` is
 * therefore the primary helper: it signs on click.
 */

export type SignedFileKind = 'docx' | 'pdf' | 'report' | 'plan' | 'version'

export type SignedFileOptions = {
  /** `report` only — 1 = Alex, 2 = Sam, 3 = Jordan. Defaults to 1. */
  phase?: number
  /** `version` only — the `manuscript_versions.id` to open. Required for that kind. */
  versionId?: string
}

export type SignedFileResult =
  | { ok: true; url: string; expiresInSeconds: number }
  | { ok: false; reason: 'not_generated' | 'forbidden' | 'error'; status: number }

function buildQuery(kind: SignedFileKind, opts: SignedFileOptions): string {
  const params = new URLSearchParams({ kind })
  if (kind === 'report' && opts.phase !== undefined) params.set('phase', String(opts.phase))
  if (kind === 'version' && opts.versionId) params.set('versionId', opts.versionId)
  return params.toString()
}

/** Ask the server for a fresh signed URL. Never throws; returns a reason. */
export async function getSignedFileUrl(
  projectId: string,
  kind: SignedFileKind,
  opts: SignedFileOptions = {}
): Promise<SignedFileResult> {
  try {
    const res = await fetch(`/api/projects/${projectId}/files?${buildQuery(kind, opts)}`)
    if (!res.ok) {
      const reason =
        res.status === 404 ? 'not_generated' : res.status === 401 ? 'forbidden' : 'error'
      return { ok: false, reason, status: res.status }
    }
    const json = (await res.json()) as { url?: string; expiresInSeconds?: number }
    if (!json.url) return { ok: false, reason: 'error', status: res.status }
    return { ok: true, url: json.url, expiresInSeconds: json.expiresInSeconds ?? 0 }
  } catch {
    return { ok: false, reason: 'error', status: 0 }
  }
}

/**
 * Sign, then open in a new tab. The drop-in replacement for
 * `window.open(row.some_pdf_url, '_blank')`.
 *
 * Returns the result so a caller can surface a real message instead of a tab
 * that silently fails to open — a button that opens nothing is the affordance
 * problem the house rule is about.
 */
export async function openSignedFile(
  projectId: string,
  kind: SignedFileKind,
  opts: SignedFileOptions = {}
): Promise<SignedFileResult> {
  const result = await getSignedFileUrl(projectId, kind, opts)
  if (result.ok) window.open(result.url, '_blank', 'noopener,noreferrer')
  return result
}
