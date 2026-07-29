'use client'

/**
 * OverviewClient — client shell for the Project Overview tab.
 *
 * Fetches /api/projects/[id]/overview and composes the two-column layout:
 *   left: BookObjectPanel (cover + meta + shelf)
 *   right: EditorGreetingCard + JourneyStepper
 *
 * Per AL-UX-004 §4 this is the new default landing inside a project.
 */

import { useEffect, useState } from 'react'
import { BookObjectPanel } from './BookObjectPanel'
import { EditorGreetingCard } from './EditorGreetingCard'
import { JourneyStepper } from './JourneyStepper'
import type { OverviewPayload } from '@/app/api/projects/[id]/overview/route'

interface OverviewClientProps {
  projectId: string
  authorName?: string
}

export function OverviewClient({ projectId, authorName }: OverviewClientProps) {
  const [payload, setPayload] = useState<OverviewPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/projects/${projectId}/overview`)
        if (!res.ok) throw new Error(`Failed to load (${res.status})`)
        const json = await res.json() as OverviewPayload
        if (!cancelled) setPayload(json)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [projectId])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <p className="text-[13px]" style={{ color: 'var(--color-muted)' }}>Loading overview…</p>
      </div>
    )
  }

  if (error || !payload) {
    return (
      <div className="flex-1 py-16 px-6">
        <div
          className="max-w-md mx-auto px-4 py-3 rounded-md text-[13px]"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}
        >
          {error ?? 'Could not load overview.'}
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: 'var(--color-ivory)' }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 lg:gap-14">
          <BookObjectPanel payload={payload} authorName={authorName} />
          <div className="flex flex-col gap-10">
            <EditorGreetingCard payload={payload} />
            <JourneyStepper payload={payload} />
          </div>
        </div>
      </div>
    </div>
  )
}
