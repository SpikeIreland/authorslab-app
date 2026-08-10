/**
 * UTM attribution helpers.
 *
 * Stores first-touch UTM parameters in a client-readable cookie (`al_utm`)
 * so we can attach them to signup events + persist to author_profiles.
 *
 * Capture is done by middleware on any request carrying utm_* params — but
 * ONLY if the cookie is absent (first-touch attribution — never overwrite).
 *
 * Related: MKT-004 Ask 3 / platform-response memo.
 */

export type UtmData = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  first_touch_at?: string
}

export const UTM_COOKIE_NAME = 'al_utm'
export const UTM_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90 // 90 days

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

/**
 * Extract the five utm_* params from a URL (or URL string).
 * Returns an empty object if none are present.
 */
export function parseUtmFromUrl(url: string | URL): Record<string, string> {
  const parsed = typeof url === 'string' ? new URL(url) : url
  const out: Record<string, string> = {}
  for (const key of UTM_KEYS) {
    const value = parsed.searchParams.get(key)
    if (value && value.trim().length > 0) {
      out[key] = value.trim()
    }
  }
  return out
}

/**
 * Client-side cookie read. Returns null on server, when the cookie is
 * missing, or when parsing fails.
 */
export function readUtmCookie(): UtmData | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie ? document.cookie.split('; ') : []
  const target = cookies.find(c => c.startsWith(`${UTM_COOKIE_NAME}=`))
  if (!target) return null
  const raw = target.slice(UTM_COOKIE_NAME.length + 1)
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as UtmData
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

/**
 * Client-side cookie write. No-op on server.
 * 90-day expiry, SameSite=Lax, path /. Not HttpOnly (needs to be readable
 * from JS at signup).
 */
export function writeUtmCookie(data: UtmData): void {
  if (typeof document === 'undefined') return
  const encoded = encodeURIComponent(JSON.stringify(data))
  document.cookie = `${UTM_COOKIE_NAME}=${encoded}; Max-Age=${UTM_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`
}
