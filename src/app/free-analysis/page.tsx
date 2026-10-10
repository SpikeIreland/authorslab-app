'use client'

import { useState, FormEvent, ChangeEvent, DragEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { N8N_WEBHOOKS } from '@/lib/n8n-config'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { trackEvent } from '@/lib/analytics'
import { Suspense } from 'react'

// -----------------------------------------------------------------------------
// OPEN. Paul, 2026-10-10.
//
// The gate went up in August so a marketing ad would not land traffic on a form
// mid-retrofit. It stayed up long after the retrofit finished, because nobody
// — me included — said out loud that it was waiting on a DECISION rather than
// on work. Paul asked twice whether the free analysis was resolved while every
// piece behind this constant was already done.
//
//   A switch nobody owns is not a safeguard. It is a thing that gets left.
//
// What had to be true before it opened, and now is:
//   · 00.04 completes end to end (first ever successful run, 9 Oct, after four
//     stacked faults: crypto global, orphan journey FK, inverted extract
//     routing, and a failure reported as success).
//   · The form is on the brand's token set.
//   · The confirmation offers an account rather than "Return to Home".
//   · The word count is the manuscript's, not the assessment's.
//
// NOT yet verified, and accepted as the cost of opening today: the APITemplate
// header/footer alignment and the corrected word count have not been seen in a
// rendered report. Worst case is a left-shifted header on a PDF, which is
// visible, recoverable, and a smaller cost than another week shut.
// -----------------------------------------------------------------------------
const FREE_ANALYSIS_ACTIVE = true

export default function FreeAnalysisPage() {
  return (
    <Suspense fallback={<FreeAnalysisComingSoon />}>
      <FreeAnalysisGate />
    </Suspense>
  )
}

/**
 * The preview door is gone.
 *
 * `?preview=1` existed so the smoke test could run against the real form, on
 * the real deployment, posting to the real webhook, while the page stayed shut
 * to everyone else. It did its job: four faults that no amount of reading had
 * found turned up in two runs through it.
 *
 * It was always going to be deleted in the commit that opened the gate, and
 * that deletion is what makes this finished rather than merely switched on.
 * FreeAnalysisComingSoon is kept — a gate that cannot be closed again is not a
 * gate, and the next retrofit will want it.
 */
function FreeAnalysisGate() {
  if (!FREE_ANALYSIS_ACTIVE) {
    return <FreeAnalysisComingSoon />
  }
  return <FreeAnalysisForm />
}

function FreeAnalysisComingSoon() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-ivory)' }}>
      <MarketingNav />

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-[0.14em] mb-4" style={{ color: 'var(--color-muted)' }}>
            Free manuscript assessment
          </p>
          <h1
            className="text-4xl md:text-5xl leading-tight mb-6"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
          >
            Opening this week
          </h1>
          <p className="text-lg leading-relaxed mb-10" style={{ color: 'var(--color-ink)' }}>
            Alex is finishing his final read-throughs before we open the free assessment.
            We&apos;ll have it live very shortly. If you&apos;d rather not wait, you can
            start work on a manuscript right now with a Single-Project Pass or a monthly
            membership — the full editorial journey with Alex, Sam and Jordan.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/pricing"
              className="inline-flex items-center px-6 py-3 rounded-md text-[14px] font-medium transition-colors"
              style={{ background: 'var(--color-sage-deep)', color: 'var(--color-paper)' }}
            >
              See pricing
            </Link>
            <Link
              href="/"
              className="text-[14px] font-medium transition-colors"
              style={{ color: 'var(--color-sage-deep)' }}
            >
              Back to home →
            </Link>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}

