# Handover — public-pages truth pass + pricing simplification

**AL-MKT-009 · 2026-08-10**
**From:** Marketing station (all decisions Paul's, 2026-08-10)
**To:** Platform Dev station · fwd Pricing Chat, UI/UX, Demo & Content Ops
**Companion docs:** AL-MKT-007 Marketing Status Matrix v1.1 (source of truth) ·
AL-MKT-008 pricing decision memo

## 1 · Decisions this work implements

1. **£119 single-project pass REMOVED** (user feedback: confusing). Membership
   only: Starter £10 / Author £19 / Pro £39 monthly, annual £7/£13/£27,
   annual-first. £13 bridge credit gone with it.
2. **Legacy users:** no blanket grandfathering. Beta users complete their
   current manuscript in the editing studio; beyond that, standard
   membership. Exception: Carl (founder). Pricing Chat to verify nobody ever
   actually *paid* for the old package/pass before the old FAQ promise is
   considered fully retired.
3. **Persona roster ratified:** Eliot = companion/first contact (new) ·
   Ivy & Reid in Wright · Alex/Sam/Jordan unchanged · **Taylor = Design
   only** · **Morgan = Publishing** · **Riley = Marketing** (Kai retired —
   revert the code-side Kai rename) · Eden retired everywhere.
4. **Status truth:** editing studio live; Wright, Design, Publishing,
   Marketing all "coming soon"; staged-release membership formula everywhere:
   *new stages join your membership as they release — your price never
   changes.*

## 2 · What Marketing changed (already committed to the working tree)

~35 copy edits across five files, all committed 2026-08-10; each file parses
clean (esbuild `--loader:tsx` check).

- `src/app/page.tsx` — Eliot in journey band; journey entry 5 now
  "Taylor, Morgan & Riley" (T·M·R); status sentence added to journey intro;
  hero + metadata no longer imply cover/launch are live; membership card
  bullets reframed (editing studio + stages-join formula; "unlimited
  projects" scoped to Author/Pro).
- `src/app/faq/page.tsx` — Eden→Eliot/Wright throughout; pass Q&As replaced
  (single-book answer now sells Starter; old-package answer states the
  legacy policy); Taylor/Morgan split across the Publishing category with
  roadmap voice ("when the Publishing stage releases…"); 15-minute
  turnaround claim removed (pending smoke-test number); both "reply within
  24 hours" promises removed (mailbox doesn't exist yet — support@ address
  itself retained, see §4.3).
- `src/app/how-it-works/page.tsx` — metadata + hero state live-vs-coming
  status; Phase 4 subtitle "with Taylor & Morgan · coming soon"; Phase 5
  "with Riley · coming soon"; "files ready in 3–5 days" removed; "all five
  stages included" → membership formula; journey grid cell "Taylor & Morgan".
- `src/app/editors/page.tsx` — Phase 4/5 kickers marked "Coming soon";
  Taylor relabelled Design Lead with Morgan referenced; closing CTA now
  "Alex, Sam and Jordan are ready today…". (Proper Eliot + Morgan profile
  sections are a UI/UX design task — not attempted here.)
- `src/app/pricing/page.tsx` — pass card replaced by a "coming soon"
  roadmap card (satisfies launch-checklist item 7 for this page); tier
  bullets reframed; unverifiable "Priority turnaround" Pro bullet removed;
  $-figure human-cost anchor softened to unquantified "thousands of pounds";
  $299 FAQ answer replaced with legacy policy; header comment notes PD-4
  superseded.

## 3 · Deploy readiness — Marketing's assessment

These changes introduce **no new blockers**; every edit strictly increases
truthfulness of an already-live site. Known pre-existing conditions that
deploy does not worsen: free-analysis form live but workflow inactive
(submits error — retrofit in flight), support@ mailbox not yet real, legal
pages absent, in-app naming (Eden/Kai/Ghostwriter) not yet matching the new
public roster.

Preflight before push:

1. `next build` / CI type-check (Marketing verified parse only, not types)
2. **PD-5 ruling needed from Paul:** pricing page carries "do not deploy
   before the Founding Author announcement." If the legacy ruling makes that
   announcement moot, Paul says so and the blocker dies; otherwise it holds.
3. Confirm no mid-flight Platform Dev work on these five files collides
   (Stripe rewire, MVP unplug)

## 4 · Actions requested

**Platform Dev**
1. Build + deploy the five updated pages (after §3 preflight)
2. In-app renames to match the roster: marketing persona Kai → **Riley**
   (revert), companion/matcher → **Eliot** (code, system prompts, n8n 7.01,
   webhook path), Publishing placeholder = **Morgan**; Wright schema rename
   per the Ghostwriter Line dispatch when it lands
3. Remove any checkout/signup path that still sells or mentions the pass
4. Entitlement handling for the two legacy beta users (complete current
   manuscript) + Carl's founder account

**Pricing Chat** — archive the £119 Stripe product; purchaser check (§1.2);
rule on the private £9.50 founding tier's fate.

**UI/UX** — Eliot + Morgan profile sections for /editors; free-analysis
restyle (still old-brand); nicer coming-soon chip pattern if desired.

**Ops/Paul** — hello@/support@ mailboxes (now blocking several published
claims); PD-5 ruling (§3.2).

## 5 · Verification after deploy

Fetch live pages and confirm: no "Eden", no "£119", no "$299/$399", no
"every stage is live", Taylor never paired with "Publishing" as her role,
"coming soon" present on pricing + how-it-works + editors, tier figures
match Stripe (£7/£13/£27 annual headline). Marketing will run this check on
request.

— Marketing station
