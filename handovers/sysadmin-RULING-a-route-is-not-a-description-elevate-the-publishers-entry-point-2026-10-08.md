# SysAdmin RULING → marketing, marketing-hub, ux, publisher — A route is not a description. The publisher's entry point is elevated, and the publisher product moves to `publishers.authorslab.ai`.

**From:** `sysadmin` · **Date:** 2026-10-08 · **Decided by:** Paul
**Amends:** the founding ruling of 2026-10-02 (§2), and `marketing-hub`'s no-cross-link build constraint
**Settles:** W2, the dedicated-domain question, open since 2026-10-05

---

## 1 · The decisions Paul has taken

**The brand stays.** AuthorsLab works for both, and no new brand or legal entity is created. A division internally, nothing a lawyer needs to see.

**The publisher product gets `publishers.authorslab.ai`.** A subdomain, not a path and not a second brand. It satisfies the own-app ruling, gives a distinct entry point that can rank on its own, costs nothing to register, and redirects in one line if a standalone brand is ever wanted.

**And the frame that makes all of it coherent, which is Paul's:**

> **Separate the buying. Share the using.**

Every irritation of the last fortnight — the login that chose a product for you, the search result, the thin public page, the domain — is on the **buying** side. Nothing about the engine, the reports or the editing studio has ever been a complaint, and Paul has said plainly that he wants the manuscript editing studio to look the same in both.

That is not a contradiction. A publisher and an author **buy** completely differently and must never see each other's purchase journey. Once inside, a good editorial surface is a good editorial surface.

**What must never be shared: the name on the page, the domain, the marketing, the pricing, the sign-in.**
**What may be identical: the engine, the schema, the reports, the editing surfaces.**

---

## 2 · RULING — a route is not a description

`marketing-hub` ruled on 2026-10-01 that the publisher page must not link to or describe the author product, and called it a build constraint rather than a copy preference. **That ruling stands and I am not weakening it.** But it has been read one step too far, and the cost is now measurable.

**Measured this turn, on the live site:** the only route from the author product to the publisher product is **one link in the footer of `MarketingFooter.tsx`, reading "For publishers".**

A publishing house arriving at `authorslab.ai` — which many will, whatever the subdomain eventually ranks for — must scroll to the bottom of a page selling a writer's tool before they find any indication they are in the wrong room.

**RULED:**

> **The constraint forbids describing or selling the other product. It does not forbid a signpost.**
> **A route is not a description.**

An audience switch belongs in the **header** of the author landing page: *"For publishing houses →"* or equivalent. No copy, no pitch, no claims, no logos — a door. It sells a publisher nothing and it tells them in one glance where to go.

**Without it, the only way a publisher reaches their product is by already knowing the URL**, which rather defeats the purpose of having one.

**`marketing-hub`:** your constraint is intact in the direction that matters — the publisher page still describes nothing of the author product. Say so if you read this differently; the symmetry question (does the publisher page carry a return route?) is yours and I have not ruled it.

---

## 3 · What does not exist, measured this turn

`marketing` asked how we get two listings for a brand search. The honest answer is that **nobody can guarantee what Google shows for a brand query**, and anyone who says otherwise is selling something.

But three things materially raise the odds and **none of them exist today**:

| | State |
|---|---|
| `schema.org` structured data | **None anywhere in the codebase.** No `Organization`, no `SoftwareApplication`, nothing. |
| `sitemap.ts` / `sitemap.xml` | **Absent.** |
| `robots.ts` / `robots.txt` | **Absent.** |

For a site with two audiences and a founder worried about which one surfaces, those are the cheapest fixes available and they are hours of work.

**`marketing`, with `sysadmin` for the wiring:**

- An **`Organization`** block naming AuthorsLab, with the two products declared, and `sameAs` for whatever public profiles exist.
- A **sitemap** covering both products, with the publisher pages listed rather than discovered.
- A **robots** file that does not accidentally hide either.
- **Sitelinks cannot be forced.** They are generated, and the main thing that influences them is a substantial, clearly-structured, well-linked publisher section. The work in §2 and the subdomain are the levers; there is no switch.

**Do not promise Paul two listings.** We can make them likely and we cannot make them certain, and saying otherwise would be the first claim this estate has made about something it does not control.

---

## 4 · A build constraint on the subdomain, before anyone builds it

**Cookies must be host-scoped, never scoped to `.authorslab.ai`.**

A subdomain can share cookies with its parent. If the auth cookie is ever set on the parent domain, a session on one product silently becomes a session on the other — **the destination-resolver defect resurrected at the cookie layer, and far harder to see**, because there is no code to read: the browser simply hands the same session to both.

That defect cost Carl a confusing sign-in and cost this estate four days of chasing "cross-pollution" that turned out to be one function. It must not come back wearing a cookie attribute.

`sysadmin` owns the check; it goes on the split checklist as a gate, not a note.

---

## 5 · Sequencing

**The demo first.** Oliver holds a proposal that says AuthorsLab and is waiting on a working demonstration, not a new address. None of this is allowed to delay Paul's five-point demo.

1. **Now, small:** §2's header route, structured data, sitemap, robots. Hours, and they help immediately.
2. **With the app split:** the move to `publishers.authorslab.ai`.
3. **Not now:** a standalone brand. Paul has decided AuthorsLab works. The subdomain keeps that door open at the cost of one redirect if it ever stops being true.

---

## 6 · Owners

- **`marketing`** — §2 header route on the author landing; §3 structured data, sitemap, robots. The `/publishers` page content you rebuilt moves to the subdomain unchanged.
- **`marketing-hub`** — §2 amends how your constraint is read, not the constraint. Contest it this turn if I have read it wrong.
- **`ux`** — the audience switch is chrome and therefore yours. It must read as a signpost, not an advertisement: no claims, no product description, no visual weight competing with the author page's own call to action.
- **`publisher`** — nothing new. Your public pages move hosts; they do not change.
- **`sysadmin`** — the subdomain, the deployment, and §4's cookie gate.

— `sysadmin`
