'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect, FormEvent, ChangeEvent, DragEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Manuscript } from '@/types/database'

function ReUploadContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [manuscript, setManuscript] = useState<Manuscript | null>(null)
    const [authorName, setAuthorName] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [extractedText, setExtractedText] = useState<string>('')
    const [wordCount, setWordCount] = useState<number>(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
    const [statusMessage, setStatusMessage] = useState('')
    const [dragOver, setDragOver] = useState(false)

    // Add states for existing manuscript metadata
    const [existingChapterCount, setExistingChapterCount] = useState<number>(0)
    const [existingHasPrologue, setExistingHasPrologue] = useState<boolean>(false)
    const [existingHasEpilogue, setExistingHasEpilogue] = useState<boolean>(false)

    const isFormValid = file && wordCount > 0

    useEffect(() => {
        async function loadManuscript() {
            const manuscriptId = searchParams.get('manuscriptId')
            if (!manuscriptId) {
                router.push('/author-studio')
                return
            }

            const supabase = createClient()

            // Get authenticated user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Get author profile
            const { data: profile } = await supabase
                .from('author_profiles')
                .select('id, first_name, last_name')
                .eq('auth_user_id', user.id)
                .single()

            if (!profile) {
                router.push('/onboarding')
                return
            }

            setAuthorName(`${profile.first_name} ${profile.last_name}`.trim() || 'Author')

            // Load existing manuscript
            const { data: manuscriptData } = await supabase
                .from('manuscripts')
                .select('*')
                .eq('id', manuscriptId)
                .eq('author_id', profile.id)
                .single()

            if (!manuscriptData) {
                alert('Manuscript not found')
                router.push('/author-studio')
                return
            }

            setManuscript(manuscriptData)

            // Load existing chapter metadata
            const { data: chapters } = await supabase
                .from('chapters')
                .select('chapter_number')
                .eq('manuscript_id', manuscriptId)

            if (chapters) {
                // Check for prologue (chapter_number = 0)
                const hasPrologue = chapters.some(ch => ch.chapter_number === 0)
                setExistingHasPrologue(hasPrologue)

                // Check for epilogue (chapter_number = 999)
                const hasEpilogue = chapters.some(ch => ch.chapter_number === 999)
                setExistingHasEpilogue(hasEpilogue)

                // Count regular chapters (exclude prologue=0 and epilogue=999)
                const regularChapters = chapters.filter(ch => ch.chapter_number !== 0 && ch.chapter_number !== 999)
                setExistingChapterCount(regularChapters.length)

                console.log('📊 Existing manuscript structure:', {
                    totalChapters: chapters.length,
                    regularChapters: regularChapters.length,
                    hasPrologue,
                    hasEpilogue
                })
            }
        }

        loadManuscript()
    }, [searchParams, router])

    const handleFileSelection = async (selectedFile: File) => {
        setFile(selectedFile)
        setUploadStatus('processing')
        setStatusMessage('📖 Processing your PDF manuscript...')
        setIsProcessing(true)

        try {
            // Extract text from PDF
            setStatusMessage('📄 Extracting text from PDF...')

            const extractFormData = new FormData()
            extractFormData.append('file', selectedFile)
            extractFormData.append('fileName', selectedFile.name)

            const extractResponse = await fetch('https://spikeislandstudios.app.n8n.cloud/webhook/extract-pdf-text', {
                method: 'POST',
                body: extractFormData
            })

            if (!extractResponse.ok) {
                throw new Error('Failed to extract text from PDF')
            }

            const extractResult = await extractResponse.json()
            const extractedText = extractResult.text || extractResult.extractedText || ''

            if (!extractedText || extractedText.length < 100) {
                throw new Error('Could not extract sufficient text from PDF.')
            }

            setExtractedText(extractedText)

            // Calculate word count
            setStatusMessage('🔢 Analyzing word count...')
            const finalWordCount = extractedText.trim().split(/\s+/).filter((w: string) => w.length > 0).length

            setWordCount(finalWordCount)
            setUploadStatus('success')
            setStatusMessage(`✅ Manuscript processed: ${finalWordCount.toLocaleString()} words`)

        } catch (error) {
            console.error('File processing error:', error)
            setUploadStatus('error')
            const errorMessage = error instanceof Error ? error.message : 'File processing failed'
            setStatusMessage(`❌ ${errorMessage}`)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFileSelection(files[0])
        }
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragOver(false)
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragOver(false)

        const files = e.dataTransfer.files
        if (files.length > 0) {
            handleFileSelection(files[0])
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!manuscript || !file || !extractedText) {
            setStatusMessage('❌ Missing required information.')
            return
        }

        const formData = new FormData(e.currentTarget)
        const chapterCount = parseInt(formData.get('chapterCount') as string) || 0
        const hasPrologue = formData.get('hasPrologue') === 'on'
        const hasEpilogue = formData.get('hasEpilogue') === 'on'
        const manuscriptTitle = formData.get('manuscriptTitle') as string
        const genre = formData.get('genre') as string

        if (!manuscriptTitle || !genre) {
            setStatusMessage('❌ Please fill in all required fields.')
            return
        }

        setIsSubmitting(true)

        try {
            const supabase = createClient()

            // 1. Delete all existing chapters
            console.log('🗑️ Deleting old chapters...')
            await supabase
                .from('chapters')
                .delete()
                .eq('manuscript_id', manuscript.id)

            // 2. Delete all existing issues
            console.log('🗑️ Deleting old issues...')
            await supabase
                .from('manuscript_issues')
                .delete()
                .eq('manuscript_id', manuscript.id)

            // 3. Delete all chat history (FIXED: correct table name)
            console.log('🗑️ Deleting old chat history...')
            await supabase
                .from('editor_chat_history')
                .delete()
                .eq('manuscript_id', manuscript.id)

            // 4. Delete any manuscript version snapshots
            console.log('🗑️ Deleting old version snapshots...')
            await supabase
                .from('manuscript_versions')
                .delete()
                .eq('manuscript_id', manuscript.id)

            // 5. Reset publishing progress (Taylor's Phase 4 data)
            console.log('🔄 Resetting publishing progress...')
            await supabase
                .from('publishing_progress')
                .update({
                    assessment_completed: false,
                    assessment_completed_at: null,
                    assessment_answers: null,
                    publishing_plan: null,
                    plan_pdf_url: null,
                    current_step: null,
                    completed_steps: [],
                    cover_concepts: null,
                    selected_cover_url: null,
                    front_matter: null,
                    back_matter: null,
                    formatting_completed_at: null,
                    metadata_completed_at: null,
                    step_data: null
                })
                .eq('manuscript_id', manuscript.id)

            // 6. Reset editing phases
            console.log('🔄 Resetting editing phases...')
            await supabase
                .from('editing_phases')
                .update({
                    phase_status: 'pending',
                    ai_read_started_at: null,
                    ai_read_completed_at: null,
                    phase_completed_at: null,
                    report_pdf_url: null,
                    chapters_analyzed: 0,
                    chapters_approved: 0
                })
                .eq('manuscript_id', manuscript.id)
                .neq('phase_number', 1)  // Keep Phase 1 separate

            // Set Phase 1 back to active
            await supabase
                .from('editing_phases')
                .update({
                    phase_status: 'active',
                    ai_read_started_at: null,
                    ai_read_completed_at: null,
                    phase_completed_at: null,
                    report_pdf_url: null,
                    chapters_analyzed: 0,
                    chapters_approved: 0
                })
                .eq('manuscript_id', manuscript.id)
                .eq('phase_number', 1)

            // 7. Update manuscript record (FIXED: correct column name)
            console.log('📝 Updating manuscript...')
            await supabase
                .from('manuscripts')
                .update({
                    title: manuscriptTitle,
                    genre: genre,
                    current_word_count: wordCount,
                    full_text: extractedText,  // FIXED: was manuscript_text
                    manuscript_summary: null,
                    full_analysis_key_points: null,
                    full_analysis_text: null,
                    report_pdf_url: null,
                    analysis_started_at: null,
                    status: 'pending',
                    updated_at: new Date().toISOString()
                })
                .eq('id', manuscript.id)

            // 8. Trigger chapter parsing
            setStatusMessage('📖 Parsing your chapters...')

            const parseResponse = await fetch('https://spikeislandstudios.app.n8n.cloud/webhook/parse-chapters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manuscriptId: manuscript.id,
                    manuscriptText: extractedText,
                    expectedChapters: chapterCount,
                    hasPrologue: hasPrologue,
                    hasEpilogue: hasEpilogue
                })
            })

            if (parseResponse.ok) {
                // Poll for chapters
                setStatusMessage('🔍 Verifying chapters are ready...')

                let chaptersFound = false
                for (let attempt = 0; attempt < 10; attempt++) {
                    await new Promise(resolve => setTimeout(resolve, 1000))

                    const { data: chapters } = await supabase
                        .from('chapters')
                        .select('id')
                        .eq('manuscript_id', manuscript.id)

                    if (chapters && chapters.length > 0) {
                        console.log(`✅ Verified ${chapters.length} chapters`)
                        setStatusMessage(`✅ Found ${chapters.length} chapters! Returning to studio...`)
                        chaptersFound = true
                        break
                    }
                }

                if (!chaptersFound) {
                    console.warn('⚠️ Chapters not found after 10 seconds')
                    setStatusMessage('⚠️ Chapters are still processing. Redirecting anyway...')
                }
            }

            // 9. Redirect back to author studio
            console.log('✅ Redirecting to author studio...')
            setTimeout(() => {
                router.push(`/author-studio?manuscriptId=${manuscript.id}`)
            }, 2000)

        } catch (error) {
            console.error('❌ Re-upload error:', error)
            setIsSubmitting(false)
            const errorMessage = error instanceof Error ? error.message : 'Re-upload failed'
            setStatusMessage(`❌ Error: ${errorMessage}`)
            setUploadStatus('error')
        }
    }

    if (!manuscript) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-white text-2xl">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-5">
            {/* Loading Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-12 text-center max-w-md shadow-2xl">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Replacing Your Manuscript
                        </h3>
                        <p className="text-gray-600">
                            {statusMessage || 'Setting up your new manuscript...'}
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                {/* Warning Header */}
                <div className="text-center mb-8 text-white">
                    <h1 className="text-5xl font-bold mb-4">Replace Manuscript</h1>
                    <div className="text-3xl font-semibold mb-4 opacity-95">{authorName}</div>

                    {/* Warning Box */}
                    <div className="bg-yellow-500 border-4 border-yellow-600 rounded-2xl p-6 mb-6">
                        <div className="text-4xl mb-3">⚠️</div>
                        <h2 className="text-2xl font-bold text-yellow-900 mb-3">Important Warning</h2>
                        <p className="text-yellow-900 font-medium">
                            Uploading a new manuscript will permanently delete:
                        </p>
                        <ul className="text-yellow-900 font-medium mt-3 space-y-1">
                            <li>• All current chapters</li>
                            <li>• All editor notes and analysis</li>
                            <li>• All chat history</li>
                            <li>• All editing progress</li>
                            <li>• All cover designs and publishing setup</li>
                        </ul>
                        <p className="text-yellow-900 font-bold mt-4">
                            This action cannot be undone!
                        </p>
                    </div>

                    <p className="text-xl opacity-90">
                        Current manuscript: <strong>&quot;{manuscript.title}&quot;</strong>
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl p-12 shadow-2xl">
                    <form onSubmit={handleSubmit}>
                        {/* File Upload */}
                        <div className="mb-10">
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('fileInput')?.click()}
                                className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${dragOver ? 'border-blue-600 bg-blue-50' :
                                    uploadStatus === 'processing' ? 'border-yellow-500 bg-yellow-50 animate-pulse' :
                                        uploadStatus === 'success' ? 'border-green-500 bg-green-50' :
                                            'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
                                    }`}
                            >
                                <div className="text-6xl mb-5">
                                    {uploadStatus === 'processing' ? '⏳' : uploadStatus === 'success' ? '✅' : '📖'}
                                </div>
                                <div className="text-2xl font-semibold text-gray-900 mb-3">
                                    {uploadStatus === 'success' && file ? `${file.name} uploaded!` : 'Upload New Manuscript'}
                                </div>
                                <div className="text-gray-600 mb-6">
                                    {uploadStatus === 'success' && wordCount > 0
                                        ? `${wordCount.toLocaleString()} words ready for analysis`
                                        : 'Drag and drop your PDF or click to browse'}
                                </div>

                                {/* Manuscript Preparation Tips */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
                                    <div className="font-semibold text-blue-900 mb-2 text-center text-sm">
                                        📝 Manuscript Requirements
                                    </div>
                                    <div className="text-blue-800 text-xs space-y-1">
                                        <p>✅ Clear chapter markers (e.g., &quot;Chapter 1 - Title&quot;)</p>
                                        <p>❌ Remove Table of Contents and Index</p>
                                        <p>❌ Remove headers/footers with page numbers</p>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    id="fileInput"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        document.getElementById('fileInput')?.click()
                                    }}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-60"
                                >
                                    {isProcessing ? 'Processing...' : file ? 'Change File' : 'Choose File'}
                                </button>
                            </div>

                            {statusMessage && !isSubmitting && (
                                <div className={`mt-6 p-5 rounded-xl text-center font-medium ${uploadStatus === 'processing' ? 'bg-yellow-50 text-yellow-900 border-2 border-yellow-500' :
                                    uploadStatus === 'success' ? 'bg-green-50 text-green-900 border-2 border-green-500' :
                                        uploadStatus === 'error' ? 'bg-red-50 text-red-900 border-2 border-red-500' :
                                            ''
                                    }`}>
                                    {statusMessage}
                                </div>
                            )}
                        </div>

                        {/* Manuscript Details */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label htmlFor="manuscriptTitle" className="block font-semibold text-gray-800 mb-2">
                                    Manuscript Title *
                                </label>
                                <input
                                    type="text"
                                    id="manuscriptTitle"
                                    name="manuscriptTitle"
                                    required
                                    defaultValue={manuscript?.title || ''}
                                    placeholder="Your manuscript title"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="genre" className="block font-semibold text-gray-800 mb-2">
                                    Genre *
                                </label>
                                <select
                                    id="genre"
                                    name="genre"
                                    required
                                    defaultValue={manuscript?.genre || ''}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none bg-white"
                                >
                                    <option value="">Choose your genre</option>
                                    <option value="fiction">Fiction</option>
                                    <option value="non-fiction">Non-Fiction</option>
                                    <option value="fantasy">Fantasy</option>
                                    <option value="science-fiction">Science Fiction</option>
                                    <option value="romance">Romance</option>
                                    <option value="mystery">Mystery/Thriller</option>
                                    <option value="historical">Historical Fiction</option>
                                    <option value="literary">Literary Fiction</option>
                                    <option value="young-adult">Young Adult</option>
                                    <option value="children">Children&apos;s</option>
                                    <option value="memoir">Memoir</option>
                                    <option value="biography">Biography</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Chapter Count */}
                        <div className="mb-6">
                            <label htmlFor="chapterCount" className="block font-semibold text-gray-800 mb-2">
                                Number of Chapters *
                            </label>
                            <input
                                type="number"
                                id="chapterCount"
                                name="chapterCount"
                                min="1"
                                max="200"
                                required
                                defaultValue={existingChapterCount || ''}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none"
                            />
                            <small className="text-gray-600">
                                How many chapters does your manuscript have? (excluding prologue/epilogue)
                            </small>
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-3 mb-10">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="hasPrologue"
                                    name="hasPrologue"
                                    defaultChecked={existingHasPrologue}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <span className="text-gray-800">My manuscript has a prologue</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="hasEpilogue"
                                    name="hasEpilogue"
                                    defaultChecked={existingHasEpilogue}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <span className="text-gray-800">My manuscript has an epilogue</span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 bg-gray-200 text-gray-800 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-300 transition-all"
                            >
                                ← Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!isFormValid || isSubmitting}
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🔄 Replace Manuscript
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function ReUploadPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-white text-2xl">Loading...</div>
            </div>
        }>
            <ReUploadContent />
        </Suspense>
    )
}