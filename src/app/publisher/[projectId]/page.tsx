import { PublisherOverview } from '@/app/publisher/_components/overview/PublisherOverview'

/**
 * /publisher/[projectId] — THE OVERVIEW, rebuilt (A4, 2026-10-06).
 *
 * ─── What was here before, and why it is gone ───────────────────────────────
 *
 * 1,252 lines, preserved in git at `7f46290`. Paul's verdict, twice:
 *
 *   "It is too intrusive on an Author's work and it doesn't provide any real
 *    information from the publisher's perspective."
 *   "I want to go to an Overview page, but not the one that we currently have
 *    because it is terrible."
 *
 * Both halves of that were true, and the second half is the one that explains
 * the first. The page had no model of what a publisher comes here to learn, so
 * it showed what it could reach — which happened to be the author's working
 * material. A surface with no question to answer will answer with whatever it
 * can read.
 *
 * ─── What replaced it ───────────────────────────────────────────────────────
 *
 * The author Overview, which Paul named as the better page, is four
 * components. Three cross to the house; the fourth is the defect:
 *
 *   BookObjectPanel     -> TitleObjectPanel   cover + the facts about it
 *   ShelfDocuments      -> CollateralShelf    the collateral list
 *   JourneyStepper      -> StationLadder      where it is, station by station
 *   EditorGreetingCard  -> HouseStateCard     replaced: the author's card is a
 *                                             persona greeting the author by
 *                                             name with a CTA into their next
 *                                             writing step
 *
 * Backed by `/api/publisher/projects/[id]/overview`, which is gate-first.
 *
 * ─── Why this file is nine lines ────────────────────────────────────────────
 *
 * The data read lives in the route, the rendering in components, the states in
 * `PublisherOverview`. The old page held all three, which is why a defect in
 * any one of them could only be fixed by reading 1,252 lines — and why the
 * cover-approval read went wrong in it once already.
 */

export default async function PublisherProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  return (
    <div className="min-h-screen" style={{ background: '#F7F7F5', color: '#3F3F3F' }}>
      <PublisherOverview projectId={projectId} />
    </div>
  )
}
