'use client'

// Fork modal opened from "+ Start a new project" on the Lobby.
// Two paths:
//   - Write a book → POST /api/projects/new, then route to the new project's
//     Wright tab inside the project shell.
//   - Edit a manuscript → route to the existing /onboarding page, which
//     handles file upload + chapter parsing + manuscript creation as it
//     does today.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RELEASED } from '@/lib/feature-flags'

interface Props {
  open: boolean
  onClose: () => void
}

export function NewProjectModal({ open, onClose }: Props) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Close on Escape key.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !creating) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, creating, onClose])

  if (!open) return null

  async function chooseWrite() {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/projects/new', { method: 'POST' })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(errBody.error || `Failed to create project (${res.status})`)
      }
      const json = await res.json() as { id: string }
      // Wright is a staged future release; when it flips live this
      // routes back to the Wright tab. In the meantime the upload-only
      // modal never invokes chooseWrite, so this branch is inert.
      router.push(
        RELEASED.wright
          ? `/projects/${json.id}/wright`
          : `/projects/${json.id}`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setCreating(false)
    }
  }

  function chooseEdit() {
    router.push('/onboarding')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={() => { if (!creating) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-project-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="new-project-title" className="text-lg font-medium text-ink mb-1">
          Start a new project
        </h2>
        <p className="text-sm text-muted mb-5">
          {RELEASED.wright
            ? 'What are you here to do?'
            : 'Upload your manuscript to get started.'}
        </p>

        {error && (
          <div className="mb-4 px-3 py-2 bg-status-high/10 border border-status-high/40 rounded text-sm text-status-high">
            {error}
          </div>
        )}

        {RELEASED.wright ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={chooseWrite}
              disabled={creating}
              className="text-left p-4 border border-line rounded-md hover:border-faint hover:bg-paper-warm disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              <p className="text-sm font-medium text-ink mb-1.5">
                {creating ? 'Creating project…' : 'Write a book'}
              </p>
              <p className="text-xs text-muted mb-3 leading-relaxed">
                I have an idea or rough material — help me build it out.
              </p>
              <p className="text-xs text-faint leading-relaxed">
                A writing partner in Wright (Ivy or Reid) takes you from here.
              </p>
            </button>

            <button
              type="button"
              onClick={chooseEdit}
              disabled={creating}
              className="text-left p-4 border border-line rounded-md hover:border-faint hover:bg-paper-warm disabled:opacity-50 transition-colors"
            >
              <p className="text-sm font-medium text-ink mb-1.5">Edit a manuscript</p>
              <p className="text-xs text-muted mb-3 leading-relaxed">
                I have a draft and I&rsquo;m ready to polish it.
              </p>
              <p className="text-xs text-faint leading-relaxed">
                Alex begins reading and gives developmental notes.
              </p>
            </button>
          </div>
        ) : (
          // MVP: Wright station is held for a staged release, so the
          // fork collapses to upload-only. When RELEASED.wright flips
          // true, the two-path grid above restores automatically.
          <div className="mb-5">
            <button
              type="button"
              onClick={chooseEdit}
              disabled={creating}
              className="w-full text-left p-4 border border-line rounded-md hover:border-faint hover:bg-paper-warm disabled:opacity-50 transition-colors"
            >
              <p className="text-sm font-medium text-ink mb-1.5">Upload your manuscript</p>
              <p className="text-xs text-muted mb-3 leading-relaxed">
                Drop your draft in and Alex will begin the developmental read.
              </p>
              <p className="text-xs text-faint leading-relaxed">
                Supported: .docx, .txt, and other common manuscript formats.
              </p>
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="text-sm text-muted hover:text-ink disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
