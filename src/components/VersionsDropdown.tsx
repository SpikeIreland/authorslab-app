'use client'

import { useState } from 'react'
import { useManuscriptVersions } from '@/hooks/useManuscriptVersions'
import { ChevronDownIcon, DocumentTextIcon, DocumentIcon } from '@heroicons/react/24/outline'

interface VersionsDropdownProps {
    manuscriptId: string
    currentPhaseNumber: number
}

export function VersionsDropdown({ manuscriptId, currentPhaseNumber }: VersionsDropdownProps) {
    const { versions, loading } = useManuscriptVersions(manuscriptId)
    const [isOpen, setIsOpen] = useState(false)

    // Group versions by phase
    const versionsByPhase = versions.reduce((acc, v) => {
        if (!acc[v.phase_number]) {
            acc[v.phase_number] = {
                phaseNumber: v.phase_number,
                editor: v.created_by_editor,
                versions: []
            }
        }
        acc[v.phase_number].versions.push(v)
        return acc
    }, {} as Record<number, { phaseNumber: number; editor: string; versions: typeof versions }>)

    const phases = Object.values(versionsByPhase).sort((a, b) => a.phaseNumber - b.phaseNumber)

    if (versions.length === 0 && !loading) {
        return null // Don't show if no versions
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-line rounded-lg hover:bg-paper-warm transition-colors"
            >
                <DocumentTextIcon className="w-5 h-5 text-muted" />
                <span className="text-sm font-medium text-ink">Versions</span>
                <ChevronDownIcon className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-line rounded-lg shadow-xl z-50">
                        <div className="p-3 border-b border-line">
                            <h3 className="text-sm font-semibold text-ink">📖 Manuscript Versions</h3>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-sm text-muted">
                                    Loading versions...
                                </div>
                            ) : phases.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted">
                                    No versions available yet
                                </div>
                            ) : (
                                phases.map((phase) => {
                                    const isComplete = phase.phaseNumber < currentPhaseNumber
                                    const isCurrent = phase.phaseNumber === currentPhaseNumber

                                    return (
                                        <div key={phase.phaseNumber} className="border-b border-line-soft last:border-0">
                                            <div className="p-3 bg-ivory">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-ink">
                                                        Phase {phase.phaseNumber} - {phase.editor}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${isComplete
                                                        ? 'bg-status-ok/10 text-status-ok'
                                                        : isCurrent
                                                            ? 'bg-amber-bg text-status-warn'
                                                            : 'bg-paper-warm text-muted'
                                                        }`}>
                                                        {isComplete ? '✓ Complete' : isCurrent ? '⚡ Current' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-3 space-y-2">
                                                {phase.versions.map((version) => {
                                                    return (
                                                        <button
                                                            key={version.id}
                                                            onClick={() => {
                                                                window.open(version.file_url || '', '_blank')
                                                                setIsOpen(false)
                                                            }}
                                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-paper-warm transition-colors"
                                                        >
                                                            <DocumentIcon className="w-5 h-5 text-status-high flex-shrink-0" />

                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-ink">
                                                                    {`${phase.editor}'s Final Version`}
                                                                </div>
                                                                <div className="text-xs text-muted">
                                                                    PDF · {new Date(version.created_at).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    })}
                                                                    {version.word_count && ` · ${version.word_count.toLocaleString()} words`}
                                                                </div>
                                                            </div>

                                                            <ChevronDownIcon className="w-4 h-4 text-faint -rotate-90 flex-shrink-0" />
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}