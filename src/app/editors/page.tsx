// ============================================================================
// AL-UX-006 · Your editors — The Manuscript Room language
// Restyle + truth-fix pass: shared nav/footer, ivory/paper palette, persona
// tokens (marketing persona renamed to Riley), solid persona discs, closed pull-quotes,
// capability statements instead of training-data claims, static phase chips.
// ============================================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export const metadata: Metadata = {
  title: 'Your editors — AuthorsLab',
  description:
    'Meet the five AI specialists on your editorial team: Alex for the first read, Sam for the line edit, Jordan for the polish, Taylor for design and publishing, and Riley for your launch.',
}

export default function EditorsPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNav active="/editors" />

      {/* Hero Section */}
      <section className="py-20 border-b border-line-soft">
        <div className="container mx-auto px-4 text-center">
          <p className="kicker text-sage-deep mb-5">Meet your complete AI editorial team</p>
          <h1 className="font-serif font-medium text-5xl md:text-6xl text-ink leading-[1.1] mb-6">
            Five expert
            <span className="block italic text-sage-deep">editorial partners</span>
          </h1>
          <p className="text-lg text-muted max-w-3xl mx-auto mb-8 leading-relaxed">
            Five AI specialists, each devoted to their craft, working together to transform your
            manuscript from first draft to published, promoted book.
          </p>
        </div>
      </section>

      {/* Alex - First read (developmental) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <p className="kicker text-faint mb-10">Phase 1 · First read</p>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Avatar Side */}
              <div className="order-2 md:order-1">
                <div className="bg-alex-light border border-alex/25 rounded-2xl p-12">
                  <div className="w-28 h-28 rounded-full bg-alex flex items-center justify-center text-white font-serif text-5xl mb-6 mx-auto">
                    A
                  </div>
                  <h3 className="font-serif text-3xl text-ink text-center mb-2">Alex</h3>
                  <p className="text-center text-alex-text font-semibold mb-6">
                    Developmental Editor
                  </p>
                  <div className="bg-paper border border-line rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-ink mb-2">Specializes in</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Story Structure</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Character Arcs</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Plot Development</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Pacing</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Side */}
              <div className="order-1 md:order-2">
                <h2 className="font-serif font-medium text-3xl text-ink mb-4">Meet Alex</h2>
                <p className="text-lg text-muted mb-6">
                  Your story architect and narrative strategist
                </p>

                <div className="space-y-6">
                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">What Alex does</h4>
                    <p className="text-muted">
                      Alex dives deep into your manuscript&apos;s foundation, analyzing story structure,
                      character development, and thematic elements. Think of Alex as your story doctor
                      who diagnoses structural issues before they become problems.
                    </p>
                  </div>

                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">Alex&apos;s approach</h4>
                    <p className="font-serif italic text-ink mb-3">
                      &ldquo;Every great story has a strong backbone. I help you build that
                      foundation by examining:&rdquo;
                    </p>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-alex-text mt-1">→</span>
                        <span>Does your plot structure support your story goals?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-alex-text mt-1">→</span>
                        <span>Are your characters growing in meaningful ways?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-alex-text mt-1">→</span>
                        <span>Does your pacing keep readers engaged?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-alex-text mt-1">→</span>
                        <span>Are your themes woven naturally throughout?</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">Expertise</h4>
                    <p className="text-muted">
                      Deeply versed in the craft of published fiction across all genres — story
                      structure methodologies and character development frameworks. Alex understands
                      what makes stories resonate with readers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sam - Line edit */}
      <section className="py-20 bg-paper-warm border-y border-line-soft">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <p className="kicker text-faint mb-10">Phase 2 · Line edit</p>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Info Side */}
              <div>
                <h2 className="font-serif font-medium text-3xl text-ink mb-4">Meet Sam</h2>
                <p className="text-lg text-muted mb-6">
                  Your prose perfectionist and style guardian
                </p>

                <div className="space-y-6">
                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">What Sam does</h4>
                    <p className="text-muted">
                      Sam works at the sentence level, refining your prose for clarity, impact, and
                      beauty. Every word is evaluated, every sentence tested for flow. Sam turns good
                      writing into great writing.
                    </p>
                  </div>

                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">Sam&apos;s approach</h4>
                    <p className="font-serif italic text-ink mb-3">
                      &ldquo;Great prose sings. I help you find your voice by focusing on:&rdquo;
                    </p>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-sam-text mt-1">→</span>
                        <span>Sentence rhythm and musicality</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sam-text mt-1">→</span>
                        <span>Word choice precision and impact</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sam-text mt-1">→</span>
                        <span>Dialogue authenticity and voice distinction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sam-text mt-1">→</span>
                        <span>Paragraph flow and transitions</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">Expertise</h4>
                    <p className="text-muted">
                      A deep feel for what makes prose memorable across literary fiction, commercial
                      fiction, and creative non-fiction. Sam knows how to enhance your unique voice
                      rather than flatten it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Avatar Side */}
              <div>
                <div className="bg-sam-light border border-sam/25 rounded-2xl p-12">
                  <div className="w-28 h-28 rounded-full bg-sam flex items-center justify-center text-white font-serif text-5xl mb-6 mx-auto">
                    S
                  </div>
                  <h3 className="font-serif text-3xl text-ink text-center mb-2">Sam</h3>
                  <p className="text-center text-sam-text font-semibold mb-6">
                    Line Editor
                  </p>
                  <div className="bg-paper border border-line rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-ink mb-2">Specializes in</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Prose Flow</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Dialogue</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Voice</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Style</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jordan - Polish (copy edit) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <p className="kicker text-faint mb-10">Phase 3 · Polish</p>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Avatar Side */}
              <div className="order-2 md:order-1">
                <div className="bg-jordan-light border border-jordan/25 rounded-2xl p-12">
                  <div className="w-28 h-28 rounded-full bg-jordan flex items-center justify-center text-white font-serif text-5xl mb-6 mx-auto">
                    J
                  </div>
                  <h3 className="font-serif text-3xl text-ink text-center mb-2">Jordan</h3>
                  <p className="text-center text-jordan-text font-semibold mb-6">
                    Copy Editor
                  </p>
                  <div className="bg-paper border border-line rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-ink mb-2">Specializes in</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Grammar</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Consistency</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Accuracy</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Polish</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Side */}
              <div className="order-1 md:order-2">
                <h2 className="font-serif font-medium text-3xl text-ink mb-4">Meet Jordan</h2>
                <p className="text-lg text-muted mb-6">
                  Your precision expert and quality assurance specialist
                </p>

                <div className="space-y-6">
                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">What Jordan does</h4>
                    <p className="text-muted">
                      Jordan is your manuscript&apos;s last line of defense against errors. With
                      meticulous attention to detail, Jordan ensures your book is technically flawless
                      and ready for publication.
                    </p>
                  </div>

                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">Jordan&apos;s approach</h4>
                    <p className="font-serif italic text-ink mb-3">
                      &ldquo;Excellence is in the details. I catch what others miss by checking:&rdquo;
                    </p>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-jordan-text mt-1">→</span>
                        <span>Grammar, punctuation, and spelling accuracy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-jordan-text mt-1">→</span>
                        <span>Consistency in names, dates, and facts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-jordan-text mt-1">→</span>
                        <span>Formatting and style convention adherence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-jordan-text mt-1">→</span>
                        <span>Timeline and continuity errors</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">Expertise</h4>
                    <p className="text-muted">
                      Fluent in the major style conventions and the standards of professionally
                      published manuscripts. Jordan combines traditional editing standards with modern
                      AI precision.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Taylor - Design & Publishing */}
      <section className="py-20 bg-paper-warm border-y border-line-soft">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <p className="kicker text-faint mb-10">Phase 4 · Design &amp; Publishing</p>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Info Side */}
              <div>
                <h2 className="font-serif font-medium text-3xl text-ink mb-4">Meet Taylor</h2>
                <p className="text-lg text-muted mb-6">
                  Your publishing strategist and launch coordinator
                </p>

                <div className="space-y-6">
                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">What Taylor does</h4>
                    <p className="text-muted">
                      Taylor transforms your edited manuscript into a professionally formatted,
                      publication-ready book. From cover design to file preparation, Taylor handles all
                      the technical aspects of getting your book into readers&apos; hands.
                    </p>
                  </div>

                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">Taylor&apos;s approach</h4>
                    <p className="font-serif italic text-ink mb-3">
                      &ldquo;Publishing is where editing meets reader experience. I help you with:&rdquo;
                    </p>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">→</span>
                        <span>AI-generated cover designs tailored to your genre</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">→</span>
                        <span>Professional formatting for print and e-book</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">→</span>
                        <span>Front and back matter creation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-taylor-text mt-1">→</span>
                        <span>Publishing platform guidance and file preparation</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">Expertise</h4>
                    <p className="text-muted">
                      Versed in publishing industry standards, book design principles, and distribution
                      strategies across traditional, indie, and hybrid publishing models.
                    </p>
                  </div>
                </div>
              </div>

              {/* Avatar Side */}
              <div>
                <div className="bg-taylor-light border border-taylor/25 rounded-2xl p-12">
                  <div className="w-28 h-28 rounded-full bg-taylor flex items-center justify-center text-white font-serif text-5xl mb-6 mx-auto">
                    T
                  </div>
                  <h3 className="font-serif text-3xl text-ink text-center mb-2">Taylor</h3>
                  <p className="text-center text-taylor-text font-semibold mb-6">
                    Publishing Specialist
                  </p>
                  <div className="bg-paper border border-line rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-ink mb-2">Specializes in</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Cover Design</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Formatting</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">E-books</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Print</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Riley - Marketing */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <p className="kicker text-faint mb-10">Phase 5 · Marketing</p>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Avatar Side */}
              <div className="order-2 md:order-1">
                <div className="bg-riley-light border border-riley/25 rounded-2xl p-12">
                  <div className="w-28 h-28 rounded-full bg-riley flex items-center justify-center text-white font-serif text-5xl mb-6 mx-auto">
                    R
                  </div>
                  <h3 className="font-serif text-3xl text-ink text-center mb-2">Riley</h3>
                  <p className="text-center text-riley-text font-semibold mb-6">
                    Marketing Strategist
                  </p>
                  <div className="bg-paper border border-line rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-ink mb-2">Specializes in</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Platform</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Promotion</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Readers</span>
                      <span className="border border-line bg-ivory text-muted px-3 py-1 rounded-full text-xs font-semibold">Launch</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Side */}
              <div className="order-1 md:order-2">
                <h2 className="font-serif font-medium text-3xl text-ink mb-4">Meet Riley</h2>
                <p className="text-lg text-muted mb-6">
                  Your author platform builder and book promotion expert
                </p>

                <div className="space-y-6">
                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">What Riley does</h4>
                    <p className="text-muted">
                      Riley helps you build an author platform and create a strategic marketing plan to
                      reach your target readers. From social media to email campaigns, Riley guides you
                      through every aspect of book promotion.
                    </p>
                  </div>

                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">Riley&apos;s approach</h4>
                    <p className="font-serif italic text-ink mb-3">
                      &ldquo;Great books need readers. I help you connect with them by:&rdquo;
                    </p>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-riley-text mt-1">→</span>
                        <span>Identifying your target reader demographic</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-riley-text mt-1">→</span>
                        <span>Building your author platform and presence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-riley-text mt-1">→</span>
                        <span>Creating social media content calendars</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-riley-text mt-1">→</span>
                        <span>Planning strategic book launch campaigns</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-paper rounded-2xl p-6 border border-line">
                    <h4 className="font-semibold text-ink mb-2">Expertise</h4>
                    <p className="text-muted">
                      Grounded in what makes book marketing work — author platform strategies and
                      reader engagement best practices across multiple genres and publishing models.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How They Work Together */}
      <section className="py-20 bg-paper-warm border-y border-line">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="font-serif font-medium text-3xl text-ink mb-6">
              Your complete editorial team
            </h2>
            <p className="text-lg text-muted">
              Five specialists working in sequence to take your manuscript from first draft to
              published, promoted book
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-paper rounded-2xl border border-line p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-alex flex items-center justify-center text-white font-serif text-2xl mx-auto mb-4">
                    A
                  </div>
                  <h4 className="font-serif text-lg text-ink mb-2">Alex builds</h4>
                  <p className="text-muted text-sm">
                    Creates the strong foundation your story needs
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-sam flex items-center justify-center text-white font-serif text-2xl mx-auto mb-4">
                    S
                  </div>
                  <h4 className="font-serif text-lg text-ink mb-2">Sam refines</h4>
                  <p className="text-muted text-sm">
                    Works every sentence until it sings
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-jordan flex items-center justify-center text-white font-serif text-2xl mx-auto mb-4">
                    J
                  </div>
                  <h4 className="font-serif text-lg text-ink mb-2">Jordan polishes</h4>
                  <p className="text-muted text-sm">
                    Ensures flawless technical execution
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-taylor flex items-center justify-center text-white font-serif text-2xl mx-auto mb-4">
                    T
                  </div>
                  <h4 className="font-serif text-lg text-ink mb-2">Taylor publishes</h4>
                  <p className="text-muted text-sm">
                    Designs, formats, and prepares for distribution
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-riley flex items-center justify-center text-white font-serif text-2xl mx-auto mb-4">
                    R
                  </div>
                  <h4 className="font-serif text-lg text-ink mb-2">Riley promotes</h4>
                  <p className="text-muted text-sm">
                    Connects your book with readers
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="font-serif text-lg text-ink">
                  = Your published, promoted book
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-charcoal text-ivory">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif font-medium text-4xl text-ivory mb-6">
            Ready to work with your editorial team?
          </h2>
          <p className="text-lg text-faint mb-8 max-w-2xl mx-auto">
            All five editors are ready to help transform your manuscript. Start with a free
            assessment or begin your journey today.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/free-analysis"
              className="inline-block border border-white/25 hover:bg-white/10 text-ivory font-semibold px-6 py-3 rounded-lg text-sm"
            >
              Get your free assessment
            </Link>
            <Link
              href="/signup"
              className="inline-block bg-sage hover:bg-sage/90 text-charcoal font-semibold px-6 py-3 rounded-lg text-sm"
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
