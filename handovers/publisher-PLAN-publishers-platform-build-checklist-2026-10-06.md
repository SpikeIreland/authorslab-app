# THE PUBLISHERS PLATFORM — DIRECTION AND BUILD CHECKLIST
## publisher → paul, ux, sysadmin, identity-billing, marketing, marketing-hub, publishing, design
2026-10-06 · supersedes nothing; this is the first plan document for the publisher lane

---

## §0 The direction, in one sentence

**The Publishers Platform is the author's per-book journey rendered in the third person — minus Wright, Research and Script — with a house-level list above it.**

That is Paul's direction, stated consistently and repeatedly. It is not a new ruling. It is being written down because **the build went somewhere else**, and §1 shows where.

---

## §1 Why it has not felt like a sensible publisher's journey (measured today)

### The author's per-book journey
`src/app/projects/[id]/_components/ProjectTabStrip.tsx` →
`Overview · Wright · Author Studio · Design · Publishing · Marketing` (+ Research, Script)

### Paul's journey, applying his own subtraction
`Overview · Author Studio · Design · Publishing · Marketing`

### What the publisher product actually has per book
| Journey node | Publisher surface | State |
|---|---|---|
| Overview | `/publisher/[projectId]` | **built** (1252 lines) |
| Author Studio | `/publisher/[projectId]/read` — the reading room | **built**, 497 lines, chapter text real |
| Design | `/publisher/[projectId]/cover` — the cover studio | **built**, 410 lines, assets real |
| Publishing | — | **MISSING** |
| Marketing | — | **MISSING** |

### And here is the actual defect
**There is no tab strip on any publisher per-book page.** `PublisherNav.tsx` carries exactly two tabs and both are *house-level* views of the list: `What is late` and `Where everything is`.

So: **three of the five journey nodes are built, and nothing navigates between them.** A publisher clicks a book title on `/publisher`, lands on the Overview — the node with the least value and the most of the author's private work on it — and from there the journey visibly ends. The reading room and the cover studio, which are the two things a publisher actually came to do, are **reachable only by typing the URL.**

**That is the whole of Paul's complaint, and his instinct was reading the product correctly.** "I really want to go to either an overview page or straight to the author-studio" — the author-studio equivalent *exists and works*. He has never been able to get to it.

### The second-order consequence
Because the journey was not navigable, the lane built a **house admin console** instead — what is late, where everything is, people, house style. Those are useful and they stay. But they are the *list above* the journey, not the journey. A console answers "which book should I worry about". It never answers "what is this book". Paul has been asking for the second and being shown the first.

**House rule earned: when a journey has no navigation, every lane builds the index instead, because the index is the only page that is reachable.**

---

## §2 THE CHECKLIST

Ordered so the earliest items are the ones that make the site usable, not the ones that are architecturally tidiest.

### A — Make the journey navigable · unblocks Paul this week

- [ ] **A1 · Per-book tab strip.** `Overview · Manuscript · Design · Publishing · Marketing` on all `/publisher/[projectId]/*` pages. The two unbuilt nodes render in the author strip's existing `soon` state — present, visibly not yet, not clickable. *Owner: `publisher` (build) + `ux` (state grammar — the strip exists in the author product; it is lifted, not invented). Blocked by: nothing. This is the single change that turns three orphan pages into a journey.*
- [ ] **A2 · Where a book title lands.** `/publisher` title click currently goes to Overview. Paul's own words: "either an overview page or straight to the author-studio." *Owner: **Paul** — one line. Everything else in A is built the same either way.*
- [ ] **A3 · Third-person voice pass.** The per-book pages and the chat column currently speak **to** the author. Paul: "The chat currently speaks as if talking to the Author which doesn't work." R8 already rules the voice a render-time parameter over one prompt set, so this is a parameter, not a fork. *Owner: `publisher` for the page copy; the chat column owner for the prompt parameter. Blocked by: R8's parameter actually existing.*
- [ ] **A4 · Overview, re-scoped.** Paul: "too intrusive on an Author's work and it doesn't provide any real information from the publisher's perspective." Once A1 exists, Overview stops being the destination and becomes the *state* node: where this title is across the stations, what is waiting on the house, what is waiting on the author. Everything that is the author's private working material comes off it. *Owner: `publisher`, after A1 and A2.*

### B — The two missing journey nodes

- [ ] **B1 · Publishing (publisher render).** Read-only first — the house sees where the book is in launch prep. Specify, do not build the mechanics. *Owner: `publishing` + `publisher`.*
- [ ] **B2 · Marketing (publisher render).** Read-only first. *Owner: `marketing-hub` + `publisher`.*

### C — Make the built nodes real rather than demonstrable

- [ ] **C1 · Publisher notes table.** The reading room's notes are **attributed but not persisted** — there is no table. Today the page honestly claims nothing has reached the author, because nothing has. *Owner: `sysadmin` (migration). Already couriered.*
- [ ] **C2 · `publisher_actions` consolidated migration.** Station CHECK, `kind` values, `subject_ref`/`subject_kind`, `agreed_fingerprint`. Ready-to-apply SQL already couriered. *Owner: `sysadmin`. Blocking: the cover studio's decision log and the per-version approval read.*
- [ ] **C3 · W4 — search / sort / filter on the Books list.** Distribution approved by `ux` with five amendments; `sysadmin` ruled "write the rows". *Owner: `publisher`. Blocked by: W1 only.*

