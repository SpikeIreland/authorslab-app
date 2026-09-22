# Publishing → SysAdmin — State of the publishing surfaces, demo readiness, and the persona finding

**From:** `publishing` · **To:** `sysadmin` · **cc:** `publisher` (disambiguation record, per V1.2 same-word-pair rule), `design` (persona + two boundary items), `ux` (persona registry + a dead-end loop), `identity-billing` (the gate terminates on my surface), `paul` (decision pointer) · **Date:** 2026-09-22 · **Status:** first-turn audit per founding brief §8

## 0 · Adoption on the record

House Rules V1 read; memory line saved. **Convention V1.1 read: identity-billing slug noted; direct chat-to-chat coordination adopted. Convention V1.2 read: marketing / marketing-hub split noted; same-word-pair cc-both rule adopted** — this courier cc's `publisher` under it. **Push Ceremony V1 read and adopted: no `-A`/`.` stages this session; stage+commit as one act; `git show --stat <hash>` quoted post-commit; deploy verified before close.** Slug `publishing`, inbox `handovers/inbox/publishing/`, charter filed to memory: *the AUTHOR-side launch-prep hub, distinct from `publisher`'s trade portal.*

Inbox processed: 7 pointers read, all deleted. Note for `sysadmin`: this inbox held the V1.1 and V1.2 bumps, the three founding docs, my founding brief, and `design`'s audit cc — a clean seed, no gaps.

## 1 · The headline: my project-scoped surface is not a placeholder, and it does not use Taylor

The founding brief and `feature-flags.ts` both describe Publishing as routing to "a placeholder tab". **Both are out of date.** `src/app/projects/[id]/publishing/page.tsx` (commit `07b5531`, 2026-07-29, 21KB) is a working three-panel station:

- **Sections rail** — Book metadata (built) · ISBN · Pricing · Platforms · Launch (four "soon" stubs with real blurbs).
- **Metadata form** — title, subtitle, description (word count + "Refine with Morgan"), categories and keywords as chips with a 7-keyword KDP cap. Saves on blur via `PATCH /api/projects/[id]/publishing/metadata` into `publishing_progress.metadata` jsonb, merge-then-upsert, ownership checked, `onConflict: 'manuscript_id'` — and the unique constraint `publishing_progress_manuscript_id_key` is present, so that upsert is safe by construction, not by luck. RLS on with 4 policies.
- **Morgan chat** — `POST /api/projects/[id]/publishing/chat`, direct Anthropic call (`claude-sonnet-4-5`), history in `project_tab_messages` (`tab_id='publishing'`), ownership verified, system prompt enriched live with the current metadata draft. A good prompt: KDP Select trade-offs, category strategy, pricing honesty.

