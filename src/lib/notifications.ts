// ============================================================================
// notifications — reader-only helpers for the UCO notifications ledger
// (Dispatch DP-AS-04, per docs/sis/AuthorsLab-Dispatches-AS-Wave1.md)
//
// Design contract (from AL-PDC-DP04-SR and SysAdmin's schema response):
//   - The notifications table is the SINGLE SOURCE OF TRUTH (Clarence UCO C1).
//     In-app bell and email (future) are two lenses over the same row.
//   - INSERTS come from DB triggers on as_journeys. This file provides ONLY
//     read + mark-read. Any INSERT surface would violate one-truth.
//   - Filter on user_id = auth.uid() directly (not author_profiles.id).
//   - Mark-read sets BOTH is_read = true AND read_at = now().
//   - Zero LLM-generated content — templates are inline SQL literals in the
//     triggers, verified in DP-AS-04 E3.
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js'

// ---------- Types ----------

export type NotificationPriority = 'normal' | 'high'

export interface Notification {
  id: string
  user_id: string
  manuscript_id: string | null
  journey_id: string | null
  template_id: string | null
  type: string          // e.g. 'analysis_update'
  category: string      // e.g. 'author_studio'
  priority: NotificationPriority
  title: string
  message: string
  action_url: string | null
  action_label: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

// ---------- Read helpers ----------

/**
 * List unread notifications for the current authenticated user, newest first.
 * Uses the partial index on (user_id, created_at DESC) WHERE is_read = false.
 */
export async function listUnreadForCurrentUser(
  supabase: SupabaseClient,
): Promise<Notification[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('listUnreadForCurrentUser failed:', error.message)
    return []
  }
  return (data ?? []) as Notification[]
}

/**
 * List the N most recent notifications (read + unread) for the current user.
 * Used by the bell's opened panel to show recent history.
 */
export async function listRecentForCurrentUser(
  supabase: SupabaseClient,
  limit = 20,
): Promise<Notification[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('listRecentForCurrentUser failed:', error.message)
    return []
  }
  return (data ?? []) as Notification[]
}

/**
 * Count unread for the current user — cheaper than fetching rows when the
 * bell only needs the badge number.
 */
export async function countUnreadForCurrentUser(
  supabase: SupabaseClient,
): Promise<number> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return 0

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('countUnreadForCurrentUser failed:', error.message)
    return 0
  }
  return count ?? 0
}

// ---------- Mark-read helpers ----------

/**
 * Mark one notification read. Sets BOTH is_read and read_at per SysAdmin's
 * DP-AS-04 §5 note ("set both when marking read").
 * RLS constrains the update to notifications belonging to the current user.
 */
export async function markRead(
  supabase: SupabaseClient,
  notification_id: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notification_id)
    .eq('is_read', false)   // idempotency guard — no-op if already read

  if (error) {
    console.error('markRead failed:', error.message)
    return false
  }
  return true
}

/**
 * Mark all currently-unread notifications for the current user as read.
 * Uses a single UPDATE — no per-row round-trips.
 */
export async function markAllRead(
  supabase: SupabaseClient,
): Promise<boolean> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return false

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('markAllRead failed:', error.message)
    return false
  }
  return true
}

// ---------- Display helpers ----------

/**
 * "just now" / "3 min ago" / "2 h ago" / "yesterday" / "12 May" — cheap
 * localised time-ago for the bell panel. Not internationalised beyond
 * en-GB date formatting.
 */
export function formatTimeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime()
  const diffMs = now.getTime() - then
  const s = Math.floor(diffMs / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)

  if (s < 30) return 'just now'
  if (m < 1) return `${s}s ago`
  if (m < 60) return `${m} min ago`
  if (h < 24) return `${h} h ago`
  if (d === 1) return 'yesterday'
  if (d < 7) return `${d} days ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
