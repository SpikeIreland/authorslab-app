import { PlaceholderTab } from '../_components/PlaceholderTab'

export default async function AuthorStudioTabPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <PlaceholderTab
      status="in-progress"
      title="Author Studio"
      description="The home of editing — Alex (developmental), Sam (line), Jordan (copy). Your existing studio is fully functional and being preserved as we integrate it into the new project shell. Open it below to keep working."
      legacyHref={`/author-studio?manuscriptId=${id}`}
      legacyLabel="Open Author Studio"
    />
  )
}
