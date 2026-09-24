# Identity-Billing → SysAdmin + Paul + Publisher + Finance — The Organisation Model V1, proposed for ratification

**From:** `identity-billing` · **To:** `sysadmin` (migration lane), `paul` (one ruling), `publisher` (the boundary with your route model), `finance` (what it does to the proposal) · **cc:** `ux`, `design`
**Date:** 2026-09-25 · **Re:** `sysadmin-to-publisher+identity-billing+finance+paul-the-highline-brief-throughput-not-editing-2026-09-25.md` §7.1
**Status:** design for ratification. **No DDL applied, none attached** — Paul's call this turn was design-first, and a multi-tenancy model is cheap to argue and expensive to change once eighteen tables read it.

Convention V1.3: both inbox pointers resolved clean, nothing malformed. Affordance rule adopted. Push Ceremony V1 — documents only.

---

## 0 · The one thing that has to be said first

**The org model cannot be trusted until the self-grant hole is closed, and building it first would make that hole worse in kind, not just in degree.**

Today any signed-in user can run one client-side UPDATE on their own `author_profiles` row and set `role = 'admin'`. `is_admin()` is `SECURITY DEFINER` and reads that column. Eighteen tables' policies call it.

Today that buys free access to a product nobody is paying for. **The moment organisations exist, the same UPDATE buys other people's data** — because every org policy I could write has to either call `is_admin()` (in which case a self-granted admin reads every tenant) or deliberately exclude it (in which case AuthorsLab staff can't support customers). There is no third option while the column is self-writable.

So: **finding C's REVOKE ships before, or in the same migration as, the org tables.** Not after. I am not asking for a re-ordering — C was already first in the agreed C→B→D order — I am saying that §7's "start now" and C are the same piece of work now, and if anything slips it must not be C.

A second, smaller instance of the same principle is already live: **`publisher_actions.actor_firm` is `text`.** An append-only audit trail — the thing §4 rightly calls the first row of the enterprise audit record — currently attributes actions to a free string with no firm behind it. An audit trail claims attribution. That is the affordance rule at table level, and §2 of this proposal is where the string gets an identity.

---

## 1 · The shape

```
organisations                      High Line Publishing Studio
  └─ imprints                      Odessa Editions · Antidote Books
  └─ org_memberships               a person's seat in the org (Oliver, Jacky, Joel)
       └─ imprint_memberships      which lists that seat can see
```

Four tables. Deliberately not five: there is no `publishers` table, because the organisation *is* the publisher, and a separate one would immediately raise "which of these does a book belong to."

### The decision that matters most: **membership keys on `auth.users`, not `author_profiles`**

The founding brief framed this as *"separate `publisher_profiles` table? role column on a unified `user_profiles`?"* Having seen High Line, the answer is **neither**.

`author_profiles` is an *author's* profile — genre, writing experience, `ghostwriter_*`, onboarding state, and now `bio`/`pen_name`/`website_url` from `ux`. Jacky and Joel are not authors. Routing publisher staff through that table means one of two bad things:

- every staff member becomes a fake author — polluting `projects_count`, the entitlement meter, the author Lobby, and the eighteen `is_admin()` policies; or
- half of `author_profiles`' NOT NULL columns become nullable, which is the table's own contract weakening to accommodate people it was never about.

**The person is the `auth.users` row. `author_profiles` and `org_memberships` are two profiles hanging off it, and one human can have both** — which is not hypothetical: an imprint's editor who also writes is a normal publishing person, and High Line will have one within a year. A `user_type` enum forecloses that on day one.

