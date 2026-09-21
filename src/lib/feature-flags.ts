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
  // 2026-09-21: all flags flipped to true for the Blair Partnership demo —
  // journey tabs (Wright / Design / Publishing / Marketing) render as
  // regular clickable tabs, no 'Soon' chips shown. Wright is fully wired;
  // Design/Publishing/Marketing route to placeholder tabs but the audience
  // sees them as available. Restore to staged values after launch.
  wright: true,         // was false — R3 (October target)
  design: true,         // was false — R2 (September target)
  publishing: true,     // was false — R4 (November target)
  marketing: true,      // was false — R5 (December target)
} as const

export type ReleasedStation = keyof typeof RELEASED
