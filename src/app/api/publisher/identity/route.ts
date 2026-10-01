import { NextResponse } from 'next/server'
import {
  resolvePublisherIdentity,
  publisherIdentityRefusal,
  type PublisherIdentity,
} from '@/lib/publisher/identity'

// GET /api/publisher/identity
//
// WHICH HOUSE IS LOOKING — one read, so no surface guesses.
//
// This route exists to retire a constant. Every publisher surface prints the
// name of the house at the top, and until today that name came from
// `src/app/publisher/_data/firm.ts`:
//
//   > export const VIEWING_FIRM = 'Harrowgate House'
//
// which was honest about itself — "HARROWGATE HOUSE IS INVENTED … when
// publisher accounts land, this constant is replaced by a read of the signed-in
// firm and nothing else on these pages changes." `identity-billing` reported on
// 2026-09-30 that the read is available and, as of that hour, evidenced rather
// than merely typechecked. So the constant goes.
//
// ─── Why a route of its own rather than a wider payload ─────────────────────
// The four tab surfaces each fetch a payload that already carries
// `organisation`, and they use it. The three per-title surfaces — the portal,
// the reading room, the cover studio — fetch a BOOK, and a book payload has no
// business carrying the viewer's identity: it would be the same fact arriving
// from three places, which is how three surfaces end up disagreeing about who
// is signed in. This answers that one question and nothing else.
//
// ─── What it does not do ────────────────────────────────────────────────────
// It returns no membership id and no email. A surface renders a house name and
// a scope; it does not need the actor id, and `publisher_actions` records that
// server-side from the same resolver rather than accepting it from a client.
//
// 403 is a real answer here, not a failure: see the note in the Lobby route.
// A caller that cannot resolve a publisher identity must be told which of the
// two empties it is looking at, and this route says `not_a_publisher` in as
// many words so the surface can.

export interface PublisherIdentityPayload {
  organisation: { name: string; slug: string }
  viewer: {
    orgRole: PublisherIdentity['org_role']
    scopeIsWholeOrg: boolean
    /** The imprints this caller may see — possibly empty, which is a real and
     *  different state from "this house has no imprints". */
    imprints: { id: string; name: string }[]
  }
}

export async function GET() {
  // identity.ts no longer THROWS on multi-org and no longer conflates a read
  // failure with "no seat" (identity-billing, 2026-10-01, on publisher's §5
  // catch). The three cases are mapped in ONE place --
  // publisherIdentityRefusal() -- so no route can answer 403 to a database
  // hiccup. The 409 for multi_org is preserved exactly as this route had it.
  const resolved = await resolvePublisherIdentity()
  if (resolved.status !== 'ok') {
    const r = publisherIdentityRefusal(resolved)
    return NextResponse.json(r.body, { status: r.status })
  }
  const identity: PublisherIdentity = resolved.identity

  const payload: PublisherIdentityPayload = {
    organisation: {
      name: identity.organisation.name,
      slug: identity.organisation.slug,
    },
    viewer: {
      orgRole: identity.org_role,
      scopeIsWholeOrg: identity.scope_is_whole_org,
      imprints: identity.imprints.map((i) => ({ id: i.id, name: i.name })),
    },
  }

  return NextResponse.json(payload)
}
