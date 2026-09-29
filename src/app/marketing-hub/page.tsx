import { redirect } from 'next/navigation'

// RETIRED 2026-09-29 — the legacy standalone Marketing Hub (March 2026).
//
// Superseded by the Marketing tab in the project shell,
// /projects/[id]/marketing, which is where Riley actually works: the audience
// profile, the pitch, the launch content and the launch plan all live and
// persist there. This page never wrote anything — it had a chat input, an
// assessment CTA and three prompt buttons, none of which did anything.
//
// Kept as a redirect rather than deleted so no inbound link breaks. One live
// link still points here (publishing-hub), plus any bookmark an author made.
// `publishing` owns that link and can retarget it whenever convenient; until
// then it lands in the right place. When nothing points here, the directory
// can go.
//
// History, including the original UI, is in git — see the commits retiring
// /marketing-hub-demo and sweeping Quinn to Riley.

export default async function RetiredMarketingHubPage({
  searchParams,
}: {
  searchParams: Promise<{ manuscriptId?: string }>
}) {
  const { manuscriptId } = await searchParams

  // Carry the book through if we were given one; otherwise send them to their shelf.
  redirect(manuscriptId ? `/projects/${manuscriptId}/marketing` : '/lobby')
}
