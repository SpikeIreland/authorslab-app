'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FrontMatterSectionProps {
    manuscript: {
        id: string
        title: string
        genre: string
    }
    publishingProgress: {
        front_matter?: FrontMatterData
    } | null
    manuscriptId: string
    authorFirstName: string
}

interface FrontMatterData {
    title_page?: {
        title?: string
        subtitle?: string
        author?: string
        completed?: boolean
    }
    copyright_page?: {
        copyright_year?: string
        publisher?: string
        isbn?: string
        copyright_notice?: string
        disclaimer?: string
        completed?: boolean
    }
    dedication?: {
        text?: string
        completed?: boolean
    }
    acknowledgements?: {
        text?: string
        completed?: boolean
    }
    epigraph?: {
        quote?: string
        attribution?: string
        completed?: boolean
    }
    preface?: {
        text?: string
        completed?: boolean
    }
}

type FrontMatterItem = 'title_page' | 'copyright_page' | 'dedication' | 'acknowledgements' | 'epigraph' | 'preface'

// Editor component props interfaces
interface EditorBaseProps {
    frontMatter: FrontMatterData
    onSave: (itemKey: FrontMatterItem, data: Record<string, string | boolean>) => Promise<void>
    onCancel: () => void
    isSaving: boolean
}

interface TitlePageEditorProps extends EditorBaseProps {
    manuscript: {
        title: string
        genre: string
    }
}

interface DedicationEditorProps extends EditorBaseProps {
    authorFirstName: string
}

