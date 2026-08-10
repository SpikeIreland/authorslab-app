// ============================================================================
// AL-UX-006 · How it works — The Manuscript Room language
// Restyle + truth-fix pass: shared nav/footer, ivory/paper palette, persona
// tokens, no gradients, no emoji, no price anchors. Status truth per
// AL-MKT-007: editing studio live; Wright/Design/Publishing/Marketing coming soon.
// ============================================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export const metadata: Metadata = {
  title: 'How it works — AuthorsLab',
  description:
    'Five stages, a named editor at each one: a first read with Alex, a line edit with Sam, a final polish with Jordan — live today — then design with Taylor, publishing with Morgan, and your launch with Riley, coming soon.',
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNav active="/how-it-works" />

      {/* Hero Section */}
      <section className="py-20 border-b border-line-soft">
        <div className="container mx-auto px-4 text-center">
          <p className="kicker text-sage-deep mb-5">Your complete writing journey</p>
          <h1 className="font-serif font-medium text-5xl md:text-6xl text-ink leading-[1.1] mb-6">
            From first draft to
            <span className="block italic text-sage-deep">published book</span>
          </h1>
          <p className="text-lg text-muted max-w-3xl mx-auto mb-8 leading-relaxed">
            A five-stage journey from manuscript to published book, with a named editor at every
            stage, working at your pace. The editing studio is open today; design, publishing
            and marketing stages arrive as staged releases.
          </p>
        </div>
      </section>

      {/* The 5 Phases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">

            {/* Phase 1: First read (developmental) */}
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-alex flex items-center justify-center text-white font-serif text-2xl">
                  1
                </div>
                <div>
                  <h2 className="font-serif font-medium text-3xl text-ink">First read</h2>
                  <p className="text-alex-text font-medium text-sm mt-1">
                    Developmental editing · story structure &amp; the big picture · with Alex
                  </p>
                </div>
              </div>

              <div className="bg-alex-light rounded-2xl p-8 border border-alex/25">
                <h3 className="font-serif text-xl text-alex-text mb-4">What happens in the first read</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-ink mb-3">Story analysis</h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-alex-text mt-1">✓</span>
                        <span>Overall plot structure evaluation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-alex-text mt-1">✓</span>
                        <span>Character arc development</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-alex-text mt-1">✓</span>
                        <span>Pacing and tension assessment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-alex-text mt-1">✓</span>
                        <span>Theme identification and strengthening</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink mb-3">You receive</h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-alex-text mt-1">→</span>
                        <span>Comprehensive manuscript analysis PDF</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-alex-text mt-1">→</span>
                        <span>Chapter-by-chapter developmental notes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-alex-text mt-1">→</span>
                        <span>Interactive chat with Alex about your story</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-alex-text mt-1">→</span>
                        <span>Downloadable approved manuscript version</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-paper rounded-lg border border-line">
                  <p className="text-sm text-muted">
                    <strong className="text-ink">Your editor:</strong> Alex, developmental specialist ·{' '}
                    <strong className="text-ink">Work at your own pace</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 2: Line edit */}
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-sam flex items-center justify-center text-white font-serif text-2xl">
                  2
                </div>
                <div>
                  <h2 className="font-serif font-medium text-3xl text-ink">Line edit</h2>
                  <p className="text-sam-text font-medium text-sm mt-1">
                    Prose polish &amp; flow · with Sam
                  </p>
                </div>
              </div>

              <div className="bg-sam-light rounded-2xl p-8 border border-sam/25">
                <h3 className="font-serif text-xl text-sam-text mb-4">What happens in the line edit</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-ink mb-3">Sentence-level work</h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-sam-text mt-1">✓</span>
                        <span>Sentence structure optimization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sam-text mt-1">✓</span>
                        <span>Word choice enhancement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sam-text mt-1">✓</span>
                        <span>Voice consistency check</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sam-text mt-1">✓</span>
                        <span>Rhythm and dialogue flow</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink mb-3">You receive</h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-sam-text mt-1">→</span>
                        <span>Line-by-line prose editing notes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sam-text mt-1">→</span>
                        <span>Detailed line editing report PDF</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sam-text mt-1">→</span>
                        <span>Interactive chat with Sam about word choice</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sam-text mt-1">→</span>
                        <span>Downloadable polished manuscript version</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-paper rounded-lg border border-line">
                  <p className="text-sm text-muted">
                    <strong className="text-ink">Your editor:</strong> Sam, line editing specialist ·{' '}
                    <strong className="text-ink">Work at your own pace</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 3: Polish (copy / final pass) */}
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-jordan flex items-center justify-center text-white font-serif text-2xl">
                  3
                </div>
                <div>
                  <h2 className="font-serif font-medium text-3xl text-ink">Polish</h2>
                  <p className="text-jordan-text font-medium text-sm mt-1">
                    The final pass · grammar &amp; technical accuracy · with Jordan
                  </p>
                </div>
              </div>

              <div className="bg-jordan-light rounded-2xl p-8 border border-jordan/25">
                <h3 className="font-serif text-xl text-jordan-text mb-4">What happens in the polish</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-ink mb-3">Technical polish</h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-jordan-text mt-1">✓</span>
                        <span>Grammar and punctuation correction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-jordan-text mt-1">✓</span>
                        <span>Spelling and typo elimination</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-jordan-text mt-1">✓</span>
                        <span>Consistency checking (names, dates, details)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-jordan-text mt-1">✓</span>
                        <span>Style convention compliance</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink mb-3">You receive</h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-jordan-text mt-1">→</span>
                        <span>Technical editing notes per chapter</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-jordan-text mt-1">→</span>
                        <span>Copy editing report PDF</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-jordan-text mt-1">→</span>
                        <span>Interactive chat with Jordan about technical details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-jordan-text mt-1">→</span>
                        <span>Publication-ready manuscript download</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-paper rounded-lg border border-line">
                  <p className="text-sm text-muted">
                    <strong className="text-ink">Your editor:</strong> Jordan, copy editing specialist ·{' '}
                    <strong className="text-ink">Work at your own pace</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 4: Design & Publishing */}
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-taylor flex items-center justify-center text-white font-serif text-2xl">
                  4
                </div>
                <div>
                  <h2 className="font-serif font-medium text-3xl text-ink">Design &amp; Publishing</h2>
                  <p className="text-taylor-text font-medium text-sm mt-1">
                    Cover, files &amp; platforms · with Taylor &amp; Morgan · coming soon
                  </p>
                </div>
              </div>

              <div className="bg-taylor-light rounded-2xl p-8 border border-taylor/25">
                <div className="bg-paper border border-line rounded-xl p-6 mb-6">
                  <h4 className="font-serif text-lg text-taylor-text mb-3">
                    Why this approach is better for you
                  </h4>
                  <p className="text-muted leading-relaxed">
                    Unlike traditional publishing services that take your rights, Taylor gives you
                    professional-grade publishing tools and guidance while YOU keep 100% ownership,
                    control, and royalties. Your book, your rights, your success.
                  </p>
                </div>

                <h3 className="font-serif text-xl text-taylor-text mb-4">What happens in design &amp; publishing</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-ink mb-3">What Taylor prepares for you</h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">✓</span>
                        <span>Professional EPUB files for all ebook platforms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">✓</span>
                        <span>Print-ready PDFs (multiple trim sizes)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">✓</span>
                        <span>AI-generated cover designs (ebook &amp; print)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">✓</span>
                        <span>Optimized book description &amp; metadata</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">✓</span>
                        <span>Keyword research &amp; category recommendations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">✓</span>
                        <span>File validation &amp; quality checks</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink mb-3">What you do (with Taylor&apos;s guidance)</h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">→</span>
                        <span>Review and select your favorite cover design</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">→</span>
                        <span>Approve formatting previews</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">→</span>
                        <span>Create free accounts on publishing platforms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">→</span>
                        <span>Upload files following Taylor&apos;s video tutorials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">→</span>
                        <span>Set your pricing and distribution</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">→</span>
                        <span>Click &quot;Publish&quot; — your book goes live!</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 bg-paper rounded-xl border border-line p-6">
                  <h4 className="font-semibold text-ink mb-3">Supported publishing platforms</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <span className="text-taylor-text">✓</span>
                      <span>Amazon KDP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-taylor-text">✓</span>
                      <span>IngramSpark</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-taylor-text">✓</span>
                      <span>Draft2Digital</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-taylor-text">✓</span>
                      <span>Apple Books</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-taylor-text">✓</span>
                      <span>Google Play</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-taylor-text">✓</span>
                      <span>Kobo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-taylor-text">✓</span>
                      <span>Barnes &amp; Noble</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-taylor-text">✓</span>
                      <span>Lulu</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-paper rounded-xl border border-line p-6">
                  <h4 className="font-serif text-lg text-taylor-text mb-3">
                    You keep 100% ownership &amp; control
                  </h4>
                  <ul className="space-y-2 text-muted text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-taylor-text mt-1">•</span>
                      <span><strong className="text-ink">All rights remain yours</strong> — no contracts giving away ownership</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-taylor-text mt-1">•</span>
                      <span><strong className="text-ink">You keep all royalties</strong> after platform fees (typically 60&ndash;70% of sales price)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-taylor-text mt-1">•</span>
                      <span><strong className="text-ink">You set your own prices</strong> — change them anytime you want</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-taylor-text mt-1">•</span>
                      <span><strong className="text-ink">You control distribution</strong> — choose which countries and platforms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-taylor-text mt-1">•</span>
                      <span><strong className="text-ink">You can update anytime</strong> — upload new versions whenever you want</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-paper rounded-lg border border-line">
                  <p className="text-sm text-muted">
                    <strong className="text-ink">Design:</strong> Taylor ·{' '}
                    <strong className="text-ink">Publishing:</strong> Morgan ·{' '}
                    <strong className="text-ink">Coming soon</strong> — releases as your book nears
                    the end of its editing journey
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 5: Marketing */}
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-riley flex items-center justify-center text-white font-serif text-2xl">
                  5
                </div>
                <div>
                  <h2 className="font-serif font-medium text-3xl text-ink">Marketing</h2>
                  <p className="text-riley-text font-medium text-sm mt-1">
                    Platform building &amp; promotion · with Riley · coming soon
                  </p>
                </div>
              </div>

              <div className="bg-riley-light rounded-2xl p-8 border border-riley/25">
                <h3 className="font-serif text-xl text-riley-text mb-4">What happens in marketing</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-ink mb-3">Marketing launch</h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-riley-text mt-1">✓</span>
                        <span>Author platform building strategy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-riley-text mt-1">✓</span>
                        <span>Target reader identification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-riley-text mt-1">✓</span>
                        <span>Social media content calendar</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-riley-text mt-1">✓</span>
                        <span>Book launch timeline and tactics</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink mb-3">You receive</h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-riley-text mt-1">→</span>
                        <span>Comprehensive marketing plan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-riley-text mt-1">→</span>
                        <span>Social media post templates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-riley-text mt-1">→</span>
                        <span>Email campaign strategies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-riley-text mt-1">→</span>
                        <span>Book promotion best practices guide</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-paper rounded-lg border border-line">
                  <p className="text-sm text-muted">
                    <strong className="text-ink">Marketing specialist:</strong> Riley ·{' '}
                    <strong className="text-ink">Coming soon</strong> — releases as your book
                    approaches launch
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Complete Journey Section */}
      <section className="py-20 bg-paper-warm border-y border-line">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif font-medium text-3xl text-ink mb-6">Your complete journey</h2>
            <p className="text-lg text-muted mb-12">
              One membership covers the editing studio today — and each new stage joins your
              membership as it releases, without your price changing.
            </p>

            <div className="bg-paper rounded-2xl p-8 md:p-12 border border-line">
              <p className="kicker text-sage-deep mb-8">The whole journey</p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-alex flex items-center justify-center text-white font-serif text-lg mx-auto mb-2">A</div>
                  <p className="text-xs text-muted">First read</p>
                  <p className="text-xs font-semibold text-alex-text">Alex</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-sam flex items-center justify-center text-white font-serif text-lg mx-auto mb-2">S</div>
                  <p className="text-xs text-muted">Line edit</p>
                  <p className="text-xs font-semibold text-sam-text">Sam</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-jordan flex items-center justify-center text-white font-serif text-lg mx-auto mb-2">J</div>
                  <p className="text-xs text-muted">Polish</p>
                  <p className="text-xs font-semibold text-jordan-text">Jordan</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-taylor flex items-center justify-center text-white font-serif text-lg mx-auto mb-2">T</div>
                  <p className="text-xs text-muted">Design &amp; Publishing</p>
                  <p className="text-xs font-semibold text-taylor-text">Taylor &amp; Morgan</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-riley flex items-center justify-center text-white font-serif text-lg mx-auto mb-2">R</div>
                  <p className="text-xs text-muted">Marketing</p>
                  <p className="text-xs font-semibold text-riley-text">Riley</p>
                </div>
              </div>

              <p className="font-serif text-2xl text-ink mb-2">
                One membership · your editors · your rights, always
              </p>
              <p className="text-muted mb-8">Work at your own pace · Full details soon</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-block bg-sage-deep hover:bg-sage-deep/90 text-white font-semibold px-6 py-3 rounded-lg text-sm"
                >
                  Start your book
                </Link>
                <Link
                  href="/free-analysis"
                  className="inline-block border border-line hover:bg-paper-warm text-ink font-semibold px-6 py-3 rounded-lg text-sm"
                >
                  Get a free assessment first
                </Link>
              </div>
            </div>

            <p className="mt-8 text-muted">
              Editing, publishing, AND marketing — one team, in one place, at your pace.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-charcoal text-ivory">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif font-medium text-4xl text-ivory mb-6">Ready to transform your manuscript?</h2>
          <p className="text-lg text-faint mb-8 max-w-2xl mx-auto">
            Start with a free manuscript assessment and see what&apos;s possible for your book.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/free-analysis"
              className="inline-block bg-sage hover:bg-sage/90 text-charcoal font-semibold px-6 py-3 rounded-lg text-sm"
            >
              Get your free assessment
            </Link>
            <Link
              href="/signup"
              className="inline-block border border-white/25 hover:bg-white/10 text-ivory font-semibold px-6 py-3 rounded-lg text-sm"
            >
              Start your book
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