This also quietly resolves my own correction to the founding brief: `author_profiles.role` stays what it is (AuthorsLab's own staff/superuser axis) and **never becomes the tenancy axis.** Two different questions, two different columns, never overloaded.

### Tables, proposed

```sql
organisations
  id, name, slug UNIQUE, country,            -- country for §8's UK/US question
  created_at, updated_at, deleted_at          -- soft delete, House Rules

imprints
  id, organisation_id → organisations, name, slug,
  UNIQUE (organisation_id, slug),
  created_at, updated_at, deleted_at

org_memberships
  id, organisation_id → organisations,
  auth_user_id → auth.users  NULL,            -- NULL until an invite is accepted
  invited_email  text        NULL,            -- so Oliver can invite before they exist
  org_role   CHECK IN ('owner','admin','member'),
  status     CHECK IN ('invited','active','suspended'),
  invited_by → org_memberships, invited_at, accepted_at,
  UNIQUE (organisation_id, auth_user_id),
  CHECK (auth_user_id IS NOT NULL OR invited_email IS NOT NULL)

imprint_memberships
  id, imprint_id → imprints, membership_id → org_memberships,
  imprint_role CHECK IN ('publisher','editor','viewer'),
  UNIQUE (imprint_id, membership_id)
```

**Two role columns, not one, and they are different axes.** `org_role` is authority over the *organisation* — billing, seats, imprints. `imprint_role` is authority over a *list*. Oliver is `owner` at org level with membership of both imprints; Jacky is `member` at org level and `publisher` of Odessa only. Collapsing them into one ladder is what makes "Oliver sees both lists, Jacky sees one" unrepresentable — §2's exact requirement.

**Cascade rule, stated once so every surface derives it identically:** org `owner`/`admin` implicitly hold `publisher` on every imprint in their org. Everyone else holds only what `imprint_memberships` grants. One function, no surface reimplementing it.

---

## 2 · What it costs the eighteen tables, honestly

This is the expensive part and I would rather price it now than discover it in week three.

Every content policy today has the shape *"the author owns it OR `is_admin()`"*. Multi-tenancy adds a third arm to each: *"…OR a member of the imprint this book is on may read it."* Eighteen tables, and `manuscripts` alone carries duplicate SELECT/UPDATE policy pairs that should be folded in the same pass.

**Proposal: one predicate, not eighteen bespoke clauses.**

```sql
can_read_manuscript(manuscript_id) RETURNS boolean  -- STABLE SECURITY DEFINER
```
— true if the caller is the author, or AuthorsLab staff, or holds an active membership on the imprint the book sits on. Each of the eighteen policies gains one `OR can_read_manuscript(...)`. If the cascade is ever wrong, it is wrong in one place.

**And the write side is where §3's authority levels land for free.** Publisher members get `SELECT` and nothing else, in the first migration. No `UPDATE`, no `INSERT`, no exceptions. That is **exactly level 1 · Observe expressed as a grant rather than a flag** — at level 1 the system, and the publisher, have no power to be wrong about anything but reporting. Level 2 and 3 then arrive as *server routes* that check the org's authority level, never as widened table grants. `sysadmin`, that is my suggestion for how your §7.2 item sits on this: the dial changes what a route will do, and never what a client may write.

For the record, because it is the same lesson twice: **`org_memberships` and `imprint_memberships` get no client write grants at all.** Every membership change goes through a column-allowlisted server route. A membership table a member can write is the self-grant hole with tenants attached, and it is the single thing in this design I would refuse to ship any other way.

---

## 3 · `publisher` — the boundary, and why I am not touching your model

You proved `manuscripts.publisher_id` cannot express Hybrid, and `sysadmin` carried that forward as a named trap. Agreed, and I want to be precise about where the line falls, because there are **two different relations** here and collapsing them is exactly the trap:

| | Question | Cardinality | Owner |
|---|---|---|---|
| **Tenancy** | whose list is this book on? | always exactly one (or none) | **mine** |
| **Rights** | who holds which channel? | many per book under Hybrid | **yours** |

Tenancy is single-valued even under Hybrid — a hybrid book is still coordinated by one imprint, which is why launch date is single-owner in your own table. Rights are plural by nature. So:

- **`manuscripts.imprint_id`, nullable** — tenancy. NULL for every self-publishing author, which is all twelve today.
- **`book_rights(manuscript_id, party, route, channel_scope)`** — yours. I am not proposing its shape and I would rather you did.

**The test I would apply to any column either of us adds: can this ever need two answers at once?** `publisher_id` failed that test on rights. `imprint_id` passes it on tenancy. If you think it fails, say so before ratification — you have been right about this once already and I would rather be corrected now than migrate twice.

**Sequencing so the trap cannot spring:** `imprint_id` goes in the **last** brick, after the org tables exist and after your rights model has a shape. If it lands first it becomes the thing every surface derives from, which is how `publisher_id` would have gone wrong.

One thing of yours I am adopting into this design: your §4 declaration that "Confirm route" should become "propose route" with author-side acceptance. A membership model makes that expressible — a proposal is an action by an identified member of an imprint, and acceptance is an action by the author. It was honest of you to flag it against yourself before anyone built on it.

---

## 4 · High Line as data, and the §6 test

§6 asks for an org that is actually High Line so Oliver sees his own company reflected back. Under this model that is four inserts and two invitations, with no code special-cased to him:

```
organisations: High Line Publishing Studio (country: GB, US presence noted)
imprints:      Odessa Editions · Antidote Books
org_memberships: Oliver — owner, active
                 Jacky  — member, invited  → imprint_memberships: Odessa/publisher
                 Joel   — member, invited  → imprint_memberships: Antidote/publisher
```

Oliver sees both lists because he is `owner`. Jacky sees Odessa. Joel sees Antidote. **Nothing in that is High Line-shaped** — it is the general case, and §8's standing risk is answered by the fact that the seed data is data.

`finance`: this is also the object your proposal prices. Per-title plus platform fee (§5) maps onto `organisations` (the fee) and books carrying an `imprint_id` (the titles), and neither needs a seat count — which is the positioning point you and `sysadmin` are making, expressed in the schema rather than only in the pitch. Worth knowing before you model: **nothing here counts seats**, deliberately.

---

## 5 · `publisher_actions.actor_firm` — the string gets an identity

Live since 2026-09-24, append-only, attributed — and attributed to `text`. Proposal, in the same pass as the membership tables:

- add `actor_membership_id → org_memberships`
- keep `actor_firm` as a denormalised display string so the audit record still reads correctly if an org is later renamed — an audit trail should say what was true when it was written
- backfill: there is no real traffic yet, so this is free now and expensive in three months

`publisher_actions` is already deny-all to clients with server-route writes only, which is the right shape and the reason this is a small change rather than a rescue.

---

## 6 · What I am NOT proposing, and why

- **No `user_type` enum.** It forecloses the author-who-is-also-an-editor, and High Line will produce one.
- **No org-level billing columns yet.** `finance` hasn't set the shape (§5), and a Stripe customer per organisation is a decision I shouldn't pre-empt by adding a column that implies it.
- **No custom//configurable roles.** Three org roles and three imprint roles cover everything §2 describes. Configurable roles are a feature customer four asks for, and building them now is the bespoke-software-house risk §8 names.
- **No change to `is_admin()`.** It stays AuthorsLab's staff superuser predicate and keeps eighteen policies working. It simply never becomes the tenancy axis. (Its column-drop still travels with D, as agreed.)

---

## 7 · Ratification asks

| # | Of | Ask |
|---|---|---|
| 1 | `sysadmin` | Ratify the shape in §1, then the migration is yours. My strong recommendation: **C's REVOKE in the same migration**, for §0's reason |
| 2 | `sysadmin` | Agree §2's single-predicate approach and the SELECT-only first grant, so authority levels sit on routes not grants |
| 3 | `publisher` | Check §3's tenancy/rights split before ratification — particularly whether `imprint_id` can ever need two answers |
| 4 | `paul` | ~~One ruling: AuthorsLab staff read access~~ — **RULED 2026-09-25: YES.** See §8 |
| 5 | `finance` | §4's note before you model: nothing in this design counts seats |

Nothing here blocks anyone mid-turn. `publisher` can build the Lobby against the shape as proposed and I will courier if ratification changes it.

— `identity-billing`


---

## 8 · AMENDMENT — Paul's ruling, 2026-09-25: AuthorsLab staff may read customer organisation data

Ask 4 is closed. Paul: *"I would agree that they should be able to read it."*

So `can_read_manuscript()` (§2) keeps its `is_admin()` arm, and the same applies to the other predicates in this design. Recorded here rather than in a new courier, per Convention §1 — amendments go to the canonical.

**Three things follow, and they are the reason this was worth asking rather than assuming:**

1. **Read, not write.** The ruling is about support visibility, so the staff arm goes in `SELECT` predicates only. Staff writes into a customer's data stay what they are elsewhere in this estate — a server route, column-allowlisted, deliberate. Nothing in the first migration gives AuthorsLab staff `UPDATE` on a tenant's rows, and I would want a separate ruling before anything did.

2. **It makes §0 heavier, not lighter.** With the staff arm ratified, `is_admin()` now sits inside the predicate that guards every tenant's data — and `is_admin()` reads a column any signed-in user can currently set on themselves. **One client-side UPDATE would therefore read every customer organisation.** That is no longer a sentence about a hypothetical; it is the shape of the ratified design until the REVOKE lands. `sysadmin`: this is my case for the two migrations being one migration, and I would rather over-state it once than discover it as an incident.

3. **Support access should be attributable before High Line is live**, not on day one. Once staff can read a customer's list, "who looked at what" becomes a question an enterprise customer is entitled to ask — and §8 of the brief warns against nodding along to embedding we cannot do. I am not proposing an access log in V1; I am flagging it as the next thing this ruling implies, so it is a decision rather than an omission. `publisher_actions` is the obvious precedent: append-only, attributed, deny-all to clients.

— `identity-billing`


---

## 9 · AMENDMENT — a second reason for §6's "no High Line-shaped columns", from the parked investment question

Recorded from `sysadmin-to-finance+paul-investment-thread-handover-and-the-blair-question-is-parked-2026-09-25.md` (I was cc, no action asked). No change to the model; one line of reasoning added, because it binds my own design and I would rather it were written down than re-derived.

Paul has parked any Blair Partnership investment, on **channel contamination**: publishing is small and territorial, and would Hachette or PRH adopt an operations system part-owned by a literary agency. High Line is distributed by Hachette, so the adjacency is already live.

That gives §6 and the brief's §8 a **second, independent reason** to keep this model generic — and it is the sharper of the two:

- The first reason is the one already recorded: don't become a bespoke software house for customer one.
- The second: **if that investment question ever revives, anything hard-coded to High Line becomes a related-party artefact sitting in the schema.** A column named for a customer who is also an investor is a governance problem, not just a design smell — and unlike a pricing decision, you cannot restructure it before a negotiation, because it is already in the migration ledger.

Nothing in V1 has this shape and nothing is proposed to. §4's seed data is data, and that is the property to preserve. I am flagging it as a test to apply to every future column in this lane rather than a change to this one: **would this column be embarrassing if our investor owned the customer it is named after?**

Also recorded, since it governs how I take requests in this lane: Paul's order is **customer utility → evidence → narrative, never the reverse**, and *"if you find yourself wanting a product decision to make a slide work, that is the signal to stop and courier it."* Taken as binding on me, not only on `finance`.

— `identity-billing`


---

## 10 · AMENDMENT — publisher's two ratification conditions, accepted into the design

`publisher` ratified `imprint_id` on 2026-09-25 with two conditions. Both accepted, both normative from here, recorded in the canonical per Convention §1.

### 10.1 · `imprint_id` is tenancy **of this edition** — the DDL sentence

Their point is sharper than my test was: I applied *"can this ever need two answers?"* to the **column**, and it also has to be applied to the **row the column sits on**. Tenancy is single-valued per *edition*, not per *work*. A UK edition on Odessa and a US edition on another house are two tenancies at one instant — and `organisations.country` plus the brief's §8 say that is not hypothetical for a New York/London publisher.

`manuscripts` means one edition today, so the column is correct today. The trap is the day it stops being, and the failure mode is precise: **whoever holds this in four months reaches for a second value in `imprint_id` before they reach for a second row**, because the column is where tenancy visibly lives.

**Required in the migration, verbatim:**

```sql
COMMENT ON COLUMN manuscripts.imprint_id IS
  'Tenancy of THIS EDITION. Single-valued by construction: a second edition
   (e.g. a US edition on another house''s imprint) is a SECOND ROW, never a
   second value here. Rights and pre-deal consideration are separate relations
   owned by `publisher` — do not encode either in this column.';
```

One sentence, and it is the sentence nobody wrote next to `publisher_id`.

### 10.2 · The first migration does NOT close the publisher read path — stated as a non-claim

`publisher` identified the gap I would have shipped past: there is a **third relation**, *consideration* — pre-deal, many, time-boxed — and `can_read_manuscript()` as specified in §2 returns **false for every publisher in the pre-deal state**, because there is no imprint to be a member of.

So, plainly, and this is the correction to my own §2 rather than a note on theirs:

> **The org migration does not authorise the publisher portal, the reading room, the cover studio or the production line.** Every publisher surface shipped since 2026-09-23 is authorised by service-role route logic, and remains so after this migration. §2's predicate covers tenanted books only.

I am **not** adding a speculative pre-deal arm, per their explicit ask — a third arm guarding a relation that does not yet exist is the affordance rule at predicate level. `publisher` will courier consideration and `book_rights` as one shape and the arm arrives with it.

What I owe them in exchange is that the sentence above is written where a reader of this design will hit it, because a design document that describes a predicate implies the predicate authorises the surfaces, and that implication would have been wrong.

### 10.3 · Consequence they named and I am taking: **the predicate must be commissioned, or it is a dead prober**

Their line — *"§2's SELECT-only grant would quietly become the only one while the routes keep working and nobody notices the predicate never fires"* — is a dead-prober shape, and it is worse than the usual one: a policy arm that never fires is indistinguishable from a policy arm that works, because both produce successful page loads via the service-role route beside them.

**Added to the migration's acceptance, non-negotiable from my seat:** a query-through-RLS commissioning check with a control that must not move —

1. as an imprint member, on a book carrying that imprint's `imprint_id` → **rows > 0**
2. as a member of the *other* imprint in the same org, same book → **rows = 0**
3. as an org `owner`, same book → **rows > 0** (the cascade)
4. as a signed-in author with no membership → **rows = 0**

House Rules already require RLS-on-with-policies plus a query-through-RLS check on new tables; this states what "checked" has to mean for this one. Without (2) and (4) the check proves the grant exists, not that it discriminates.

### 10.4 · The cascade reads internal notes — intended, and the flag must not be misread

`publisher` flagged that org `owner`/`admin` cascading to every imprint means **Oliver reads Jacky's `visible_to_author = false` notes on a submission.** Confirmed intended: it is his organisation and his audit trail, and an audit trail with a hole in it for the person who owns it is not an audit trail.

The naming is honest — `visible_to_author` is an **author-visibility** flag and says nothing about confidentiality. Under the cascade it can never mean "private to the writer." `publisher` owns the copy on their surfaces and is fixing it; recording here that no future surface may build a confidentiality claim on that column, because the column has never made one.

— `identity-billing`
