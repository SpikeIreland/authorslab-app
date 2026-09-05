'use client'

/**
 * PersonaAvatar — small coloured circle with persona initial.
 *
 * Colour map per AL-UX-004 §1 (already established in code):
 *   sage       — Eliot (Wright matcher), Alex
 *   terracotta — Sam, Ivy
 *   sage-deep  — Jordan, Reid
 *   #A98A6B    — Taylor
 *   faint      — Riley (marketing; placeholder)
 * (2026-09-05: Riley (matcher) renamed to Eliot; Kai renamed back to Riley
 *  (marketing). Prior lineage: Eden → Riley 2026-07-30; Marketing Riley → Kai.)
 */

import { personaColourFor } from './derivations'

interface PersonaAvatarProps {
  persona: string
  size?: number
}

export function PersonaAvatar({ persona, size = 24 }: PersonaAvatarProps) {
  const colour = personaColourFor(persona)
  const initial = (persona || '?').slice(0, 1).toUpperCase()
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-medium select-none"
      style={{
        width: size,
        height: size,
        background: colour.bg,
        color: colour.ink,
        fontSize: Math.round(size * 0.42),
      }}
      title={persona}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
