/**
 * One page's frame: kicker, h1, standfirst, body — and the contact block that
 * every page ends with, so a house can act from wherever it stopped reading.
 *
 * Paul's premise for the split: "people don't scroll down - they click on
 * pages." A reader who clicks rather than scrolls arrives at an arbitrary page
 * and may never see the hub, so the one thing they need in order to proceed
 * cannot live only on the hub.
 */

import { ContactBlock } from './ContactBlock'

export function PageFrame({
  kicker,
  title,
  standfirst,
  children,
}: {
  kicker: string
  title: string
  standfirst?: string
  children: React.ReactNode
}) {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-6 pt-14 pb-4">
        <p className="kicker text-sage-deep">{kicker}</p>
        <h1 className="font-serif text-[40px] leading-tight mt-3 mb-4 text-ink">{title}</h1>
        {standfirst && (
          <p className="text-muted text-[17px] leading-relaxed">{standfirst}</p>
        )}
      </div>
      <div className="max-w-3xl mx-auto px-6 pb-14">{children}</div>
      <ContactBlock />
    </main>
  )
}

/** A heading + body pair, so every page's internal structure reads the same. */
export function Block({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <section className="pt-10">
      <h2 className="font-serif text-[26px] text-ink mb-3">{heading}</h2>
      <div className="space-y-4 text-muted text-[16px] leading-relaxed">{children}</div>
    </section>
  )
}
