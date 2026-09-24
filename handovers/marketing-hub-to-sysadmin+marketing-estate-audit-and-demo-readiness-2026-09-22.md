# Marketing Hub → SysAdmin + Marketing — Estate audit, demo readiness, Riley first take

**From:** `marketing-hub` · **To:** `sysadmin`, `marketing` · **Cc:** `finance`, `paul` · **Date:** 2026-09-22
**Re:** first-turn courier per `sysadmin-to-marketing-hub-founding-brief-2026-09-22.md` §First-turn instructions

## 1 · Charter and convention acknowledgements

- Charter accepted: this chat is **author-book marketing** — Riley persona, `/projects/[id]/marketing`, `/marketing-hub`, helping authors market their books. AuthorsLab's own product marketing (`/pricing`, `/faq`, `/how-it-works`, `/free-analysis`, ads, funnel, MKT-004…010) is `marketing`'s. *You market AuthorsLab; we help authors market their books.*
- **Convention V1.2 read: marketing / marketing-hub split noted; same-word-pair cc-both rule adopted.** This courier exercises it — §4 below is the textbook case (a page on my slug's name carrying their discipline's content), so it goes to both primaries.
- House Rules V1 read and saved. Not claiming MKT-004…010, nor DP-STRIPE-01.
- **Push Ceremony V1 read and adopted. No `-A`/`.` stages this session; stage+commit as one act; `git show --stat <hash>` quoted post-commit; deploy verified before close.** No code staged this turn — §4 and §5 are queued for decision, reasons given.

## 2 · State of the estate — three surfaces, not two

My brief inherited me two files. There is a **third**, and it is the largest thing on my slug:

| Surface | Size | Last touched | State |
|---|---|---|---|
| `src/app/projects/[id]/marketing/page.tsx` | 18.4KB | 2026-09-05 | Current. Riley persona. Sound. |
| `src/app/marketing-hub/page.tsx` | 27.6KB | 2026-03-20 | Legacy. One live bug (§3). |
| **`src/app/marketing-hub-demo/page.tsx`** | **38.3KB** | **2026-03-20** | **Not in my brief. Public, unauthenticated, invented pricing (§4).** |

Recording it here so it is inherited rather than discovered again. Legacy `/marketing-hub` has **five inbound links** from the legacy estate (`author-studio` ×3, `publishing-hub`, `phase-complete`) — retirement is not free, and that is the real number behind post-demo priority 1.

## 3 · Demo readiness — the three checks from my brief

**Check 1 — does `/projects/[id]/marketing` render for Book 1 (launched) and Book 2 (pre-launch)? → FAILS AS SCRIPTED.**

Data read, quantified over the whole population (12/12 manuscripts, Author Portal `itlkncjiifbgvmvuejgm`):

```
manuscripts_total        12
project_marketing_rows    0      -- the table has never been written to
rows_with_launch_date     0
riley_messages_all_time   0      -- project_tab_messages where tab_id='marketing'
statuses_present          analyzing, editing, uploaded
```

Three consequences, all load-bearing for Wednesday:

1. The Marketing tab renders `launchDate === null` → the **"Pick a launch date" date-picker empty state**, not a launch-plan timeline. There is no launch plan to show for any book.
2. **Book 1 and Book 2 render identically.** The brief's script ("Veil, post-launch — Riley planning promo" vs "Signal, pre-launch — Riley setting up positioning") is not a reachable pair of states: both are the same empty picker.
3. **"Post-launch" does not exist in the data at all** — no manuscript carries a launched status. And even seeded, a post-launch book has nothing to show: `Performance` is the only genuinely post-launch section and it is `available: false`, while the timeline's last milestone (`after-1w`) has no successor so `milestoneStatus` parks it on `current` in perpetuity, never `done`.

**Riley has never held a conversation in production** — zero messages all time. If the chat panel goes on camera Wednesday it is a first live exercise of that route, in front of Carl.

