# AuthorsLab — System Specification

**Prepared for:** Dominic, IT Strategy (fractional), High Line Publishing · cc Oliver Malcolm
**From:** AuthorsLab · a Spike Island Studios company
**Date:** October 2026 · **Status:** DRAFT — see §9, items for Paul before this is sent

---

## 0 · What this document is

A technical description of how AuthorsLab works, where data goes, and what we do and do not yet have. It is written for someone whose job is to find the problems.

Where something is not built, it says so. Where something is unresolved, it says that too, with the date we expect to resolve it. **A specification that only contains good news is a brochure**, and we would rather hand you something you can argue with.

---

## 1 · Two products, one brand

AuthorsLab is two discrete products that share a brand and an engine, and nothing a user can see.

- **The author product** — individual writers, working on their own book.
- **The publisher product** — a publishing house's working environment. This is what High Line would use.

They do not meet. No shared navigation, no shared screens, no cross-product messaging. A High Line editor never sees the author product; High Line's authors are not platform users. Editorial output reaches an author as a **document**, sent by a named person at the house.

Below the waterline they share one engine, one model-access layer and one schema — invisible to both kinds of user.

---

## 2 · The method: an LLM is an unreliable industrial component, not an oracle

This is the part we think is genuinely unusual, and it is the reason a publishing house can put unpublished manuscripts through it.

Most AI products call a model and display the answer. We treat a model call the way a factory treats a machine on a line: it has a job number, a defined duration, an expected output, and an inspector that did not build the part.

**Four properties, all live today:**

**1. Every model call is a job with a record.** Not a request that either returns or does not. Each run is registered before it starts, carries a timeout, and ends in an explicit terminal state — ready, failed, or timed out. A run that never finishes is detected and recorded rather than quietly disappearing. The record exists independently of whether anyone's browser is open.

**2. One door to the model.** All model access goes through a single component, which records the model used, token counts and cost per call. There is no second path and no ad-hoc call anywhere in the system.

**3. Every output is checked by something that did not produce it.** A verification layer re-derives what the output *should* contain from the source material and compares. It is deliberately independent: it never asks the component that did the work whether the work was done. Each check cites the rule it enforces, and each one ships with a control that makes it fail on demand — a check nobody has watched fail is not known to work.

**4. When we cannot do something properly, we refuse.** We do not approximate, and we do not present a degraded result as a complete one. Where a feature is unfinished the interface says so rather than offering a control that appears to work.

**Underneath all four: nothing on screen may claim more than its evidence supports.** A completed station shows who completed it and whether it was a person or the system. An absent value is shown as absent, never as a plausible default.

---

## 3 · Evidence, from your own manuscript

We would rather demonstrate §2 than assert it.

**The system found an error in *The List* that we did not put there.** On ingestion it reported that chapters 19, 47 and 78 are labelled 20, 48 and 76 in the source file. It loaded all 80 chapters, flagged the discrepancy, and said which. No content was lost and nothing was silently corrected.

**It also refused a file.** An earlier PDF of the same manuscript decoded its fonts incorrectly — every "fi" and "fl" rendered as a digit, 646 affected words. The text was perfectly legible and completely wrong. Rather than analyse it, the system now detects that signature and rejects the file, naming the Word document as the alternative. **A corrupted manuscript that looks fine is worse than a rejected one.**

Both are the same principle: the system reports what it found, including when what it found is inconvenient.

---

## 4 · Architecture

| Layer | What it does | Provider |
|---|---|---|
| Application | Publisher and author interfaces | Next.js on Vercel |
| Database & storage | Manuscripts, chapters, records, generated artefacts | Supabase (PostgreSQL 17) |
| Orchestration | Editorial pipelines, job records, retries, timeouts | n8n |
| Language models | Editorial analysis | Anthropic |
| Document rendering | PDF reports | APITemplate.io |
| Transactional email | Notifications | Resend |

**Isolation.** Row-level security is enforced in the database rather than in application code. A request carries the identity of the person making it, and the database decides what that identity may read. A publisher's titles are scoped to their organisation and imprints; there is no application path that can widen that.

**Auditability.** Editorial decisions are recorded with an actor and a timestamp, server-derived rather than supplied by the client, and are not editable afterwards.

