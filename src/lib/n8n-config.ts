/**
 * n8n Webhook Configuration — AuthorsLab.ai (main)
 *
 * Single source of truth for all n8n webhook URLs used by the main app.
 * Set NEXT_PUBLIC_N8N_BASE_URL in .env.local and Vercel env vars.
 *
 * To roll back to the old account, override the env var to:
 *   https://spikeislandstudios.app.n8n.cloud
 *
 * Migrated from spikeislandstudios → authorslab account on 2026-04-23.
 */

const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_BASE_URL ??
    'https://authorslab.app.n8n.cloud';

const webhook = (path: string) => `${N8N_BASE_URL}/webhook/${path}`;

export const N8N_WEBHOOKS = {
    // ─────────────────────────────────────────────
    // Phase 0 — Admin & Global
    // ─────────────────────────────────────────────
    /** 00.01 Admin Send Welcome — used by admin/page.tsx:250 */
    adminSendWelcomeEmail: webhook('admin-send-welcome-email'),

    /** 00.02 Token Validation — JWT check on Author Studio load */
    tokenValidation: webhook('token-validation'),

    /** 00.04 Free Manuscript Analysis — marketing lead-gen.
     *  ⚠ Workflow currently INACTIVE in n8n — activate before deploying
     *  or retire the free-analysis page. */
    freeManuscriptAnalysis: webhook('free-manuscript-analysis'),

    /** 00.05 PDF Word Count (legacy / free-analysis path).
     *  ⚠ Workflow currently INACTIVE in n8n. Paul to confirm whether this
     *  should be replaced with pdfWordCount (01.02) or kept separate. */
    manuscriptWordCount: webhook('manuscript-word-count'),

    // ─────────────────────────────────────────────
    // Phase 1 — Upload & Pre-Processing Pipeline
    // ─────────────────────────────────────────────
    /** 01.00 Manuscript Clean-up Reload — used by re-upload/page.tsx:33 */
    manuscriptCleanup: webhook('manuscript-cleanup'),

    /** 01.01 Extract PDF — used by onboarding/page.tsx:287, re-upload/page.tsx:117 */
    extractPdfText: webhook('extract-pdf-text'),

    /** 01.02 PDF Word Count — used by onboarding/page.tsx:35 */
    pdfWordCount: webhook('pdf-word-count'),

    /** 01.03 Author Onboarding — used by onboarding/page.tsx:36 */
    onboarding: webhook('onboarding'),

    /** 01.04 Parse Chapters — used by onboarding/page.tsx:520, re-upload/page.tsx:34 */
    parseChapters: webhook('parse-chapters'),

    /** 01.05 Generate Manuscript Versions
     *  Used by phase-transition/page.tsx:103 AND inline in author-studio/page.tsx:3226 */
    generateManuscriptVersion: webhook('generate-manuscript-version'),

    // ─────────────────────────────────────────────
    // Phase 2 — Alex (Developmental Editor)
    // ─────────────────────────────────────────────
    /** 02.01 Generate Chapter Summaries */
    generateChapterSummaries: webhook('generate-chapter-summaries'),

    /** 02.02 Alex Generate Summary Points */
    generateSummaryPoints: webhook('generate-summary-points'),

    /** 02.03 Alex Full Manuscript Analysis */
    alexFullManuscriptAnalysis: webhook('alex-full-manuscript-analysis'),

    /** 02.04 Alex Chapter Analysis */
    alexChapterAnalysis: webhook('alex-chapter-analysis'),

    /** 02.05 Alex Chat */
    alexChat: webhook('alex-chat'),

    // ─────────────────────────────────────────────
    // Phase 3 — Sam (Line Editor)
    // ─────────────────────────────────────────────
    /** 03.01 Sam Full Manuscript Analysis */
    samFullManuscriptAnalysis: webhook('sam-full-manuscript-analysis'),

    /** 03.02 Sam Chapter Analysis */
    samChapterAnalysis: webhook('sam-chapter-analysis'),

    /** 03.03 Sam Chat */
    samChat: webhook('sam-chat'),

    // ─────────────────────────────────────────────
    // Phase 4 — Jordan (Copy Editor)
    // ─────────────────────────────────────────────
    /** 04.01 Jordan Full Manuscript Analysis */
    jordanFullManuscriptAnalysis: webhook('jordan-full-manuscript-analysis'),

    /** 04.02 Jordan Chapter Analysis */
    jordanChapterAnalysis: webhook('jordan-chapter-analysis'),

    /** 04.03 Jordan Chat */
    jordanChat: webhook('jordan-chat'),

    // ─────────────────────────────────────────────
    // Phase 5 — Taylor (Publishing Specialist)
    // ─────────────────────────────────────────────
    /** 05.01 Taylor Assessment — used by TaylorChatWidget/taylorTypes */
    taylorAssessment: webhook('taylor-assessment'),

    /** 05.03 Taylor Detect Cover Intent */
    taylorDetectCoverIntent: webhook('taylor-detect-cover-intent'),

    /** 05.04 Taylor Chat */
    taylorChat: webhook('taylor-chat'),

    // 05.02 Taylor Generate Covers is called server-side from within
    // Taylor Chat / Assessment workflows — not wired to frontend.

    // ─────────────────────────────────────────────
    // Phase 6 — Formatting (not yet wired to frontend)
    // ─────────────────────────────────────────────
    // 06.01 Format Manuscript — UI exists but backend incomplete.
    // Add here when wiring up.
} as const;

export type N8nWebhookKey = keyof typeof N8N_WEBHOOKS;