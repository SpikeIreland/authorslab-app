'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FeedbackModalProps {
    isOpen: boolean
    onClose: () => void
    manuscriptId?: string
}

export function FeedbackModal({ isOpen, onClose, manuscriptId }: FeedbackModalProps) {
    const [feedbackText, setFeedbackText] = useState('')
    const [rating, setRating] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [hoveredRating, setHoveredRating] = useState<number | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!feedbackText.trim()) {
            alert('Please enter some feedback before submitting.')
            return
        }

        setIsSubmitting(true)

        try {
            const supabase = createClient()

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('You must be logged in to submit feedback.')
                return
            }

            // Get author profile
            const { data: profile } = await supabase
                .from('author_profiles')
                .select('id')
                .eq('auth_user_id', user.id)
                .single()

            if (!profile) {
                alert('Could not find your profile.')
                return
            }

            // Submit feedback
            const { error } = await supabase
                .from('beta_feedback')
                .insert({
                    author_id: profile.id,
                    manuscript_id: manuscriptId || null,
                    feedback_text: feedbackText.trim(),
                    page_url: window.location.href,
                    rating: rating
                })

            if (error) throw error

            // Success!
            setSubmitSuccess(true)
            setTimeout(() => {
                onClose()
                setFeedbackText('')
                setRating(null)
                setSubmitSuccess(false)
            }, 2000)

        } catch (error) {
            console.error('Error submitting feedback:', error)
            alert('Failed to submit feedback. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            setFeedbackText('')
            setRating(null)
            setSubmitSuccess(false)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6">
                {submitSuccess ? (
                    // Success State
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                        <p className="text-gray-600">Your feedback helps us improve AuthorsLab.ai</p>
                    </div>
                ) : (
                    // Feedback Form
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Beta Feedback</h2>
                            <button
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Optional Rating */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    How would you rate your experience? (optional)
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(null)}
                                            className="text-3xl transition-transform hover:scale-110"
                                        >
                                            {(hoveredRating !== null ? star <= hoveredRating : star <= (rating || 0))
                                                ? '⭐'
                                                : '☆'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feedback Text */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Feedback *
                                </label>
                                <textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder="Tell us what you think! Bug reports, feature requests, or general thoughts..."
                                    rows={6}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !feedbackText.trim()}
                                    className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}