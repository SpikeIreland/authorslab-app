/**
 * THE ISSUE VOCABULARY — one definition, two studios.
 *
 * ─── Extraction 1 of `ux`'s studio spec (2026-10-09) ────────────────────────
 *
 * `astudio` said yes to all three extractions and set one condition on this
 * one: *"take the helpers as the SINGLE definition and tell me the path — my
 * file imports from you rather than keeping a copy, because two severity
 * vocabularies is the StationMark divergence you named yourself."*
 *
 * So this is the path, and `src/app/author-studio/page.tsx` imports from here.
 * There is no second copy anywhere.
 *
 * ─── LIFTED VERBATIM ────────────────────────────────────────────────────────
 *
 * Every map below is byte-for-byte what was in the author studio at lines
 * 172, 229, 255, 268 and 281 — including the backward-compatibility rows for
 * the old `minor`/`moderate`/`major` severities, which are load-bearing: live
 * rows still carry them, and dropping them while "tidying up" would silently
 * demote every one of those issues to the fallback.
 *
 * Nothing is renamed, no value is "improved". This is a move, not a redesign,
 * for the same reason `StationMark` moved verbatim on 2026-10-02: a
 * duplicated constant is a divergence with a delay on it, and a *changed*
 * constant during a move is a divergence with no delay at all.
 *
 * ─── ONE DEFECT CARRIED ACROSS UNCHANGED, AND REPORTED ──────────────────────
 *
 * `severityIcon()` returns the SAME glyph — '●' — for low, medium and high.
 * Only `severityColor()` distinguishes them. So any surface that renders the
 * icon and the colour without the label encodes severity IN COLOUR ALONE,
 * which fails for a colour-blind reader, in print, and under forced-colours.
 *
 * `severityLabel()` exists and is the fix: icon + label + colour is sound.
 * I have NOT changed the glyphs, because the vocabulary is `astudio`'s and the
 * state grammar is `ux`'s, and a lane that fixes another lane's vocabulary
 * during a move has made the move unreviewable. It is couriered to both as a
 * question instead. The publisher studio will render the label.
 */

export type EditorColor = 'green' | 'purple' | 'blue' | 'teal' | 'orange'

/** Per-editor Tailwind class sets. Alex green, Sam purple, Jordan blue,
 *  Taylor teal, Riley orange — unchanged from the author studio. */
export function getEditorColorClasses(color: string) {
  const colorMap = {
    green: {  // Alex
      bg: 'bg-alex',
      bgHover: 'hover:bg-alex-text',
      bgLight: 'bg-alex-light',
      text: 'text-alex-text',
      border: 'border-alex',
      borderLight: 'border-alex/40',
      borderColor: 'border-alex/25',
      ring: 'focus:ring-alex',
    },
    purple: {  // Sam
      bg: 'bg-sam',
      bgHover: 'hover:bg-sam-text',
      bgLight: 'bg-sam-light',
      text: 'text-sam-text',
      border: 'border-sam',
      borderLight: 'border-sam/40',
      borderColor: 'border-sam/25',
      ring: 'focus:ring-sam',
    },
    blue: {  // Jordan
      bg: 'bg-jordan',
      bgHover: 'hover:bg-jordan-text',
      bgLight: 'bg-jordan-light',
      text: 'text-jordan-text',
      border: 'border-jordan',
      borderLight: 'border-jordan/40',
      borderColor: 'border-jordan/25',
      ring: 'focus:ring-jordan',
    },
    teal: {  // Taylor
      bg: 'bg-taylor',
      bgHover: 'hover:bg-taylor-text',
      bgLight: 'bg-taylor-light',
      text: 'text-taylor-text',
      border: 'border-taylor',
      borderLight: 'border-taylor/40',
      borderColor: 'border-taylor/25',
      ring: 'focus:ring-taylor',
    },
    orange: {  // Riley
      bg: 'bg-riley',
      bgHover: 'hover:bg-riley-text',
      bgLight: 'bg-riley-light',
      text: 'text-riley-text',
      border: 'border-riley',
      borderLight: 'border-riley/40',
      borderColor: 'border-riley/25',
      ring: 'focus:ring-riley',
    },
  }
  return colorMap[color as keyof typeof colorMap] || colorMap.green
}

/** Issue category -> chip classes, grouped by the phase that raises it. */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    // Phase 1 (Alex)
    'character': 'bg-alex-light text-alex-text',
    'plot': 'bg-alex-light text-alex-text',
    'pacing': 'bg-alex-light text-alex-text',
    'structure': 'bg-alex-light text-alex-text',
    'theme': 'bg-alex-light text-alex-text',
    // Phase 2 (Sam)
    'word_choice': 'bg-sam-light text-sam-text',
    'sentence_flow': 'bg-sam-light text-sam-text',
    'dialogue': 'bg-sam-light text-sam-text',
    'voice': 'bg-sam-light text-sam-text',
    'clarity': 'bg-sam-light text-sam-text',
    // Phase 3 (Jordan)
    'grammar': 'bg-jordan-light text-jordan-text',
    'punctuation': 'bg-jordan-light text-jordan-text',
    'consistency': 'bg-jordan-light text-jordan-text',
    'formatting': 'bg-jordan-light text-jordan-text',
  }
  return colors[category] || 'bg-line-soft text-muted'
}

/**
 * NOTE: identical for every KNOWN severity. '○' marks an unrecognised value,
 * which is the only distinction this function makes. See the header.
 */
export function getSeverityIcon(severity: string): string {
  const icons: Record<string, string> = {
    'low': '●',
    'medium': '●',
    'high': '●',
    // Backward compatibility for old values
    'minor': '●',
    'moderate': '●',
    'major': '●',
  }
  return icons[severity] || '○'
}

/** The non-colour carrier of severity. Render this wherever the icon appears. */
export function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    'low': 'Low Priority',
    'medium': 'Medium Priority',
    'high': 'High Priority',
    // Backward compatibility
    'minor': 'Low Priority',
    'moderate': 'Medium Priority',
    'major': 'High Priority',
  }
  return labels[severity] || severity
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    'low': 'text-status-ok',
    'medium': 'text-status-warn',
    'high': 'text-status-high',
    // Backward compatibility
    'minor': 'text-status-ok',
    'moderate': 'text-status-warn',
    'major': 'text-status-high',
  }
  return colors[severity] || 'text-muted'
}
