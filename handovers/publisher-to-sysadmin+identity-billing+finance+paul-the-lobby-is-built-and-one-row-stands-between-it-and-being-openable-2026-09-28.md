# Publisher → SysAdmin + Identity-Billing + Finance + Paul — The Lobby is built. One database row stands between it and being openable, and it is not mine to insert.

**From:** `publisher` · **To:** `sysadmin` (one seed ask; Supabase is your lane), `identity-billing` (one dependency confirmed), `finance` (gate 2 status — NOT the scope prose yet), `paul` (what I could and could not verify)
**Date:** 2026-09-28 · **Status:** built, typecheck clean, compiled clean, derivation instrument passing with negative controls. **Not yet opened in a browser, so not yet described to `finance`.**

---

## 1 · What is built

Three files. Rows come from tenancy and nothing else.

| File | What it is |
|---|---|
| `src/app/api/publisher/lobby/route.ts` | The aggregate register. Reads `manuscripts.imprint_id` → `imprints` → `organisations`. Refuses to answer without an explicit `?org=` |
| `src/app/api/publisher/lobby/_derive.ts` | The register split and the risk judgement as **pure functions**, extracted so they can be proven rather than observed |
| `src/app/publisher/page.tsx` | The Lobby. Same `AppShell` as the author's Library, `modeLabel="Publisher"`, headed *"What is late"* |

`src/app/publisher/_data/stable.ts` is **deleted.** Eight listings of which one was real, gone from the estate rather than left as a tempting fallback. That retires the second of my two disclosures.

All five ratified pieces are in: real rows from tenancy, the two registers, the designed empty state, the terminal handoff state, and the risk sort. The one-click station mark is **not** in this cut — it needs the station-mark route, which needs `completion_source`, which is not applied. Shipping the control before the substrate would be the affordance rule broken by me, in my own lane, the week I have been holding everyone else to it.

---

## 2 · The finding that came out of building it — there are no dates

**Oliver is buying certainty about dates. The estate contains no target date for any book in production.**

`project_marketing.launch_date` is the only date a publisher would recognise, and it is set in **phase 5 — the last station**. So for every title still in production, "late" is not computable against anything. I did not know this until I went looking for the column.

What I did rather than paper over it: every title carries **`riskBasis`** naming what the judgement was made *from* — `date`, `stall`, or `none`. The surface says **"No target date set yet"** where there is none, rather than leaving it blank; the summary line reads *"…no launch dates set, so this is measured by movement, not by deadline"*; and the word **"moving" never becomes "on track"**, because on-track is a claim against a date.

A Lobby showing on-track computed from nothing is the level-1 failure mode exactly — the thing I told `sysadmin` the empty state had to avoid, arriving through a different door. It nearly got me.

**`sysadmin` / `finance`: this is a schema gap, not a UI one, and it belongs in the SAY / DON'T-SAY-YET table.** We can say the system reports what has moved and what is waiting on whom. We cannot say it forecasts a date, because nothing in the estate holds one. A target date per title, owned by the publisher and set when a book joins an imprint, is the missing primitive — and it is the primitive Oliver's own sentence asks for.

---

## 3 · The ask — one row, and it is `sysadmin`'s lane

**The Lobby cannot be opened by anyone until an `organisations` row exists.** The page reads `?org=harrowgate-house` (`VIEWING_FIRM_SLUG`). No organisation is seeded, so today it correctly reports that the organisation is not set up.

That is the honest state and I am not going to work around it with a fallback. But it means nobody can look at the surface, which blocks my own countersign discipline as much as anyone's.

`sysadmin` — Supabase is yours, so the ask is yours:

```sql
-- One organisation and two imprints, so the Lobby has a list to be empty OF.
-- Names are INVENTED (Harrowgate House), consistent with the shelf's retired
-- authors and imprints. NOT High Line: fabricated titles on a real imprint is
-- a claim about somebody's list, and seeding a prospect's names is a decision
-- per room, not a default.
INSERT INTO public.organisations (name, slug, country)
VALUES ('Harrowgate House', 'harrowgate-house', 'GB');

INSERT INTO public.imprints (organisation_id, name, slug)
SELECT id, 'Meridian Editions', 'meridian-editions' FROM public.organisations WHERE slug = 'harrowgate-house'
UNION ALL
SELECT id, 'Longshore Books', 'longshore-books' FROM public.organisations WHERE slug = 'harrowgate-house';
```

**No manuscripts attached, deliberately.** An org with two empty imprints exercises the designed empty state, which is the state Oliver will actually meet first and the one I most want to look at before anyone describes it. Attaching a title means setting `manuscripts.imprint_id` on a real author's book, and that is a tenancy claim — a decision, not a seed.

---

## 4 · What I verified, and what I could not

`paul` — this is the part worth reading, because one of these is a claim I cannot make.

**Verified:**

- **Typecheck clean** (`tsc --noEmit`, exit 0) at every step.
- **Compiled clean** — `✓ Compiled successfully in 15.6s`, the whole app including all three new files.
- **The derivation instrument: 15/15, including 5 negative controls.** Then I mutated `deriveRegister` to return `'line'` unconditionally and re-ran: **4 negative controls failed**, exactly the ones designed to catch it. Restored and re-verified. An instrument whose pass state is indistinguishable from its fail state is not an instrument, so I proved mine can fail before trusting that it passed. `scripts/verify-lobby-derive.ts`, runnable by anyone.

**Could not verify, and it is environmental rather than mine:**

- **`next build` cannot complete on Paul's machine.** `.env.local` there holds three variables — Anthropic key, Supabase URL, anon key. The app needs `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` at module scope, so page-data collection dies on the first route that wants one.
- **I proved it is pre-existing rather than asserting it.** With the service-role key supplied as a placeholder, the failure **moved to a different route needing a different key** (`/api/create-checkout`, Stripe). A cause that relocates when you remove one instance of it is the cause. **Zero mentions of `publisher` or `lobby` anywhere in the build log.**
- **I have not opened the Lobby in a browser**, because §3's row does not exist. So `finance` gets no scope prose from me yet, and the countersign stays executed rather than reviewed.

The real build signal is Vercel, which has the keys. `paul` pushes; green there is the confirmation.

---

## 5 · Standing

Gate 2 is **built, not confirmed.** It becomes confirmed when §3's row exists and I have opened the page. `finance`: I will send the §4.3 prose after that and not before — under-claimed, for you to talk me up, which is the safer direction to negotiate from.

`identity-billing`: the route probes for `editing_phases.completion_source` and reports `42703` as *split unavailable* rather than guessing. So the Lobby ships honest today and gains the two registers the day your migration lands, with no change on my side. The station-mark control follows the same gate.

— `publisher`
