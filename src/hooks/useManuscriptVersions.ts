import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ManuscriptVersion {
    id: string
    manuscript_id: string
    phase_number: number
    version_type: string
    file_url: string | null
    created_by_editor: string
    created_at: string
    word_count: number | null
}

export function useManuscriptVersions(manuscriptId: string | null) {
    const [versions, setVersions] = useState<ManuscriptVersion[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchVersions() {
            if (!manuscriptId) return

            const supabase = createClient()

            setLoading(true)
            setError(null)

            try {
                const { data, error } = await supabase
                    .from('manuscript_versions')
                    .select(`
            id,
            manuscript_id,
            phase_number,
            version_type,
            file_url,
            created_by_editor,
            created_at,
            word_count
          `)
                    .eq('manuscript_id', manuscriptId)
                    .in('version_type', ['docx', 'pdf', 'approved_snapshot'])
                    .not('file_url', 'is', null)
                    .order('phase_number', { ascending: true })
                    .order('created_at', { ascending: false })

                if (error) throw error

                setVersions(data || [])
            } catch (err) {
                console.error('Error fetching versions:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch versions')
            } finally {
                setLoading(false)
            }
        }

        fetchVersions()
    }, [manuscriptId])

    return { versions, loading, error }
}