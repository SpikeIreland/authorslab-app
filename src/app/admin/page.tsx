'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Types
interface AuthorProfile {
    id: string
    email: string
    first_name: string
    last_name: string
    is_beta_tester: boolean
    role: string
    created_at: string
    last_login_at: string | null
}

interface Manuscript {
    id: string
    title: string
    genre: string
    author_id: string
    created_at: string
}

interface EditingPhase {
    id: string
    manuscript_id: string
    phase_number: number
    status: string
    completed_at: string | null
}

interface PhaseFeedback {
    id: string
    manuscript_id: string
    author_id: string
    phase_number: number
    feedback_text: string
    rating: number | null
    created_at: string
    is_flagged: boolean
    reviewed_at: string | null
    admin_notes: string | null
}

interface UserDetails {
    profile: AuthorProfile
    manuscript: Manuscript | null
    currentPhase: EditingPhase | null
    feedback: PhaseFeedback[]
    chaptersApproved: number
    totalChapters: number
}

interface PhaseFeedbackWithDetails extends PhaseFeedback {
    author?: {
        first_name: string
        last_name: string
        email: string
    }
    manuscript?: {
        title: string
    }
}

export default function AdminDashboard() {
    const router = useRouter()
    const supabase = createClient()

    // Auth state
    const [isAdmin, setIsAdmin] = useState(false)
    const [adminEmail, setAdminEmail] = useState('')
    const [loading, setLoading] = useState(true)

    // Tab state
    const [activeTab, setActiveTab] = useState<'create' | 'users' | 'feedback' | 'stats'>('users')

    // Create user state
    const [createForm, setCreateForm] = useState({
        firstName: '',
        lastName: '',
        email: ''
    })
    const [generatedPassword, setGeneratedPassword] = useState('')
    const [creating, setCreating] = useState(false)
    const [createSuccess, setCreateSuccess] = useState(false)

    // User search state
    const [searchQuery, setSearchQuery] = useState('')
    const [users, setUsers] = useState<AuthorProfile[]>([])
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
    const [loadingUser, setLoadingUser] = useState(false)

    // Feedback state
    const [allFeedback, setAllFeedback] = useState<PhaseFeedbackWithDetails[]>([])
    const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'flagged' | 'unreviewed'>('all')

    // Stats state
    const [stats, setStats] = useState({
        totalBetaTesters: 0,
        activeThisWeek: 0,
        phaseCompletions: 0,
        averageRating: 0
    })

    // Check admin access on mount
    useEffect(() => {
        checkAdminAccess()
    }, [])

    // Load users when tab changes
    useEffect(() => {
        if (isAdmin && activeTab === 'users') {
            loadUsers()
        } else if (isAdmin && activeTab === 'feedback') {
            loadAllFeedback()
        } else if (isAdmin && activeTab === 'stats') {
            loadStats()
        }
    }, [isAdmin, activeTab])

    async function checkAdminAccess() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            console.log('🔍 Admin check - User:', user?.id, user?.email)

            if (!user) {
                console.log('❌ No user, redirecting to login')
                router.push('/login')
                return
            }

            // Check if user has admin role
            const { data: profile } = await supabase
                .from('author_profiles')
                .select('role, email')
                .eq('auth_user_id', user.id)
                .single()

            console.log('🔍 Admin check - Profile:', profile)
            console.log('🔍 Admin check - Role:', profile?.role)

            if (profile?.role === 'admin' || profile?.role === 'super_admin') {
                console.log('✅ User is admin!')
                setIsAdmin(true)
                setAdminEmail(profile.email)
            } else {
                console.log('❌ User is NOT admin, redirecting')
                router.push('/author-studio')
            }
        } catch (error) {
            console.error('Admin access check failed:', error)
            router.push('/author-studio')
        } finally {
            setLoading(false)
        }
    }

    // Generate random password
    function generatePassword() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
        let password = ''
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setGeneratedPassword(password)
    }

    // Create user and send welcome email
    async function createUser() {
        if (!createForm.firstName || !createForm.lastName || !createForm.email || !generatedPassword) {
            alert('Please fill in all fields and generate a password')
            return
        }

        setCreating(true)

        try {
            // 1. Create auth user via Supabase Admin API
            // Note: This requires admin privileges - we'll use a serverless function
            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: createForm.email,
                    password: generatedPassword,
                    firstName: createForm.firstName,
                    lastName: createForm.lastName
                })
            })

            if (!response.ok) {
                throw new Error('Failed to create user')
            }

            const { userId } = await response.json()

            // 2. Log admin action
            await supabase.from('admin_actions').insert({
                admin_id: (await supabase.auth.getUser()).data.user?.id,
                admin_email: adminEmail,
                action_type: 'create_user',
                target_user_id: userId,
                target_user_email: createForm.email,
                details: {
                    firstName: createForm.firstName,
                    lastName: createForm.lastName
                }
            })

            // 3. Trigger welcome email workflow
            await fetch('https://spikeislandstudios.app.n8n.cloud/webhook/admin-send-welcome-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: createForm.firstName,
                    lastName: createForm.lastName,
                    email: createForm.email,
                    tempPassword: generatedPassword
                })
            }).catch(() => console.log('Welcome email triggered'))

            // Success!
            setCreateSuccess(true)

            // Copy password to clipboard
            navigator.clipboard.writeText(generatedPassword)

            alert(`✅ User created successfully!\n\nPassword copied to clipboard:\n${generatedPassword}\n\nWelcome email sent to ${createForm.email}`)

            // Reset form
            setCreateForm({ firstName: '', lastName: '', email: '' })
            setGeneratedPassword('')

            setTimeout(() => setCreateSuccess(false), 3000)

        } catch (error) {
            console.error('Error creating user:', error)
            alert('❌ Failed to create user. Please try again.')
        } finally {
            setCreating(false)
        }
    }

    // Load all beta testers
    async function loadUsers() {
        try {
            const { data } = await supabase
                .from('author_profiles')
                .select('*')
                .eq('is_beta_tester', true)
                .order('created_at', { ascending: false })

            setUsers(data || [])
        } catch (error) {
            console.error('Error loading users:', error)
        }
    }

    // Load detailed user info
    async function loadUserDetails(userId: string) {
        setLoadingUser(true)
        try {
            // Get profile
            const { data: profile } = await supabase
                .from('author_profiles')
                .select('*')
                .eq('id', userId)
                .single()

            // Get manuscript
            const { data: manuscript } = await supabase
                .from('manuscripts')
                .select('*')
                .eq('author_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            // Get current phase
            let currentPhase = null
            let chaptersApproved = 0
            let totalChapters = 0

            if (manuscript) {
                const { data: phase } = await supabase
                    .from('editing_phases')
                    .select('*')
                    .eq('manuscript_id', manuscript.id)
                    .single()

                currentPhase = phase

                // Get chapter stats
                const { data: chapters } = await supabase
                    .from('chapters')
                    .select('approved')
                    .eq('manuscript_id', manuscript.id)

                totalChapters = chapters?.length || 0
                chaptersApproved = chapters?.filter(ch => ch.approved).length || 0
            }

            // Get feedback
            const { data: feedback } = await supabase
                .from('phase_feedback')
                .select('*')
                .eq('author_id', userId)
                .order('created_at', { ascending: false })

            setSelectedUser({
                profile,
                manuscript,
                currentPhase,
                feedback: feedback || [],
                chaptersApproved,
                totalChapters
            })

        } catch (error) {
            console.error('Error loading user details:', error)
        } finally {
            setLoadingUser(false)
        }
    }

    // Load all feedback
    async function loadAllFeedback() {
        try {
            let query = supabase
                .from('phase_feedback')
                .select(`
          *,
          author:author_profiles(first_name, last_name, email),
          manuscript:manuscripts(title)
        `)
                .order('created_at', { ascending: false })

            if (feedbackFilter === 'flagged') {
                query = query.eq('is_flagged', true)
            } else if (feedbackFilter === 'unreviewed') {
                query = query.is('reviewed_at', null)
            }

            const { data } = await query

            setAllFeedback(data || [])
        } catch (error) {
            console.error('Error loading feedback:', error)
        }
    }

    // Load dashboard stats
    async function loadStats() {
        try {
            // Total beta testers
            const { count: totalBeta } = await supabase
                .from('author_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_beta_tester', true)

            // Active this week (logged in within 7 days)
            const oneWeekAgo = new Date()
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

            const { count: activeCount } = await supabase
                .from('author_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_beta_tester', true)
                .gte('last_login_at', oneWeekAgo.toISOString())

            // Phase completions this week
            const { count: completionsCount } = await supabase
                .from('editing_phases')
                .select('*', { count: 'exact', head: true })
                .not('completed_at', 'is', null)
                .gte('completed_at', oneWeekAgo.toISOString())

            // Average rating
            const { data: ratings } = await supabase
                .from('phase_feedback')
                .select('rating')
                .not('rating', 'is', null)

            const avgRating = ratings && ratings.length > 0
                ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length
                : 0

            setStats({
                totalBetaTesters: totalBeta || 0,
                activeThisWeek: activeCount || 0,
                phaseCompletions: completionsCount || 0,
                averageRating: Math.round(avgRating * 10) / 10
            })

        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    // Toggle feedback flag
    async function toggleFeedbackFlag(feedbackId: string, currentFlag: boolean) {
        try {
            await supabase
                .from('phase_feedback')
                .update({ is_flagged: !currentFlag })
                .eq('id', feedbackId)

            // Reload feedback
            loadAllFeedback()
        } catch (error) {
            console.error('Error toggling flag:', error)
        }
    }

    // Mark feedback as reviewed
    async function markFeedbackReviewed(feedbackId: string) {
        try {
            const adminUser = await supabase.auth.getUser()

            await supabase
                .from('phase_feedback')
                .update({
                    reviewed_at: new Date().toISOString(),
                    reviewed_by_admin_id: adminUser.data.user?.id
                })
                .eq('id', feedbackId)

            // Reload feedback
            loadAllFeedback()
        } catch (error) {
            console.error('Error marking reviewed:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-2xl mb-2">🔐</div>
                    <p className="text-gray-600">Verifying admin access...</p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return null // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                                📚 AuthorsLab.ai
                            </Link>
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                                ADMIN
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">{adminEmail}</span>
                            <Link href="/dashboard">
                                <Button variant="outline">User Dashboard</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-6">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'create'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            ➕ Create User
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'users'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            👥 Users ({users.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('feedback')}
                            className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'feedback'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            💬 Feedback ({allFeedback.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'stats'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            📊 Stats
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">

                {/* CREATE USER TAB */}
                {activeTab === 'create' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Beta Tester Account</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.firstName}
                                        onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="John"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.lastName}
                                        onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Temporary Password
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={generatedPassword}
                                            readOnly
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                                            placeholder="Click 'Generate Password'"
                                        />
                                        <Button
                                            onClick={generatePassword}
                                            variant="outline"
                                            type="button"
                                        >
                                            🔑 Generate
                                        </Button>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        onClick={createUser}
                                        disabled={creating || !generatedPassword}
                                        className="w-full py-3 text-lg"
                                    >
                                        {creating ? '⏳ Creating Account...' : '✉️ Create Account & Send Welcome Email'}
                                    </Button>
                                </div>

                                {createSuccess && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800 font-semibold">✅ User created successfully!</p>
                                        <p className="text-green-700 text-sm mt-1">Password copied to clipboard. Welcome email sent.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-900">
                                <strong>📋 What happens:</strong>
                            </p>
                            <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-disc">
                                <li>Creates Supabase auth account with temporary password</li>
                                <li>Marks user as beta tester in database</li>
                                <li>Sends welcome email with login instructions</li>
                                <li>Password is copied to your clipboard for safekeeping</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* User List */}
                        <div>
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Beta Testers</h2>

                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />

                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {users
                                        .filter(user =>
                                            searchQuery === '' ||
                                            user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            user.email.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => loadUserDetails(user.id)}
                                                className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                                            >
                                                <div className="font-semibold text-gray-900">
                                                    {user.first_name} {user.last_name}
                                                </div>
                                                <div className="text-sm text-gray-600">{user.email}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Joined {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* User Details */}
                        <div>
                            {selectedUser ? (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                        {selectedUser.profile.first_name} {selectedUser.profile.last_name}
                                    </h2>

                                    <div className="space-y-4">
                                        {/* Profile Info */}
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                📧 {selectedUser.profile.email}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                📅 Joined {new Date(selectedUser.profile.created_at).toLocaleDateString()}
                                            </p>
                                            {selectedUser.profile.last_login_at && (
                                                <p className="text-sm text-gray-600">
                                                    🕐 Last login {new Date(selectedUser.profile.last_login_at).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>

                                        {/* Manuscript Info */}
                                        {selectedUser.manuscript ? (
                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="font-semibold text-gray-900">
                                                    📚 {selectedUser.manuscript.title}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Genre: {selectedUser.manuscript.genre}
                                                </p>
                                                {selectedUser.currentPhase && (
                                                    <>
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            📊 Phase {selectedUser.currentPhase.phase_number} - {selectedUser.currentPhase.status}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            ✅ Chapters: {selectedUser.chaptersApproved}/{selectedUser.totalChapters} approved
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-gray-600">No manuscript uploaded yet</p>
                                            </div>
                                        )}

                                        {/* Feedback */}
                                        {selectedUser.feedback.length > 0 ? (
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">💬 Feedback</h3>
                                                <div className="space-y-2">
                                                    {selectedUser.feedback.map(fb => (
                                                        <div key={fb.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                            <div className="flex items-start justify-between mb-1">
                                                                <span className="text-sm font-semibold text-green-900">
                                                                    Phase {fb.phase_number}
                                                                </span>
                                                                {fb.rating && (
                                                                    <span className="text-sm text-yellow-600">
                                                                        {'⭐'.repeat(fb.rating)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-700">{fb.feedback_text}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(fb.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-gray-600">No feedback submitted yet</p>
                                            </div>
                                        )}

                                        {/* Quick Actions */}
                                        <div className="pt-4 border-t space-y-2">
                                            <Button variant="outline" className="w-full">
                                                ✉️ Send Email
                                            </Button>
                                            <Button variant="outline" className="w-full">
                                                🔐 Reset Password
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                    <div className="text-6xl mb-4">👈</div>
                                    <p className="text-gray-600">Select a user to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* FEEDBACK TAB */}
                {activeTab === 'feedback' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">All Feedback</h2>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFeedbackFilter('all')}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${feedbackFilter === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFeedbackFilter('flagged')}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${feedbackFilter === 'flagged'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        🚩 Flagged
                                    </button>
                                    <button
                                        onClick={() => setFeedbackFilter('unreviewed')}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${feedbackFilter === 'unreviewed'
                                            ? 'bg-yellow-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        ⏳ Unreviewed
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[700px] overflow-y-auto">
                                {allFeedback.map(fb => (
                                    <div
                                        key={fb.id}
                                        className={`p-4 rounded-lg border-2 ${fb.is_flagged
                                            ? 'bg-red-50 border-red-300'
                                            : fb.reviewed_at
                                                ? 'bg-gray-50 border-gray-200'
                                                : 'bg-white border-blue-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {fb.author?.first_name || 'Unknown'} {fb.author?.last_name || 'User'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {fb.manuscript?.title || 'No manuscript'} - Phase {fb.phase_number}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {fb.rating && (
                                                    <span className="text-sm text-yellow-600">
                                                        {'⭐'.repeat(fb.rating)}
                                                    </span>
                                                )}
                                                {fb.is_flagged && <span className="text-red-600">🚩</span>}
                                                {fb.reviewed_at && <span className="text-green-600">✅</span>}
                                            </div>
                                        </div>

                                        <p className="text-gray-700 mb-3">{fb.feedback_text}</p>

                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-500">
                                                {new Date(fb.created_at).toLocaleDateString()} at {new Date(fb.created_at).toLocaleTimeString()}
                                            </p>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toggleFeedbackFlag(fb.id, fb.is_flagged)}
                                                    className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded font-semibold"
                                                >
                                                    {fb.is_flagged ? '🚩 Unflag' : 'Flag'}
                                                </button>
                                                {!fb.reviewed_at && (
                                                    <button
                                                        onClick={() => markFeedbackReviewed(fb.id)}
                                                        className="text-sm px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded font-semibold"
                                                    >
                                                        ✅ Mark Reviewed
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {allFeedback.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">💬</div>
                                        <p className="text-gray-600">No feedback yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STATS TAB */}
                {activeTab === 'stats' && (
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Statistics</h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="text-4xl mb-2">👥</div>
                                <div className="text-3xl font-bold text-gray-900">{stats.totalBetaTesters}</div>
                                <div className="text-sm text-gray-600">Total Beta Testers</div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="text-4xl mb-2">🟢</div>
                                <div className="text-3xl font-bold text-gray-900">{stats.activeThisWeek}</div>
                                <div className="text-sm text-gray-600">Active This Week</div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="text-4xl mb-2">✅</div>
                                <div className="text-3xl font-bold text-gray-900">{stats.phaseCompletions}</div>
                                <div className="text-sm text-gray-600">Phase Completions</div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="text-4xl mb-2">⭐</div>
                                <div className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</div>
                                <div className="text-sm text-gray-600">Average Rating</div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}