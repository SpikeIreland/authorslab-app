'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  LAUNCH_TEMPLATE,
  formatMilestoneDate,
  launchCountdown,
  milestoneStatus,
} from '@/lib/marketing/launchTemplate'

// ============================================================================
// Types
// ============================================================================

interface MarketingMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

type SectionId = 'audience' | 'pitch' | 'launch-plan' | 'content' | 'reviews' | 'performance'

const SECTIONS: Array<{ id: SectionId; label: string; available: boolean }> = [
  { id: 'audience', label: 'Audience', available: false },
  { id: 'pitch', label: 'Pitch', available: false },
  { id: 'launch-plan', label: 'Launch plan', available: true },
  { id: 'content', label: 'Content', available: false },
  { id: 'reviews', label: 'Reviews', available: false },
  { id: 'performance', label: 'Performance', available: false },
]

// ============================================================================
// Page
// ============================================================================

export default function MarketingTabPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id

  const [section, setSection] = useState<SectionId>('launch-plan')

  // Marketing state
  const [launchDate, setLaunchDate] = useState<string | null>(null)
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])
  const [stateLoading, setStateLoading] = useState(true)

  // Chat state
  const [messages, setMessages] = useState<MarketingMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load marketing state and chat history on mount.
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [stateRes, msgRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/marketing/state`),
          fetch(`/api/projects/${projectId}/marketing/messages`),
        ])

        if (!cancelled && stateRes.ok) {
          const json = await stateRes.json() as { launchDate: string | null; completedTaskIds: string[] }
          setLaunchDate(json.launchDate)
          setCompletedTaskIds(json.completedTaskIds)
        }
        if (!cancelled && msgRes.ok) {
          const json = await msgRes.json() as { messages: MarketingMessage[] }
          setMessages(json.messages)
        }
      } finally {
        if (!cancelled) {
          setStateLoading(false)
          setMessagesLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [projectId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  // Save launch date.
  const saveLaunchDate = useCallback(async (next: string | null) => {
    const previous = launchDate
    setLaunchDate(next)
    try {
      const res = await fetch(`/api/projects/${projectId}/marketing/state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ launchDate: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setLaunchDate(previous)
    }
  }, [projectId, launchDate])

  // Toggle a task's completed state.
  const toggleTask = useCallback(async (taskId: string) => {
    const currentlyDone = completedTaskIds.includes(taskId)
    const next = currentlyDone
      ? completedTaskIds.filter(id => id !== taskId)
      : [...completedTaskIds, taskId]

    const previous = completedTaskIds
    setCompletedTaskIds(next)   // optimistic

    try {
      const res = await fetch(`/api/projects/${projectId}/marketing/state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedTaskIds: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setCompletedTaskIds(previous)
    }
  }, [projectId, completedTaskIds])

  // Send a message to Kai.
  const sendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setSendError(null)

    const tempUser: MarketingMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUser])
    setInput('')

    try {
      const res = await fetch(`/api/projects/${projectId}/marketing/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(errBody.error || `request failed (${res.status})`)
      }

      const json = await res.json() as { reply: string }
      setMessages(prev => [...prev, {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: json.reply,
        created_at: new Date().toISOString(),
      }])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setSendError(message)
      setMessages(prev => prev.filter(m => m.id !== tempUser.id))
      setInput(text)
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [projectId, input, sending])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  const completedSet = useMemo(() => new Set(completedTaskIds), [completedTaskIds])

  return (
    <div className="h-full flex min-h-[480px]">

      {/* Sections panel */}
      <aside className="w-44 border-r border-slate-200 bg-slate-50 flex flex-col">
        <p className="px-3 pt-3 pb-2 text-[10px] uppercase tracking-wider font-medium text-slate-400">
          Sections
        </p>
        <nav className="flex flex-col gap-0.5 px-1.5">
          {SECTIONS.map(s => {
            const isActive = section === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`text-left text-sm px-2.5 py-1.5 rounded-md flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-white border border-slate-200 text-slate-900 font-medium'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                <span>{s.label}</span>
                {!s.available && (
                  <span className="text-[10px] text-slate-400 italic">soon</span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Center panel */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {section === 'launch-plan' && (
          <LaunchPlanSection
            loading={stateLoading}
            launchDate={launchDate}
            completedSet={completedSet}
            onSaveLaunchDate={saveLaunchDate}
            onToggleTask={toggleTask}
          />
        )}
        {section !== 'launch-plan' && (
          <SectionPlaceholder sectionId={section} />
        )}
      </main>

      {/* Kai chat panel */}
      <aside className="w-72 border-l border-slate-200 flex flex-col bg-white">
        <header className="px-3 py-3 border-b border-slate-200 flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ background: '#D85A30' }}
          >
            R
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 leading-tight">Kai</p>
            <p className="text-[11px] text-slate-500">Marketing</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {messagesLoading ? (
            <p className="text-xs text-slate-500">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              Tell Kai what you&rsquo;re working on. Ask which tasks matter most this week, what to skip, or how to write your launch announcement.
            </p>
          ) : (
            messages.map(m => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[90%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-3 py-2 inline-flex gap-1">
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {sendError && (
          <div className="px-3 py-2 bg-rose-50 border-t border-rose-200 text-xs text-rose-800">
            {sendError}
          </div>
        )}

        <form onSubmit={sendMessage} className="border-t border-slate-200 p-2.5">
          <div className="flex items-end gap-1.5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply to Kai…"
              rows={2}
              disabled={sending}
              className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-md text-xs resize-none focus:outline-none focus:border-slate-500 disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-medium rounded-md"
            >
              Send
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}

// ============================================================================
// Launch plan section
// ============================================================================

function LaunchPlanSection({
  loading,
  launchDate,
  completedSet,
  onSaveLaunchDate,
  onToggleTask,
}: {
  loading: boolean
  launchDate: string | null
  completedSet: Set<string>
  onSaveLaunchDate: (next: string | null) => void
  onToggleTask: (taskId: string) => void
}) {
  if (loading) {
    return <p className="p-6 text-sm text-slate-500">Loading…</p>
  }

  if (!launchDate) {
    return <PickLaunchDate onSave={onSaveLaunchDate} />
  }

  const countdown = launchCountdown(launchDate)

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-base font-medium text-slate-900">Launch plan</h2>
        <span className="text-xs text-orange-700 font-medium">
          {new Date(launchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · {countdown}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-6">
        Sensible defaults — tick off what you&rsquo;ve done. <button
          type="button"
          onClick={() => {
            const next = prompt('Update launch date (YYYY-MM-DD):',
              new Date(launchDate).toISOString().slice(0, 10))
            if (next) onSaveLaunchDate(new Date(next).toISOString())
          }}
          className="underline hover:text-slate-700"
        >
          Change launch date
        </button>
      </p>

      <div className="relative">
        {LAUNCH_TEMPLATE.map((milestone, idx) => {
          const status = milestoneStatus(launchDate, idx)
          const isLast = idx === LAUNCH_TEMPLATE.length - 1
          const isLaunchDay = milestone.daysOffset === 0

          return (
            <div key={milestone.id} className={`relative pl-7 ${isLast ? '' : 'pb-5'}`}>
              {/* Vertical line */}
              {!isLast && (
                <span
                  className="absolute left-[5px] top-3.5 bottom-0 w-px bg-slate-200"
                  aria-hidden
                />
              )}

              {/* Marker */}
              <span
                className={`absolute left-0 top-1 w-3 h-3 rounded-full box-border ${
                  status === 'done'
                    ? 'bg-emerald-600'
                    : status === 'current'
                      ? 'bg-blue-100 border-2 border-blue-600'
                      : 'border border-slate-300'
                }`}
                aria-hidden
              />

              {/* Date label */}
              <p className={`text-sm font-medium mb-1.5 ${
                status === 'done' ? 'text-slate-500' :
                status === 'current' ? 'text-blue-700' :
                'text-slate-900'
              }`}>
                {milestone.label} · {formatMilestoneDate(launchDate, milestone.daysOffset)}
                {isLaunchDay && status === 'current' && ' · today'}
              </p>

              {/* Tasks */}
              <ul className="space-y-1">
                {milestone.tasks.map(task => {
                  const done = completedSet.has(task.id)
                  return (
                    <li key={task.id}>
                      <button
                        type="button"
                        onClick={() => onToggleTask(task.id)}
                        className="flex items-center gap-2 text-left text-sm text-slate-700 hover:text-slate-900 group"
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded border box-border flex items-center justify-center flex-shrink-0 ${
                            done
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 group-hover:border-slate-500'
                          }`}
                          aria-hidden
                        >
                          {done && <span className="text-[9px] leading-none">✓</span>}
                        </span>
                        <span className={done ? 'line-through text-slate-500' : ''}>
                          {task.label}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PickLaunchDate({ onSave }: { onSave: (next: string) => void }) {
  const [value, setValue] = useState(() => {
    // Default to 6 weeks out
    const d = new Date()
    d.setDate(d.getDate() + 42)
    return d.toISOString().slice(0, 10)
  })

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-base font-medium text-slate-900 mb-1">Pick a launch date</h2>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        Set a target date and Kai will lay out a sensible launch plan around it. You can change this later — or push it back if life intervenes.
      </p>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value}
          onChange={e => setValue(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-slate-500"
        />
        <button
          type="button"
          onClick={() => onSave(new Date(value).toISOString())}
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium"
        >
          Set date
        </button>
      </div>
    </div>
  )
}

function SectionPlaceholder({ sectionId }: { sectionId: SectionId }) {
  const titles: Record<SectionId, string> = {
    audience: 'Audience',
    pitch: 'Pitch',
    'launch-plan': 'Launch plan',
    content: 'Content',
    reviews: 'Reviews',
    performance: 'Performance',
  }
  const blurbs: Record<SectionId, string> = {
    audience: 'Define who this book is for, where they spend time, what else they read. Kai will help you build a sharp picture before the launch plan locks in.',
    pitch: 'Short pitch, long pitch, social one-liner, podcast intro. Same book, different containers. Kai will draft and refine.',
    'launch-plan': '',
    content: 'Drafts of social posts, email sequences, press releases, podcast pitches. Generated against your audience and pitch.',
    reviews: 'ARC strategy, reviewer outreach, review prompts and follow-up. Pre-launch and ongoing.',
    performance: 'Sales by platform, review count, ad spend, email opens. Available once the book has launched.',
  }

  return (
    <div className="p-12 text-center">
      <p className="text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-3">
        {sectionId === 'performance' ? 'Available post-launch' : 'Coming soon'}
      </p>
      <h2 className="text-xl font-medium text-slate-900 mb-2">
        {titles[sectionId]}
      </h2>
      <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
        {blurbs[sectionId]}
      </p>
    </div>
  )
}
