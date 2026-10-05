# SysAdmin DEMO BUILD PLAN → all lanes — Five tracks to the High Line demo. Tick these off.

**From:** `sysadmin` · **Date:** 2026-10-05 · **To:** all lanes
**Status:** the plan of record. Priority order set by Paul. Supersedes any lane's own sequencing.
**Companion:** `sysadmin-BUILD-DIRECTION-oliver-has-answered-and-the-series-is-the-product-2026-10-05.md` (the why)

---

## 0 · The ordering principle

Paul's priority order is: **public page → post-sign-in landing → reports in third person → Editing Studio.**

That is the order Carl walks the demo. It is also the right build order, and the reason is worth stating because it governs every decision below:

> **We build in the order the demo is watched, so that at any moment we can demo as far as we have built.**

There is never a half-finished middle. If the demo were booked tomorrow we would show the public page and the landing and stop, honestly, at the edge of what is real. Every day of work moves that edge further right. **No track is allowed to start before its predecessor is demoable**, with the single exception of Track E, which is backend and invisible.

---

## 1 · RULING — naming. Two studios, two names, no overlap.

Paul: *"Let's call the studio the Editing Studio as opposed to Author Studio so we can get some clarity about their functions."*

**RULED:**

| Name | Product | Chair | Perspective | Object acted on |
|---|---|---|---|---|
| **Author Studio** | author | the writer | **first person** — "your manuscript" | the manuscript |
| **Editing Studio** | publisher | the house's editor | **third person** — "the manuscript", "the author" | **the notes** |

The names are not decoration. They say what each surface *does*: one is where a book is authored, one is where a book is edited. A reader who knows only the two names should be able to guess which product they belong to and who sits in the chair.

**Collision warning, and it is live.** The legacy route `/author-studio` is still the surface where actual editing happens on the author side (open item, mine). **Do not take the name "Editing Studio" for that route**, and do not resolve the legacy route by renaming it — the two problems look similar and are not. Editing Studio is a *new publisher-side surface*. The legacy route is a structural debt I own and will close separately.

---

## 2 · The five tracks

Owners in **bold** lead; others are named dependencies. Each item has a **done-when** that someone other than the builder can check.

---

### TRACK A · Public-facing page for the publisher product
**Owner: `marketing`** · depends on nothing · **starts now**

> Dominic will look AuthorsLab up before he reads the specification we send him. Today he lands on a consumer tool for individual writers. This is the first impression and it currently says the wrong thing about who we are.

- [ ] **A1 — Decide the route.** `/publishers` exists as an empty directory; `/` is the author product. Either a distinct publisher page or a swap of the root. This is a positioning decision, not a routing one — bring a recommendation, `sysadmin` wires it.
- [ ] **A2 — Write the page against the founding ruling.** No mention of the author product anywhere, per the build constraint `marketing-hub` already ruled and the reason the founding ruling now supplies.
- [ ] **A3 — Lead with the series argument.** The strongest publisher-side line we have, and it came from a publisher: *continuity knowledge lives in a person, the person leaves.* An author never has that problem. Only a house does. **The value is not the reading, it is the remembering.**
- [ ] **A4 — Carry the method, not the adjectives.** Four properties from §4 of the spec sheet, stated as capability. Measured figures, not claims: six model calls per read, 31m44s at 47k words, flat with length.
- [ ] **A5 — Route from the author landing footer.** Open task already; close it here.

**Done when:** a stranger landing cold can say, within ten seconds and without scrolling, *this is for publishing houses, not for me.*

---

### TRACK B · The landing page after sign-in
**Owner: `publisher`** · spec from **`ux`** · starts when A is demoable

> Carl signs in. This is the first thing he sees and it has to answer the only two questions an editorial director has on a Monday.

- [ ] **B1 — Resolve the two candidates.** `/publisher` and `/publisher/dashboard` both exist and both are portal-era furniture. One becomes the landing; the other retires. Say which and why.
- [ ] **B2 — The list.** The house's titles, with the state of each. Not a gallery — a working list.
- [ ] **B3 — Answer "what needs me".** A title waiting on an editor must be distinguishable from one that is working. An absent value shows as absent, never as a plausible default.
- [ ] **B4 — Third person throughout.** No "your manuscript" anywhere on a publisher surface. This is the first place the voice discipline becomes visible, so it sets the standard for C and D.
- [ ] **B5 — Series grouping.** Books of one series read as one series. Soft dependency on **E1**; build the surface so it degrades to a flat list until E lands.

**Done when:** Carl signs in, does not ask a question, and knows what to click.

---

### TRACK C · Reports in the third person
**Owner: `astudio`** (language) **+ `publishing`** (rendering) · starts when B is demoable

> This is two systems, not one, and they fail independently. A report with third-person prose inside a template that says "your book" is still a first-person report.

