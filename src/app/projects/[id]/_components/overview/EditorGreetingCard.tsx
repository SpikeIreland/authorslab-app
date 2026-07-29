'use client'

/**
 * EditorGreetingCard — right column, top card.
 *
 * Per AL-UX-004 §4: active persona avatar, kicker, headline, 1-2 sentence
 * message, primary CTA into the phase-appropriate tab, secondary "Read notes"
 * link when a report PDF exists.
 */

import Link from 'next/link'
import { PersonaAvatar } from '@/app/lobby/_components/PersonaAvatar'
import {
  greetingPersona,
  greetingKicker,
  greetingMessage,
  primaryCta,
  secondaryCta,
} from './overviewDerivations'
import type { OverviewPayload } from '@/app/api/projects/[id]/overview/route'

interface EditorGreetingCardProps {
  payload: OverviewPayload
}

export function EditorGreetingCard({ payload }: EditorGreetingCardProps) {
  const persona = greetingPersona(payload)
  const kicker = greetingKicker(payload)
  const { headline, body } = greetingMessage(payload)
  const primary = primaryCta(payload)
  const secondary = secondaryCta(payload)

  return (
    <section
      className="rounded-lg p-6"
      style={{
        background: 'var(--color-paper-warm)',
        border: '1px solid var(--color-line-soft)',
      }}
    >
      <div className="flex items-start gap-4">
        <PersonaAvatar persona={persona} size={44} />
        <div className="flex-1 min-w-0">
          <p className="kicker mb-1.5">{kicker}</p>
          <h2
            className="text-[22px] leading-snug mb-2"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
          >
            {headline}
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-ink)' }}>
            {body}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4 flex-wrap">
        <Link
          href={primary.href}
          className="inline-flex items-center px-4 py-2 rounded-md text-[13px] font-medium transition-colors"
          style={{
            background: 'var(--color-sage-deep)',
            color: 'var(--color-paper)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-charcoal)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-sage-deep)' }}
        >
          {primary.label}
        </Link>

        {secondary && (
          <a
            href={secondary.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-medium transition-colors"
            style={{ color: 'var(--color-sage-deep)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-charcoal)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-sage-deep)' }}
          >
            {secondary.label} →
          </a>
        )}
      </div>
    </section>
  )
}
