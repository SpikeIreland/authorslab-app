/**
 * Shared manuscript file intake — validation, text extraction and sanitisation.
 *
 * This exists because /onboarding, /re-upload and /free-analysis each grew their
 * own copy of this logic, and the copies drifted: /free-analysis gained DOCX
 * support under MKT-005 while the other two stayed PDF-only, which forced authors
 * to convert to PDF and produced the 2026-09-30 onboarding failure.
 */

export const DOCX_MIME =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export const MAX_MANUSCRIPT_BYTES = 20 * 1024 * 1024 // 20MB

export const MANUSCRIPT_FILE_ACCEPT =
    `.pdf,.docx,application/pdf,${DOCX_MIME}`

export type ManuscriptFileKind = 'pdf' | 'docx'

export type ManuscriptFileValidation =
    | { kind: ManuscriptFileKind }
    | { error: string }

/**
 * Single gate for BOTH the click path and the drag-and-drop path.
 * An `accept` attribute does not apply to drops, so it cannot be the only check.
 */
export function validateManuscriptFile(file: File): ManuscriptFileValidation {
    const fileName = file.name.toLowerCase()

    const isPdf = fileName.endsWith('.pdf') || file.type === 'application/pdf'
    const isDocx = fileName.endsWith('.docx') || file.type === DOCX_MIME

    if (!isPdf && !isDocx) {
        return {
            error: 'Please upload your manuscript as a PDF (.pdf) or Word document (.docx).'
        }
    }

    if (file.size > MAX_MANUSCRIPT_BYTES) {
        return { error: 'That file is larger than 20MB. Please upload a smaller file.' }
    }

    // .docx wins a name/MIME disagreement: a Word file mislabelled as PDF would
    // fail extraction, whereas mammoth simply rejects anything that is not a zip.
    return { kind: isDocx ? 'docx' : 'pdf' }
}

/**
 * Strip characters that Postgres will not accept in a text column.
 *
 * A NUL byte, or a lone surrogate, malforms the node-postgres Bind message and
 * Postgres rejects the whole frame with SQLSTATE 08P01, "invalid message format" —
 * which surfaces to the author as an opaque 500 from the onboarding webhook, named
 * against whichever node happened to bind the text first.
 *
 * n8n's "1.1 Extract PDF" sanitises at source; this is the same guarantee applied
 * at the browser boundary, so the DOCX path does not depend on that fix and no
 * caller has to know the rule.
 *
 * `\p{Cs}` under /u matches only LONE surrogates — a valid surrogate pair is a
 * single code point and is not in category Cs, so emoji and astral characters
 * survive. Tab, newline and carriage return are deliberately kept.
 */
export function sanitiseManuscriptText(text: string): string {
    if (!text) return ''

    return text
        .replace(/\p{Cs}/gu, '')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .normalize('NFC')
}

/**
 * Read a .docx in the browser. No extraction round trip, and no chance for a PDF
 * text layer to introduce artefacts — which is why DOCX is the better path.
 */
export async function extractDocxText(docxFile: File): Promise<string> {
    const mammoth = await import('mammoth/mammoth.browser')
    const arrayBuffer = await docxFile.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value || ''
}

/**
 * Extract manuscript text from a validated file, sanitised and ready to send.
 * PDFs go to the n8n extraction endpoint; Word documents are read locally.
 */
export async function extractManuscriptText(
    file: File,
    kind: ManuscriptFileKind,
    extractPdfWebhookUrl: string
): Promise<string> {
    if (kind === 'docx') {
        let raw: string
        try {
            raw = await extractDocxText(file)
        } catch {
            throw new Error(
                'Could not read that Word document. It may be corrupted, or saved in the older .doc format - please re-save it as .docx.'
            )
        }
        return sanitiseManuscriptText(raw)
    }

    const extractFormData = new FormData()
    extractFormData.append('file', file)
    extractFormData.append('fileName', file.name)

    const extractResponse = await fetch(extractPdfWebhookUrl, {
        method: 'POST',
        body: extractFormData
    })

    if (!extractResponse.ok) {
        throw new Error('Failed to extract text from PDF')
    }

    const extractResult = await extractResponse.json()
    return sanitiseManuscriptText(
        extractResult.text || extractResult.extractedText || ''
    )
}

/** Message for when extraction succeeded but returned too little to work with. */
export function insufficientTextMessage(kind: ManuscriptFileKind): string {
    return kind === 'docx'
        ? 'Could not read enough text from that document. Please check it contains your manuscript text.'
        : 'Could not extract sufficient text from PDF. Please ensure the file is not password-protected. If it is a scanned document, upload the Word (.docx) version instead.'
}
