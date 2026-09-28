/**
 * THE VIEWING FIRM
 *
 * Every publisher surface renders the name of the house that is looking. Until
 * there is a publisher identity to read it from (identity-billing), it comes
 * from here — one constant, one edit.
 *
 * HARROWGATE HOUSE IS INVENTED. Like the imprints and the authors on the
 * shelf, it is a stand-in, not a real publisher. Swapping it for a prospect's
 * real name before a meeting is a deliberate act with its own judgement call
 * (a demo wearing someone's name can read as presumption rather than
 * tailoring) — so it lives here, named and obvious, rather than typed into
 * five files.
 *
 * When publisher accounts land, this constant is replaced by a read of the
 * signed-in firm and nothing else on these pages changes.
 */
export const VIEWING_FIRM = 'Harrowgate House'

/**
 * The organisation slug the Lobby reads its list by.
 *
 * This is the tenancy key, not a label: `/api/publisher/lobby?org=<slug>`
 * resolves `organisations.slug` and returns only that organisation's titles.
 * The route deliberately refuses to default to "everything" when no org is
 * named — a route with no caller identity that returns every publisher's list
 * is a disclosure, not a convenience.
 *
 * NOTHING IS SEEDED YET. Until an organisation row exists with this slug, the
 * Lobby will report that the organisation is not set up — which is the honest
 * outcome and the one to leave in place. Seeding invented titles onto a real
 * imprint would be a claim about somebody's list.
 */
export const VIEWING_FIRM_SLUG = 'harrowgate-house'