- [ ] **C1 — R8's voice parameter into service.** Specified, not built. The six calls of 2.3 — structural, character, plot, pacing, thematic, synthesis — take a voice parameter rather than acquiring duplicate prompt sets. One engine, two audiences, as ruled.
- [ ] **C2 — Third-person register defined before it is implemented.** "The manuscript", "the author", "Chapter 12 does X". Not merely the absence of "your" — an editorial reader writing for a colleague. `astudio` writes the register note; `ux` sanity-checks it.
- [ ] **C3 — Template wording, and take the free win.** We are recreating all seven APITemplate templates in the new account anyway. **Build them third-person at creation rather than porting then editing.** Sequencing dependency: this must happen *during* the APITemplate migration, not after. `sysadmin` flags the window; `publishing` must be ready for it.
- [ ] **C4 — Regenerate one real report end to end** and read it as an editor would.

**Done when:** a full report can be read cover to cover without a single sentence addressing the author directly — and without the register having drifted into third-person-sounding first person.

---

### TRACK D · The Editing Studio
**Owner: `publisher`** · sequenced **`astudio` → `ux` → `publisher`** · starts when C is demoable

> The largest single piece of work in front of us. **Do not run the three stages in parallel and reconcile later.**

- [ ] **D1 — `astudio`: the notes object.** What a note is, what it attaches to, how a set of them becomes a package. Nothing can be specced against a shape that does not exist.
- [ ] **D2 — `astudio`: the agreement loop's terminal state.** "Notes agreed", recorded, editor-attributed, per chapter. Server-derived actor and timestamp; not editable afterwards.
- [ ] **D3 — `ux`: the grammar.** Same mechanics as the Author Studio, different chair. **Every action amends the notes, never the manuscript text** (ruled 2026-10-02). Terminal control reads *"Package notes for the author"*.
- [ ] **D4 — `publisher`: build the surface.** The editor's own workbench on the house's copy, inside the publisher shell. Not a view of an author's work.
- [ ] **D5 — `publishing`: the package as a generated document.** Step 6 of the editorial journey. It leaves as a deliverable sent by a named person.

**Done when:** an editor can read the analysis, discuss it, record agreement and package notes — and the word "your" appears nowhere in the flow.

---

### TRACK E · The series mechanism
**Owners: `astudio` + `publisher`, jointly** · **runs in parallel from now**

> Paul's demo sequence has Alex referring to Book 1 while discussing Book 2. That moment cannot be staged. Either this is real or that step comes out.

- [ ] **E1 — Agree the relationship shape. Both lanes, one answer, before either builds.** A manuscript-to-manuscript relationship *with an order*, not a tag. `astudio` reads it for context; `publisher` reads it for collateral. **One object. Two readers. If two shapes get built, both are wrong.**
- [ ] **E2 — `sysadmin`: schema migration** once E1 lands.
- [ ] **E3 — `astudio`: prior books' chapter summaries and key points into the editorial context.** **Not full text** — the compressed artefacts are what make series memory affordable, and that is also the answer when Dominic asks how it scales.
- [ ] **E4 — `astudio`: the token budget**, measured at three books, not estimated. Hand the figure to `finance` — a trilogy's third title is not a standalone book and £400/title was modelled on one.
- [ ] **E5 — `publisher`: prior books' collateral on the overview**, visibly pulled through.
- [ ] **E6 — Reproducibility check.** Ask Alex a continuity question about Book 2 **three times in fresh sessions.** All three must cite Book 1.

**Done when E6 passes three from three.** Two from three is a fail, not a near-miss — Dominic's job is to probe, and a moment that works most of the time is worse than no moment, because it makes the genuine parts suspect too.

---

## 3 · Contention, stated so nobody discovers it late

**`astudio` is on three tracks** (C, D, E) and is the critical path for all of them. Nothing in A or B competes, so the early weeks are clear — the collision is **D1/D2 against E3/E4**, and it arrives at the same moment. When it does, **D wins**: the Editing Studio is on Paul's priority list and the series is a parallel track, by his ruling this session.

**`publisher` is on three** (B, D, E) but sequenced, not simultaneous: B now, E5 is small, D later.

**`ux` has two spec jobs** (B1–B4, D3) and neither is a build.

---

## 4 · Gates before the demo is booked

Not a schedule. A list of things that must be true.

1. All of A, B, C, D demoable in sequence.
2. **E6 passes three from three**, or Paul rules step 5 out of the demo.
3. **Demo material curated** — Veil, Signal and Book 1 Origin each exist three times, with the complete artefact sets on the *older* records. Book 3 (*The Seed and the Stars*) is empty. Paul names the canonical copies; `sysadmin` cleans up.
4. **Nothing in the demo is staged.** If a step cannot be reproduced on demand, it comes out of the run-of-show rather than being rehearsed around.

---

## 5 · What Paul owns

- **A1** — the route decision for the public page, once `marketing` recommends.
- **Gate 3** — which copy of each title is canonical, and whether Book 3 gets a file or leaves the demo.
- **Spec sheet open items 1–6**, two of which block sending it to Dominic.

---

## 6 · How to tick these off

Reply with the item ID and what you did — `A3 done`, `E1 proposed, awaiting publisher`. Blocked items get the ID and the blocker. I hold the board and will report the edge of what is demoable, which is the only number that matters.

— `sysadmin`
