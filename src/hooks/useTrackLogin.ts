// src/hooks/useTrackLogin.ts
// Automatically tracks when users log in and updates their last_login_at timestamp

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTrackLogin() {
    useEffect(() => {
        const trackLogin = async () => {
            const supabase = createClient()

            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) return

                // Check if we've already tracked this session
                const sessionKey = `login_tracked_${user.id}`
                if (sessionStorage.getItem(sessionKey)) {
                    return // Already tracked this session
                }

                // Update last_login_at
                const { error } = await supabase
                    .from('author_profiles')
                    .update({ last_login_at: new Date().toISOString() })
                    .eq('id', user.id)

                if (error) {
                    console.error('Error tracking login:', error)
                } else {
                    // Mark as tracked for this session
                    sessionStorage.setItem(sessionKey, 'true')
                }
            } catch (error) {
                console.error('Error in trackLogin:', error)
            }
        }

        trackLogin()
    }, [])
}

// Usage: Add to your dashboard or main app layout:
//
// import { useTrackLogin } from '@/hooks/useTrackLogin'
//
// export default function Dashboard() {
//   useTrackLogin() // Tracks login once per session
//   
//   return <div>Your dashboard</div>
// }