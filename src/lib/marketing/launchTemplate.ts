// Launch plan template — shared by the Marketing tab page and the chat
// system prompt so Kai and the UI stay in sync.
//
// Milestones are defined as offsets in days from the writer's chosen launch
// date. Task IDs are stable strings; the database stores which IDs the
// writer has marked complete.

export interface LaunchTask {
  id: string
  label: string
}

export interface LaunchMilestone {
  id: string
  label: string
  daysOffset: number   // negative = before launch, 0 = launch day, positive = after
  tasks: LaunchTask[]
}

export const LAUNCH_TEMPLATE: LaunchMilestone[] = [
  {
    id: 'before-4w',
    daysOffset: -28,
    label: '4 weeks before',
    tasks: [
      { id: 'audience', label: 'Define target audience' },
      { id: 'email-list', label: 'Build email list' },
      { id: 'website', label: 'Set up author website' },
    ],
  },
  {
    id: 'before-2w',
    daysOffset: -14,
    label: '2 weeks before',
    tasks: [
      { id: 'arc-send', label: 'Send ARC to reviewers' },
      { id: 'announcement', label: 'Draft launch announcement' },
      { id: 'social-schedule', label: 'Schedule first 5 social posts' },
    ],
  },
  {
    id: 'launch-week',
    daysOffset: -7,
    label: 'Launch week',
    tasks: [
      { id: 'amazon-confirm', label: 'Confirm Amazon listing live' },
      { id: 'final-email', label: 'Final email to list' },
      { id: 'launch-blitz', label: 'Schedule launch day social blitz' },
      { id: 'podcast-confirm', label: 'Confirm podcast guest spot' },
    ],
  },
  {
    id: 'launch-day',
    daysOffset: 0,
    label: 'Launch day',
    tasks: [
      { id: 'launch-email', label: 'Send launch email to list' },
      { id: 'social-blitz', label: 'Post on all social channels' },
      { id: 'podcast-outreach', label: 'Outreach to remaining podcasts' },
    ],
  },
  {
    id: 'after-1w',
    daysOffset: 7,
    label: '1 week after',
    tasks: [
      { id: 'reviewer-followup', label: 'Follow up with reviewers' },
      { id: 'ads-launch', label: 'First Amazon ad campaign' },
    ],
  },
]

// Add days to an ISO date string and return a new Date.
export function addDays(launchDateIso: string, days: number): Date {
  const d = new Date(launchDateIso)
  d.setDate(d.getDate() + days)
  return d
}

// Status of a milestone given the launch date and "today".
// - 'done'     — the milestone date has passed
// - 'current'  — between this milestone and the next (or it's launch day today)
// - 'future'   — the milestone date is yet to come
export type MilestoneStatus = 'done' | 'current' | 'future'

export function milestoneStatus(
  launchDateIso: string,
  milestoneIdx: number,
  now: Date = new Date(),
): MilestoneStatus {
  const milestone = LAUNCH_TEMPLATE[milestoneIdx]
  if (!milestone) return 'future'

  const milestoneDate = addDays(launchDateIso, milestone.daysOffset)
  const next = LAUNCH_TEMPLATE[milestoneIdx + 1]
  const nextDate = next ? addDays(launchDateIso, next.daysOffset) : null

  // Compare by calendar day, not exact time.
  const dayMs = 24 * 60 * 60 * 1000
  const nowDay = Math.floor(now.getTime() / dayMs)
  const milestoneDay = Math.floor(milestoneDate.getTime() / dayMs)
  const nextDay = nextDate ? Math.floor(nextDate.getTime() / dayMs) : null

  if (nextDay !== null && nowDay >= nextDay) return 'done'
  if (nowDay >= milestoneDay) return 'current'
  return 'future'
}

// Format an ISO date as "12 May" or "12 May 2026" depending on year context.
export function formatMilestoneDate(launchDateIso: string, daysOffset: number): string {
  const d = addDays(launchDateIso, daysOffset)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

// "6 days to go", "Launch today", "Launched 3 days ago", etc.
export function launchCountdown(launchDateIso: string, now: Date = new Date()): string {
  const dayMs = 24 * 60 * 60 * 1000
  const launchDay = Math.floor(new Date(launchDateIso).getTime() / dayMs)
  const nowDay = Math.floor(now.getTime() / dayMs)
  const diff = launchDay - nowDay

  if (diff === 0) return 'Launch today'
  if (diff === 1) return 'Launch tomorrow'
  if (diff > 1) return `Launch in ${diff} days`
  if (diff === -1) return 'Launched yesterday'
  return `Launched ${Math.abs(diff)} days ago`
}