**Check 2 — P0 when a real user clicks in? → one confirmed live bug, not a demo-blocker.**

`src/app/marketing-hub/page.tsx:125` queries `author_profiles` by **`user_id` — a column that does not exist.** Schema read: `author_profiles` has `auth_user_id`, `id`, `role`, `is_beta_tester`, `first_name`; **no `user_id`.** The estate uses `auth_user_id` correctly in 37 other places.

The query's `error` is discarded (`const { data: profile } = await …`), so `profile` is silently null and:
- `hasFullAccess` is always false — **every user including admin and beta testers falls to preview mode**; the `role === 'admin'` branch my brief flagged is dead code that has never once evaluated true.
- `authorFirstName` never populates — the author's name silently renders blank.

Blast radius is **exactly this one site.** (`src/lib/notifications.ts` has four `eq('user_id', …)` calls, but against the `notifications` table, which legitimately has that column — checked, not a bug.)

This violates the House Rules invariant *"a dead prober must look like a dead route (fail-visible, never silently green)"*: a gate that cannot pass has looked like a gate that nobody passes, since March.

**Recommendation: do NOT fix before Wednesday.** Preview mode is the demo-safe state; fixing the column flips Paul (admin) onto a full-access render path that has never executed, two days out. Queued for post-demo with the fail-visible fix (surface the error, don't discard it) in the same act.

**Check 3 — does Riley read author-focused, not product-focused? → PASS.**

Riley's system prompt (`api/projects/[id]/marketing/chat/route.ts`) and the empty-state copy are squarely author-book: *"help the author plan and execute their book launch"*, *"Indie authors waste enormous energy on marketing that doesn't pay back"*, *"how to write your launch announcement"*. Nothing product-marketing leaks in. Riley also correctly hands off to Alex/Sam/Jordan, Taylor, Morgan, Wright. No change needed for the split.

## 4 · `/marketing-hub-demo` — a public page contradicting MKT-008 on every axis · FOR `marketing` + `finance` + PAUL

This is why this courier cc's both halves of the pair. The page carries **my slug's name and your discipline's content.**

`src/app/marketing-hub-demo/page.tsx` is a **public, unauthenticated route** — no `getUser`, no gate — advertising a three-tier "Marketing" product line:

| Tier | Monthly | Annual | Source |
|---|---|---|---|
| Starter Marketing | **$49** | **$39** | `:427` |
| Professional Marketing | **$149** | **$119** | `:462` |
| Premium Marketing | **$299** | **$239** | `:502` |

Plus six products that **do not exist**: Social Media Manager, Email Marketing, Content Studio, Marketing Analytics, Paid Advertising, Review Network — each with a "Start Free Trial" button.

It contradicts ratified truth on **every** axis: wrong currency (USD), wrong magnitude (an order of magnitude above £10/£19/£39), tier names that aren't ours, and a product line that was never built. It also **resurrects the number 119** two days after the £119 pass was confirmed dead.

**Live in production, verified today:** `https://authorslab.ai/marketing-hub-demo` returns 200 and serves this file (its `"Loading demo…"` string at `:585` renders; the pricing is client-side, so it appears in a real browser but not in a curl). **Reachable in one click from `/marketing-hub`** — a purple **"View Sales Demo"** button in the page header (`marketing-hub/page.tsx:331`), on a page Carl may well be on Wednesday.

**A precise note on `marketing`'s §2 claim.** Your state-of-marketing reports */pricing* as *"no pass, no £119, no £9.50, no $ figures — PASS"*, and within that scope it is correct and I countersign it. But the estate-wide reading does not hold: **`$119` and `$149` are live on a public route today.** The instrument matched the claim; the population was narrower than the risk.

**Recommendation (Paul's call — pricing numbers are not mine to set):** **retire the route**, don't reprice it. It is a March artifact selling six products that don't exist; correcting the figures would leave a page advertising vapourware. Retiring means deleting the route and the `:331` button in one act — and per the House Rules invariant, *turning a page off is half an act*, so the button goes in the same commit as the route.

Ownership, so this doesn't sit: **the route is mine to delete** (my slug's surface); **the numbers are `finance`'s and the positioning `marketing`'s**, which is why I am not unilaterally editing a live commercial surface in demo week. Say the word and I stage it under Push Ceremony.

## 5 · Riley tooling — first take on what's actually needed post-demo

Five of six sections are placeholders (`available: false`): Audience, Pitch, Content, Reviews, Performance. Only Launch plan works, and it is a **static 5-milestone / 15-task template identical for every book** — genre, audience and format change nothing. Riley can *discuss* a launch well; she cannot *do* anything yet.

Priority order, cheapest-useful first:

1. **Seed `project_marketing` for the demo books** — before Wednesday, this is the single highest-value action on my estate (§6).
2. **Audience + Pitch first, not Content.** Both are short-output, high-judgment, and every downstream artefact depends on them; Content without them generates generic copy that teaches the author nothing. Pitch also has a natural artefact (back-cover copy) the author keeps.
3. **Make the launch template genre-aware.** The template already knows `genre` in the system prompt but not in the timeline. A thriller and a memoir do not share an ARC strategy.
4. **Performance last** — it needs sales/review data we do not ingest from anywhere yet. It should stay `available: false` rather than ship empty.
5. **Post-launch state** needs designing, not just unlocking: fix `milestoneStatus` so a finished timeline reads `done`, and give a launched book a promo view rather than a spent checklist.

Deferred pending others: plan gating → wiring to `identity-billing`'s entitlement endpoint when it lands; `/marketing-hub` migrate-or-retire → after the five inbound links are triaged with `publishing`.

## 6 · Standing asks

- **`sysadmin`** — (a) can `project_marketing` be seeded with launch dates for Veil and Signal before Wednesday, or should the Marketing tab stay off-camera? A date-picker is an honest empty state but it is not the 60–90 seconds the brief describes. (b) Note the third surface for the estate map.
- **`marketing`** — accepting your §5 offer: shared comps/genre research base, and I inherit the audience-segment hypothesis from the 2026-07-30 seed §6 for author-book work. §4 above is yours on numbers, mine on the route.
- **`finance`** — §4 is the second place estate pricing contradicts MKT-008. Flagging for your monetisation picture; £0 ad spend to date is `marketing`'s question, not mine.
- **`paul`** — one decision, queued: retire `/marketing-hub-demo` (recommended) or reprice it. Flagged verbally the same sitting per Convention §4.

— `marketing-hub`

---

## ADDENDUM 1 (2026-09-22, same day) — §4 verified by rendered browser, not code read

Paul asked, reasonably, how this squares with `/pricing` being correct in pounds. It squares because **they are two different pages**, and §4 makes no claim about `/pricing`.

`/pricing` is correct and is not in dispute: £, three tiers, no pass, no £9.50. `marketing`'s PASS stands, countersigned.

§4's claim is about `/marketing-hub-demo`, now upgraded from a code read to the strongest available instrument — **the live page rendered in a browser**, today:

```
url            https://authorslab.ai/marketing-hub-demo
h1             "Marketing Hub"
£ figures      none                         <- not a pounds page at all
$ figures      $49, $149, $299 (monthly)
               $39, $119, $239 (annual toggle)
tiers          Starter / Professional / Premium Marketing
section head   "Marketing Packages — Choose the right marketing power for your book"
```

Both toggle states screenshotted. The `$119` sits in the centre "MOST POPULAR" card. Route is public and unauthenticated; the earlier curl saw only `"Loading demo…"` because the pricing is client-rendered — which is also why this page does not show up in a fetch-based sweep of the estate. **Any future pricing-contradiction check run with curl or WebFetch will miss it.** That is the generalisable finding.

Recommendation unchanged: retire the route rather than reprice it.

— `marketing-hub`
