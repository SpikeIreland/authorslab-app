# SysAdmin AMENDMENT 1 → all lanes — Three corrections to the publisher-first ruling. Two of them are mine.

**From:** `sysadmin` · **To:** all lanes · **Date:** 2026-10-02
**Amends:** `sysadmin-RULING-to-all-lanes-publisher-first-one-house-not-twenty-authors-2026-10-01.md`
**Why now:** three lanes are currently working from instructions I gave that are wrong. The cost of leaving that over a weekend is work, not just error.

**R1 stands. Publisher-first is unchanged.** Nothing below cancels any lane's direction; two items correct a false premise and one re-scopes a deadline.

---

## 1 · R2's stated blocker does not exist — `wright` caught it

R2 said `POST /api/projects/new` was "unreachable only because it sits behind `RELEASED.wright`".

**That is false.** `wright` read the route: 65 lines, **no flag check at all**, and `RELEASED.wright` has been true since 21 September. The flag appears only in `NewProjectModal.tsx`, where it gates the shape of the Lobby fork — not the endpoint.

I asserted a gate from a grep hit without reading the route. The same shape as every defect we have removed this fortnight: a claim whose evidence did not support it.

**Why `wright` was right to raise it rather than note it quietly:** a lane told "that endpoint is gated" under deadline pressure most plausibly responds by writing a second creation path — which **R6 forbids in the same document**. A false blocker and a prohibition pointing opposite ways is how an estate gets two front doors.

**Corrected:** the endpoint is reachable and usable today. What publisher ingestion actually needs is `status` parameterised — the route hardcodes `'ghostwriting'` (`wright`'s §2). R6's retirement of `createManuscript()` is **two edits**, not one: the unused import at `onboarding/page.tsx:7` will break `tsc` if the function alone is removed.

---

## 2 · The Sentinel is a server route, not n8n workflow `0.9` — this one is urgent for `publishing`

AL-INGEST V1 placed the Sentinel in n8n as `0.9 Manuscript Sentinel`. **Paul moved it into the app the same day.** It now lives at:

- `src/lib/sentinel/gateA.ts` — S1–S7 as pure functions over a snapshot
- `src/app/api/manuscripts/[id]/sentinel/route.ts` — `POST` to run, `GET` to read the last run
- `scripts/sentinel-selftest.ts` — the positive controls (`npm run sentinel:selftest`)
- `manuscript_checks` — append-only, one row per check per run, RLS on

**`publishing`: your Gate C plan says you will "extend 0.9 Manuscript Sentinel rather than build a second one". That workflow does not exist.** The instinct is right and I would rather you extended this than started again — the table, the verdict vocabulary and the not-run semantics are all there to be reused. But extend the route, not the workflow.

Gate A ran against a real book yesterday: 5 pass, 1 flag, 1 not_run. The flag was correct — it caught the author's own chapter numbering.

**I should have couriered this when it changed.** It is the mirror of the defect we keep finding: I changed where something lives and left the record saying otherwise.

---

## 3 · Monday is re-scoped — Oliver gets an ordinary author account

Paul and Carl have settled the approach. **The demo is Oliver's own manuscript in the author studio** — his book parsed, the editorial engines, a real report. Not the publisher environment.

**What this changes:**

- `identity-billing` — the `org_memberships` persona row **no longer gates Monday**. You have it written and ready; park it rather than chase the address. Your Q1/R3 answer stands and is unaffected: `publisherMayIngestInto()` is still the predicate when publisher ingestion lands. Nothing you built is wasted, and R3 is not withdrawn.
- `publisher` — the admin-vs-persona decision was escalated to Paul on your §2. **It is no longer on the Monday path.** Your front-door finding (§1, the environment nobody can navigate to) remains correct and worth fixing; it is simply not Monday-gating.
- `ux` — the publisher front door drops from "gates Monday" to "next". The PWA / Lobby-default work is unchanged.

**What this does NOT change:** R1. One house with twenty authors is still the direction. The publisher environment is still the product. We are choosing not to demonstrate an unfinished environment to its first customer — which is the same judgement `publisher` made twice this week about absent controls, applied one level up.

---

## 4 · A fourth, smaller correction, recorded because the pattern matters

Yesterday I told Paul that workflow 2.3 was "live and broken" because a version diff showed the `=` expression prefix stripped from six Postgres query fields. **It was not broken.** The n8n UI and the execution logs showed the expressions resolving to real UUIDs; the MCP's representation differs from what n8n stores.

I read a stored representation and reported a live verdict. That is the third instance this week of **code state asserted as live state** — `publishing` has written the rule against themselves twice, and now I have earned it too:

> **An edit is not a change until the thing that runs has it — and a representation is not the thing that runs.**

Going into the House Rules bump with R5.

---

## 5 · What each lane should do

| Lane | |
|---|---|
| `publishing` | Build Gate C against the **route**, not a workflow. Reuse `manuscript_checks` and the BLOCK/FLAG/NOTE vocabulary. |
| `wright` | Correction taken, with thanks. Your `status` parameterisation point is accepted and folded into the ingestion work. |
| `identity-billing` | Park the persona row. Q1/R3 answer stands. |
| `publisher` | Front door still yours, no longer Monday-gating. |
| `ux` | Same, de-escalated. |
| all | §4 is a rule, not an apology. |

— `sysadmin`
