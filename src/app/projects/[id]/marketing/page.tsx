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

const SECTIONS: Array<{ id: SectionId; label: string; preview?: boolean }> = [
  { id: 'audience', label: 'Audience' },
  { id: 'pitch', label: 'Pitch' },
  { id: 'launch-plan', label: 'Launch plan' },
  { id: 'content', label: 'Content', preview: true },
  { id: 'reviews', label: 'Reviews', preview: true },
  { id: 'performance', label: 'Performance', preview: true },
]

// ============================================================================
// Page
// ============================================================================

export default function MarketingTabPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id

  const [section, setSection] = useState<SectionId>('audience')

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

  // Send a message to Riley.
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
                {s.preview && (
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 border border-slate-200 rounded px-1 py-px">
                    Preview
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Center panel */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {section === 'audience' && (
          <AudienceSection projectId={projectId} />
        )}
        {section === 'pitch' && (
          <PitchSection projectId={projectId} onGoToAudience={() => setSection('audience')} />
        )}
        {section === 'launch-plan' && (
          <LaunchPlanSection
            loading={stateLoading}
            launchDate={launchDate}
            completedSet={completedSet}
            onSaveLaunchDate={saveLaunchDate}
            onToggleTask={toggleTask}
          />
        )}
        {section !== 'launch-plan' && section !== 'audience' && section !== 'pitch' && (
          <SectionPreview sectionId={section} />
        )}
      </main>

      {/* Riley chat panel */}
      <aside className="w-72 border-l border-slate-200 flex flex-col bg-white">
        <header className="px-3 py-3 border-b border-slate-200 flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ background: '#D85A30' }}
          >
            R
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 leading-tight">Riley</p>
            <p className="text-[11px] text-slate-500">Marketing</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {messagesLoading ? (
            <p className="text-xs text-slate-500">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              Tell Riley what you&rsquo;re working on. Ask which tasks matter most this week, what to skip, or how to write your launch announcement.
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
              placeholder="Reply to Riley…"
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
        Set a target date and Riley will lay out a sensible launch plan around it. You can change this later — or push it back if life intervenes.
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

// ============================================================================
// Audience section — Riley's reader profile for this book
// ============================================================================

interface AudienceComp { title: string; author: string; why: string }
interface AudienceChannel { name: string; kind: string; note: string }
interface AudienceProfile {
  primaryReader: string
  readerDescription: string
  comps: AudienceComp[]
  channels: AudienceChannel[]
  hooks: string[]
  avoid: string[]
  generatedAt: string
  editedAt?: string
}

function AudienceSection({ projectId }: { projectId: string }) {
  const [audience, setAudience] = useState<AudienceProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<AudienceProfile | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/marketing/audience`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string }
          throw new Error(body.error || `couldn\u2019t load (${res.status})`)
        }
        const json = await res.json() as { audience: AudienceProfile | null }
        if (!cancelled) setAudience(json.audience)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [projectId])

  const generate = useCallback(async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/marketing/audience`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error || `generation failed (${res.status})`)
      }
      const json = await res.json() as { audience: AudienceProfile }
      setAudience(json.audience)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setGenerating(false)
    }
  }, [projectId])

  const save = useCallback(async (next: AudienceProfile) => {
    const previous = audience
    setAudience(next)
    setEditing(false)
    try {
      const res = await fetch(`/api/projects/${projectId}/marketing/audience`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setAudience(previous)
      setError('Couldn\u2019t save that edit \u2014 your previous version is still here.')
    }
  }, [projectId, audience])

  if (loading) return <p className="p-6 text-sm text-slate-500">Loading\u2026</p>

  // Empty state — Riley offers to build it.
  if (!audience) {
    return (
      <div className="p-6 max-w-2xl">
        <h2 className="text-base font-medium text-slate-900 mb-1">Audience</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-lg">
          Before anything else in marketing: who is this book for? Riley will read your
          opening chapters and draft a reader profile \u2014 comparable titles, where those
          readers gather, and the angles worth leading with. You can edit every word of it.
        </p>
        {error && (
          <div className="mb-4 px-3 py-2 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800">
            {error}
          </div>
        )}
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-md text-sm font-medium"
        >
          {generating ? 'Riley is reading your book\u2026' : 'Build my audience profile'}
        </button>
        {generating && (
          <p className="mt-3 text-xs text-slate-500">This takes a few seconds.</p>
        )}
      </div>
    )
  }

  if (editing && draft) {
    return <AudienceEditor draft={draft} onChange={setDraft} onCancel={() => setEditing(false)} onSave={() => save(draft)} />
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-baseline justify-between mb-1 gap-4">
        <h2 className="text-base font-medium text-slate-900">Audience</h2>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => { setDraft(audience); setEditing(true) }}
            className="text-xs text-slate-500 underline hover:text-slate-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="text-xs text-slate-500 underline hover:text-slate-700 disabled:no-underline disabled:text-slate-300"
          >
            {generating ? 'Rebuilding\u2026' : 'Rebuild'}
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-6">
        {audience.editedAt ? 'Edited by you' : 'Drafted by Riley from your opening chapters'} \u00b7 yours to change
      </p>

      {error && (
        <div className="mb-5 px-3 py-2 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800">
          {error}
        </div>
      )}

      <section className="mb-7">
        <p className="text-lg font-medium text-slate-900 leading-snug mb-2">{audience.primaryReader}</p>
        <p className="text-sm text-slate-700 leading-relaxed">{audience.readerDescription}</p>
      </section>

      {audience.comps.length > 0 && (
        <section className="mb-7">
          <h3 className="text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-2.5">
            They already own these
          </h3>
          <ul className="space-y-2">
            {audience.comps.map((c, i) => (
              <li key={i} className="text-sm">
                <span className="text-slate-900 font-medium">{c.title}</span>
                {c.author && <span className="text-slate-500"> \u00b7 {c.author}</span>}
                {c.why && <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{c.why}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {audience.channels.length > 0 && (
        <section className="mb-7">
          <h3 className="text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-2.5">
            Where to find them
          </h3>
          <ul className="space-y-2">
            {audience.channels.map((c, i) => (
              <li key={i} className="text-sm">
                <span className="text-slate-900">{c.name}</span>
                {c.kind && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-slate-400 border border-slate-200 rounded px-1 py-px">
                    {c.kind}
                  </span>
                )}
                {c.note && <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{c.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {audience.hooks.length > 0 && (
        <section className="mb-7">
          <h3 className="text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-2.5">
            Angles to lead with
          </h3>
          <ul className="space-y-1.5">
            {audience.hooks.map((h, i) => (
              <li key={i} className="text-sm text-slate-700 leading-relaxed pl-3 border-l-2 border-slate-200">{h}</li>
            ))}
          </ul>
        </section>
      )}

      {audience.avoid.length > 0 && (
        <section>
          <h3 className="text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-2.5">
            Don\u2019t bother with
          </h3>
          <ul className="space-y-1.5">
            {audience.avoid.map((a, i) => (
              <li key={i} className="text-sm text-slate-500 leading-relaxed">{a}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function AudienceEditor({
  draft, onChange, onCancel, onSave,
}: {
  draft: AudienceProfile
  onChange: (next: AudienceProfile) => void
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-base font-medium text-slate-900 mb-1">Edit audience</h2>
      <p className="text-xs text-slate-500 mb-5">
        Riley drafted this \u2014 you know your readers better. One item per line where there are lists.
      </p>

      <label className="block mb-4">
        <span className="text-[11px] uppercase tracking-wider font-medium text-slate-400">Who it\u2019s for</span>
        <input
          value={draft.primaryReader}
          onChange={e => onChange({ ...draft, primaryReader: e.target.value })}
          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-slate-500"
        />
      </label>

      <label className="block mb-4">
        <span className="text-[11px] uppercase tracking-wider font-medium text-slate-400">What they want</span>
        <textarea
          value={draft.readerDescription}
          onChange={e => onChange({ ...draft, readerDescription: e.target.value })}
          rows={3}
          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:border-slate-500"
        />
      </label>

      <label className="block mb-4">
        <span className="text-[11px] uppercase tracking-wider font-medium text-slate-400">Angles to lead with</span>
        <textarea
          value={draft.hooks.join('\n')}
          onChange={e => onChange({ ...draft, hooks: e.target.value.split('\n').filter(Boolean) })}
          rows={5}
          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:border-slate-500"
        />
      </label>

      <label className="block mb-5">
        <span className="text-[11px] uppercase tracking-wider font-medium text-slate-400">Don\u2019t bother with</span>
        <textarea
          value={draft.avoid.join('\n')}
          onChange={e => onChange({ ...draft, avoid: e.target.value.split('\n').filter(Boolean) })}
          rows={3}
          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:border-slate-500"
        />
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium"
        >
          Save
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Pitch section — the book in five containers, written for the agreed reader
// ============================================================================

interface PitchProfile {
  oneLiner: string
  compLine: string
  backCover: string
  longPitch: string
  spokenIntro: string
  generatedAt: string
  editedAt?: string
}

const PITCH_FIELDS: Array<{ key: keyof PitchProfile; label: string; hint: string; rows: number }> = [
  { key: 'oneLiner', label: 'One line', hint: 'Stops the right reader scrolling.', rows: 2 },
  { key: 'compLine', label: 'Shelf comparison', hint: 'The X-meets-Y, using books they own.', rows: 2 },
  { key: 'backCover', label: 'Back cover', hint: 'What a browser reads before buying.', rows: 8 },
  { key: 'longPitch', label: 'Long pitch', hint: 'For a blogger, journalist or agent.', rows: 12 },
  { key: 'spokenIntro', label: 'Said out loud', hint: 'Thirty seconds on a podcast.', rows: 6 },
]

function PitchSection({ projectId, onGoToAudience }: { projectId: string; onGoToAudience: () => void }) {
  const [pitch, setPitch] = useState<PitchProfile | null>(null)
  const [hasAudience, setHasAudience] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<PitchProfile | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/marketing/pitch`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string }
          throw new Error(body.error || `couldn\u2019t load (${res.status})`)
        }
        const json = await res.json() as { pitch: PitchProfile | null; hasAudience: boolean }
        if (!cancelled) { setPitch(json.pitch); setHasAudience(json.hasAudience) }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [projectId])

  const generate = useCallback(async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/marketing/pitch`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        if (body.error === 'audience_required') {
          setHasAudience(false)
          throw new Error('Riley needs your audience profile first \u2014 a pitch without a reader is just a summary.')
        }
        throw new Error(body.error || `generation failed (${res.status})`)
      }
      const json = await res.json() as { pitch: PitchProfile }
      setPitch(json.pitch)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setGenerating(false)
    }
  }, [projectId])

  const save = useCallback(async (next: PitchProfile) => {
    const previous = pitch
    setPitch(next)
    setEditing(false)
    try {
      const res = await fetch(`/api/projects/${projectId}/marketing/pitch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setPitch(previous)
      setError('Couldn\u2019t save that edit \u2014 your previous version is still here.')
    }
  }, [projectId, pitch])

  const copy = useCallback((key: string, value: string) => {
    navigator.clipboard?.writeText(value).then(
      () => { setCopied(key); setTimeout(() => setCopied(null), 1600) },
      () => setError('Couldn\u2019t copy that \u2014 select and copy manually.'),
    )
  }, [])

  if (loading) return <p className="p-6 text-sm text-slate-500">Loading\u2026</p>

  // Audience gate — the dependency, made visible rather than implied.
  if (!pitch && !hasAudience) {
    return (
      <div className="p-6 max-w-2xl">
        <h2 className="text-base font-medium text-slate-900 mb-1">Pitch</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-lg">
          Your pitch comes after your audience. Riley writes every line for a specific
          reader \u2014 without one she\u2019d just be summarising your plot, which is what most
          book blurbs get wrong.
        </p>
        <button
          type="button"
          onClick={onGoToAudience}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium"
        >
          Start with Audience
        </button>
      </div>
    )
  }

  if (!pitch) {
    return (
      <div className="p-6 max-w-2xl">
        <h2 className="text-base font-medium text-slate-900 mb-1">Pitch</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-lg">
          One book, five containers \u2014 a line that stops a scroll, a shelf comparison, the
          back cover, a long pitch for media, and thirty seconds you can say out loud.
          Riley writes all five for the reader in your audience profile, in your book\u2019s voice.
        </p>
        {error && (
          <div className="mb-4 px-3 py-2 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800">{error}</div>
        )}
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-md text-sm font-medium"
        >
          {generating ? 'Riley is writing\u2026' : 'Write my pitch'}
        </button>
        {generating && <p className="mt-3 text-xs text-slate-500">This takes a few seconds.</p>}
      </div>
    )
  }

  if (editing && draft) {
    return (
      <div className="p-6 max-w-2xl">
        <h2 className="text-base font-medium text-slate-900 mb-1">Edit pitch</h2>
        <p className="text-xs text-slate-500 mb-5">It\u2019s your book \u2014 say it your way.</p>
        {PITCH_FIELDS.map(f => (
          <label key={f.key} className="block mb-4">
            <span className="text-[11px] uppercase tracking-wider font-medium text-slate-400">{f.label}</span>
            <textarea
              value={String(draft[f.key] ?? '')}
              onChange={e => setDraft({ ...draft, [f.key]: e.target.value })}
              rows={f.rows}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:border-slate-500"
            />
          </label>
        ))}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => save(draft)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium"
          >
            Save
          </button>
          <button type="button" onClick={() => setEditing(false)} className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-baseline justify-between mb-1 gap-4">
        <h2 className="text-base font-medium text-slate-900">Pitch</h2>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => { setDraft(pitch); setEditing(true) }}
            className="text-xs text-slate-500 underline hover:text-slate-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="text-xs text-slate-500 underline hover:text-slate-700 disabled:no-underline disabled:text-slate-300"
          >
            {generating ? 'Rewriting\u2026' : 'Rewrite'}
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-6">
        {pitch.editedAt ? 'Edited by you' : 'Written by Riley for your audience profile'} \u00b7 yours to change
      </p>

      {error && (
        <div className="mb-5 px-3 py-2 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800">{error}</div>
      )}

      {PITCH_FIELDS.map(f => {
        const value = String(pitch[f.key] ?? '')
        if (!value) return null
        return (
          <section key={f.key} className="mb-7">
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <h3 className="text-[11px] uppercase tracking-wider font-medium text-slate-400">{f.label}</h3>
              <button
                type="button"
                onClick={() => copy(f.key, value)}
                className="text-[11px] text-slate-400 hover:text-slate-700 flex-shrink-0"
              >
                {copied === f.key ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className={`text-slate-800 whitespace-pre-wrap leading-relaxed ${
              f.key === 'oneLiner' ? 'text-lg font-medium leading-snug' : 'text-sm'
            }`}>
              {value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{f.hint}</p>
          </section>
        )
      })}
    </div>
  )
}

function SectionPreview({ sectionId }: { sectionId: SectionId }) {
  const titles: Record<SectionId, string> = {
    audience: 'Audience',
    pitch: 'Pitch',
    'launch-plan': 'Launch plan',
    content: 'Content',
    reviews: 'Reviews',
    performance: 'Performance',
  }
  const blurbs: Record<SectionId, string> = {
    audience: '',
    pitch: '',
    'launch-plan': '',
    content: 'Social posts, email sequences, podcast pitches \u2014 drafted from your pitch and aimed at the channels in your audience profile.',
    reviews: 'ARC strategy, reviewer outreach, and follow-up \u2014 tracked so you know who has your book and who has posted.',
    performance: 'Sales by platform, review count, ad spend, email opens. Fills in once the book is out.',
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-baseline justify-between mb-1 gap-4">
        <h2 className="text-base font-medium text-slate-900">{titles[sectionId]}</h2>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 border border-slate-200 rounded px-1 py-px flex-shrink-0">
          Preview
        </span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-lg">{blurbs[sectionId]}</p>

      <div className="relative">
        <div aria-hidden className="pointer-events-none select-none space-y-5">
          {sectionId === 'content' && <ContentPreview />}
          {sectionId === 'reviews' && <ReviewsPreview />}
          {sectionId === 'performance' && <PerformancePreview />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/45 to-white" />
      </div>

      <p className="text-xs text-slate-400 mt-1">
        {sectionId === 'performance'
          ? 'Shape shown above \u2014 real numbers arrive with your first sales.'
          : 'Shape shown above \u2014 Riley fills it in once your audience profile is set.'}
      </p>
    </div>
  )
}

function PreviewBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-2">{label}</h3>
      {children}
    </section>
  )
}

function GhostLine({ w = 'w-full' }: { w?: string }) {
  return <span className={`block h-2 rounded bg-slate-200 ${w}`} />
}

function ContentPreview() {
  return (
    <>
      <PreviewBlock label="Announcement post">
        <div className="space-y-1.5"><GhostLine /><GhostLine w="w-5/6" /></div>
      </PreviewBlock>
      <PreviewBlock label="Email sequence">
        <ul className="space-y-2">
          {['Cover reveal', 'Two weeks out', 'Launch day', 'One week after'].map(t => (
            <li key={t} className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
              <span className="text-sm text-slate-400">{t}</span>
            </li>
          ))}
        </ul>
      </PreviewBlock>
    </>
  )
}

function ReviewsPreview() {
  return (
    <PreviewBlock label="ARC readers">
      <ul className="space-y-2.5">
        {['Sent \u00b7 awaiting review', 'Sent \u00b7 awaiting review', 'Posted', 'Not yet sent'].map((state, i) => (
          <li key={i} className="flex items-center justify-between gap-3">
            <GhostLine w="w-40" />
            <span className="text-[11px] text-slate-400 flex-shrink-0">{state}</span>
          </li>
        ))}
      </ul>
    </PreviewBlock>
  )
}

function PerformancePreview() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {['Copies sold', 'Reviews', 'Email opens'].map(label => (
        <div key={label} className="border border-slate-200 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">{label}</p>
          <div className="h-5 w-12 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  )
}
