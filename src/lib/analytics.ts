/**
 * Vercel Analytics event wrapper — type-safe event names + SSR-safe.
 *
 * Silently no-ops on the server (or if Vercel Analytics hasn't loaded yet).
 * Attaches first-touch UTM data from the `al_utm` cookie to every event so
 * downstream attribution is trivial.
 *
 * Related: MKT-004 Ask 3 / platform-response memo.
 *
 * Server-side events (Stripe webhook subscription_started / subscription_cancelled)
 * import `track` from `@vercel/analytics/server` directly — this wrapper is
 * client-only.
 *
 * TODO(free-analysis-completed): fire when the n8n workflow reports delivery
 * of the free-analysis report. Requires a callback from n8n back into the app
 * that isn't yet wired.
 */

import { track } from '@vercel/analytics'
import { readUtmCookie } from './utm'

export type AnalyticsEvent =
  | 'signup_started'
  | 'signup_completed'
  | 'manuscript_uploaded_first'
  | 'editor_session_started_first'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'free_analysis_submitted'
  | 'free_analysis_completed'

type EventProperty = string | number | boolean | null

export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, EventProperty>
): void {
  if (typeof window === 'undefined') return

  try {
    const utm = readUtmCookie()
    const utmProps: Record<string, EventProperty> = {}
    if (utm) {
      if (utm.utm_source) utmProps.utm_source = utm.utm_source
      if (utm.utm_medium) utmProps.utm_medium = utm.utm_medium
      if (utm.utm_campaign) utmProps.utm_campaign = utm.utm_campaign
      if (utm.utm_content) utmProps.utm_content = utm.utm_content
      if (utm.utm_term) utmProps.utm_term = utm.utm_term
      if (utm.first_touch_at) utmProps.first_touch_at = utm.first_touch_at
    }

    const merged: Record<string, EventProperty> = { ...utmProps, ...(properties ?? {}) }
    // `track` is safe to call before window.va exists — it queues internally,
    // but wrap in try/catch defensively anyway.
    track(event, merged)
  } catch (err) {
    // Never let analytics throw into product code.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[analytics] trackEvent failed:', err)
    }
  }
}
