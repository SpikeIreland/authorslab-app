import { PlaceholderTab } from '../_components/PlaceholderTab'

export default async function PublishingTabPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <PlaceholderTab
      status="in-progress"
      title="Publishing"
      description="Book metadata, ISBN, pricing, platforms (KDP, IngramSpark, Apple Books), and launch. Morgan helps with the higher-level decisions. Your existing Publishing Hub is being split into Design + Publishing — open the current version below."
      legacyHref={`/publishing-hub?manuscriptId=${id}`}
      legacyLabel="Open Publishing Hub"
    />
  )
}
