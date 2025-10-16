'use client'

import { Suspense, useState, useEffect, FormEvent, ChangeEvent, DragEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createManuscript, updateAuthorProfile } from '@/lib/supabase/queries'
import type { AuthorProfile } from '@/lib/supabase/queries'

function OnboardingContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [file, setFile] = useState<File | null>(null)
    const [extractedText, setExtractedText] = useState<string>('')
    const [wordCount, setWordCount] = useState<number>(0)
    const [manuscriptId, setManuscriptId] = useState<string>('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
    const [statusMessage, setStatusMessage] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const [authorName, setAuthorName] = useState('Let\'s get you set up')

    const WORD_COUNT_WEBHOOK = 'https://spikeislandstudios.app.n8n.cloud/webhook/portal-word-count'
    const ONBOARDING_WEBHOOK = 'https://spikeislandstudios.app.n8n.cloud/webhook/onboarding'

    useEffect(() => {
        loadAuthorName()
        generateManuscriptId()
    }, [])

    const loadAuthorName = () => {
        const firstName = searchParams.get('firstName') ||
            localStorage.getItem('currentUserFirstName') ||
            sessionStorage.getItem('currentUserFirstName')

        if (firstName) {
            setAuthorName(`Hi ${firstName}!`)
        } else {
            const email = searchParams.get('email') || localStorage.getItem('currentUserEmail')
            if (email) {
                const emailName = email.split('@')[0]
                const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1)
                setAuthorName(`Hi ${formattedName}!`)
            }
        }
    }

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

        if (fileName.endsWith('.txt')) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = (e) => resolve(e.target?.result as string || '')
                reader.onerror = () => reject(new Error('Failed to read text file'))
                reader.readAsText(file)
            })
        } else if (fileName.endsWith('.docx')) {
            // For DOCX files, we'll use the fallback for now
            // In production, you'd want to use a library like mammoth
            throw new Error('DOCX processing requires server-side handling')
        } else {
            throw new Error('Unsupported file format')
        }
    }

    const handleFileSelection = async (selectedFile: File) => {
        setFile(selectedFile)
        setUploadStatus('processing')
        setStatusMessage('📖 Reading your manuscript...')
        setIsProcessing(true)

        const userId = searchParams.get('userId') || localStorage.getItem('currentUserId')

        if (!userId) {
            setUploadStatus('error')
            setStatusMessage('Error: User not identified. Please log in again.')
            setIsProcessing(false)
            return
        }

        try {
            // Extract text
            setStatusMessage('🔍 Analyzing your text...')
            const text = await extractTextFromFile(selectedFile)
            setExtractedText(text)

            if (!text || text.length < 100) {
                throw new Error('Could not extract readable text from the file')
            }

            // Send to word count workflow
            const textPayload = {
                manuscriptText: text,
                fileName: selectedFile.name,
                manuscriptId: manuscriptId,
                fileSize: selectedFile.size,
                fileType: selectedFile.type,
                phaseType: 'developmental_editing',
                textLength: text.length,
                userId: userId,
                author_id: userId,
                manuscriptTitle: 'Processing',
                genre: 'fiction'
            }

            const wordCountResponse = await fetch(WORD_COUNT_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(textPayload)
            })

            let wordCountResult
            let finalWordCount = 0
            try {
                wordCountResult = await wordCountResponse.json()
                finalWordCount = wordCountResult.wordCount || countWords(text)
            } catch (e) {
                finalWordCount = countWords(text)
            }

            setWordCount(finalWordCount)

            // Store in session
            sessionStorage.setItem('manuscriptContent', text)
            sessionStorage.setItem('uploadedWordCount', finalWordCount.toString())
            sessionStorage.setItem('manuscriptId', manuscriptId)
            sessionStorage.setItem('userId', userId)

            setUploadStatus('success')
            setStatusMessage(`✅ Perfect! Your manuscript has been analyzed. ${finalWordCount.toLocaleString()} words ready for your AI specialists!`)
            setIsProcessing(false)

        } catch (error) {
            console.error('File processing error:', error)

            // Fallback to estimation
            const estimated = estimateWordCount(selectedFile)
            setWordCount(estimated)
            setUploadStatus('success')
            setStatusMessage(`✅ Great! Your manuscript is ready. Your AI specialists are excited to work with you!`)
            setIsProcessing(false)

            sessionStorage.setItem('manuscriptContent', `[File: ${selectedFile.name}]\n\nYour manuscript content will be processed when you enter the writing studio.`)
            sessionStorage.setItem('uploadedWordCount', estimated.toString())
            sessionStorage.setItem('manuscriptId', manuscriptId)
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

        const formData = new FormData(e.currentTarget)
        const userId = searchParams.get('userId') || localStorage.getItem('currentUserId')
        const authorProfileId = localStorage.getItem('authorProfileId')
        const email = searchParams.get('email') || localStorage.getItem('currentUserEmail')
        const firstName = searchParams.get('firstName') || localStorage.getItem('currentUserFirstName')
        const lastName = searchParams.get('lastName') || localStorage.getItem('currentUserLastName')

        if (!userId || !authorProfileId) {
            setStatusMessage('❌ Error: User not identified. Please log in again.')
            return
        }

        const chapterCount = parseInt(formData.get('chapterCount') as string) || 0
        const hasPrologue = formData.get('hasPrologue') === 'on'
        const hasEpilogue = formData.get('hasEpilogue') === 'on'
        const manuscriptTitle = formData.get('manuscriptTitle') as string
        const genre = formData.get('genre') as string

        setIsSubmitting(true)

        try {
            // Step 1: Create manuscript in Supabase
            console.log('📝 Creating manuscript in Supabase...')
            const manuscript = await createManuscript({
                author_id: authorProfileId,
                title: manuscriptTitle,
                genre: genre,
                current_word_count: wordCount,
                full_text: extractedText,
                total_chapters: chapterCount,
                expected_chapters: chapterCount,
                has_prologue: hasPrologue,
                has_epilogue: hasEpilogue
            })

            console.log('✅ Manuscript created:', manuscript.id)

            // Step 2: Store session data
            sessionStorage.setItem('onboardingComplete', 'true')
            sessionStorage.setItem('manuscriptTitle', manuscriptTitle)
            sessionStorage.setItem('manuscriptGenre', genre)
            sessionStorage.setItem('manuscriptId', manuscript.id)

            // Step 3: Mark onboarding as complete
            await updateAuthorProfile(userId, {
                onboarding_complete: true
            } as Partial<AuthorProfile>)

            // Step 4: Trigger n8n workflows for chapter parsing and analysis
            console.log('🔄 Triggering n8n workflows...')

            // Send to onboarding webhook
            const webhookData = {
                accountData: { email, firstName, lastName },
                userId: userId,
                author_id: authorProfileId,
                manuscriptTitle: manuscriptTitle,
                genre: genre,
                bookGenre: genre,
                chapterCount: chapterCount,
                expectedChapters: chapterCount,
                hasPrologue: hasPrologue,
                hasEpilogue: hasEpilogue,
                writingExperience: 'some-experience',
                publishingGoal: 'improve-writing',
                fileName: file?.name || '',
                fileSize: file?.size || 0,
                fileType: file?.type || '',
                wordCount: wordCount,
                manuscriptId: manuscript.id,
                manuscriptContent: extractedText,
                manuscriptText: extractedText,
                onboardingCompleted: true,
                timestamp: new Date().toISOString()
            }

            await fetch(ONBOARDING_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookData)
            })

            console.log('✅ Onboarding webhook triggered')

            // Trigger chapter parsing (this will create chapters in Supabase via n8n)
            console.log('📚 Triggering chapter parsing...')
            fetch('https://spikeislandstudios.app.n8n.cloud/webhook/parse-chapters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manuscriptId: manuscript.id,
                    manuscriptText: extractedText,
                    expectedChapters: chapterCount,
                    hasPrologue: hasPrologue,
                    hasEpilogue: hasEpilogue
                })
            }).then(() => {
                console.log('✅ Chapter parsing triggered')
            }).catch(err => console.error('⚠️ Chapter parsing error:', err))

            // Step 5: Redirect to author studio
            console.log('✅ Redirecting to author studio...')
            setTimeout(() => {
                router.push(`/author-studio?userId=${userId}&manuscriptId=${manuscript.id}`)
            }, 1500)

        } catch (error) {
            console.error('❌ Onboarding error:', error)
            setIsSubmitting(false)
            const errorMessage = error instanceof Error ? error.message : 'Onboarding failed'
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
                                    accept=".docx,.txt"
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