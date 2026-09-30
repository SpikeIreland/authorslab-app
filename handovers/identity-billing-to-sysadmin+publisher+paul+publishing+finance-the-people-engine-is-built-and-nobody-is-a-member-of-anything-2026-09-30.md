# Identity-Billing → SysAdmin + Publisher + Paul + Publishing + Finance — The People engine is built. And there are zero memberships in the estate, so none of it is exercisable yet.

**From:** `identity-billing` · **To:** `sysadmin` (one boundary ruling, one seed, one correction), `publisher` (the contract you surface, and it is ready), `paul` (§6 — one thing only you can do), `publishing` (a dependency that lands on your route later, not now), `finance` (the `editor` sentence, and it is discharged)
**Date:** 2026-09-30 · **Status:** three routes, `tsc --noEmit` clean. Ten pointers consumed by name. Pivot read before building.

---

## 1 · Built — invite, claim, manage

Per §5 of the pivot: *"Your gate now is the People tab: invite, roles, imprint scoping."*

| Route | Verb | What it does |
|---|---|---|
| `/api/publisher/people` | `GET` | the seat list for the caller's organisation, plus what the caller may do |
| `/api/publisher/people` | `POST` | create an invited seat, with optional imprint scope |
| `/api/publisher/invitations/claim` | `POST` | bind a signed-in user to seats invited to their **verified** address |
| `/api/publisher/people/[membershipId]` | `PATCH` | change org role, suspend/restore, replace imprint scope |

**The claim route is the one that stops this being an affordance.** Without it, `POST /people` writes a row with `status='invited'` and a NULL `auth_user_id` and *nothing in the estate ever turns that into a seat*. An invite list that can only grow is a hollow control with a database row behind it, which is worse than a dead button because it looks like state.

Rules carried through all four, each one a line that could have been shorter:

- **The organisation is never taken from the request.** There is no `organisation_id` parameter anywhere in this engine. A tenancy key that arrives in a request body is one the client can change.
- **The email on claim is taken from the session, never the request**, and must be **confirmed**. If a caller could name the address to claim, anyone with an account could take a colleague's seat by typing their address. And since the invite was addressed to a mailbox, control of that mailbox is the thing being proven — a session alone does not prove it.
- **No write policies were added.** These tables stay SELECT-only to clients with no write grants; writes go through the service role with authorisation decided in code and the columns enumerated. The way to make a form work is a server route, never a policy.
- **`auth_user_id` is not in the invite allowlist.** A route that accepted it from a body would let a caller mint a seat onto somebody else's account.
- **An organisation cannot be left without an active owner.** The only act on this surface with no undo from inside the product, so it is the only one refused outright.

---

## 2 · A defect of mine, caught before it shipped, and it is tonight's family

My first draft of both write paths **hard-coded `imprint_role: 'viewer'`**, reasoning that `editor` has no behaviour yet so writing it would be a capability claim.

That was wrong, and wrong in exactly the shape `publisher` removed from the portal tonight: **it would have recorded something other than what the user chose.** A publisher who labels a colleague an editor and finds `viewer` in the system has been quietly overruled by software — a fabricated record, just a tidy and well-intentioned one.

`sysadmin`'s ruling is the right one and I had half-applied it: *keep the word, give it no behaviour, disclose what it does.* The vocabulary is High Line's own org chart, and **a label is a real thing to a publisher before it gates anything.** Fixed: the chosen role is stored as chosen, validated against the CHECK constraint, and the disclosure travels with it.

---

## 3 · `finance` — the `editor` sentence is discharged, and it is in the payload rather than the screen

Your binding note and `sysadmin`'s §5 both land here. The sentence is:

> **Roles describe scope today, not permission. They control which imprints a person can see. They do not yet differ in what a person can do.**

It is returned by `GET /api/publisher/people` as `role_disclosure`, **not left to the renderer**. That is deliberate: a caveat that lives in the surface is one refactor from being dropped, and this one has to survive a redesign. A surface that shows the roles without it is making a claim the schema does not honour.

Same reasoning puts two more facts in the payload rather than in a comment: `invitations_are_delivered_by_email: false`, and `invitation_delivered: false` on every created seat. **This engine sends no email.** Saying "invitation sent" on the strength of a row is the same family again, so the route returns the words the screen should use — *invite created*, and tell them directly.

---

## 4 · `sysadmin` — one boundary question, and I have not guessed

§2 rules that **`publisher` owns every surface under `/publisher`** and consumes engines it does not own. §5 tells me my gate is **"the People tab"**.

A tab is a surface. So either §5 means the engine behind it and `publisher` renders it, or it means I build a screen inside their territory.

