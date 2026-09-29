'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Manuscript, PublishingProgress } from '@/types/database'
import CoverDesignerPanel from '@/components/CoverDesignerPanel'
import { openSignedFile } from '@/lib/signedFile'
import Link from 'next/link'

interface PublishingContentPanelProps {
    manuscriptId: string
    selectedElement: string
}

export default function PublishingContentPanel({
    manuscriptId,
    selectedElement
}: PublishingContentPanelProps) {
    const [manuscript, setManuscript] = useState<Manuscript | null>(null)
    const [publishingProgress, setPublishingProgress] = useState<PublishingProgress | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [manuscriptId])

    async function loadData() {
        const supabase = createClient()

        // Load manuscript
        const { data: manuscriptData } = await supabase
            .from('manuscripts')
            .select('*')
            .eq('id', manuscriptId)
            .single()

        // Load publishing progress
        const { data: progressData } = await supabase
            .from('publishing_progress')
            .select('*')
            .eq('manuscript_id', manuscriptId)
            .single()

        setManuscript(manuscriptData as Manuscript)
        setPublishingProgress(progressData as PublishingProgress)
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    // Render content based on selected element
    function renderContent() {
        switch (selectedElement) {
            case 'overview':
                return <OverviewContent manuscript={manuscript} publishingProgress={publishingProgress} />

            case 'cover-design':
                return <CoverDesignContent manuscriptId={manuscriptId} publishingProgress={publishingProgress} />

            case 'front-matter':
                return <FrontMatterContent manuscript={manuscript} publishingProgress={publishingProgress} />

            case 'back-matter':
                return <BackMatterContent manuscript={manuscript} publishingProgress={publishingProgress} />

            case 'formatting':
                return <FormattingContent manuscript={manuscript} publishingProgress={publishingProgress} />

            case 'platform-setup':
                return <PlatformSetupContent publishingProgress={publishingProgress} />

            case 'metadata':
                return <MetadataContent manuscript={manuscript} publishingProgress={publishingProgress} />

            case 'isbn':
                return <ISBNContent publishingProgress={publishingProgress} />

            case 'pre-launch':
                return <PreLaunchContent publishingProgress={publishingProgress} />

            default:
                return <OverviewContent manuscript={manuscript} publishingProgress={publishingProgress} />
        }
    }

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
            {renderContent()}
        </div>
    )
}

// ============================================
// Individual Content Components
// ============================================