export default function FrontMatterSection({
    manuscript,
    publishingProgress,
    manuscriptId,
    authorFirstName
}: FrontMatterSectionProps) {
    const [activeItem, setActiveItem] = useState<FrontMatterItem | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [frontMatter, setFrontMatter] = useState<FrontMatterData>(publishingProgress?.front_matter || {})

    // Subscribe to realtime updates
    useEffect(() => {
        const supabase = createClient()

        const channel = supabase
            .channel(`front-matter-${manuscriptId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'publishing_progress',
                    filter: `manuscript_id=eq.${manuscriptId}`
                },
                (payload) => {
                    if (payload.new.front_matter) {
                        setFrontMatter(payload.new.front_matter as FrontMatterData)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [manuscriptId])

    async function saveFrontMatterItem(itemKey: FrontMatterItem, data: Record<string, string | boolean>) {
        setIsSaving(true)

        const supabase = createClient()

        const updatedFrontMatter = {
            ...frontMatter,
            [itemKey]: {
                ...data,
                completed: true
            }
        }

        const { error } = await supabase
            .from('publishing_progress')
            .update({ front_matter: updatedFrontMatter })
            .eq('manuscript_id', manuscriptId)

        if (error) {
            console.error('Error saving front matter:', error)
            alert('Error saving. Please try again.')
        } else {
            setFrontMatter(updatedFrontMatter)
            setActiveItem(null)
        }

        setIsSaving(false)
    }

    const frontMatterItems = [
        {
            id: 'title_page' as FrontMatterItem,
            icon: '📖',
            title: 'Title Page',
            description: 'Your book\'s title, subtitle, and author name',
            isComplete: frontMatter.title_page?.completed || false,
            isRequired: true
        },
        {
            id: 'copyright_page' as FrontMatterItem,
            icon: '©️',
            title: 'Copyright Page',
            description: 'Legal information and copyright notice',
            isComplete: frontMatter.copyright_page?.completed || false,
            isRequired: true
        },
        {
            id: 'dedication' as FrontMatterItem,
            icon: '💝',
            title: 'Dedication',
            description: 'Dedicate your book to someone special',
            isComplete: frontMatter.dedication?.completed || false,
            isRequired: false
        },
        {
            id: 'acknowledgements' as FrontMatterItem,
            icon: '🙏',
            title: 'Acknowledgements',
            description: 'Thank those who helped make your book possible',
            isComplete: frontMatter.acknowledgements?.completed || false,
            isRequired: false
        },
        {
            id: 'epigraph' as FrontMatterItem,
            icon: '✨',
            title: 'Epigraph',
            description: 'An inspiring quote to set the tone',
            isComplete: frontMatter.epigraph?.completed || false,
            isRequired: false
        },
        {
            id: 'preface' as FrontMatterItem,
            icon: '📝',
            title: 'Preface',
            description: 'Author\'s note about the book',
            isComplete: frontMatter.preface?.completed || false,
            isRequired: false
        }
    ]

    if (activeItem) {
        return renderEditor(
            activeItem,
            frontMatter,
            saveFrontMatterItem,
            () => setActiveItem(null),
            isSaving,
            manuscript,
            authorFirstName
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-300">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-3xl">
                        📄
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Front Matter</h2>
                        <p className="text-gray-600">Professional pages that appear before your story</p>
                    </div>
                </div>

                {/* Progress Summary */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-blue-900">Progress</span>
                        <span className="text-sm text-blue-700">
                            {frontMatterItems.filter(i => i.isComplete).length}/{frontMatterItems.length} complete
                        </span>
                    </div>
                    <div className="bg-blue-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(frontMatterItems.filter(i => i.isComplete).length / frontMatterItems.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Front Matter Items */}
                <div className="space-y-3">
                    {frontMatterItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveItem(item.id)}
                            className={`w-full p-6 rounded-xl border-2 transition-all text-left ${item.isComplete
                                    ? 'bg-green-50 border-green-300 hover:border-green-400'
                                    : item.isRequired
                                        ? 'bg-yellow-50 border-yellow-300 hover:border-yellow-400'
                                        : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">{item.icon}</div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                                            {item.isRequired && !item.isComplete && (
                                                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-semibold">
                                                    Required
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {item.isComplete ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-600 font-semibold text-sm">Complete</span>
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                                                ✓
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 text-2xl">→</div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Table of Contents (Auto-generated) */}
                <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-3xl">📑</div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Table of Contents</h3>
                                <p className="text-sm text-gray-600 mt-1">Auto-generated from your {manuscript.title} chapters</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 font-semibold text-sm">Auto-Generated</span>
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                                ✓
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <p className="text-blue-800 text-sm">
                        💬 <strong>Need help?</strong> Ask Taylor: &quot;Help me write my dedication&quot; or &quot;Generate a copyright page for me&quot;
                    </p>
                </div>
            </div>
        </div>
    )
}

// Editor for each front matter item
function renderEditor(
    itemKey: FrontMatterItem,
    frontMatter: FrontMatterData,
    onSave: (itemKey: FrontMatterItem, data: Record<string, string | boolean>) => Promise<void>,
    onCancel: () => void,
    isSaving: boolean,
    manuscript: { title: string; genre: string },
    authorFirstName: string
) {
    switch (itemKey) {
        case 'title_page':
            return <TitlePageEditor frontMatter={frontMatter} onSave={onSave} onCancel={onCancel} isSaving={isSaving} manuscript={manuscript} />
        case 'copyright_page':
            return <CopyrightPageEditor frontMatter={frontMatter} onSave={onSave} onCancel={onCancel} isSaving={isSaving} />
        case 'dedication':
            return <DedicationEditor frontMatter={frontMatter} onSave={onSave} onCancel={onCancel} isSaving={isSaving} authorFirstName={authorFirstName} />
        case 'acknowledgements':
            return <AcknowledgementsEditor frontMatter={frontMatter} onSave={onSave} onCancel={onCancel} isSaving={isSaving} />
        case 'epigraph':
            return <EpigraphEditor frontMatter={frontMatter} onSave={onSave} onCancel={onCancel} isSaving={isSaving} />
        case 'preface':
            return <PrefaceEditor frontMatter={frontMatter} onSave={onSave} onCancel={onCancel} isSaving={isSaving} />
        default:
            return null
    }
}

// Individual Editors

function TitlePageEditor({ frontMatter, onSave, onCancel, isSaving, manuscript }: TitlePageEditorProps) {
    const [title, setTitle] = useState(frontMatter.title_page?.title || manuscript.title || '')
    const [subtitle, setSubtitle] = useState(frontMatter.title_page?.subtitle || '')
    const [author, setAuthor] = useState(frontMatter.title_page?.author || '')

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-3xl">
                            📖
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Title Page</h2>
                            <p className="text-gray-600">The first page readers see</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ← Back
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Form */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Book Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg font-semibold"
                                placeholder="The Veil and The Flame Part 1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Subtitle (Optional)
                            </label>
                            <input
                                type="text"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="A Tale of Magic and Mystery"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Author Name *
                            </label>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="Your Name"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => onSave('title_page', { title, subtitle, author })}
                                disabled={isSaving || !title || !author}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save Title Page'}
                            </button>
                            <button
                                onClick={onCancel}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="bg-gray-50 rounded-xl p-12 border-2 border-gray-200 flex items-center justify-center min-h-[500px]">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title || 'Your Book Title'}</h1>
                            {subtitle && (
                                <h2 className="text-2xl text-gray-600 mb-8">{subtitle}</h2>
                            )}
                            <div className="mt-12">
                                <p className="text-xl text-gray-700">{author || 'Author Name'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CopyrightPageEditor({ frontMatter, onSave, onCancel, isSaving }: EditorBaseProps) {
    const currentYear = new Date().getFullYear()
    const [copyrightYear, setCopyrightYear] = useState(frontMatter.copyright_page?.copyright_year || currentYear.toString())
    const [publisher, setPublisher] = useState(frontMatter.copyright_page?.publisher || 'Self-Published')
    const [isbn, setIsbn] = useState(frontMatter.copyright_page?.isbn || '')
    const [copyrightNotice, setCopyrightNotice] = useState(
        frontMatter.copyright_page?.copyright_notice ||
        `Copyright © ${currentYear}. All rights reserved.

No part of this book may be reproduced in any form or by any electronic or mechanical means, including information storage and retrieval systems, without written permission from the author, except for the use of brief quotations in a book review.`
    )
    const [disclaimer, setDisclaimer] = useState(
        frontMatter.copyright_page?.disclaimer ||
        'This is a work of fiction. Names, characters, places, and incidents either are the product of the author\'s imagination or are used fictitiously. Any resemblance to actual persons, living or dead, events, or locales is entirely coincidental.'
    )

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-3xl">
                            ©️
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Copyright Page</h2>
                            <p className="text-gray-600">Legal protection for your work</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ← Back
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Copyright Year *
                            </label>
                            <input
                                type="text"
                                value={copyrightYear}
                                onChange={(e) => setCopyrightYear(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="2025"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Publisher
                            </label>
                            <input
                                type="text"
                                value={publisher}
                                onChange={(e) => setPublisher(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="Self-Published"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ISBN (Optional)
                        </label>
                        <input
                            type="text"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            placeholder="978-1-234567-89-0"
                        />
                        <p className="text-xs text-gray-500 mt-1">You can add your ISBN later if you don&apos;t have one yet</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Copyright Notice *
                        </label>
                        <textarea
                            value={copyrightNotice}
                            onChange={(e) => setCopyrightNotice(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Disclaimer (for fiction) *
                        </label>
                        <textarea
                            value={disclaimer}
                            onChange={(e) => setDisclaimer(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => onSave('copyright_page', {
                                copyright_year: copyrightYear,
                                publisher,
                                isbn,
                                copyright_notice: copyrightNotice,
                                disclaimer
                            })}
                            disabled={isSaving || !copyrightYear || !copyrightNotice || !disclaimer}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Copyright Page'}
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DedicationEditor({ frontMatter, onSave, onCancel, isSaving, authorFirstName }: DedicationEditorProps) {
    const [text, setText] = useState(frontMatter.dedication?.text || '')

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-3xl">
                            💝
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Dedication</h2>
                            <p className="text-gray-600">Honor someone special</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ← Back
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Dedication Text
                            </label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="For my mother, who believed in me when no one else did."
                            />
                            <p className="text-xs text-gray-500 mt-2">Keep it short and heartfelt (1-3 sentences works best)</p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                            <p className="text-sm text-purple-800">
                                <strong>💡 Examples:</strong><br />
                                • &quot;For my family, who never stopped believing&quot;<br />
                                • &quot;To Sarah, my first reader and best friend&quot;<br />
                                • &quot;For everyone who said I couldn&apos;t&quot;
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => onSave('dedication', { text })}
                                disabled={isSaving || !text}
                                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Dedication'}
                            </button>
                            <button
                                onClick={onCancel}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>

                        <button
                            onClick={() => setText('')}
                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Skip Dedication (Optional)
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-xl p-12 border-2 border-gray-200 flex items-center justify-center min-h-[400px]">
                        <div className="text-center italic text-gray-700 text-lg">
                            {text || 'Your dedication will appear here...'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function AcknowledgementsEditor({ frontMatter, onSave, onCancel, isSaving }: EditorBaseProps) {
    const [text, setText] = useState(frontMatter.acknowledgements?.text || '')

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-3xl">
                            🙏
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Acknowledgements</h2>
                            <p className="text-gray-600">Thank those who helped</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ← Back
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Acknowledgements
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={12}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            placeholder="I would like to thank my editor, Sarah, for her invaluable feedback and patience throughout this process. Thanks also to my beta readers, who caught so many things I missed. And to my family, who put up with me disappearing into my writing cave for months on end - I couldn't have done this without your support."
                        />
                        <p className="text-xs text-gray-500 mt-2">Thank editors, beta readers, family, friends, mentors - anyone who helped</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                        <p className="text-sm text-green-800">
                            <strong>💡 Who to thank:</strong><br />
                            • Editors and beta readers<br />
                            • Family and friends for support<br />
                            • Mentors or writing groups<br />
                            • Anyone who inspired the story
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => onSave('acknowledgements', { text })}
                            disabled={isSaving || !text}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Acknowledgements'}
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                    </div>

                    <button
                        onClick={() => setText('')}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Skip Acknowledgements (Optional)
                    </button>
                </div>
            </div>
        </div>
    )
}

function EpigraphEditor({ frontMatter, onSave, onCancel, isSaving }: EditorBaseProps) {
    const [quote, setQuote] = useState(frontMatter.epigraph?.quote || '')
    const [attribution, setAttribution] = useState(frontMatter.epigraph?.attribution || '')

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-yellow-500 rounded-xl flex items-center justify-center text-3xl">
                            ✨
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Epigraph</h2>
                            <p className="text-gray-600">A quote to set the tone</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ← Back
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Quote
                            </label>
                            <textarea
                                value={quote}
                                onChange={(e) => setQuote(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="All we have to decide is what to do with the time that is given us."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Attribution
                            </label>
                            <input
                                type="text"
                                value={attribution}
                                onChange={(e) => setAttribution(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="J.R.R. Tolkien, The Fellowship of the Ring"
                            />
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                            <p className="text-sm text-yellow-800">
                                <strong>💡 Tip:</strong> Choose a quote that resonates with your book&apos;s themes. It should set the emotional tone for what&apos;s to come.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => onSave('epigraph', { quote, attribution })}
                                disabled={isSaving || !quote || !attribution}
                                className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Epigraph'}
                            </button>
                            <button
                                onClick={onCancel}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>

                        <button
                            onClick={() => { setQuote(''); setAttribution('') }}
                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Skip Epigraph (Optional)
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-xl p-12 border-2 border-gray-200 flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <p className="italic text-gray-700 text-lg mb-4">
                                &quot;{quote || 'Your inspiring quote will appear here...'}&quot;
                            </p>
                            <p className="text-gray-600 text-sm">
                                — {attribution || 'Attribution'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PrefaceEditor({ frontMatter, onSave, onCancel, isSaving }: EditorBaseProps) {
    const [text, setText] = useState(frontMatter.preface?.text || '')

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-500 rounded-xl flex items-center justify-center text-3xl">
                            📝
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Preface</h2>
                            <p className="text-gray-600">Your note to readers about the book</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ← Back
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Preface Text
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={14}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            placeholder="This book began as a dream I had five years ago. I woke up with vivid images of a world shrouded in mist, where magic was both a gift and a curse. Over the years, that dream evolved into the story you're about to read.

Writing this has been a journey of discovery, both for me and for my characters. I hope you enjoy reading it as much as I enjoyed bringing it to life."
                        />
                        <p className="text-xs text-gray-500 mt-2">Share why you wrote the book, what inspired you, or what readers should know</p>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                        <p className="text-sm text-indigo-800">
                            <strong>💡 What to include:</strong><br />
                            • Why you wrote this book<br />
                            • What inspired the story<br />
                            • Any context readers should know<br />
                            • Your journey writing it
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => onSave('preface', { text })}
                            disabled={isSaving || !text}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Preface'}
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                    </div>

                    <button
                        onClick={() => setText('')}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Skip Preface (Optional)
                    </button>
                </div>
            </div>
        </div>
    )
}