'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BackMatterSectionProps {
    manuscript: {
        id: string
        title: string
        genre: string
    }
    publishingProgress: {
        back_matter?: BackMatterData
    } | null
    manuscriptId: string
    authorFirstName: string
}

interface BackMatterData {
    author_bio?: {
        bio_text?: string
        author_tagline?: string
        profile_image_url?: string
        completed?: boolean
    }
    author_note?: {
        text?: string
        completed?: boolean
    }
    next_book_preview?: {
        title?: string
        preview_text?: string
        completed?: boolean
    }
}

type BackMatterItem = 'author_bio' | 'author_note' | 'next_book_preview'

interface EditorBaseProps {
    backMatter: BackMatterData
    onSave: (itemKey: BackMatterItem, data: Record<string, string | boolean>) => Promise<void>
    onCancel: () => void
    isSaving: boolean
}

interface AuthorBioEditorProps extends EditorBaseProps {
    authorFirstName: string
    authorProfileId: string
}

export default function BackMatterSection({
    manuscript,
    publishingProgress,
    manuscriptId,
    authorFirstName
}: BackMatterSectionProps) {
    const [activeItem, setActiveItem] = useState<BackMatterItem | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [backMatter, setBackMatter] = useState<BackMatterData>(publishingProgress?.back_matter || {})
    const [authorProfileId, setAuthorProfileId] = useState<string>('')

    // Load author profile ID
    useEffect(() => {
        async function loadAuthorProfile() {
            const supabase = createClient()

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('author_profiles')
                .select('id, profile_image_url')
                .eq('auth_user_id', user.id)
                .single()

            if (profile) {
                setAuthorProfileId(profile.id)

                // If back matter doesn't have profile image but profile does, use it
                if (profile.profile_image_url && !backMatter.author_bio?.profile_image_url) {
                    setBackMatter({
                        ...backMatter,
                        author_bio: {
                            ...backMatter.author_bio,
                            profile_image_url: profile.profile_image_url
                        }
                    })
                }
            }
        }

        loadAuthorProfile()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Subscribe to realtime updates
    useEffect(() => {
        const supabase = createClient()

        const channel = supabase
            .channel(`back-matter-${manuscriptId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'publishing_progress',
                    filter: `manuscript_id=eq.${manuscriptId}`
                },
                (payload) => {
                    if (payload.new.back_matter) {
                        setBackMatter(payload.new.back_matter as BackMatterData)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [manuscriptId])

    async function saveBackMatterItem(itemKey: BackMatterItem, data: Record<string, string | boolean>) {
        setIsSaving(true)

        const supabase = createClient()

        const updatedBackMatter: BackMatterData = {
            ...backMatter,
            [itemKey]: {
                ...data,
                completed: true
            } as BackMatterData[typeof itemKey]
        }

        const { error } = await supabase
            .from('publishing_progress')
            .update({ back_matter: updatedBackMatter })
            .eq('manuscript_id', manuscriptId)

        if (error) {
            console.error('Error saving back matter:', error)
            alert('Error saving. Please try again.')
        } else {
            setBackMatter(updatedBackMatter)
            setActiveItem(null)
        }

        setIsSaving(false)
    }

    const backMatterItems = [
        {
            id: 'author_bio' as BackMatterItem,
            icon: '👤',
            title: 'Author Bio',
            description: 'Tell readers about yourself with photo',
            isComplete: backMatter.author_bio?.completed || false,
            isRequired: true
        },
        {
            id: 'author_note' as BackMatterItem,
            icon: '💌',
            title: 'Author Note',
            description: 'Share your thoughts with readers',
            isComplete: backMatter.author_note?.completed || false,
            isRequired: false
        },
        {
            id: 'next_book_preview' as BackMatterItem,
            icon: '📚',
            title: 'Preview Next Book',
            description: 'Hook readers with your next story',
            isComplete: backMatter.next_book_preview?.completed || false,
            isRequired: false
        }
    ]

    if (activeItem) {
        return renderEditor(
            activeItem,
            backMatter,
            saveBackMatterItem,
            () => setActiveItem(null),
            isSaving,
            authorFirstName,
            authorProfileId
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-300">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-3xl">
                        📑
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Back Matter</h2>
                        <p className="text-gray-600">Author information and bonus content</p>
                    </div>
                </div>

                {/* Progress Summary */}
                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-purple-900">Progress</span>
                        <span className="text-sm text-purple-700">
                            {backMatterItems.filter(i => i.isComplete).length}/{backMatterItems.length} complete
                        </span>
                    </div>
                    <div className="bg-purple-200 rounded-full h-2">
                        <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${(backMatterItems.filter(i => i.isComplete).length / backMatterItems.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Back Matter Items */}
                <div className="space-y-3">
                    {backMatterItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveItem(item.id)}
                            className={`w-full p-6 rounded-xl border-2 transition-all text-left ${item.isComplete
                                    ? 'bg-green-50 border-green-300 hover:border-green-400'
                                    : item.isRequired
                                        ? 'bg-yellow-50 border-yellow-300 hover:border-yellow-400'
                                        : 'bg-gray-50 border-gray-200 hover:border-purple-300'
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

                {/* Help Section */}
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <p className="text-purple-800 text-sm">
                        💬 <strong>Need help?</strong> Ask Taylor: &quot;Help me write my author bio&quot; or &quot;Create an author note for my readers&quot;
                    </p>
                </div>
            </div>
        </div>
    )
}

// Editor renderer
function renderEditor(
    itemKey: BackMatterItem,
    backMatter: BackMatterData,
    onSave: (itemKey: BackMatterItem, data: Record<string, string | boolean>) => Promise<void>,
    onCancel: () => void,
    isSaving: boolean,
    authorFirstName: string,
    authorProfileId: string
) {
    switch (itemKey) {
        case 'author_bio':
            return (
                <AuthorBioEditor
                    backMatter={backMatter}
                    onSave={onSave}
                    onCancel={onCancel}
                    isSaving={isSaving}
                    authorFirstName={authorFirstName}
                    authorProfileId={authorProfileId}
                />
            )
        case 'author_note':
            return <AuthorNoteEditor backMatter={backMatter} onSave={onSave} onCancel={onCancel} isSaving={isSaving} />
        case 'next_book_preview':
            return <NextBookPreviewEditor backMatter={backMatter} onSave={onSave} onCancel={onCancel} isSaving={isSaving} />
        default:
            return null
    }
}

// Author Bio Editor with Image Upload
function AuthorBioEditor({ backMatter, onSave, onCancel, isSaving, authorFirstName, authorProfileId }: AuthorBioEditorProps) {
    const [bioText, setBioText] = useState(backMatter.author_bio?.bio_text || '')
    const [tagline, setTagline] = useState(backMatter.author_bio?.author_tagline || '')
    const [profileImageUrl, setProfileImageUrl] = useState(backMatter.author_bio?.profile_image_url || '')
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(profileImageUrl || null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file')
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be under 5MB')
                return
            }

            setImageFile(file)

            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const uploadImage = async () => {
        if (!imageFile) return profileImageUrl

        setIsUploadingImage(true)

        const supabase = createClient()
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${authorProfileId}.${fileExt}`

        const { error } = await supabase.storage
            .from('author-profiles')
            .upload(fileName, imageFile, {
                upsert: true,
                contentType: imageFile.type
            })

        if (error) {
            console.error('Error uploading image:', error)
            alert('Failed to upload image. Please try again.')
            setIsUploadingImage(false)
            return profileImageUrl
        }

        const { data: { publicUrl } } = supabase.storage
            .from('author-profiles')
            .getPublicUrl(fileName)

        // Update author_profiles table
        await supabase
            .from('author_profiles')
            .update({ profile_image_url: publicUrl })
            .eq('id', authorProfileId)

        setIsUploadingImage(false)
        setProfileImageUrl(publicUrl)
        return publicUrl
    }

    const handleSave = async () => {
        let finalImageUrl = profileImageUrl

        if (imageFile) {
            finalImageUrl = await uploadImage()
        }

        await onSave('author_bio', {
            bio_text: bioText,
            author_tagline: tagline,
            profile_image_url: finalImageUrl
        })
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-3xl">
                            👤
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Author Bio</h2>
                            <p className="text-gray-600">Your profile for readers</p>
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
                        {/* Profile Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Profile Photo
                            </label>
                            <div className="flex flex-col items-center gap-4">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Profile preview"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null)
                                                setImagePreview(null)
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center border-4 border-dashed border-purple-400">
                                        <span className="text-purple-400 text-5xl">📷</span>
                                    </div>
                                )}

                                <label className="cursor-pointer px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-lg text-sm">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    {imagePreview ? '✏️ Change Photo' : '📸 Upload Photo'}
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Author Tagline
                            </label>
                            <input
                                type="text"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                placeholder="Award-winning author of..."
                            />
                            <p className="text-xs text-gray-500 mt-1">A short, compelling one-liner</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Biography *
                            </label>
                            <textarea
                                value={bioText}
                                onChange={(e) => setBioText(e.target.value)}
                                rows={10}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                placeholder={`${authorFirstName} is an author who... [Write 100-300 words about yourself, your writing journey, and what readers should know]`}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Write in third person (use &quot;{authorFirstName} is...&quot; instead of &quot;I am...&quot;)
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                            <p className="text-sm text-purple-800">
                                <strong>💡 What to include:</strong><br />
                                • Your writing background<br />
                                • Other books you&apos;ve written<br />
                                • Awards or achievements<br />
                                • Where you live<br />
                                • Personal interests relevant to your writing
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || isUploadingImage || !bioText}
                                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploadingImage ? 'Uploading Image...' : isSaving ? 'Saving...' : 'Save Author Bio'}
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
                    <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4">Preview</h3>
                        <div className="space-y-4">
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Author"
                                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-purple-500 shadow-lg"
                                />
                            )}
                            {tagline && (
                                <p className="text-center text-purple-700 font-semibold italic">{tagline}</p>
                            )}
                            {bioText && (
                                <p className="text-gray-700 text-sm leading-relaxed">{bioText}</p>
                            )}
                            {!bioText && !tagline && !imagePreview && (
                                <p className="text-gray-400 italic text-center">Your author bio preview will appear here</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function AuthorNoteEditor({ backMatter, onSave, onCancel, isSaving }: EditorBaseProps) {
    const [text, setText] = useState(backMatter.author_note?.text || '')

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-pink-500 rounded-xl flex items-center justify-center text-3xl">
                            💌
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Author Note</h2>
                            <p className="text-gray-600">A personal message to your readers</p>
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
                            Your Note to Readers
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={12}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                            placeholder="Thank you so much for reading this book! I hope you enjoyed the journey as much as I enjoyed writing it. If you have a moment, I'd be incredibly grateful if you could leave a review..."
                        />
                        <p className="text-xs text-gray-500 mt-2">Share your gratitude, ask for reviews, or connect with readers</p>
                    </div>

                    <div className="p-4 bg-pink-50 rounded-lg border-2 border-pink-200">
                        <p className="text-sm text-pink-800">
                            <strong>💡 Consider including:</strong><br />
                            • Gratitude for reading<br />
                            • Request for reviews<br />
                            • How to follow you on social media<br />
                            • Mention of upcoming books<br />
                            • Personal story about writing this book
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => onSave('author_note', { text })}
                            disabled={isSaving || !text}
                            className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Author Note'}
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
                        Skip Author Note (Optional)
                    </button>
                </div>
            </div>
        </div>
    )
}

function NextBookPreviewEditor({ backMatter, onSave, onCancel, isSaving }: EditorBaseProps) {
    const [title, setTitle] = useState(backMatter.next_book_preview?.title || '')
    const [previewText, setPreviewText] = useState(backMatter.next_book_preview?.preview_text || '')

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-3xl">
                            📚
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Preview Next Book</h2>
                            <p className="text-gray-600">Hook readers with your next story</p>
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
                            Next Book Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            placeholder="Book 2: The Return"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Preview Text (Chapter 1 excerpt or teaser)
                        </label>
                        <textarea
                            value={previewText}
                            onChange={(e) => setPreviewText(e.target.value)}
                            rows={14}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            placeholder="COMING SOON - [Book Title]

Chapter 1

[Paste an exciting excerpt from the opening of your next book...]"
                        />
                        <p className="text-xs text-gray-500 mt-2">Include first chapter or a compelling teaser (500-1000 words)</p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Tips:</strong><br />
                            • Choose an exciting opening scene<br />
                            • End on a cliffhanger if possible<br />
                            • Include &quot;COMING SOON&quot; or release date<br />
                            • Keep readers wanting more
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => onSave('next_book_preview', { title, preview_text: previewText })}
                            disabled={isSaving || !title || !previewText}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Preview'}
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                    </div>

                    <button
                        onClick={() => { setTitle(''); setPreviewText('') }}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Skip Book Preview (Optional)
                    </button>
                </div>
            </div>
        </div>
    )
}