function OverviewContent({ manuscript, publishingProgress }: { manuscript: Manuscript | null, publishingProgress: PublishingProgress | null }) {
    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                {/* Manuscript Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-300 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{manuscript?.title || 'Your Manuscript'}</h1>
                            <p className="text-gray-600">{manuscript?.genre}</p>
                        </div>
                        <Link
                            href={`/author-studio?manuscriptId=${manuscript?.id}&phase=3`}
                            className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg font-semibold hover:bg-teal-200 transition-all text-sm"
                        >
                            View in Studio →
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-gray-900">{manuscript?.current_word_count?.toLocaleString() || '0'}</div>
                            <div className="text-sm text-gray-600">Words</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-gray-900">{manuscript?.total_chapters || '0'}</div>
                            <div className="text-sm text-gray-600">Chapters</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-600">✓</div>
                            <div className="text-sm text-gray-600">Edited</div>
                        </div>
                    </div>

                    {publishingProgress?.publishing_plan && (
                        <div className="bg-teal-50 rounded-lg p-4 border-l-4 border-teal-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">📋 Your Publishing Plan</h3>
                                    <p className="text-sm text-gray-600">Personalized strategy ready to view</p>
                                </div>
                                {publishingProgress.plan_pdf_url && (
                                    // Signed on click rather than rendered as an href: a signed URL
                                    // expires, and the plan's bucket is going private.
                                    <button
                                        type="button"
                                        onClick={() => { if (manuscript?.id) void openSignedFile(manuscript.id, 'plan') }}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all text-sm"
                                    >
                                        View Plan →
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Publishing Journey Progress */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Publishing Journey</h2>

                    <div className="space-y-4">
                        <ProgressItem
                            icon="📚"
                            label="Assessment Complete"
                            isComplete={!!publishingProgress?.assessment_completed}
                        />
                        <ProgressItem
                            icon="🎨"
                            label="Cover Design"
                            isComplete={!!publishingProgress?.selected_cover_id}
                        />
                        <ProgressItem
                            icon="📄"
                            label="Front Matter"
                            isComplete={!!publishingProgress?.step_data?.front_matter_complete}
                        />
                        <ProgressItem
                            icon="📝"
                            label="Back Matter"
                            isComplete={!!publishingProgress?.step_data?.back_matter_complete}
                        />
                        <ProgressItem
                            icon="📖"
                            label="Formatting"
                            isComplete={!!publishingProgress?.formatting_completed_at}
                        />
                        <ProgressItem
                            icon="🏷️"
                            label="Metadata"
                            isComplete={!!publishingProgress?.metadata_completed_at}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProgressItem({ icon, label, isComplete }: { icon: string, label: string, isComplete: boolean }) {
    return (
        <div className={`flex items-center gap-4 p-4 rounded-lg ${isComplete ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50'}`}>
            <div className="text-2xl">{icon}</div>
            <div className="flex-1">
                <div className="font-semibold text-gray-900">{label}</div>
            </div>
            {isComplete ? (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
            ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            )}
        </div>
    )
}

function CoverDesignContent({ manuscriptId, publishingProgress }: { manuscriptId: string, publishingProgress: PublishingProgress | null }) {
    const hasCoverConcepts = publishingProgress?.cover_designs && publishingProgress.cover_designs.length > 0

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                {hasCoverConcepts ? (
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Cover Designs</h2>
                        <p className="text-gray-600 mb-8">Select your favorite professional cover concept</p>
                        <CoverDesignerPanel manuscriptId={manuscriptId} />
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                        <div className="text-6xl mb-6">🎨</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Cover Design</h2>
                        <p className="text-gray-600 mb-6">
                            Taylor will generate professional cover concepts for your book during your conversation.
                        </p>
                        <div className="bg-teal-50 rounded-lg p-6 border-l-4 border-teal-500 max-w-2xl mx-auto">
                            <p className="text-gray-700">
                                💬 Chat with Taylor in the right panel to start the cover design process!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function FrontMatterContent({ manuscript, publishingProgress }: { manuscript: Manuscript | null, publishingProgress: PublishingProgress | null }) {
    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Front Matter</h2>
                <p className="text-gray-600 mb-8">Professional pages that appear before your story begins</p>

                <div className="space-y-4">
                    <FrontMatterSection title="Title Page" icon="📖" />
                    <FrontMatterSection title="Copyright Page" icon="©️" />
                    <FrontMatterSection title="Dedication" icon="💝" />
                    <FrontMatterSection title="Acknowledgements" icon="🙏" />
                    <FrontMatterSection title="Table of Contents" icon="📑" />
                    <FrontMatterSection title="Foreword/Preface" icon="✍️" />
                </div>

                <div className="mt-8 bg-teal-50 rounded-lg p-6 border-l-4 border-teal-500">
                    <p className="text-gray-700">
                        💬 <strong>Work with Taylor:</strong> Chat with Taylor in the right panel to create and refine your front matter pages.
                    </p>
                </div>
            </div>
        </div>
    )
}

function FrontMatterSection({ title, icon }: { title: string, icon: string }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="flex items-center gap-3">
                <div className="text-2xl">{icon}</div>
                <div className="flex-1">
                    <div className="font-semibold text-gray-900">{title}</div>
                </div>
                <div className="text-sm text-gray-500">Coming soon</div>
            </div>
        </div>
    )
}

function BackMatterContent({ manuscript, publishingProgress }: { manuscript: Manuscript | null, publishingProgress: PublishingProgress | null }) {
    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Back Matter</h2>
                <p className="text-gray-600 mb-8">Professional pages that appear after your story ends</p>

                <div className="space-y-4">
                    <BackMatterSection title="Author Bio" icon="👤" />
                    <BackMatterSection title="Author Note" icon="💭" />
                    <BackMatterSection title="Preview of Next Book" icon="📚" />
                    <BackMatterSection title="About the Author Page" icon="ℹ️" />
                </div>

                <div className="mt-8 bg-teal-50 rounded-lg p-6 border-l-4 border-teal-500">
                    <p className="text-gray-700">
                        💬 <strong>Work with Taylor:</strong> Chat with Taylor in the right panel to create your back matter pages.
                    </p>
                </div>
            </div>
        </div>
    )
}

function BackMatterSection({ title, icon }: { title: string, icon: string }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="flex items-center gap-3">
                <div className="text-2xl">{icon}</div>
                <div className="flex-1">
                    <div className="font-semibold text-gray-900">{title}</div>
                </div>
                <div className="text-sm text-gray-500">Coming soon</div>
            </div>
        </div>
    )
}

function FormattingContent({ manuscript, publishingProgress }: { manuscript: Manuscript | null, publishingProgress: PublishingProgress | null }) {
    const projectId = manuscript?.id
    const hasPdf = Boolean(publishingProgress?.formatted_files?.pdf)
    const hasDocx = Boolean(publishingProgress?.formatted_files?.docx)

    // The files themselves live in a private bucket, so a download link has to
    // be signed at read time rather than stored. Ask only for the kinds the row
    // says exist, so a 404 here means a real failure rather than "none yet".
    const [urls, setUrls] = useState<{ pdf?: string; docx?: string }>({})

    useEffect(() => {
        if (!projectId) return
        let cancelled = false

        async function sign(kind: 'pdf' | 'docx') {
            try {
                const res = await fetch(`/api/projects/${projectId}/files?kind=${kind}`)
                if (!res.ok) return
                const json = await res.json() as { url?: string }
                if (!cancelled && json.url) setUrls(prev => ({ ...prev, [kind]: json.url }))
            } catch {
                // Leave the card on "Not generated yet" rather than offering a
                // link that will not open.
            }
        }

        if (hasPdf) sign('pdf')
        if (hasDocx) sign('docx')
        return () => { cancelled = true }
    }, [projectId, hasPdf, hasDocx])

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Manuscript Formatting</h2>
                <p className="text-gray-600 mb-8">
                    Your edited manuscript, front matter and back matter composed into one document.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <FormatCard
                        icon="📝"
                        title="Word document (DOCX)"
                        description="The composed manuscript as an editable file, for a proofreader or a typesetter."
                        url={urls.docx}
                    />
                    <FormatCard
                        icon="📄"
                        title="Interior PDF"
                        description="The book laid out as pages — title page, copyright, chapters, back matter."
                        url={urls.pdf}
                    />
                </div>

                <div className="bg-amber-50 rounded-lg p-6 border-l-4 border-amber-500">
                    <p className="text-gray-700">
                        <strong>What these are, and are not.</strong> These are reading and proofing copies —
                        a faithful layout of your book that you can read, print at home, or hand to a proofreader.
                        They are <strong>not</strong> print-ready files for a printer or a distributor: that needs a
                        specified trim size, bleed and a spine sized to the page count, and this step does not
                        produce those yet. EPUB and Kindle files are not produced at all.
                    </p>
                </div>
            </div>
        </div>
    )
}