---

## 5 · Data

### 5.1 Model training — the question we expect first

**Content submitted to AuthorsLab is not used to train models.** We use Anthropic's commercial API, which does not train on API inputs or outputs.

> **[PAUL — §9.1]** This must be stated against the current Anthropic commercial terms and quoted precisely, not paraphrased from memory. It is the single most important sentence in this document for a publisher.

### 5.2 Where data resides — current state, stated plainly

| Component | Region today | Holds manuscript content? |
|---|---|---|
| Supabase (database + storage) | **Singapore (`ap-southeast-1`)** | **Yes** |
| APITemplate (PDF rendering) | **Singapore (default endpoint)** | Transits during render |
| Anthropic | Per provider terms | Transits during analysis |
| Vercel, n8n, Resend | *to confirm* | *to confirm* |

**We are moving to EU/UK.** Both Supabase and APITemplate offer European regions. APITemplate is an endpoint change and is being folded into migration work already scheduled. Supabase requires a project migration rather than an in-place region change, which is real work and is being costed rather than promised.

We are telling you this before you ask because the alternative — migrating quietly and then claiming EU residency — is the kind of thing that should cost a vendor your trust.

> **[PAUL — §9.2]** Target date once Supabase migration is costed.

### 5.3 The Data Map

We maintain a live map showing every service that touches data, where it physically sits, whether data rests there, and the classification of each hop between them. It is an operational instrument, not a diagram — it reflects the present state, including the parts we are mid-way through changing.

> **[PAUL — §9.3]** Built for Clarence; to be populated for AuthorsLab. Decide whether to show it at the next session — my recommendation is yes, Singapore and all.

### 5.4 Retention, deletion and export

Manuscripts, chapters and generated artefacts persist for the life of the account. Deletion removes the manuscript and its dependent records.

> **[PAUL — §9.4]** Export and exit are not built. A publisher will ask what they keep if they leave. Needs a position before this is sent, even if the position is "specified, not built".

---

## 6 · Integration

Today AuthorsLab is a self-contained environment: there is no public API, no webhook surface and no SSO. Nothing here plugs into High Line's systems, Hachette's, contracts or royalties — it runs alongside what you have.

Oliver mentioned you are building High Line's IT infrastructure. We would rather design the integration surface against what you are actually building than guess at it, so we would treat the shape of that as a conversation rather than a specification.

---

## 7 · Assurance

**We hold no certifications today.** We are engaging **Sprinto** to pursue **SOC 2** and **ISO 27001**, beginning with our sister product Clarence and extending to AuthorsLab.

> **[PAUL — §9.5]** Confirm which standard first, and indicative timing. "In progress with a named platform" is a real answer; "we're looking into it" is not.

---

## 8 · What we do not have yet

Stated here so you do not have to find it.

| | |
|---|---|
| SOC 2 / ISO 27001 | Not held. In progress (§7). |
| Data processing agreement | Not drafted. |
| EU/UK data residency | Not yet. Migration planned (§5.2). |
| Public API / webhooks / SSO | None (§6). |
| Export and exit tooling | Not built (§5.4). |
| Series continuity across titles | **The artefacts exist for every book; the cross-title mechanism is the next thing we build.** Oliver's offer of a second title in the series is exactly how we would prove it. |
| Design, production and marketing stations | Framework present, not in service. Phase one is editorial. |

---

## 9 · Items for Paul before this is sent

1. **§5.1** — quote Anthropic's commercial terms precisely. Most important line in the document.
2. **§5.2** — Supabase migration cost and target date.
3. **§5.3** — populate the Data Map for AuthorsLab; decide whether to show it.
4. **§5.4** — a position on export and exit.
5. **§7** — Sprinto: which standard first, indicative timing.
6. **Confirm regions** for Vercel, n8n and Resend — three unknown cells in §5.2.
7. **Decide** whether to include the fuller version of §3 — we traced a defect in our own output, found the underlying analysis had never been stored, recovered it and corrected the write path. It is a stronger demonstration of instrumentation than either example given, and it is an admission. My view: a technical evaluator trusts a team that finds its own faults more than one that claims none. Yours to weigh.

---

*AuthorsLab · a Spike Island Studios company · authorslab.ai*
