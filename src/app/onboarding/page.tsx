'use client'

import { Suspense, useState, useEffect, useCallback, FormEvent, ChangeEvent, DragEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createManuscript, updateAuthorProfile } from '@/lib/supabase/queries'
import type { AuthorProfile } from '@/lib/supabase/queries'

function OnboardingContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [authorName, setAuthorName] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [extractedText, setExtractedText] = useState<string>('')
    const [wordCount, setWordCount] = useState<number>(0)
    const [manuscriptId, setManuscriptId] = useState<string>('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
    const [statusMessage, setStatusMessage] = useState('')
    const [dragOver, setDragOver] = useState(false)

    const WORD_COUNT_WEBHOOK = 'https://spikeislandstudios.app.n8n.cloud/webhook/portal-word-count'
    const ONBOARDING_WEBHOOK = 'https://spikeislandstudios.app.n8n.cloud/webhook/onboarding'

    const loadAuthorName = useCallback(() => {
        const firstName = searchParams.get('firstName') || localStorage.getItem('currentUserFirstName')
        if (firstName) {
            setAuthorName(firstName)
        } else {
            const email = searchParams.get('email') || localStorage.getItem('currentUserEmail')
            if (email) {
                const emailName = email.split('@')[0]
                const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1)
                setAuthorName(formattedName)
            }
        }
    }, [searchParams])

    useEffect(() => {
        loadAuthorName()
    }, [loadAuthorName])

    useEffect(() => {
        const fetchProfileId = async () => {
            // Try URL first
            let profileId = searchParams.get('authorProfileId')

            // Then try localStorage
            if (!profileId) {
                profileId = localStorage.getItem('authorProfileId')
            }

            // If still missing, query Supabase
            if (!profileId) {
                const userId = searchParams.get('userId') || localStorage.getItem('currentUserId')

                if (userId) {
                    console.log('⚠️ No profileId found, querying Supabase for user:', userId)

                    try {
                        const { createClient } = await import('@/lib/supabase/client')
                        const supabase = createClient()

                        const { data: profile } = await supabase
                            .from('author_profiles')
                            .select('id')
                            .eq('auth_user_id', userId)
                            .maybeSingle()

                        if (profile && profile.id) {
                            profileId = profile.id
                            console.log('✅ Found profile from Supabase:', profileId)
                        }
                    } catch (error) {
                        console.error('Error fetching profile:', error)
                    }
                }
            }

            if (profileId) {
                localStorage.setItem('authorProfileId', profileId)
                console.log('✅ authorProfileId set:', profileId)
            } else {
                console.warn('⚠️ Still no authorProfileId - form submission will fail')
            }
        }

        fetchProfileId()
    }, [searchParams])

    const generateManuscriptId = () => {
        const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0
            const v = c == 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
        setManuscriptId(id)
    }

    const countWords = (text: string): number => {
        if (!text) return 0
        return text.trim().split(/\s+/).filter(word => word.length > 0).length
    }

    const estimateWordCount = (file: File): number => {
        const avgBytesPerWord = 5
        return Math.round(file.size / avgBytesPerWord)
    }

    const extractTextFromFile = async (file: File): Promise<string> => {
        const fileName = file.name.toLowerCase()

        if (!fileName.endsWith('.pdf')) {
            throw new Error('Only PDF files are supported at this time. Please convert your manuscript to PDF.')
        }

        // Send PDF to word count webhook
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('fileName', file.name)
            formData.append('fileSize', file.size.toString())

            setStatusMessage('📄 Analyzing PDF...')

            const response = await fetch(WORD_COUNT_WEBHOOK, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error(`PDF processing failed: ${response.status}`)
            }

            const result = await response.json()

            // Extract the text and word count from response
            const extractedText = result.text || result.extractedText || result.manuscriptText || ''
            const calculatedWordCount = result.wordCount || result.word_count || 0

            if (!extractedText || extractedText.length < 100) {
                throw new Error('Could not extract text from PDF. Please ensure the file is not password-protected.')
            }

            // Set word count from the webhook response
            setWordCount(calculatedWordCount)
            console.log('✅ PDF processed:', calculatedWordCount, 'words')

            return extractedText

        } catch (error) {
            console.error('PDF extraction error:', error)
            throw new Error('Failed to process PDF. Please ensure the file is not password-protected or corrupted.')
        }
    }

    const handleFileSelection = async (selectedFile: File) => {
        setFile(selectedFile)
        setUploadStatus('processing')
        setStatusMessage('📖 Processing your PDF manuscript...')
        setIsProcessing(true)

        const userId = searchParams.get('userId') || localStorage.getItem('currentUserId')

        if (!userId) {
            setUploadStatus('error')
            setStatusMessage('❌ Error: User not identified. Please log in again.')
            setIsProcessing(false)
            return
        }

        try {
            // Extract text - this calls pdf-word-count webhook
            const text = await extractTextFromFile(selectedFile)
            setExtractedText(text)

            setUploadStatus('success')
            setStatusMessage(`✅ Manuscript processed: ${wordCount.toLocaleString()} words`)

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
        console.log('=== FORM SUBMIT START ===')

        const formData = new FormData(e.currentTarget)
        const userId = searchParams.get('userId') || localStorage.getItem('currentUserId')
        const authorProfileId = localStorage.getItem('authorProfileId')
        const email = searchParams.get('email') || localStorage.getItem('currentUserEmail')
        const firstName = searchParams.get('firstName') || localStorage.getItem('currentUserFirstName')
        const lastName = searchParams.get('lastName') || localStorage.getItem('currentUserLastName')

        console.log('Submit validation:', {
            hasFile: !!file,
            hasText: !!extractedText,
            wordCount,
            userId,
            authorProfileId
        })

        if (!userId || !authorProfileId || !file || !extractedText) {
            setStatusMessage('❌ Missing required information. Please ensure you uploaded a manuscript.')
            return
        }

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
        console.log('🚀 Submitting to onboarding webhook...')

        try {
            // Generate a manuscript ID if we don't have one
            if (!manuscriptId) {
                generateManuscriptId()
            }

            const finalManuscriptId = manuscriptId || `ms-${Date.now()}`

            // Prepare the payload for onboarding webhook
            const onboardingPayload = {
                // User info
                userId: userId,
                author_id: authorProfileId,
                authorEmail: email,
                firstName: firstName,
                lastName: lastName,

                // Manuscript info
                manuscriptId: finalManuscriptId,
                manuscriptTitle: manuscriptTitle,
                bookTitle: manuscriptTitle,
                genre: genre,

                // Content
                manuscriptText: extractedText,
                manuscriptContent: extractedText,
                wordCount: wordCount,

                // Chapter info
                chapterCount: chapterCount,
                expectedChapters: chapterCount,
                hasPrologue: hasPrologue,
                hasEpilogue: hasEpilogue,

                // File info
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,

                // Metadata
                onboardingCompleted: true,
                timestamp: new Date().toISOString()
            }

            console.log('Sending to onboarding webhook:', {
                manuscriptTitle,
                wordCount,
                manuscriptId: finalManuscriptId
            })

            // Send to onboarding webhook
            const response = await fetch(ONBOARDING_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(onboardingPayload)
            })

            if (!response.ok) {
                throw new Error(`Onboarding webhook failed: ${response.status}`)
            }

            const result = await response.json()
            console.log('✅ Onboarding webhook response:', result)

            // Get manuscript ID from response if provided
            const savedManuscriptId = result.manuscriptId || result.manuscript_id || finalManuscriptId

            // Store in session/local storage
            sessionStorage.setItem('onboardingComplete', 'true')
            sessionStorage.setItem('manuscriptId', savedManuscriptId)
            localStorage.setItem('currentManuscriptId', savedManuscriptId)

            // Redirect to author studio
            console.log('✅ Redirecting to author studio...')
            setTimeout(() => {
                router.push(`/author-studio?userId=${userId}&manuscriptId=${savedManuscriptId}`)
            }, 2000)

        } catch (error) {
            console.error('❌ SUBMISSION ERROR:', error)
            setIsSubmitting(false)
            const errorMessage = error instanceof Error ? error.message : 'Submission failed'
            setStatusMessage(`❌ Error: ${errorMessage}`)
            setUploadStatus('error')
        }
    }

    const isFormValid = file && wordCount > 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-5">
            {/* Loading Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-12 text-center max-w-md shadow-2xl">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Setting Up Your Writing Studio
                        </h3>
                        <p className="text-gray-600">
                            Preparing everything for your collaboration with AI specialists...
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                {/* Welcome Header */}
                <div className="text-center mb-12 text-white">
                    <h1 className="text-5xl font-bold mb-4">Welcome!</h1>
                    <div className="text-3xl font-semibold mb-4 opacity-95">{authorName}</div>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Let&apos;s set up your personal writing workspace with AI specialists who will guide you through every step of your journey
                    </p>
                </div>

                {/* Main Setup Card */}
                <div className="bg-white rounded-3xl p-12 shadow-2xl">
                    {/* AI Preview */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 rounded-2xl p-8 mb-10 text-center">
                        <div className="text-5xl mb-4">🚀✨</div>
                        <h3 className="text-2xl font-bold text-blue-900 mb-3">Your AI Writing Studio Awaits</h3>
                        <p className="text-blue-800">
                            Upload your manuscript and we&apos;ll set up a personalized workspace where you can collaborate with AI specialists throughout your entire writing journey.
                        </p>
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Let&apos;s Start with Your Manuscript</h2>
                        <p className="text-xl text-gray-600">
                            Share your work so we can set up your personalized writing workspace
                        </p>
                    </div>

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
                                    {uploadStatus === 'success' && file ? `${file.name} uploaded!` : 'Share Your Manuscript'}
                                </div>
                                <div className="text-gray-600 mb-6">
                                    {uploadStatus === 'success' && wordCount > 0
                                        ? `${wordCount.toLocaleString()} words ready for analysis`
                                        : 'Upload your manuscript as Word (.docx) or Text (.txt)'}
                                </div>

                                {/* Formatting Tip */}
                                <div className="bg-blue-50 border border-blue-500 rounded-xl p-5 mb-6 text-left max-w-xl mx-auto">
                                    <div className="font-semibold text-blue-900 mb-2 text-center">
                                        📝 Quick Formatting for Best Results
                                    </div>
                                    <div className="text-blue-800 text-sm space-y-1">
                                        <p><strong>Format chapters as simple numbered lists:</strong></p>
                                        <code className="block bg-white px-3 py-1 rounded my-1">1. Your Chapter Title</code>
                                        <code className="block bg-white px-3 py-1 rounded my-1">2. Another Chapter Title</code>
                                        <p className="text-xs mt-2 opacity-75">
                                            Including &quot;0. Prologue&quot; helps us analyze your complete story structure.
                                            This formatting is just for analysis - you can change it back for publishing.
                                        </p>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    id="fileInput"
                                    accept=".pdf,.docx,.doc,.txt"
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

                            {/* Status Message */}
                            {statusMessage && (
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
                                    What&apos;s your story called? *
                                </label>
                                <input
                                    type="text"
                                    id="manuscriptTitle"
                                    name="manuscriptTitle"
                                    required
                                    placeholder="Your manuscript title"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="genre" className="block font-semibold text-gray-800 mb-2">
                                    What genre are we working in? *
                                </label>
                                <select
                                    id="genre"
                                    name="genre"
                                    required
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
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <span className="text-gray-800">My manuscript has a prologue</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="hasEpilogue"
                                    name="hasEpilogue"
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <span className="text-gray-800">My manuscript has an epilogue</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="text-center pt-8 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={!isFormValid || isSubmitting}
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-12 py-5 rounded-xl text-xl font-bold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[280px]"
                            >
                                🚀 Enter Your Writing Studio
                            </button>
                            <p className="mt-5 text-gray-600">
                                Your AI specialists will be waiting for you in your collaborative writing workspace
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-white text-2xl">Loading...</div>
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    )
}