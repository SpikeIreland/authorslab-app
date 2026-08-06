// ============================================================================
// Legal pages · shared PolicyPage shell
// Renders a markdown policy inside the Manuscript Room chrome: MarketingNav,
// hero (kicker + serif title), interim-notice card, ReactMarkdown body with
// custom-styled elements, MarketingFooter. Server component.
// ============================================================================

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

type PolicyPageProps = {
  title: string
  kicker: string
  markdownContent: string
}

/** Custom renderers keep the markdown body inside the Manuscript Room palette. */
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="font-serif font-medium text-4xl md:text-5xl text-ink leading-[1.15] mt-14 mb-6 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-serif font-medium text-2xl md:text-3xl text-ink leading-snug mt-12 mb-4 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif font-medium text-xl text-ink leading-snug mt-8 mb-3">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-semibold text-base text-ink mt-6 mb-2">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-ink leading-relaxed my-4">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-ink">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-sage-deep underline underline-offset-2 decoration-sage-deep/40 hover:decoration-sage-deep"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 my-4 space-y-2 marker:text-muted text-ink">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 my-4 space-y-2 marker:text-muted text-ink">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  hr: () => <hr className="my-10 border-0 border-t border-line" />,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-sage-deep/40 bg-paper-warm rounded-r-lg pl-5 pr-4 py-3 text-ink/90 italic">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-paper-warm border border-line-soft px-1.5 py-0.5 text-[0.85em] font-mono text-ink">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-4 rounded-lg bg-paper-warm border border-line-soft p-4 overflow-x-auto text-sm">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-line">
      <table className="w-full text-sm text-left border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-paper-warm text-ink">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-line last:border-b-0">{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-3 font-semibold text-ink align-top">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-ink align-top">{children}</td>
  ),
}

export function PolicyPage({ title, kicker, markdownContent }: PolicyPageProps) {
  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNav />

      {/* Hero */}
      <section className="py-16 md:py-20 border-b border-line-soft">
        <div className="container mx-auto px-4 text-center">
          <p className="kicker text-sage-deep mb-5">{kicker}</p>
          <h1 className="font-serif font-medium text-5xl md:text-6xl text-ink leading-[1.1]">
            {title}
          </h1>
        </div>
      </section>

      {/* Body */}
      <section className="py-14 md:py-16">
        <div className="max-w-4xl mx-auto px-4">

          {/* Interim notice */}
          <div className="mb-12 rounded-2xl border border-line bg-paper-warm p-6 md:p-7">
            <p className="kicker text-sage-deep mb-2">Interim notice</p>
            <p className="text-ink leading-relaxed">
              Our legal registration details are being finalised alongside our public
              launch. If you have questions about how we handle your data in the meantime,
              please <a href="mailto:privacy@authorslab.ai" className="text-sage-deep underline underline-offset-2 decoration-sage-deep/40 hover:decoration-sage-deep">contact us</a>.
              The substantive terms below reflect our current practice; specific
              registration details will be updated shortly.
            </p>
          </div>

          <article className="text-base md:text-[17px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {markdownContent}
            </ReactMarkdown>
          </article>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
