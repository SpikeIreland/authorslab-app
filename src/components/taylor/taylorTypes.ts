// ============================================
// Taylor Panel - Shared Types & Constants
// ============================================

import { N8N_WEBHOOKS } from '@/lib/n8n-config'

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
    assessment: N8N_WEBHOOKS.taylorAssessment,
    chat: N8N_WEBHOOKS.taylorChat,
} as const