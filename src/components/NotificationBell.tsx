'use client'

// ============================================================================
// NotificationBell — UCO in-app surface for the notifications ledger
// (Dispatch DP-AS-04, per docs/sis/AuthorsLab-Dispatches-AS-Wave1.md)
//
// - Reads the notifications table via reader helpers (never inserts)
// - Subscribes to realtime changes for the current user's rows
// - Shows unread count as a small badge on the bell icon
// - Click opens a panel with recent notifications (up to 20)
// - Click a notification: marks read and optionally navigates to action_url
// - "Mark all read" clears the panel's unread state
//
// All copy is deterministic — no LLM content anywhere in this surface (E3).
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  type Notification,
  countUnreadForCurrentUser,
  listRecentForCurrentUser,
  markAllRead,
  markRead,
  formatTimeAgo,
} from '@/lib/notifications'

interface Props {
  // Optional visual variant — the studio's dark header may need a light bell,
  // while the project shell's white header needs a dark bell. Default is dark.
  variant?: 'dark' | 'light'
}

export function NotificationBell({ variant = 'dark' }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [userId, setUserId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [recent, setRecent] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)

  // Resolve current user once.
  useEffect(() => {
    let cancelled = false
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!cancelled) setUserId(user?.id ?? null)
    })
    return () => { cancelled = true }
  }, [supabase])

  // Initial unread count + realtime subscription.
  useEffect(() => {
    if (!userId) return

    let cancelled = false

    countUnreadForCurrentUser(supabase).then(n => {
      if (!cancelled) setUnreadCount(n)
    })

    // Realtime: any change to this user's notifications refreshes the badge.
    // Filter on user_id per SysAdmin's schema response note (not author_id).
    const channel = supabase
      .channel(`notifications-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Cheap re-count. Refresh recent list too if the panel is open.
          countUnreadForCurrentUser(supabase).then(n => {
            if (!cancelled) setUnreadCount(n)
          })
          if (open) {
            listRecentForCurrentUser(supabase, 20).then(rows => {
              if (!cancelled) setRecent(rows)
            })
          }
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [supabase, userId, open])

  // Load recent list whenever the panel opens.
  useEffect(() => {
    if (!open || !userId) return
    setLoading(true)
    listRecentForCurrentUser(supabase, 20).then(rows => {
      setRecent(rows)
      setLoading(false)
    })
  }, [open, userId, supabase])

  // Close the panel when clicking outside.
  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    // Register after a tick so the same click that opened the panel doesn't
    // immediately close it.
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Click a notification: mark read (optimistic), then optionally navigate.
  const handleNotificationClick = useCallback(async (n: Notification) => {
    if (!n.is_read) {
      // Optimistic UI update
      setRecent(prev => prev.map(r => r.id === n.id ? { ...r, is_read: true, read_at: new Date().toISOString() } : r))
      setUnreadCount(c => Math.max(0, c - 1))
      await markRead(supabase, n.id)
    }
    if (n.action_url) {
      setOpen(false)
      router.push(n.action_url)
    }
  }, [supabase, router])

  const handleMarkAllRead = useCallback(async () => {
    // Optimistic
    setRecent(prev => prev.map(r => r.is_read ? r : { ...r, is_read: true, read_at: new Date().toISOString() }))
    setUnreadCount(0)
    await markAllRead(supabase)
  }, [supabase])

  // Don't render at all if there's no authenticated user (avoids showing a
  // bell on the login/marketing pages if this component ever gets mounted
  // in a shared layout).
  if (!userId) return null

  const bellColour = variant === 'light' ? '#ffffff' : '#0f172a'
  const badgeShown = unreadCount > 0

  return (
    <div ref={panelRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={badgeShown ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
      >
        {/* Bell icon — inline SVG so we don't need a new icon dep */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={bellColour} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {badgeShown && (
          <span
            className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-red-600 text-white text-[10px] font-medium flex items-center justify-center leading-none"
            aria-hidden
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 flex flex-col"
          role="dialog"
          aria-label="Notifications"
          style={{ maxHeight: 'min(420px, calc(100vh - 80px))' }}
        >
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-xs text-slate-500">Loading…</p>
            ) : recent.length === 0 ? (
              <p className="px-4 py-6 text-xs text-slate-500">
                You&rsquo;re all caught up.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map(n => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${n.is_read ? '' : 'bg-blue-50/50'}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.is_read && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${n.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`}
                            aria-label={n.priority === 'high' ? 'High priority unread' : 'Unread'}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${n.is_read ? 'text-slate-700' : 'text-slate-900 font-medium'} truncate`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[11px] text-slate-400">
                              {formatTimeAgo(n.created_at)}
                            </span>
                            {n.action_label && n.action_url && (
                              <span className="text-[11px] text-blue-600 font-medium">
                                {n.action_label} →
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
