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