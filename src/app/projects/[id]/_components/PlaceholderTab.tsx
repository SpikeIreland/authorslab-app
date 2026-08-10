import Link from 'next/link'

// Shared placeholder used by every tab whose interior hasn't been built into
// the project shell yet. Some tabs link to a legacy standalone page (Author
// Studio, Publishing Hub, Marketing Hub, Ghostwriter); others just say
// "coming soon".
export function PlaceholderTab({
  title,
  description,
  legacyHref,
  legacyLabel,
  status,
}: {
  title: string
  description: string
  legacyHref?: string
  legacyLabel?: string
  status?: 'in-progress' | 'coming-soon'
}) {
  const statusLabel =
    status === 'coming-soon' ? 'Coming soon' :
    status === 'in-progress' ? 'In progress' :
    null

  return (
    <div className="max-w-xl mx-auto py-16 px-6 text-center">
      {statusLabel && (
        <p className="text-[11px] uppercase tracking-wider font-medium text-faint mb-3">
          {statusLabel}
        </p>
      )}
      <h2 className="text-2xl font-medium text-ink mb-3">{title}</h2>
      <p className="text-sm text-muted leading-relaxed mb-8 max-w-md mx-auto">
        {description}
      </p>
      {legacyHref && (
        <Link
          href={legacyHref}
          className="inline-block px-4 py-2 bg-charcoal hover:bg-charcoal/90 text-white rounded-md text-sm font-medium"
        >
          {legacyLabel ?? 'Open'} →
        </Link>
      )}
    </div>
  )
}