function FreeAnalysisForm() {
  const [file, setFile] = useState<File | null>(null)
  const [wordCount, setWordCount] = useState<string>('')
  const [wordCountFormatted, setWordCountFormatted] = useState<string>('')
  const [wordCountUnavailable, setWordCountUnavailable] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string>('')
  const [dragOver, setDragOver] = useState(false)
  // Captured at submit so the confirmation can say where the report is going.
  const [submittedEmail, setSubmittedEmail] = useState<string>('')

  const WEBHOOK_URL = N8N_WEBHOOKS.freeManuscriptAnalysis

  const DOCX_MIME =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

  const validateFile = (file: File) => {
    // MKT-005: DOCX accepted alongside PDF. Marketing implied larger uploads
    // are fine now that the workflow analyses the whole manuscript, so the cap
    // bumps to 20MB. DOCX is client-converted to plain text via mammoth before
    // upload (see convertDocxToText below).
    const maxSize = 20 * 1024 * 1024 // 20MB
    const fileName = file.name.toLowerCase()

    const isPdf = fileName.endsWith('.pdf') || file.type === 'application/pdf'
    const isDocx = fileName.endsWith('.docx') || file.type === DOCX_MIME

    if (!isPdf && !isDocx) {
      return { valid: false, error: 'Only PDF or DOCX files are accepted.' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 20MB.' }
    }

    return { valid: true }
  }

  // Convert a .docx File into a plain-text File the workflow's text-extract
  // branch can read. Uses the browser build of mammoth so no server round-trip.
  const convertDocxToText = async (docxFile: File): Promise<File> => {
    const mammoth = await import('mammoth/mammoth.browser')
    const arrayBuffer = await docxFile.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    const baseName = docxFile.name.replace(/\.docx$/i, '')
    const textBlob = new Blob([result.value], { type: 'text/plain' })
    return new File([textBlob], `${baseName}.txt`, { type: 'text/plain' })
  }

  /**
   * The word count, counted where we actually have the words.
   *
   * ─── WHY THIS NO LONGER CALLS A WEBHOOK ─────────────────────────────────
   *
   * It used to POST the file to `manuscript-word-count`. Measured 9 October:
   * NO WORKFLOW IS ON THAT PATH. The two word-count workflows in n8n — "1.2
   * PDF Word Count" (active) and "00.05 PDF Word Count" (inactive since April)
   * — both sit on `pdf-word-count`. So every call 404'd, silently, forever.
   *
   * And repointing the config would have turned a 404 into a 500: despite its
   * name, 1.2 does no PDF parsing and accepts no file. It expects
   * `{ manuscriptText: "..." }` as JSON. This page sends multipart with a PDF.
   *
   *   The config file had already flagged this — "⚠ Workflow currently
   *   INACTIVE in n8n. Paul to confirm" — and the page kept calling it anyway,
   *   because the fallback hid the failure behind a plausible number.
   *
   * ─── SO: EXACT WHERE WE CAN BE, ABSENT WHERE WE CANNOT ──────────────────
   *
   * For DOCX we already extract the text in this browser, with mammoth, to
   * build the upload. Counting it is free and exact — no network, no service,
   * nothing to be down.
   *
   * For PDF we hold no text client-side, so there is no count to give, and we
   * say so. A manuscript still uploads and is still analysed in full: the
   * count was always a courtesy to the reader, never a precondition.
   */
  const getAccurateWordCount = async (file: File) => {
    const unavailable = {
      success: false,
      wordCount: null as number | null,
      formattedWordCount: '',
      quality: 'unavailable',
    }

    const isDocx =
      file.name.toLowerCase().endsWith('.docx') || file.type === DOCX_MIME

    if (!isDocx) return unavailable

    try {
      const mammoth = await import('mammoth/mammoth.browser')
      const arrayBuffer = await file.arrayBuffer()
      const { value } = await mammoth.extractRawText({ arrayBuffer })
      // \S+ rather than splitting on whitespace: a split yields a leading
      // empty string on text that starts with a space, which would count one
      // word too many on exactly the files nobody checks.
      const count = (value.match(/\S+/g) || []).length
      if (count === 0) return unavailable
      return {
        success: true,
        wordCount: count,
        formattedWordCount: count.toLocaleString(),
        quality: 'exact',
      }
    } catch (error) {
      console.error('[free-analysis] could not read the document to count it:', error)
      return unavailable
    }
  }

  const handleFileSelection = async (selectedFile: File) => {
    setError('')
    setFile(null)
    setWordCount('')
    setWordCountFormatted('')
    
    const validation = validateFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setFile(selectedFile)
    setIsAnalyzing(true)
    
    const wordCountResult = await getAccurateWordCount(selectedFile)
    
    // Absent, and said so. The submission still proceeds: a word count is a
    // courtesy to the reader, not a precondition of the analysis, and refusing
    // an upload because a count failed is a worse answer than not showing one.
    setWordCount(wordCountResult.wordCount == null ? '' : String(wordCountResult.wordCount))
    setWordCountFormatted(wordCountResult.formattedWordCount)
    setWordCountUnavailable(!wordCountResult.success)
    setIsAnalyzing(false)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a PDF or DOCX file to upload.')
      return
    }

    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setIsSubmitting(true)
    setError('')

    // If DOCX, convert to plain text client-side so the workflow's text-extract
    // branch can consume it (n8n's extractFromFile has no docx op in this
    // version). PDFs pass through unchanged.
    const fileNameLower = file.name.toLowerCase()
    const isDocx =
      fileNameLower.endsWith('.docx') || file.type === DOCX_MIME
    let uploadFile: File = file
    let uploadFileType: 'pdf' | 'txt' = 'pdf'

    if (isDocx) {
      try {
        uploadFile = await convertDocxToText(file)
        uploadFileType = 'txt'
      } catch (convErr) {
        console.error('DOCX conversion failed:', convErr)
        setIsSubmitting(false)
        setError(
          'We couldn\'t read your .docx file. Please try re-saving it, or export it as PDF and try again.'
        )
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    const formData = new FormData(e.currentTarget)
    formData.set('manuscript0', uploadFile)
    formData.set('fileType', uploadFileType)
    formData.set('originalFileName', file.name)
    formData.set('fileSizeBytes', file.size.toString())
    formData.set('submissionDate', new Date().toISOString())
    formData.set('wordCount', wordCount)
    setSubmittedEmail(String(formData.get('email') || ''))

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData
      })

      // Guard against non-2xx responses — previous code showed success on any
      // outcome, giving false confirmation when the webhook failed.
      if (!response.ok) {
        throw new Error(`Submission failed (${response.status})`)
      }

      // MKT-004 Ask 3: fire free_analysis_submitted once the webhook accepts
      // the submission. Live from 2026-10-10 — the gate is open, so this is
      // now a real attribution signal rather than instrumentation waiting on
      // one. `marketing` should expect the first events today.
      trackEvent('free_analysis_submitted', {
        wordCount: Number(wordCount) || 0,
        fileSizeBytes: file.size,
      })

      setTimeout(() => {
        setIsSubmitting(false)
        setIsSuccess(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 2000)
    } catch (err) {
      console.error('Free-analysis submission failed:', err)
      setIsSubmitting(false)
      setError(
        'We couldn\'t receive your manuscript right now. Please try again in a minute, or email support@authorslab.ai if the problem persists.'
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  /* Confirmation + submitting screens rebuilt on the token grammar
   * (sysadmin's free-analysis BRIEF §2, 2026-10-09). Constraints honoured:
   *  - Nothing claims what has not happened: no turnaround figure until the
   *    smoke test measures one. marketing owns the copy — when the measured
   *    figure exists, it slots into the one sentence marked below.
   *  - The CTA is an invitation, not a close: the next step is a free
   *    account, not a checkout; no urgency, no discounting.
   */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-ivory">
        <MarketingNav />

        <div className="max-w-xl mx-auto px-6 py-24">
          <div className="bg-white border border-line rounded-2xl p-10 text-center">
            <div className="w-10 h-10 mx-auto mb-6 rounded-full bg-sage/15 flex items-center justify-center" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-sage-deep">
                <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {/* Copy is marketing's (their 2026-10-09 courier §2), verbatim but
               for the recipient address, which is a surface fact. The measured-
               turnaround sentence — "Recent reads have taken about [MEASURED]"
               — is deliberately NOT rendered until the smoke test fills the
               slot; marketing's rule: the sentence does not ship with a guess
               in it. */}
            <h1 className="font-serif text-3xl text-ink mb-4">
              Your manuscript is in.
            </h1>
            <p className="text-muted mb-2">
              The full read is underway &mdash; five analyses across your whole
              book, then a synthesis.
            </p>
            <p className="text-muted mb-10">
              Your report arrives by email as a PDF, from editors@authorslab.ai
              {submittedEmail && (
                <>, to <span className="text-ink">{submittedEmail}</span></>
              )}.
            </p>

            <p className="text-sm text-muted mb-4 max-w-sm mx-auto">
              While it runs: an AuthorsLab account is where the report becomes
              a conversation &mdash; your editors can walk you through what
              they found, chapter by chapter.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-sage-deep hover:bg-sage-deep/90 text-white font-semibold px-6 py-3 rounded-lg"
            >
              Create your free account
            </Link>

            <div className="mt-8">
              <Link href="/" className="text-sm text-muted hover:text-ink">
                Return home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-ivory">
        <MarketingNav />

        <div className="max-w-xl mx-auto px-6 py-24">
          <div className="bg-white border border-line rounded-2xl p-10 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-6" aria-hidden="true">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse [animation-delay:300ms]" />
            </div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              Sending your manuscript&hellip;
            </h2>
            <p className="text-muted">
              Don&apos;t close this page just yet &mdash; this can take a moment for a full book.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <MarketingNav />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-6">
            <span className="px-6 py-3 bg-white/20 border-2 border-white rounded-full text-lg font-bold">
              🎉 100% FREE • FULL MANUSCRIPT ANALYSIS
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            Free Manuscript Analysis
          </h1>
          <p className="text-2xl opacity-95">
            Get professional AI analysis of your complete manuscript in minutes
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Breakthrough Notice */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-4 border-yellow-400 rounded-2xl p-8 mb-8 text-center relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl">
              🚀
            </div>
            <h2 className="text-3xl font-bold text-yellow-900 mb-4 mt-4">
              BREAKTHROUGH: Full Manuscript Analysis Now FREE!
            </h2>
            <p className="text-xl text-yellow-800 mb-4">
              Experience our complete AI analysis technology with your entire manuscript.
            </p>
            <div className="bg-yellow-200 rounded-lg p-4 font-bold text-yellow-900">
              No more 2,000-word limits • No credit card required • Professional insights in minutes
            </div>
          </div>

          {/* What You'll Receive */}
          <div className="bg-paper rounded-2xl p-8 shadow-lg border-l-4 border-sage-deep mb-8">
            <h3 className="font-serif text-2xl text-ink mb-4">What You&apos;ll Receive (Free!):</h3>
            <ul className="space-y-3 text-muted">
              <li className="flex items-start gap-3">
                <span className="text-sage-deep mt-1">✓</span>
                <span><strong>Complete manuscript overview</strong> - Overall strengths and development opportunities</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sage-deep mt-1">✓</span>
                <span><strong>Key structural insights</strong> - Pacing, organization, and narrative flow</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sage-deep mt-1">✓</span>
                <span><strong>Character development overview</strong> - Protagonist journey and supporting character effectiveness</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sage-deep mt-1">✓</span>
                <span><strong>Thematic depth assessment</strong> - Core themes and their development</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sage-deep mt-1">✓</span>
                <span><strong>Professional priority recommendations</strong> - Next steps for improvement</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sage-deep mt-1">✓</span>
                <span><strong>Detailed PDF report</strong> via email</span>
              </li>
            </ul>
          </div>

          {/* Upgrade CTA */}
          <div className="bg-sage-deep text-white rounded-2xl p-8 mb-8 text-center">
            <h3 className="font-serif text-2xl mb-4">Want chapter-by-chapter detail?</h3>
            <p className="text-lg mb-6">
              This free analysis provides a comprehensive overview. For detailed, actionable chapter-by-chapter feedback, scene-specific suggestions, and a complete revision roadmap:
            </p>
            <Link href="/pricing">
              <Button className="bg-paper text-ink hover:bg-ivory text-lg px-8 py-6">
                Explore AuthorsLab membership
              </Button>
            </Link>
          </div>

          {/* PDF Notice */}
          <div className="bg-paper-warm border border-line rounded-xl p-6 mb-8 text-center">
            <h4 className="font-serif text-xl text-ink mb-2">PDF or Word format</h4>
            <p className="text-muted mb-2">
              We accept <strong>PDF files only</strong> for streamlined processing and comprehensive analysis quality.
            </p>
            <p className="text-faint text-sm">
              <em>Need to convert? Most word processors can save/export as PDF.</em>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-paper rounded-2xl p-8 shadow-lg">
            {error && (
              <div className="bg-amber-bg border border-status-high rounded-xl p-4 mb-6 text-status-high">
                ❌ {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="authorName" className="block text-lg font-bold text-ink mb-2">
                  Author Name <span className="text-status-high">*</span>
                </label>
                <input
                  type="text"
                  id="authorName"
                  name="authorName"
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-line rounded-lg focus:border-sage-deep focus:outline-none text-lg"
                />
              </div>

              <div>
                <label htmlFor="bookTitle" className="block text-lg font-bold text-ink mb-2">
                  Book/Manuscript Title <span className="text-status-high">*</span>
                </label>
                <input
                  type="text"
                  id="bookTitle"
                  name="bookTitle"
                  required
                  placeholder="Enter your book title"
                  className="w-full px-4 py-3 border border-line rounded-lg focus:border-sage-deep focus:outline-none text-lg"
                />
              </div>

              <div>
                <label htmlFor="authorEmail" className="block text-lg font-bold text-ink mb-2">
                  Email Address <span className="text-status-high">*</span>
                </label>
                <input
                  type="email"
                  id="authorEmail"
                  name="authorEmail"
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-line rounded-lg focus:border-sage-deep focus:outline-none text-lg"
                />
              </div>

              <div>
                <label htmlFor="genre" className="block text-lg font-bold text-ink mb-2">
                  Genre (Optional)
                </label>
                <input
                  type="text"
                  id="genre"
                  name="genre"
                  placeholder="e.g., Literary Fiction, Romance, Mystery"
                  className="w-full px-4 py-3 border border-line rounded-lg focus:border-sage-deep focus:outline-none text-lg"
                />
              </div>

              <div>
                <label htmlFor="additionalNotes" className="block text-lg font-bold text-ink mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  rows={4}
                  placeholder="Any specific areas you'd like us to focus on..."
                  className="w-full px-4 py-3 border border-line rounded-lg focus:border-sage-deep focus:outline-none text-lg resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-lg font-bold text-ink mb-2">
                  Upload Complete Manuscript PDF <span className="text-status-high">*</span>
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all ${
                    dragOver 
                      ? 'border-sage-deep bg-sage-bg' 
                      : file 
                      ? 'border-sage-deep bg-sage-bg' 
                      : 'border-line bg-paper-warm hover:border-sage hover:bg-sage-bg/60'
                  }`}
                >
                  <div className="text-6xl mb-4">📄</div>
                  <div className="font-serif text-xl text-ink mb-2">
                    Choose Your Complete Manuscript
                  </div>
                  <div className="text-muted mb-6">
                    Drag and drop your PDF here, or click to browse<br />
                    <strong>Full manuscript analysis - no word limits!</strong>
                  </div>
                  
                  <input
                    type="file"
                    id="manuscript"
                    name="manuscript0"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => document.getElementById('manuscript')?.click()}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all"
                  >
                    Select PDF File
                  </button>

                  {file && (
                    <div className="mt-6 p-4 bg-sage-bg rounded-lg">
                      <div className="font-bold text-ink mb-2">
                        Selected: {file.name}
                      </div>
                      {isAnalyzing ? (
                        <div className="text-muted">Reading the file…</div>
                      ) : wordCountUnavailable ? (
                        <div className="text-muted">
                          <strong>Word count unavailable.</strong> We could not read a count from this file.<br />
                          <span className="text-sm">Your manuscript will still be analysed in full.</span>
                        </div>
                      ) : wordCountFormatted ? (
                        <div className="text-muted">
                          <strong>Manuscript Word Count:</strong> {wordCountFormatted} words<br />
                          <span className="text-sm">Ready for analysis.</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-paper-warm rounded-lg text-sm text-muted">
                  <strong>Accepted formats:</strong> PDF (.pdf) or Word (.docx)<br />
                  <strong>Maximum size:</strong> 20MB<br />
                  <strong>Full manuscript analysis:</strong> We analyze your complete manuscript, regardless of length<br />
                  <strong>Convert to PDF:</strong> Most word processors have a &quot;Save as PDF&quot; or &quot;Export as PDF&quot; option<br />
                  <strong>Best quality:</strong> Ensure your PDF contains selectable text (not scanned images)<br />
                  <strong>⭐ No word limits:</strong> Upload your entire manuscript for comprehensive analysis
                </div>
              </div>

              <Button
                type="submit"
                disabled={!file || isAnalyzing}
                className="w-full text-xl py-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {isAnalyzing ? 'Analyzing File...' : 'Get Complete Free Analysis'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}