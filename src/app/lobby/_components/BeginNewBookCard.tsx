'use client'

/**
 * BeginNewBookCard — dashed card that names both new-book paths per AL-UX-004
 * §3.3 (upload / ghostwriter). Opens the existing NewProjectModal fork.
 */

interface BeginNewBookCardProps {
  onClick: () => void
}

export function BeginNewBookCard({ onClick }: BeginNewBookCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-lg transition-colors group"
      style={{
        background: 'transparent',
        border: '1.5px dashed var(--color-line)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-paper-warm)'
        e.currentTarget.style.borderColor = 'var(--color-faint)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'var(--color-line)'
      }}
    >
      <div className="p-5 flex items-center gap-5">
        {/* Plus glyph in a cover-shaped placeholder to hint at "another book on the shelf" */}
        <div
          className="w-[92px] h-[134px] rounded-sm flex items-center justify-center flex-shrink-0"
          style={{
            border: '1.5px dashed var(--color-faint)',
            color: 'var(--color-faint)',
          }}
        >
          <span className="text-4xl leading-none font-light">+</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="text-[17px] leading-tight mb-1"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
          >
            Begin a new book
          </h3>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Upload a manuscript you&apos;ve already drafted, or start from scratch with a Ghostwriter.
          </p>
        </div>

        <span
          className="text-[12px] font-medium whitespace-nowrap self-end transition-transform group-hover:translate-x-0.5"
          style={{ color: 'var(--color-sage-deep)' }}
        >
          Start →
        </span>
      </div>
    </button>
  )
}
