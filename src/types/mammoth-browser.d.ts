// Mammoth ships a browser-only bundle at 'mammoth/mammoth.browser' that has no
// bundled type declarations. We only use extractRawText from it (client-side
// DOCX → plain text on /free-analysis), so a minimal shim is enough.

declare module 'mammoth/mammoth.browser' {
  export interface MammothInput {
    arrayBuffer: ArrayBuffer
  }

  export interface MammothResult {
    value: string
    messages: Array<{ type: string; message: string }>
  }

  export function extractRawText(input: MammothInput): Promise<MammothResult>
  export function convertToHtml(input: MammothInput): Promise<MammothResult>
}