### D — The demo library · Carl's run

- [ ] **D1 · The three-row swap.** Veil → `c037e098`, Signal → `14057c5e`, `CS The List` off the list. SQL written by `sysadmin`, `imprint_id` only, no `author_id` touched. *Owner: **Paul** — awaiting your word.*
- [ ] **D2 · Series order declaration.** Is Veil book 1 and Signal book 2? `astudio` and `publisher` both refuse to guess. *Owner: **Paul** — one line.*
- [ ] **D3 · Carl's seat.** `carl@spikeisland.tv` is the demo account: currently `role=admin` (over-privileged — that is a staff grant and would hand him every author on the platform) and `is_admin=false` with **0 seats** (under-privileged — he cannot see the house). *Owner: `identity-billing` + `sysadmin`.*

### E — The front door and the commercial edge

- [x] **E1 · `/publishers` public page rewritten** against the reset. *`marketing`, W1, commit `88f3a9e`.*
- [ ] **E2 · Who answers `publishers@`, inside what promise.** The page already says *"a person answers, same working day."* *Owner: **Paul**.*
- [ ] **E3 · The enquiry record.** Ruled to `identity-billing` — an enquiry is the pre-history of an organisation. Nothing to build until E2 has a name. *Owner: `identity-billing` (record) + `sysadmin` (route).*

### F — Legal · Paul generates these separately via Clarence Legal

- [ ] **F1 · Publisher-side Privacy Policy, Terms, and DPA.** Brief at §3 below. *Owner: **Paul** / Clarence Legal.*

---

## §3 BRIEF FOR CLARENCE LEGAL

Paul's point is taken and it is correct: `docs/Legal/drafts/privacy-policy.md` is the **author site's** policy. The Publishers Platform is a different product with a different customer and needs its own documents. These are the facts to draft against — all measured, not assumed.

**Who the customer is.** The publishing house, as an `organisation`. Not the author. The house pays; the author does not.

**How access works.** By **seat** on an **imprint**. The seat is granted by the house (and by AuthorsLab on setup). **The author does not invite anyone and cannot revoke.** This is the central fact and it is the one the author-side policy does not currently describe.

**What a seat-holder can see.** Every title on their own imprint: title, author name, state across the seven stations, cover assets and the author's selection, chapter text, and the editorial notes package.

**What a seat-holder cannot see.** Any title on another imprint (enforced server-side; out-of-scope returns 404, not 403). The author's AI conversations. Any price or cost figure — excluded from publisher surfaces by construction, on Paul's standing position.

**What a publisher writes.** An append-only action log — approvals, revision requests, notes — attributed to a named membership and the organisation's name, derived server-side. A publisher cannot write under a name they supply.

**Personal data we hold about the publisher's own people.** Name, email, membership, organisation. Plus, if E3 is built, inbound enquiry details — a named person at a named house and what they publish, which is business-contact personal data.

**The authors in this model are generally not platform users.** Of the 9 authors currently on a publisher list, 9 have accounts and **0 have ever signed in**. Their work reaches the house through the house's own library, and the notes package exits as a document.

**Where data rests.** Supabase (project `itlkncjiifbgvmvuejgm`), Vercel, n8n Cloud, Anthropic/OpenAI, Stripe — the author policy's subprocessor list applies. `/publishers` promises prospects a technical specification covering exactly this, so the two must agree.

**One flag for the drafter, so the two documents do not contradict.** The author-side policy §5.2 is headed *"Publisher access — explicit and author-controlled only"* and promises the author initiates, specifies one book, can revoke, and that the publisher sees no editorial feedback. The Publishers Platform works the other way on all four. §5.2 is marked "planned feature", so it is not false about today's platform — but it describes a shape we are not building, and an author reading both documents must not find them in conflict. **Either §5.2 is redrafted alongside the publisher documents, or the publisher product acquires author consent and revoke.** That is a product decision for Paul, not a drafting one, and the drafter needs to know which way it went.

---

## §4 Explicitly NOT in the Publishers Platform

Wright, Research, Script — Paul's subtraction, unchanged. The editorial pass itself. Style-sheet enforcement. Cover generation and intake. Layout snag lists. Asset-pack copy. Invite and roles mechanics. Any price shown to a publisher. Tracks C, D and E remain frozen.

**Surface them. Implement none.**

---

## §5 What each lane is being asked for

| Lane | Item |
|---|---|
| **paul** | A2, D1, D2, E2, F1 — five one-line decisions, and they unblock most of A and D |
| **ux** | A1 — ratify lifting the author tab strip; it is your grammar |
| **sysadmin** | C1, C2 (both already couriered), D3 |
| **identity-billing** | D3, E3 |
| **publishing** | B1 |
| **marketing-hub** | B2 |
| **marketing** | E2 (the live copy is yours) |
| **design** | A1 touches the cover studio's place in the strip — nothing of yours moves |
| **publisher** | A1, A3, A4, C3, and the B-node publisher renders |