function FormatCard({ icon, title, description, url }: { icon: string, title: string, description: string, url?: string }) {
    const isAvailable = Boolean(url)
    return (
        <div className={`rounded-lg p-6 border-2 ${isAvailable ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            {isAvailable ? (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all text-sm"
                >
                    Download →
                </a>
            ) : (
                <div className="text-sm text-gray-500">Not generated yet</div>
            )}
        </div>
    )
}

function PlatformSetupContent({ publishingProgress }: { publishingProgress: PublishingProgress | null }) {
    const platforms = publishingProgress?.assessment_answers?.platforms || []

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Platform Setup</h2>
                <p className="text-gray-600 mb-8">Get ready to publish on your selected platforms</p>

                <div className="space-y-4">
                    {platforms.includes('amazon-kdp') && (
                        <PlatformCard title="Amazon KDP" icon="📦" color="yellow" />
                    )}
                    {platforms.includes('draft2digital') && (
                        <PlatformCard title="Draft2Digital" icon="📚" color="green" />
                    )}
                    {platforms.includes('ingramspark') && (
                        <PlatformCard title="IngramSpark" icon="📖" color="blue" />
                    )}
                    {platforms.includes('apple-books') && (
                        <PlatformCard title="Apple Books" icon="🍎" color="gray" />
                    )}
                </div>

                <div className="mt-8 bg-teal-50 rounded-lg p-6 border-l-4 border-teal-500">
                    <p className="text-gray-700">
                        💬 <strong>Work with Taylor:</strong> Get step-by-step guidance for setting up each platform.
                    </p>
                </div>
            </div>
        </div>
    )
}

function PlatformCard({ title, icon, color }: { title: string, icon: string, color: string }) {
    return (
        <div className={`bg-${color}-50 border-2 border-${color}-300 rounded-lg p-6`}>
            <div className="flex items-center gap-4">
                <div className="text-3xl">{icon}</div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600">Setup guide coming soon</p>
                </div>
            </div>
        </div>
    )
}

function MetadataContent({ manuscript, publishingProgress }: { manuscript: Manuscript | null, publishingProgress: PublishingProgress | null }) {
    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Metadata Manager</h2>
                <p className="text-gray-600 mb-8">Optimize your book&apos;s discoverability</p>

                <div className="space-y-6">
                    <MetadataField label="Book Title" value={manuscript?.title} />
                    <MetadataField label="Subtitle" value={publishingProgress?.metadata?.subtitle} />
                    <MetadataField label="Description/Blurb" value={publishingProgress?.metadata?.description} />
                    <MetadataField label="Keywords" value={publishingProgress?.metadata?.keywords?.join(', ')} />
                    <MetadataField label="Categories" value={publishingProgress?.metadata?.categories?.join(', ')} />
                </div>

                <div className="mt-8 bg-teal-50 rounded-lg p-6 border-l-4 border-teal-500">
                    <p className="text-gray-700">
                        💬 <strong>Work with Taylor:</strong> Optimize your metadata for maximum discoverability.
                    </p>
                </div>
            </div>
        </div>
    )
}

function MetadataField({ label, value }: { label: string, value?: string | null }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                {value ? (
                    <p className="text-gray-900">{value}</p>
                ) : (
                    <p className="text-gray-400 italic">Not set yet</p>
                )}
            </div>
        </div>
    )
}

function ISBNContent({ publishingProgress }: { publishingProgress: PublishingProgress | null }) {
    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">ISBN Management</h2>
                <p className="text-gray-600 mb-8">Acquire and manage your book&apos;s ISBN</p>

                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500 mb-6">
                    <h3 className="font-bold text-gray-900 mb-2">📚 What is an ISBN?</h3>
                    <p className="text-gray-700 text-sm">
                        An International Standard Book Number (ISBN) is a unique identifier for your book.
                        You&apos;ll need different ISBNs for different formats (eBook, paperback, hardcover).
                    </p>
                </div>

                <div className="space-y-4">
                    <ISBNOption title="Free ISBN from Platform" description="Amazon KDP and other platforms provide free ISBNs" />
                    <ISBNOption title="Purchase Your Own ISBN" description="From Bowker (US) or your country's ISBN agency" />
                </div>

                <div className="mt-8 bg-teal-50 rounded-lg p-6 border-l-4 border-teal-500">
                    <p className="text-gray-700">
                        💬 <strong>Work with Taylor:</strong> Get personalized ISBN recommendations for your publishing strategy.
                    </p>
                </div>
            </div>
        </div>
    )
}

function ISBNOption({ title, description }: { title: string, description: string }) {
    return (
        <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    )
}

function PreLaunchContent({ publishingProgress }: { publishingProgress: PublishingProgress | null }) {
    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Pre-Launch Checklist</h2>
                <p className="text-gray-600 mb-8">Final steps before publishing your book</p>

                <div className="space-y-3">
                    <ChecklistItem label="Cover finalized and approved" isComplete={!!publishingProgress?.selected_cover_id} />
                    <ChecklistItem label="Front matter complete" isComplete={!!publishingProgress?.step_data?.front_matter_complete} />
                    <ChecklistItem label="Back matter complete" isComplete={!!publishingProgress?.step_data?.back_matter_complete} />
                    <ChecklistItem label="Files formatted for all platforms" isComplete={!!publishingProgress?.formatting_completed_at} />
                    <ChecklistItem label="Metadata optimized" isComplete={!!publishingProgress?.metadata_completed_at} />
                    <ChecklistItem label="ISBN assigned (if applicable)" isComplete={!!publishingProgress?.step_data?.isbn_assigned} />
                    <ChecklistItem label="Platform accounts set up" isComplete={!!publishingProgress?.step_data?.platforms_configured} />
                    <ChecklistItem label="Final manuscript review" isComplete={false} />
                </div>

                <div className="mt-8 bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                    <h3 className="font-bold text-gray-900 mb-2">🚀 Ready to Launch?</h3>
                    <p className="text-gray-700 text-sm mb-4">
                        Once all items are checked, you&apos;ll be ready to upload your book to your selected platforms!
                    </p>
                    <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all">
                        Launch Publishing Process →
                    </button>
                </div>
            </div>
        </div>
    )
}

function ChecklistItem({ label, isComplete }: { label: string, isComplete: boolean }) {
    return (
        <div className={`flex items-center gap-4 p-4 rounded-lg ${isComplete ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50 border-2 border-gray-200'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isComplete ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                {isComplete && '✓'}
            </div>
            <div className="flex-1 text-gray-900">{label}</div>
        </div>
    )
}