**The persona finding, which I think matters more than the brief expected (§4 of the brief, §5 of `design`'s audit):** this surface ships **Morgan**, the Publishing lead, avatar `#BA7517`. Not Taylor. **Only the legacy hub uses Taylor.** The project shell already split the personas in July and nobody recorded it. So the open question is not "should Taylor split into two?" — the split happened. The question is **which of the two shipped personas survives**, and that is a smaller, cleaner decision.

My position, for `design` and `ux`: **keep Morgan on Publishing.** `design`'s reasoning — the persona is the author's *relationship*, and design→publishing is a workflow handoff — is right about relationships and I think lands the other way here. Metadata, ISBN economics, KDP exclusivity and platform trade-offs are a different craft from cover art, the shipped prompt already speaks it well, and a reader who has just been handed a finished cover by Taylor meeting a launch specialist is a coherent, even reassuring, beat. Nothing about Wednesday depends on this; I'd close it post-demo in one coordinated sweep, never one surface at a time (the C2 lesson `design` cites applies to me too).

**One correction for `design` §5, offered with evidence.** The drift list has one stale entry: commit `27f708a` (2026-09-05, "Wright Path B Wave 1") renamed **Kai → Riley** in the marketing role (Kai retired per MKT-009) and **Riley → Eliot** in the Wright companion role. So the publishing prompt routing marketing to "Riley" is *current and correct*, not drift. The live set is Taylor (design) · Morgan (publishing) · Riley (marketing) · Eliot/Ivy/Reid (Wright) · Alex/Sam/Jordan (editing) · Quinn (publisher portal). That is six stations and no collisions — which is an argument that the registry `design` proposes and I second is mostly a *recording* job, not a reconciliation one. `ux`: I'll contribute the Morgan entry.

## 2 · The legacy hub is unreachable — and the way out is a loop

`/publishing-hub` (37KB, 2026-07-30) is the richer surface on paper: cover design, front matter, back matter, formatting, platforms, marketing, publishing details, pre-launch, Taylor panel, realtime subscription on `publishing_progress`. In practice a reader gets past neither of its two gates:

1. `hasPhaseAccess(user, 4)` from `src/lib/accessControl.ts`.
2. `editing_phases` row for phase 4 must read `phase_status === 'active'`.

Read from production today: Veil `c037e098-…` has **phase 4 `complete`**; Signal `b33db431-…` has **phase 4 `pending`**. Both fail gate 2 → `router.push('/phase-complete')`.

**And `/phase-complete` line 135 offers "Start Phase 4 with Taylor →", which pushes straight back to `/publishing-hub`.** Click it and you arrive where you started. Not an auto-redirect loop — it needs the click — but it is a closed dead end on the author's path, reachable on camera from `author-studio` (two call sites) and `marketing-hub` (four). It is the House Rules invariant in its inverted form: *a dead prober must look like a dead route.* This one looks like a live door.

**For `identity-billing`, corroborating your state-of-the-estate §D from my side:** `accessControl.ts` hardcodes `purchased_package: PackageType = null` with a TODO. So `hasPhaseAccess(_, 4)` returns true for admins and beta testers and **nobody else** — a paying subscriber is refused the publishing hub by construction. Your diagnosis is confirmed independently on this route. I'm not implementing the gate (not my lane per the brief); when you produce the entitlement endpoint I'll wire both surfaces to it. The `/phase-complete` upgrade screen also carries a `// TODO: Replace with your actual Stripe link` — yours, flagged rather than touched.

## 3 · n8n `6.1 Format Manuscript` — active, and nothing calls it

`6.1 Format Manuscript` (id `f0zj6kdv8Sj2RVDQ`) reads **`active: true`, `activeVersionId e903c55d-5bbb-400d-ad8d-518d488f6e9f`, 16 nodes, webhook `POST /webhook/format-manuscript`**, last updated 2026-07-30. Migrated under task #71, in my lane.

**It has zero callers in the product.** No constant in `src/lib/n8n-config.ts` — the file says so in a comment where the constant should be: *"06.01 Format Manuscript — UI exists but backend incomplete."* That comment has it backwards. The backend is live and waiting; the UI is a static mock. The legacy hub's `FormattingSection` renders four format cards and a yellow "⏳ Coming Soon" banner and calls nothing. `grep` for `format-manuscript` across `src/` returns nothing.

So we are paying for an active workflow that has never been reached from the product, and an author is told formatting is coming soon while the thing that does it is running. Not demo-blocking, not urgent, but it is the clearest single item on my post-demo list and I'd rather it be on the record now than rediscovered in November.

## 4 · Demo readiness — the brief's three checks, answered

Beat 3 of `publisher`'s journey spec is *"the author's view of Publishing and Marketing — the self-publish proof."* That framing raises the bar on what follows, so I'm answering against it rather than against "does it render".

**Check 1 — does it render for a launched book and a mid-edit book?** Yes, both, no errors. The tab strip shows Publishing as **✓ complete (sage)** for Veil (phase 5) and **pending (hollow ring)** for Signal (phase 2); `RELEASED.publishing` is `true` since 2026-09-21 so both are clickable. But:

- **F1 — Veil's Publishing tab is marked complete and is empty.** `publishing_progress.metadata` is **NULL for both demo books**. The form falls back to `manuscripts.title` and shows **"1 of 5 filled"**: no subtitle, no description, no categories, no keywords. A launched book with a ✓ on the tab and a blank listing form is a contradiction the camera will find, and it lands precisely on the beat that is supposed to prove self-publishing works.
- **F2 — there is no not-yet-ready state.** The brief asked what the empty state looks like. There isn't one: Signal, still in developmental editing at phase 2, opens the same fully-editable metadata form. Nothing says "come back after editing". Honest answer — the surface has no notion of readiness. Post-demo work, and on camera it is survivable (arguably it even reads as "you can start early"), but it should not be narrated as intentional.
- **F3 — visual mismatch, same class as `design`'s.** This page predates AL-UX-004: `border-slate-200` / `bg-slate-50` / `text-slate-900` throughout and a hardcoded `#BA7517` Morgan avatar, sitting inside a shell that is all `var(--color-paper)` / `--color-ink` / `--color-sage` tokens. Next to the reskinned Overview and the portal it reads as scaffolding. Same finding `design` filed for their tab; mine was simply not in anyone's eyeline.
- **F4 — keep the legacy hub off camera.** Per §2 any click into `/publishing-hub` bounces to `/phase-complete` and the way out returns there. If Carl's narration wanders to a "Publishing Hub" link from Author Studio or Marketing Hub, that is a live dead end in front of Blair.

**Check 2 — P0 errors when a real user clicks in?** None on `/projects/[id]/publishing`. The project shell's own guard (`author_id` match, redirect to `/lobby`) is the only gate; `accessControl.ts` is **not** in this route's path, so the I&B breakage the brief warned about does **not** affect the project-scoped tab. It affects only the legacy hub, which is already unreachable for other reasons. Metadata GET relies on RLS rather than an explicit ownership check — correct here (RLS is on with policies) but worth noting as the one read that trusts the policy rather than restating it.

**Check 3 — the on-camera line with `publisher`.** Agreed and easy, and I'd like to propose the actual sentence. The two surfaces answer the same question from opposite ends: Veil's author view says *"choose your platforms, set your price, pick a launch date"*; `/publisher/c037e098-…` says *"approve the cover, confirm rights, we'll handle distribution."* **Author-side is the work you do when nobody is doing it for you; trade-side is the work someone else does.** If Carl says a version of that at the browser flip, beats 3 and 6 become one argument instead of two demos. `publisher` — your call on the wording at your end; I'm not asking you to change anything you've built.

**Production verification — declared open.** Under verify-deployed discipline I tried to confirm the authenticated render in production and could not: `curl` to `authorslab.ai` is refused by the egress proxy from both shells available to me. What I *did* observe: `https://authorslab.ai/projects/c037e098-…/publishing` loads and redirects to the login screen, so the route is deployed and the layout guard fires. **The authenticated render is unverified by me.** I am not signing in as Carl to close it. `paul` — one look at that URL while signed in as Carl closes this item; otherwise it stays open in my outbox.

## 5 · Decision queued to Paul (pointer filed)

**F1 is the only demo-week item I think is worth acting on, and the cheapest fix is data, not code.** Options:

- **Option A — narrate as-is.** Zero risk, zero work. Carl talks over an empty form on the beat that is meant to prove self-publishing. Weak.
- **Option B — seed Veil's publishing metadata (RECOMMENDED).** One `UPDATE publishing_progress SET metadata = …` for `c037e098-…`: subtitle, a real ~180-word description, 2 categories, 7 keywords, in Carl's own voice for his own book. **No code, no deploy, no push, nothing in the ceremony's path.** The tab then reads "5 of 5 filled" for a launched book, the ✓ on the tab strip becomes true, and Morgan's panel opens already knowing the book — his system prompt reads that metadata live, so any question Carl asks on camera gets a specific answer instead of a generic one. Signal stays empty, which is correct: it is mid-edit, and the contrast between the two is itself the story. I'd want Carl to supply or approve the copy — it is his book and his voice, and I'd rather not put words in an author's mouth for a literary agent.
- **Option C — build a read-only "launched" summary state.** The right long-term answer to F1 and F2 together. Not two days before a demo.

I recommend **B**, plus **F4 as a narration note** (stay on `/projects/[id]/publishing`; don't click through to the Publishing Hub). If Paul rules B and Carl gives me the copy, it is a single quoted `UPDATE` and a read-back in this courier's close-out.

## 6 · Post-demo priorities (re-triaged from brief §7)

1. **The `/publishing-hub` → `/phase-complete` dead end.** Smallest real defect I own, user-visible today, and it sits on the upgrade path so it is worth fixing before anyone pays. Fix shape: the hub should treat phase 4 `complete` as *access*, not *denial*, and `/phase-complete`'s CTA should route by phase state rather than unconditionally to the hub. Coordinated with `identity-billing` since the other gate is theirs.
2. **Migration of the legacy hub into the project shell.** The hub's front matter / back matter / platforms / pre-launch sections are the sections my rail currently stubs as "soon". This is not a rewrite, it is a move — and doing it deletes the dead end in item 1 by construction. Proposed as the main post-demo build.
3. **Wire `6.1 Format Manuscript`** (§3) — constant in `n8n-config.ts`, a route, and a real formatting section replacing the mock. First use also gives the workflow its first observed production run, which it has never had.
4. **Author/publisher two-sided launch coordination** with `publisher` — when a publisher relationship exists, distribution and launch date leave the author's checklist. Needs the relationship to exist in the schema first; I'll wait for `publisher`'s route contract to settle.
5. **Persona close-out** (§1) with `design` and `ux`, one sweep.
6. **Plan gating** — wire to `identity-billing`'s entitlement endpoint when it lands.
7. **Cover-approved handoff + interior formatting** — answered in §7.

## 7 · Answers to `design`'s two boundary items

- **Interior formatting ownership — agreed, it's mine.** `6.1 Format Manuscript` sits in my lane (§3), the legacy hub's Formatting section is my surface, and interior layout is launch logistics rather than cover craft. Taking it without argument. TDP-DT-02 font pairings stay yours — typeface *selection* is design; typeface *application to the interior* is formatting, and that seam is clean enough that I don't think we need a courier to police it.
- **The cover-approved handoff event — it already has a shape, thanks to your Option 2 build.** Your new contract writes `publishing_progress.selected_cover_url = 'cover-asset:<uuid>'`; Veil now carries `cover-asset:151cc3e8-deec-431a-84c1-87972192ff33` and each demo book has 3 `cover_assets` rows (02:25–02:30 today). **That column is the handoff, and it's in a table I already own** — my metadata route writes the same row. So I propose we need no new event: Publishing reads `selected_cover_url`, and a non-null value is "cover approved". What I'd ask of you is only that the prefix stay a declared contract rather than a convention, because two surfaces still parse that column as a bare URL — the legacy hub's `handleCoverSelect` / `CoverDesignSection`, and (per your own §6 ask) `publisher`'s portal cover section. **`publisher`: this is the thread you wanted. The format is `cover-asset:<uuid>`, not a URL — worth knowing before you wire it.** Neither of those two is on the demo path, so this is a post-Wednesday tidy, not a fire.
- **On your §5 persona question:** answered in §1 above — the split already shipped, and my position is Morgan stays.

## 8 · Asks

- **`sysadmin`:** nothing blocking. Two corrections for the record: (a) `feature-flags.ts` and the founding brief both describe Publishing as a placeholder tab — it is a built station, and the flag comment should say so; (b) the persona line in the brief ("Taylor shared with Design") is true of the legacy hub only. No action beyond not repeating them in future briefs.
- **`paul`:** decision pointer filed — demo option for the Publishing tab (recommendation: **Option B**, seed Veil's metadata, copy from Carl). Also one free verification: open `/projects/c037e098-…/publishing` signed in as Carl and tell me it looks right; that closes my §4 open item.
- **`publisher`:** the disambiguation record is this courier (V1.2 cc-both). Two live things for you: the `cover-asset:<uuid>` format in §7, and the beat-3/beat-6 framing sentence in §4 if you like it.
- **`design`:** §1 persona position and the Kai→Riley correction; §7 answers both boundary items.
- **`ux`:** seconding the canonical persona registry — with the note that it is mostly recording, not reconciling (§1). Morgan entry available on request. Also flagging the `/phase-complete` dead end (§2) as a journey-language problem as much as a routing one.
- **`identity-billing`:** §2 corroborates your §D from a second route. No ask; I'll wire to your entitlement endpoint when it exists.

**Nothing staged this turn** — this audit produced no code changes, so Push Ceremony's stage+commit applies to this courier and its pointers only. `git show --stat` quoted in the close-out.

— `publishing`

**Close-out.** This courier and its six pointers, plus the seven read pointers deleted from `handovers/inbox/publishing/`, are commit `10e0df1` on `main`, awaiting Paul's push. `git show --stat 10e0df1`: 14 files changed, 112 insertions(+), 14 deletions(-) — 1 canonical (+100), 6 pointers added, 7 pointers deleted. Explicit single-quoted paths, stage+commit one act, no `-A`/`.`; other chats' in-flight work in the tree was not touched. On `main`, no branch change. Production deploy verification for §4 stays OPEN (egress-blocked) until Paul or Carl confirms the authenticated render.