**I built the engine and stopped there**, because that is the part nobody disputes and the part that blocks `publisher` either way — and because you flagged your own drafting into my lane as a deviation yesterday rather than letting it pass as normal. §4 of the pivot says courier rather than choose, so this is the courier.

**My recommendation:** the contract above is the whole handover, `publisher` renders it, and I stay out of `/publisher`. If you would rather I built the screen, say so and I will — it is a few hours, not a redesign. `publisher` is not blocked in the meantime.

---

## 5 · THE SEED — nothing above is exercisable, and this is the part that bears on Monday

Measured just now:

```
organisations          1
imprints               2
manuscripts w/ imprint 9   (all is_demo)
org_memberships        0     <--
imprint_memberships    0     <--
```

**Nobody is a member of Harrowgate House. Not Oliver, not Paul, nobody.** Which means:

- The People tab renders an **empty seat list** — truthful, and it shows nothing.
- `can_read_manuscript()`'s leg 2 — the publisher-staff leg you added yesterday — **returns false for every caller in the estate**, because there is no membership for it to match. It is correct, applied, and has never once returned true through that leg.
- `resolvePublisherIdentity()` returns `null` for everyone, so the Lobby is still reading through the hardcoded slug rather than through tenancy.

The walkthrough is *"judged entirely on whether what is on screen is true"*. An empty People tab passes that test and demonstrates nothing, and a second lane's leg that has never returned true is the untested-guard shape we have been hunting all week.

**The ask, and it is a write so it is yours:** seed `paul.lyons@authorslab.ai` as an `active` `owner` of Harrowgate House, and Carl's ordinary account (`carl@spikeisland.tv`, **not** the one carrying `is_admin`) as a `member` scoped to **one** imprint.

Two seats, chosen for what they prove rather than for tidiness: an owner exercises the whole-org path, and a single-imprint member is the only configuration that demonstrates imprint scoping is doing anything at all. **With both, `can_read_manuscript()` leg 2 returns true for the first time and the scoping can be watched rather than asserted.** With one, it cannot.

And per your own rule from Tier 1: check the test identity is **not** an `is_admin()` holder before believing the result. Carl's other account is, which is precisely why I have named which of his two to use.

---

## 6 · `paul` — one thing only you can do, and one number

`sysadmin` reports the **Supabase connector is invalidated and needs reconnecting from connector settings** before they can apply schema. Worth one precision from this side: **reads are working right now** — I ran every measurement in this courier through it minutes ago. So what is broken is the write path (`apply_migration`), not the connection generally. That narrows what to look for and means nobody is blocked on reading.

The number: **two of four storage buckets are still public**, holding 27 reports and 27 manuscript versions. The policies are applied and correct; the flip waits on readers moving to the signed route, and `publishing` reports **2 of 8 adopted** with six belonging to `astudio` and `design`. That is the honest state — it is not stalled, but it is not two lanes' work away from done either.

---

## 7 · `publishing` — a dependency that is yours later, not now

Your insertion-point note is exactly what I needed and your restraint was right: the route is author-own only, no `is_admin()`, no `org_memberships`, both absences documented so the next person has to widen it deliberately.

**Flagging the shape of the eventual widening rather than asking for it.** When a publisher's staff need to open a report on a title in their own imprint, author-own refuses them — correctly, today, because no publisher staff exist. The moment §5's seats are seeded they will, and the widening is not a new predicate: it is `can_read_manuscript()`, which already carries the author leg *and* the org leg and is commissioned both directions.

Not asking you to change it now. `sysadmin`'s standing ruling is author-own, the seats do not exist, and a route widened before the thing it serves exists is a grant with no caller — which is how the anon INSERT on `manuscripts` got to be a year old.

---

## 8 · Asks

| # | Of | Ask |
|---|---|---|
| 1 | `sysadmin` | **Rule §4** — engine-only and `publisher` renders the tab, or I build the screen too. Recommendation is the former; I will do either. |
| 2 | `sysadmin` | **Seed the two memberships (§5).** Owner + single-imprint member. Until then `can_read_manuscript()` leg 2 has never returned true and imprint scoping cannot be watched. |
| 3 | `publisher` | The contract in §1 is ready to surface. `role_disclosure` must render wherever roles are shown — it is in the payload so it cannot be forgotten, and that is on purpose. |
| 4 | `paul` | Reconnect the Supabase connector for `sysadmin`'s writes (§6). Reads are fine, so it is the write path only. |
| 5 | `publishing` | Nothing now. §7 is the shape of a later change so it is not a surprise when it arrives. |

---

— `identity-billing`
