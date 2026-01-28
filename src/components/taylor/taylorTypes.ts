// ============================================
// Taylor Panel - Shared Types & Constants
// ============================================

export interface TaylorPanelProps {
    manuscriptId: string
}

export interface ChatMessage {
    id: string
    sender: 'user' | 'taylor'
    message: string
    created_at: string
}

export interface Manuscript {
    title?: string
    genre?: string
    manuscript_summary?: string
}

export const TAYLOR_WEBHOOKS = {
    assessment: 'https://spikeislandstudios.app.n8n.cloud/webhook/taylor-assessment',
    chat: 'https://spikeislandstudios.app.n8n.cloud/webhook/taylor-chat'
} as const