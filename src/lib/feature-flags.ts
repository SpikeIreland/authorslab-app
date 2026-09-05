/**
 * Feature flags for staged product releases.
 *
 * MVP launch (R1, mid-August 2026) ships editing studio only. Wright,
 * Design, Publishing, Marketing stations are built or specced but held back
 * per Paul's founding decision (2026-07-30) to release as timed subsequent
 * products. Flip a flag to `true` when the corresponding station releases
 * publicly.
 *
 * Roadmap: docs/sis/platform-dev/2026-07-30-release-roadmap-v1.md
 */
export const RELEASED = {
  wright: false,        // R3 (October target)
  design: false,        // R2 (September target)
  publishing: false,    // R4 (November target)
  marketing: false,     // R5 (December target)
} as const

export type ReleasedStation = keyof typeof RELEASED
