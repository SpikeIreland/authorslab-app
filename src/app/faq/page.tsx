'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I get started with AuthorLab.ai?",
          a: "Getting started is easy! You can begin with our free manuscript analysis to see what's possible, or jump straight into the complete Author Package. Simply sign up, upload your manuscript, and our AI editors will begin working on your book."
        },
        {
          q: "What file formats do you accept?",
          a: "We accept most common document formats including .docx (Microsoft Word), .pdf, .txt, and .rtf. Your manuscript should be in a single file for best results."
        },
        {
          q: "How long does it take to get started after signing up?",
          a: "Immediately! Once you upload your manuscript, our AI editors begin analyzing it right away. You'll receive your first feedback within 24-48 hours depending on the length of your manuscript."
        },
        {
          q: "Do I need any special software?",
          a: "No special software needed! Everything works right in your browser. You just need an internet connection and a modern web browser (Chrome, Firefox, Safari, or Edge)."
        }
      ]
    },
    {
      category: "The Editing Process",
      questions: [
        {
          q: "What's the difference between the 4 editing phases?",
          a: "Phase 1 (Developmental) focuses on big-picture story structure, characters, and plot. Phase 2 (Line Editing) refines your prose at the sentence level. Phase 3 (Copy Editing) ensures technical accuracy and grammar. Phase 4 (Publishing Prep) formats your book for publication. Each phase builds on the previous one."
        },
        {
          q: "Can I skip phases or do them out of order?",
          a: "We recommend completing all phases in order for the best results. Each phase is designed to build on the previous one. However, if you've already had developmental editing done elsewhere, contact us to discuss starting at Phase 2."
        },
        {
          q: "How long does the complete editing process take?",
          a: "Most manuscripts complete all 4 phases in 10-16 days. The exact timeline depends on your manuscript's length and complexity. You'll see estimated timelines for your specific manuscript after upload."
        },
        {
          q: "What if I disagree with the AI's suggestions?",
          a: "You're always in control! All suggestions are just that - suggestions. You can accept, modify, or reject any feedback. The AI editors are here to help you strengthen YOUR vision for your book."
        },
        {
          q: "Can I communicate with the AI editors?",
          a: "Yes! You can ask questions, request clarification, or discuss specific aspects of your manuscript with Alex, Sam, and Jordan throughout the editing process."
        }
      ]
    },
    {
      category: "Pricing & Packages",
      questions: [
        {
          q: "What's included in the free manuscript analysis?",
          a: "Our free analysis includes a comprehensive AI-powered report covering story structure, character development, pacing, plot consistency, and key improvement areas. It's a detailed overview that shows you what's working and what needs attention."
        },
        {
          q: "Is the $399 Author Package a one-time payment or subscription?",
          a: "It's a one-time payment! You pay $399 once and receive complete editing through all 4 phases, plus publishing preparation. No hidden fees, no recurring charges."
        },
        {
          q: "What's the difference between the Free Analysis and the $399 package?",
          a: "The free analysis provides an overview and diagnostic report. The $399 Author Package includes the full 4-phase editing journey, real-time workspace collaboration, chapter-by-chapter feedback, implementation guidance, and publishing preparation."
        },
        {
          q: "Can I upgrade from the free analysis to the full package?",
          a: "Absolutely! After receiving your free analysis, you can upgrade to the complete Author Package at any time. We'll continue right where the analysis left off."
        },
        {
          q: "Do you offer refunds?",
          a: "We offer a satisfaction guarantee for the first phase. If you're not happy with the developmental editing in Phase 1, contact us within 7 days for a full refund. After Phase 1 is approved and you move to Phase 2, all sales are final."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processor."
        }
      ]
    },
    {
      category: "Technical Questions",
      questions: [
        {
          q: "Is my manuscript secure and confidential?",
          a: "Yes! Your manuscript is encrypted and stored securely. We never share, sell, or use your content for any purpose other than providing editing services to you. Your intellectual property remains 100% yours."
        },
        {
          q: "What if I have a very long manuscript (over 100,000 words)?",
          a: "We can handle manuscripts of virtually any length. Very long manuscripts may require additional processing time. Contact us before uploading manuscripts over 150,000 words to discuss timeline expectations."
        },
        {
          q: "Can I work on my manuscript while it's being edited?",
          a: "Yes! You have full access to your manuscript at all times. However, we recommend waiting for feedback from each phase before making major changes, so the AI editors can provide the most accurate guidance."
        },
        {
          q: "What happens to my manuscript after the editing is complete?",
          a: "You receive your fully edited manuscript in multiple formats (Word document, PDF, and publication-ready files). Your original files remain in your account for reference. You own all rights to your work."
        },
        {
          q: "Can I download my manuscript at any time?",
          a: "Yes! You can download your manuscript in various formats at any stage of the process. You always have full access to your work."
        }
      ]
    },
    {
      category: "Publishing & Beyond",
      questions: [
        {
          q: "Does Phase 4 actually publish my book?",
          a: "Phase 4 prepares your manuscript for publication by creating print-ready PDFs, e-book files (EPUB, MOBI), and providing publishing platform guidance. The actual uploading to Amazon KDP, IngramSpark, or other platforms is done by you, but we give you everything you need and step-by-step instructions."
        },
        {
          q: "Do you help with cover design?",
          a: "Phase 4 includes cover design guidance and templates. For custom professional cover design, we can connect you with recommended designers (additional cost)."
        },
        {
          q: "What about marketing my book?",
          a: "Phase 4 includes basic marketing materials templates (book description, author bio, social media posts). For comprehensive marketing support, ask about our Marketing Add-on package."
        },
        {
          q: "Can I use AuthorLab.ai for multiple books?",
          a: "Yes! Each manuscript is a separate project with its own $399 fee. Many authors use our service for their entire series or multiple books."
        },
        {
          q: "Do you help with traditional publishing submissions?",
          a: "While our primary focus is on preparing manuscripts for self-publishing, the editing quality is suitable for traditional publishing submissions. We can provide query letter guidance as an add-on service."
        }
      ]
    },
    {
      category: "Support & Help",
      questions: [
        {
          q: "What if I get stuck or have questions during the process?",
          a: "Author Package customers receive priority support throughout their journey. You can reach out via email, and we typically respond within 24 hours. For urgent issues, we offer expedited support."
        },
        {
          q: "Do you offer phone support?",
          a: "Currently, we provide support via email and in-platform messaging. This allows us to keep costs low while providing detailed, thoughtful responses to your questions."
        },
        {
          q: "What if I need help understanding the AI feedback?",
          a: "That's what we're here for! If any feedback is unclear, you can ask for clarification directly through the platform, and we'll provide additional context and examples."
        },
        {
          q: "Can I request a human editor to review the AI's work?",
          a: "Currently, all editing is performed by our AI editorial team (Alex, Sam, and Jordan). For manuscripts requiring human editorial oversight, please contact us about our Premium Review add-on service."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              📚 AuthorsLab.ai
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/how-it-works" className="text-gray-700 hover:text-blue-900 font-semibold">
                How It Works
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-900 font-semibold">
                Pricing
              </Link>
              <Link href="/editors" className="text-gray-700 hover:text-blue-900 font-semibold">
                Our Editors
              </Link>
              <Link href="/faq" className="text-blue-900 font-semibold border-b-2 border-blue-900">
                FAQ
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-900 font-semibold">
                Sign In
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-bold">
              ❓ Frequently Asked Questions
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            We&apos;re Here to
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Answer Your Questions
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about AuthorLab.ai, our AI editors, and the editing process.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
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
                        className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all hover:border-blue-300"
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 text-lg pr-4">
                            {faq.q}
                          </span>
                          <span className={`text-2xl text-blue-600 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                            ↓
                          </span>
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-5 pt-2">
                            <p className="text-gray-700 leading-relaxed">
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

      {/* Still Have Questions Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Cannot find what you are looking for? We are here to help!
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                <div className="text-4xl mb-4">📧</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">
                  Get detailed answers to your questions via email.
                </p>
                <div className="text-blue-600 hover:underline font-semibold">
                  support@authorslab.ai
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Try It Free</h3>
                <p className="text-gray-600 mb-4">
                  See our AI editors in action with a free manuscript analysis.
                </p>
                <Link href="/free-analysis">
                  <Button className="w-full">
                    Get Free Analysis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of authors who have transformed their manuscripts with AuthorLab.ai.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/free-analysis">
              <Button variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Start with Free Analysis
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-lg px-8 py-6">
                Begin Full Journey - $399
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}