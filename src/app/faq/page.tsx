'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      category: "Getting started",
      questions: [
        {
          q: "How do I get started with AuthorsLab?",
          a: "Most authors start with the free manuscript assessment: Alex reads your full manuscript and delivers a written assessment as a PDF — no card required. From there you can join a membership and begin the editorial journey. If you're starting from a blank page, Wright — our drafting stage, coming soon — is where Eliot will meet you first and pair you with a drafting partner that suits your book."
        },
        {
          q: "What file format do you accept?",
          a: "Upload your manuscript as a PDF, up to 10MB. A single file works best — your whole manuscript in one document."
        },
        {
          q: "How long does the free assessment take?",
          a: "Alex reads the full manuscript and the written assessment arrives in your email as a PDF shortly after you submit."
        },
        {
          q: "Do I need any special software?",
          a: "No. Everything runs in your browser — you just need an internet connection and a modern browser such as Chrome, Firefox, Safari, or Edge."
        },
        {
          q: "What if I haven't written my book yet?",
          a: "That's what Wright is for — the drafting stage where Eliot meets you first, helps you shape the idea, and pairs you with a drafting partner so the blank page stops being a wall. Wright is coming soon; today, the editing studio is built for finished or nearly finished manuscripts."
        }
      ]
    },
    {
      category: "The editorial journey",
      questions: [
        {
          q: "Who are the editors, and what does each one do?",
          a: "Each book travels a journey with named editors. Eliot meets you first (including in Wright, for books that begin from a blank page). Alex gives your book its First read — a full-manuscript developmental assessment. Sam does the Line edit, working through your prose chapter by chapter. Jordan handles the Polish — a final consistency and rhythm pass. Taylor leads Design — cover and interior files. Morgan leads Publishing — metadata and platform preparation. Riley builds your Marketing launch plan. The editing journey — Alex, Sam and Jordan — is live now; Wright, Design, Publishing and Marketing are coming soon."
        },
        {
          q: "Do I have to go through the stages in order?",
          a: "The journey is designed to flow in order because each stage builds on the last — structure before sentences, sentences before polish. But you're not locked in: if your book has already had developmental editing elsewhere, you can begin further along, and you can return to any previous editor whenever you like."
        },
        {
          q: "How long does the whole process take?",
          a: "You set the pace. There are no deadlines or time limits — some authors move through the journey in a few weeks, others take months. Your project waits for you in your library."
        },
        {
          q: "What if I disagree with an editor's suggestions?",
          a: "You're always in control. Every note is a suggestion — you can accept it, adapt it, or reject it. The editors are there to strengthen your vision for the book, not to replace it."
        },
        {
          q: "Can I talk to the editors?",
          a: "Yes, as much as you like. Conversation with your editors is unlimited — ask questions, push back, request examples. Editorial passes only meter the deep reads: a full read of your manuscript by one editor, such as an assessment, a line pass, or a polish pass."
        }
      ]
    },
    {
      category: "Pricing & membership",
      questions: [
        {
          q: "What's included in the free manuscript assessment?",
          a: "Alex reads your full manuscript and delivers a written assessment as a PDF covering structure, character, pacing, and the areas that most need attention. It's free, requires no card, and covers one manuscript. It's the best way to see how AuthorsLab works before you commit to anything."
        },
        {
          q: "How much does membership cost?",
          a: "There are three tiers. Starter is £7/month billed annually (or £10 billed monthly) and includes one full-manuscript editorial pass per month with one active project. Author is £13/month billed annually (or £19 billed monthly) with four passes per month and unlimited projects. Pro is £27/month billed annually (or £39 billed monthly) with ten passes per month. Conversation with your editors is unlimited on every tier."
        },
        {
          q: "What counts as an editorial pass?",
          a: "A pass is a full deep read of your manuscript by one editor — Alex's assessment, one of Sam's line passes, or Jordan's polish pass. Everyday conversation with the editors doesn't use passes; only deep reads are metered."
        },
        {
          q: "I only have one book. Do I need a membership?",
          a: "Membership is how AuthorsLab works, and for one book the Starter tier is designed exactly for that: £7/month billed annually, one active project, one full editorial pass per month, unlimited conversation with your editors. When your book is done you can cancel — everything you've downloaded stays yours."
        },
        {
          q: "What happened to the old one-time editing package?",
          a: "The old one-time packages have been retired in favour of simple memberships. If you used AuthorsLab during the beta, you can complete the manuscript you're working on in the editing studio; ongoing use beyond that is by membership, like every other author."
        },
        {
          q: "Can I cancel or change my tier?",
          a: "Yes, at any time. Cancellations and tier changes take effect at the end of your current billing period, and your library and shelf documents remain yours — you can download them whenever you like."
        },
        {
          q: "What payment methods do you accept?",
          a: "All major credit and debit cards (Visa, Mastercard, American Express, Discover), processed securely through Stripe."
        }
      ]
    },
    {
      category: "Publishing your book",
      questions: [
        {
          q: "Does AuthorsLab publish my book for me?",
          a: "No — and that's deliberate. When the Publishing stage releases, Morgan prepares everything you need, and you click publish on the platform of your choice. That way you keep 100% ownership, full control, and all your royalties. AuthorsLab is not the publisher; you are."
        },
        {
          q: "What will Taylor and Morgan prepare?",
          a: "Design and Publishing are the next stages on the roadmap. Taylor leads Design: cover design for ebook and print, and professionally formatted interior files (EPUB for ebooks, print-ready PDFs). Morgan leads Publishing: book description and metadata, keyword and category recommendations, and platform preparation so your files pass validation on the store you choose."
        },
        {
          q: "Which publishing platforms can I use?",
          a: "When the Publishing stage releases, Morgan prepares files compatible with all major platforms, including Amazon KDP, IngramSpark, Draft2Digital, Apple Books, Google Play, Kobo, Barnes & Noble, and Lulu. You can publish to as many or as few as you choose."
        },
        {
          q: "Do I keep ownership of my book?",
          a: "Yes — 100%. You retain all rights, set your own prices, control your distribution, and can update or unpublish your book at any time. There are no contracts assigning rights to anyone; your intellectual property stays entirely yours."
        },
        {
          q: "What royalties will I earn?",
          a: "You keep everything after platform fees — AuthorsLab takes no cut. On Amazon KDP, for example, ebooks priced between $2.99 and $9.99 earn about 70% per sale, and print books earn around 60% after printing costs. A $2.99 ebook earns roughly $2 per sale; a $14.99 print book typically $5–7."
        },
        {
          q: "How much does it cost to publish on these platforms?",
          a: "Creating accounts on Amazon KDP, Draft2Digital, and most other platforms is free, and there are no upfront costs to list your book. Platforms take their share from each sale, but you pay nothing to upload."
        },
        {
          q: "Do I need an ISBN?",
          a: "For ebooks, no — Amazon and most platforms provide one free. For print, Amazon provides a free ISBN, or you can buy your own for about $125 if you want your own imprint listed. Morgan will walk you through the right option when the Publishing stage releases."
        },
        {
          q: "What if I need help uploading to a platform?",
          a: "The Publishing stage is being designed to be beginner-friendly: Morgan gives step-by-step guidance for each major platform, showing you exactly what to enter and where. And if you ever get stuck, email support@authorslab.ai and we'll help you troubleshoot."
        },
        {
          q: "What if I want to publish traditionally instead of self-publishing?",
          a: "The editorial journey with Alex, Sam, and Jordan produces a submission-ready manuscript. If you're pursuing agents and traditional publishers, you can simply stop after Jordan's polish and submit your polished manuscript instead."
        }
      ]
    },
    {
      category: "Marketing & launch",
      questions: [
        {
          q: "What does Riley do?",
          a: "Riley is your marketing editor and builds your launch plan: identifying your target readers, shaping your positioning and book description for discovery, and planning the launch itself so your book meets its readers rather than disappearing quietly. Riley's Marketing stage is coming soon — it releases as your book approaches launch."
        },
        {
          q: "Can I use AuthorsLab for multiple books?",
          a: "Yes — that's the point of the library. Your library holds all your projects, and each book travels its own journey. On the Starter tier you work on one active project at a time; the Author and Pro tiers include unlimited projects."
        },
        {
          q: "Do you help with book cover design?",
          a: "Yes — when the Design stage releases, Taylor generates cover options for both ebook and print, and you choose and refine the direction you like."
        },
        {
          q: "Can I make changes to my book after it's published?",
          a: "Absolutely. Because you self-publish, you can upload a new version to your platform at any time, and the updated edition typically goes live within a few days. It's your book — you control everything."
        }
      ]
    },
    {
      category: "Your manuscript & your data",
      questions: [
        {
          q: "Is my manuscript secure and confidential?",
          a: "Yes. Your manuscript is encrypted and stored securely. We never share, sell, or use your content for anything other than providing editorial services to you. Your intellectual property remains 100% yours."
        },
        {
          q: "What if my manuscript is very long?",
          a: "Length is rarely a problem — your editors read the whole book regardless. Just keep the uploaded PDF under the 10MB limit; if your file is larger, exporting it at a standard page size without embedded images usually brings it well under."
        },
        {
          q: "Can I keep working on my manuscript during editing?",
          a: "Yes, you have full access to your project at all times. We'd suggest finishing each editorial pass before making major changes, so the next editor is working from the version you actually intend."
        },
        {
          q: "Can I download my work at any time?",
          a: "Yes. Your library and shelf documents are yours — you can download your manuscript and every document your editors produce at any stage, and they remain available in your account."
        },
        {
          q: "Can I return to a previous editor later in the journey?",
          a: "Yes. Moving forward never closes a door behind you — you can go back to Alex, Sam, or any other editor to keep refining, and all your conversation history and progress is saved."
        }
      ]
    },
    {
      category: "Support & help",
      questions: [
        {
          q: "What if I get stuck or have questions during the process?",
          a: "Ask your editors first — conversation with them is unlimited, and they can clarify any note or suggestion in context. For account or technical questions, email support@authorslab.ai."
        },
        {
          q: "Do you offer phone support?",
          a: "Not currently. Support is by email and through in-platform conversation with your editors. This keeps our costs — and your membership price — low, while letting us give detailed, thoughtful answers."
        },
        {
          q: "What if I don't understand a piece of editorial feedback?",
          a: "Ask the editor who gave it. Alex, Sam, and Jordan can explain any note, give examples from your own manuscript, and rework the suggestion until it makes sense — that conversation is unlimited and never uses a pass."
        },
        {
          q: "How do I contact support?",
          a: "Email support@authorslab.ai for technical questions, account issues, or anything else."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNav active="/faq" />

      {/* Hero */}
      <section className="py-20 border-b border-line-soft">
        <div className="container mx-auto px-4 text-center">
          <p className="kicker mb-4">Frequently asked questions</p>
          <h1 className="font-serif text-5xl md:text-6xl text-ink mb-6">
            Answers, before you ask
          </h1>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            Everything you need to know about AuthorsLab, your editors, and the journey your book takes.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="font-serif text-3xl text-ink mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-sage-deep text-white font-serif text-lg flex items-center justify-center flex-shrink-0">
                    {categoryIndex + 1}
                  </span>
                  {category.category}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = faqs
                      .slice(0, categoryIndex)
                      .reduce((sum, cat) => sum + cat.questions.length, 0) + faqIndex
                    const isOpen = openIndex === globalIndex

                    return (
                      <div
                        key={faqIndex}
                        className="bg-paper rounded-xl border border-line overflow-hidden transition-colors hover:border-sage"
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-paper-warm transition-colors"
                        >
                          <span className="font-semibold text-ink text-lg pr-4">
                            {faq.q}
                          </span>
                          <svg
                            className={`w-5 h-5 text-sage-deep transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                          >
                            <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-5 pt-2">
                            <p className="text-muted leading-relaxed">
                              {faq.a}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-paper-warm border-y border-line-soft">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-4xl text-ink mb-6">
              Still have questions?
            </h2>
            <p className="text-xl text-muted mb-8">
              If you can&apos;t find what you&apos;re looking for, we&apos;re happy to help.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-paper rounded-xl p-8 border border-line text-left">
                <p className="kicker mb-3">Email support</p>
                <h3 className="text-xl font-semibold text-ink mb-2">Write to us</h3>
                <p className="text-muted mb-4">
                  Get detailed answers to your questions by email.
                </p>
                <a href="mailto:support@authorslab.ai" className="text-sage-deep font-semibold hover:underline">
                  support@authorslab.ai
                </a>
              </div>

              <div className="bg-paper rounded-xl p-8 border border-line text-left">
                <p className="kicker mb-3">Try it free</p>
                <h3 className="text-xl font-semibold text-ink mb-2">Free manuscript assessment</h3>
                <p className="text-muted mb-4">
                  Alex reads your full manuscript and sends a written assessment — no card required.
                </p>
                <Link href="/free-analysis">
                  <Button className="w-full bg-sage-deep text-white hover:bg-sage">
                    Get your free assessment
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-charcoal text-ivory">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl mb-6">
            Ready to begin?
          </h2>
          <p className="text-xl mb-8 text-ivory/80 max-w-2xl mx-auto">
            Start with a free assessment, or give one book the complete journey.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/free-analysis">
              <Button className="text-lg px-8 py-6 bg-sage text-charcoal hover:bg-sage-light font-semibold">
                Start with a free assessment
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="text-lg px-8 py-6 bg-transparent border-ivory/30 text-ivory hover:bg-ivory/10">
                See membership pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
