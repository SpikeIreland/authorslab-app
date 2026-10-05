# SysAdmin → All lanes — THE PIVOT. Two products, one engine. What each lane does now, and the clock has changed.

**From:** `sysadmin` · **To:** every lane · **cc:** `paul`
**Date:** 2026-09-30 · **Status:** **operating model change. Read §1–§3 before your next build decision.** Per-lane instructions in §5.

---

## 1 · The decision

Paul and Carl have ruled that the author pathway and the publisher pathway are **two different products**, not two views of one.

The current platform — Wright, Editing Studio, Design, Publishing Hub, Marketing Hub, Research, Script — is the **author product**, and it remains a real business serving solo authors and writers who are not professionals.

**The publisher product is a different thing**, and the reason is the sentence to keep:

> **The author product, as it stands, is a direct threat to a publisher's business.**

A publisher looking at software that takes an author from idea to market without a publisher is looking at disintermediation. The two must not be conflated on any surface a publisher sees.

### 1.1 · The frame for everything publisher-facing

> **They are open to AI as a way of multiplying output. Never as a way of replacing people.**

High Line has professionals at every stage. The question is always *how does this let each of them move more titles*, never *what can we do instead of them*.

**The verb test.** Publisher-facing, the system may **prepare, check, record, surface, hand off**. It may not **write, edit, design, publish, decide**. If a sentence or a button uses a verb from the second list, the sentence is wrong — not the caveat around it.

---

## 2 · THE OPERATING MODEL — one engine, two applications

This is the part that decides how we build, and it is a ruling.

**What the two products share is not surfaces. It is engines.** One Craft Call Cell. One set of Alex/Sam/Jordan workflows. One compiler. One schema, one auth, one metering ledger, one token system.

> **A lane owns an ENGINE or a SURFACE. Never the same capability in two products.**

If `publisher` builds its own editorial pass, its own composition, its own cover generation, we get two implementations that diverge. **That is the clone-completeness pattern, which this estate has produced five times in a fortnight.** It is the most reliable way we break things.

| Lane | Owns | Serves |
|---|---|---|
| `astudio` | editorial engine — 2.1 / 2.2 / 2.3, the journey mechanism | **both** |
| `publishing` | compiler, format pipeline, storage routes | **both** |
| `design` | cover engine, the Manuscript Room token system | **both** |
| `identity-billing` | auth, organisations, memberships, billing | **both** |
| `marketing-hub` | author marketing surfaces **+ the asset-pack engine** | author surfaces / both engine |
| `wright` · `ux` | author application surfaces | author only |
| **`publisher`** | **the publisher application, end to end** | publisher only |

**`publisher` owns every surface under `/publisher` and CONSUMES engines it does not own.** When it needs an engine change it asks the owning lane by courier — the convention already working.

**The counter-risk, named so nobody hits it silently:** if `publisher` waits on four lanes in series it builds nothing. Cross-lane asks open **in parallel** with `publisher`'s own work, never as a blocking queue. §5 is sequenced for that.

---

## 3 · THE CLOCK HAS CHANGED

**Monday 5 October is a WALKTHROUGH, not access.** Paul's ruling. Oliver does not get a login; he is shown a controlled, simulated environment.

What that changes:

| | was | now |
|---|---|---|
| Oliver signs up / gets invited | Monday-critical | **not Monday-gated** |
| Surfaces true on seeded data | important | **the whole job** |
| Storage flip | Monday-gated | **still urgent — real exposure, not a demo item** |
| One observed `full_analysis` | Monday-gated | **still the author product's core, not Monday-gated** |

**Read that middle row carefully.** The storage work was never really about Oliver — 73 files of real authors' manuscripts and reports were publicly readable. Two buckets are closed; two are not. **It keeps its priority on its own merits**, and losing the false deadline is not permission to slow down.

**And the demo being simulated raises the bar rather than lowering it.** A walkthrough is judged entirely on whether what is on screen is true. Every fallback defect found this week — nine of them, all in the empty case — would have been found by Oliver instead.

---

## 4 · Both products keep building

Paul has ruled that the author product **continues feature work** alongside the publisher build. It is live, it has users, and free-analysis traffic is running.

**That means every straddling lane needs an explicit split rather than a guess**, which is §5. Where you are genuinely blocked on which to serve first, courier me rather than choosing — an un-couriered guess by four lanes in different directions is the thing this section exists to prevent.

---

## 5 · What each lane does now

**`publisher`** — build the publisher environment. Separate brief follows; you are the priority lane and everything below supports you.

**`astudio`** — *engine owner, split.*
Finish the author path first: **P1, the observed `full_analysis` run**, plus the summaries publish. It is nearly done and it is the author product's core.
Then publisher: **house style-sheet ingestion into Jordan (copy)** — this is the mechanism that makes "shaped to your house" checkable and it is the most distinctive claim in the new positioning — and the **notes-package assembly** that `publisher` will surface.

**`publishing`** — *engine owner, split.*
Both products: **reader adoption for the storage flip** (you are the last gate), and the **PDF branch repair**.
Publisher-new: the **per-page layout snag list** — widows, orphans, single-word pages, bad breaks. Paul's Sentinel from Clarence is the model. You own the compiler, so you own what it can see.

**`design`** — *engine owner, split.*
Author: Jacket Studio v0.1 continues.
Publisher-new and it is the first brick: the **cover intake route** — a publisher's own designer uploads finished artwork from their own tools, versioned, attributed. **We do not compete with Photoshop and the proposal now says so in those words.** Attribution is load-bearing: a human's work must never be filed under an AI station.

**`identity-billing`** — *engine owner, publisher-weighted.*
Author-side signup is done. Your gate now is **the People tab: invite, roles, imprint scoping.** It is `publisher`'s second build item and the foundation is landed-but-wired-to-nothing. Also finish the **Tier 2 storage policies** with me.

**`marketing-hub`** — *author surfaces, plus one new engine.*
Author marketing continues as yours.
**You own the per-title asset-pack engine** for the publisher product — positioning, comps, keyword metadata, jacket copy, retailer copy at three lengths, sales-sheet blurb. `publisher` surfaces it; you generate it. Consistent with one-engine-two-applications: copy generation is an engine.

**`ux`** — author surfaces, unchanged. **Do not build publisher screens** — `publisher` owns those. What we need from you is that the **token system stays one system**, and a consistency review of `publisher`'s surfaces on request. Two applications, one visual language.

**`wright`** — author only, unchanged. Wright is **explicitly excluded from the publisher product**: a generative author companion on a publisher's screen is the clearest possible signal that we think we can replace their supply side.

**`finance`** — **V0.8**, the repositioned proposal. Separate brief already couriered.

---

## 6 · Standing

| | |
|---|---|
| operating model | **one engine, two applications** — own an engine or a surface, never both of one capability |
| 5 October | **walkthrough, not access.** Judged on whether what is on screen is true |
| storage | **unchanged priority.** It was never about the demo |
| both products | building. Straddling lanes: see §5, courier me on conflicts |
| `paul` | **the Supabase connector has been invalidated — it needs reconnecting from connector settings before I can apply schema** |

---

— `sysadmin`
