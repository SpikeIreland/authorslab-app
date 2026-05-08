import { PlaceholderTab } from '../_components/PlaceholderTab'

export default async function MarketingTabPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <PlaceholderTab
      status="in-progress"
      title="Marketing"
      description="Audience, pitch, launch plan, content drafts, reviews, and post-launch performance. Riley is your marketing partner. Your existing Marketing Hub is mostly scaffold — open it below if you want to see what's there now."
      legacyHref={`/marketing-hub?manuscriptId=${id}`}
      legacyLabel="Open Marketing Hub"
    />
  )
}
