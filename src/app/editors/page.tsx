import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditorsPage() {
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
              <Link href="/editors" className="text-blue-900 font-semibold border-b-2 border-blue-900">
                Our Editors
              </Link>
              <Link href="/faq" className="text-gray-700 hover:text-blue-900 font-semibold">
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
            <span className="px-4 py-2 bg-gradient-to-r from-green-400/20 to-orange-400/20 border-2 border-green-400 text-green-700 rounded-full text-sm font-bold">
              🤖 Meet Your Complete AI Editorial Team
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Five Expert
            <span className="block bg-gradient-to-r from-green-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              Editorial Partners
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Five AI specialists, each trained in their craft, working together to transform your manuscript from first draft to published, promoted book.
          </p>
        </div>
      </section>

      {/* Alex - Developmental Editor */}
      <section className="py-20 relative">
        <div className="absolute top-8 right-8 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          PHASE 1
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Avatar Side */}
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                  <div className="relative z-10">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-6xl mb-6 mx-auto backdrop-blur-sm">
                      👔
                    </div>
                    <h3 className="text-4xl font-bold text-center mb-2">Alex</h3>
                    <p className="text-center text-green-100 text-lg font-semibold mb-6">
                      Developmental Editor
                    </p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <p className="text-sm font-semibold mb-2">Specializes in:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Story Structure</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Character Arcs</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Plot Development</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Pacing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Side */}
              <div className="order-1 md:order-2">
                <div className="inline-block px-4 py-2 bg-green-100 text-green-900 rounded-full text-sm font-bold mb-4">
                  Phase 1: Developmental Editing
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Alex</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Your story architect and narrative strategist
                </p>

                <div className="space-y-6">
                  <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-green-600">📚</span>
                      What Alex Does
                    </h4>
                    <p className="text-gray-700">
                      Alex dives deep into your manuscript&apos;s foundation, analyzing story structure, character development, and thematic elements. Think of Alex as your story doctor who diagnoses structural issues before they become problems.
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-green-600">💡</span>
                      Alex&apos;s Approach
                    </h4>
                    <p className="text-gray-700 mb-3">
                      &quot;Every great story has a strong backbone. I help you build that foundation by examining:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">→</span>
                        <span>Does your plot structure support your story goals?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">→</span>
                        <span>Are your characters growing in meaningful ways?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">→</span>
                        <span>Does your pacing keep readers engaged?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">→</span>
                        <span>Are your themes woven naturally throughout?</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-green-600">🎓</span>
                      Training & Expertise
                    </h4>
                    <p className="text-gray-700">
                      Trained on thousands of published novels across all genres, story structure methodologies, and character development frameworks. Alex understands what makes stories resonate with readers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sam - Line Editor */}
      <section className="py-20 bg-gray-50 relative">
        <div className="absolute top-8 right-8 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          PHASE 2
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Info Side */}
              <div>
                <div className="inline-block px-4 py-2 bg-purple-100 text-purple-900 rounded-full text-sm font-bold mb-4">
                  Phase 2: Line Editing
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Sam</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Your prose perfectionist and style guardian
                </p>

                <div className="space-y-6">
                  <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-purple-600">✍️</span>
                      What Sam Does
                    </h4>
                    <p className="text-gray-700">
                      Sam works at the sentence level, refining your prose for clarity, impact, and beauty. Every word is evaluated, every sentence tested for flow. Sam turns good writing into great writing.
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-purple-600">💡</span>
                      Sam&apos;s Approach
                    </h4>
                    <p className="text-gray-700 mb-3">
                      &quot;Great prose sings. I help you find your voice by focusing on:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">→</span>
                        <span>Sentence rhythm and musicality</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">→</span>
                        <span>Word choice precision and impact</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">→</span>
                        <span>Dialogue authenticity and voice distinction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">→</span>
                        <span>Paragraph flow and transitions</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-purple-600">🎓</span>
                      Training & Expertise
                    </h4>
                    <p className="text-gray-700">
                      Trained on award-winning prose across literary fiction, commercial fiction, and creative non-fiction. Sam knows what makes writing memorable and how to enhance your unique voice.
                    </p>
                  </div>
                </div>
              </div>

              {/* Avatar Side */}
              <div>
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32"></div>
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mb-24"></div>

                  <div className="relative z-10">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-6xl mb-6 mx-auto backdrop-blur-sm">
                      ✨
                    </div>
                    <h3 className="text-4xl font-bold text-center mb-2">Sam</h3>
                    <p className="text-center text-purple-100 text-lg font-semibold mb-6">
                      Line Editor
                    </p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <p className="text-sm font-semibold mb-2">Specializes in:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Prose Flow</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Dialogue</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Voice</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Style</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jordan - Copy Editor */}
      <section className="py-20 relative">
        <div className="absolute top-8 right-8 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          PHASE 3
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Avatar Side */}
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                  <div className="relative z-10">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-6xl mb-6 mx-auto backdrop-blur-sm">
                      🔍
                    </div>
                    <h3 className="text-4xl font-bold text-center mb-2">Jordan</h3>
                    <p className="text-center text-blue-100 text-lg font-semibold mb-6">
                      Copy Editor
                    </p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <p className="text-sm font-semibold mb-2">Specializes in:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Grammar</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Consistency</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Accuracy</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Polish</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Side */}
              <div className="order-1 md:order-2">
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-bold mb-4">
                  Phase 3: Copy Editing
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Jordan</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Your precision expert and quality assurance specialist
                </p>

                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-blue-600">🔬</span>
                      What Jordan Does
                    </h4>
                    <p className="text-gray-700">
                      Jordan is your manuscript&apos;s last line of defense against errors. With meticulous attention to detail, Jordan ensures your book is technically flawless and ready for publication.
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-blue-600">💡</span>
                      Jordan&apos;s Approach
                    </h4>
                    <p className="text-gray-700 mb-3">
                      &quot;Excellence is in the details. I catch what others miss by checking:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">→</span>
                        <span>Grammar, punctuation, and spelling accuracy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">→</span>
                        <span>Consistency in names, dates, and facts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">→</span>
                        <span>Formatting and style guide adherence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">→</span>
                        <span>Timeline and continuity errors</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-blue-600">🎓</span>
                      Training & Expertise
                    </h4>
                    <p className="text-gray-700">
                      Trained on major style guides (Chicago Manual of Style, AP, MLA) and countless published manuscripts. Jordan combines traditional editing standards with modern AI precision.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Taylor - Publishing */}
      <section className="py-20 bg-gray-50 relative">
        <div className="absolute top-8 right-8 bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          PHASE 4
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Info Side */}
              <div>
                <div className="inline-block px-4 py-2 bg-teal-100 text-teal-900 rounded-full text-sm font-bold mb-4">
                  Phase 4: Publishing Preparation
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Taylor</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Your publishing strategist and launch coordinator
                </p>

                <div className="space-y-6">
                  <div className="bg-teal-50 rounded-xl p-6 border-l-4 border-teal-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-teal-600">📚</span>
                      What Taylor Does
                    </h4>
                    <p className="text-gray-700">
                      Taylor transforms your edited manuscript into a professionally formatted, publication-ready book. From cover design to file preparation, Taylor handles all the technical aspects of getting your book into readers&apos; hands.
                    </p>
                  </div>

                  <div className="bg-teal-50 rounded-xl p-6 border-l-4 border-teal-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-teal-600">💡</span>
                      Taylor&apos;s Approach
                    </h4>
                    <p className="text-gray-700 mb-3">
                      &quot;Publishing is where editing meets reader experience. I help you with:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">→</span>
                        <span>AI-generated cover designs tailored to your genre</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">→</span>
                        <span>Professional formatting for print and e-book</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">→</span>
                        <span>Front and back matter creation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">→</span>
                        <span>Publishing platform guidance and file preparation</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-xl p-6 border-l-4 border-teal-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-teal-600">🎓</span>
                      Training & Expertise
                    </h4>
                    <p className="text-gray-700">
                      Trained on publishing industry standards, book design principles, and distribution strategies across traditional, indie, and hybrid publishing models.
                    </p>
                  </div>
                </div>
              </div>

              {/* Avatar Side */}
              <div>
                <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32"></div>
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mb-24"></div>

                  <div className="relative z-10">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-6xl mb-6 mx-auto backdrop-blur-sm">
                      📚
                    </div>
                    <h3 className="text-4xl font-bold text-center mb-2">Taylor</h3>
                    <p className="text-center text-teal-100 text-lg font-semibold mb-6">
                      Publishing Specialist
                    </p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <p className="text-sm font-semibold mb-2">Specializes in:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Cover Design</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Formatting</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">E-books</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Print</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quinn - Marketing */}
      <section className="py-20 relative">
        <div className="absolute top-8 right-8 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          PHASE 5
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Avatar Side */}
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                  <div className="relative z-10">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-6xl mb-6 mx-auto backdrop-blur-sm">
                      🚀
                    </div>
                    <h3 className="text-4xl font-bold text-center mb-2">Quinn</h3>
                    <p className="text-center text-orange-100 text-lg font-semibold mb-6">
                      Marketing Strategist
                    </p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <p className="text-sm font-semibold mb-2">Specializes in:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Platform</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Promotion</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Readers</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">Launch</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Side */}
              <div className="order-1 md:order-2">
                <div className="inline-block px-4 py-2 bg-orange-100 text-orange-900 rounded-full text-sm font-bold mb-4">
                  Phase 5: Marketing Strategy
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Quinn</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Your author platform builder and book promotion expert
                </p>

                <div className="space-y-6">
                  <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-orange-600">🎯</span>
                      What Quinn Does
                    </h4>
                    <p className="text-gray-700">
                      Quinn helps you build an author platform and create a strategic marketing plan to reach your target readers. From social media to email campaigns, Quinn guides you through every aspect of book promotion.
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-orange-600">💡</span>
                      Quinn&apos;s Approach
                    </h4>
                    <p className="text-gray-700 mb-3">
                      &quot;Great books need readers. I help you connect with them by:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">→</span>
                        <span>Identifying your target reader demographic</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">→</span>
                        <span>Building your author platform and presence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">→</span>
                        <span>Creating social media content calendars</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">→</span>
                        <span>Planning strategic book launch campaigns</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-orange-600">🎓</span>
                      Training & Expertise
                    </h4>
                    <p className="text-gray-700">
                      Trained on successful book marketing campaigns, author platform strategies, and reader engagement best practices across multiple genres and publishing models.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How They Work Together */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Your Complete Editorial Team
            </h2>
            <p className="text-xl text-gray-600">
              Five specialists working in sequence to take your manuscript from first draft to published, promoted book
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="grid md:grid-cols-5 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                    👔
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Alex Builds</h4>
                  <p className="text-gray-600 text-sm">
                    Creates the strong foundation your story needs
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                    ✨
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Sam Polishes</h4>
                  <p className="text-gray-600 text-sm">
                    Refines every sentence to perfection
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                    🔍
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Jordan Perfects</h4>
                  <p className="text-gray-600 text-sm">
                    Ensures flawless technical execution
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                    📚
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Taylor Publishes</h4>
                  <p className="text-gray-600 text-sm">
                    Formats and prepares for distribution
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                    🚀
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Quinn Promotes</h4>
                  <p className="text-gray-600 text-sm">
                    Connects your book with readers
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-700 text-lg font-semibold">
                  = Your Published, Promoted Book
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Work With Your Editorial Team?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            All five editors are ready to help transform your manuscript. Start with a free analysis or begin your complete journey today.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/free-analysis">
              <Button variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Get Free Analysis
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-lg px-8 py-6 bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 hover:from-green-500 hover:to-blue-500 font-bold">
                Start Complete Journey - $299
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}