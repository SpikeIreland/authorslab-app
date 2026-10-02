# Oliver's account — SAY / DON'T-SAY-YET

**For:** Carl (primary contact), ahead of giving Oliver Blair a working account
**From:** `sysadmin` · **Date:** 2026-10-01
**Doctrine:** SIS Doctrine V1 §2.10 — honesty is the interface. Live things in present tense, in-flight things in roadmap tense.
**Purpose:** so the email, the conversation and the screen all say the same thing. A claim that survives the email and dies on the screen costs more than the claim was worth.

---

## 0 · The one-line frame

> This is the editorial phase of the platform, working, with your own manuscript in it. The house-level view — your imprints, your staff, your whole list — is in build, and this account does not have it.

That frame is worth saying early and once. Everything below sits inside it.

---

## 1 · SAY — verified today, 2026-10-01

Each of these was measured, not assumed. Where it was measured on Oliver's own manuscript, that is noted — those are the strongest things we can say.

| Claim | Evidence |
|---|---|
| **We read the whole book, not a sample.** | Full manuscript text is what the engine receives. 63,273 words read in one pass. |
| **His book is loaded and complete.** | *CS The List* — **82 chapters** including prologue and epilogue, no gaps, no empty chapters. |
| **Alex produced a developmental analysis and a PDF report.** | 23-page report generated and emailed on completion. |
| **It takes about 30–40 minutes for a book this size.** | Measured: **31m 20s** on his manuscript. Say the real number. |
| **You can close the laptop.** | Completion is recorded server-side; the author gets an email and an in-app notification whether or not the tab is open. Verified end to end today. |
| **Three editorial engines, not one.** | Alex (developmental), Sam (line), Jordan (copy) — each a separate pass. |
| **The system checks its own ingestion and reports what it finds.** | The structural quality check runs after loading and flags anomalies. |
| **It found something in his own manuscript.** | Chapters 19, 47 and 78 are labelled 20, 48 and 76 in his file. All 80 chapters loaded; the system noticed and said so. |
| **Word documents are preferred; bad PDFs are refused rather than loaded.** | A PDF whose fonts decode incorrectly is rejected with an explanation, not silently ingested. |

**The numbering catch is the single best thing to show him.** It is his own file, it is a real finding, and it demonstrates the claim in the proposal — *"provably ready, or provably not, with a list of exactly what is missing"* — better than any feature tour. It also shows the system telling the truth about input it was given, which is the trust question underneath everything else.

---

## 2 · DON'T SAY YET — real, in build, not in this account

Roadmap tense. None of this is in Oliver's account and he should hear that from us before he finds it.

| Not yet | What to say if it comes up |
|---|---|
| **Organisations, imprints, staff seats** | "In build. This account is a single-author workspace so you can see the editorial engine working. Your house, your imprints and your team's access are the next piece." |
| **The list view across a whole list** | "Built for the publisher environment, not in this account — you have one title here, not forty." |
| **Editor review-and-release** — a named High Line person signing off a notes package before it reaches a writer | "In build, and it is non-negotiable before any author sees our notes. Right now nothing is released to anyone." |
| **Observe / Assist / Operate switches** | "Specified, not built. Settings are changed with us until they ship." |
| **House style sheet enforcement** | "We can hold your style sheet; enforcing it inside the editorial stations is in build." |
| **Design, Publishing and Marketing stations** | "Held deliberately. Phase one is editorial." |
| **Production and handoff to Hachette** | "Phase two, and we would rather build it to your real requirements than to our guess." |
| **Target dates and the overdue/at-risk measure** | "Publisher environment — not in this account." |

**Do not demonstrate a tab that leads to a placeholder.** Before Oliver gets in, the Design / Publishing / Marketing flags should be set back to held, so the journey strip reads **Alex → Sam → Jordan**. That is exactly phase one as sold, and it removes the risk of him clicking into an empty room. (`src/lib/feature-flags.ts` — the restore the Blair demo deferred.)

---

## 3 · Rough edges he may hit — say it first

He is going to try to load a manuscript himself. Better he hears this from Carl than discovers it.

| Edge | What to say |
|---|---|
| **Upload runs through an author's onboarding flow** — asks for a profile photo, genre, chapter count | "That path was built for individual authors. A publisher-shaped way in is the next thing we are building, and you are the reason it is shaped the way it will be." |
| **A chapter list screen appears between upload and the studio** | Transitional. Being removed. |
| **The read takes 30–40 minutes** | Say it upfront. It reads the entire book; that is the point, and it is why it is not instant. |
| **One chapter in his book has no summary** | Chapter 6, 175 words — the shortest in the manuscript. Known, logged. If he spots it, acknowledge it rather than explain it away. |

---

## 4 · ~~Hold until verified~~ — **CLEARED 2026-10-02**

The hold was: do not send the Alex PDF, because its cover read **"≈0 words"** on a 63,000-word novel.

**Resolved and verified.** The re-rendered report reads **≈63,273 words**, carries its cover heading, and the header and footer now sit correctly on the page. **The report is sendable.**

Recorded because what the hold uncovered was worse than the symptom: `manuscripts.full_analysis_text` held the literal string `"undefined"` — nine characters. The storing node read `$json.text` where the engine emits `$json.output`, so the analysis had never reached the database at all. The PDF was fine because it is built from the engine's output directly. Recovered in full (56,457 characters) from the execution record, and the write path corrected so the next manuscript stores it first time.

**Still true of one other title:** *The Veil and the Flame* carries the same `"undefined"`. Not in Oliver's account and not a risk to this demo, but it will fail the same way if anyone re-renders it.

---

## 5 · What Oliver's account should contain

- One author account, his own credentials.
- One manuscript: *CS The List*, already parsed — 82 chapters.
- Journey strip limited to Alex / Sam / Jordan.
- Nothing else. An empty Library with one book is honest; a Library with our test titles in it is not.

---

## 6 · The two sentences to avoid

**"The monthly fee covers setup."** It does not, and the proposal says otherwise — £750 buys the whole platform, the full list, every seat, every imprint. Reframing it as setup invites "so what do I pay for afterwards?" and turns a platform fee into a services fee. Setup effort explains *why phase one takes time*; it does not justify the price.

**"You'll be able to do X" — about anything in section 2.** Everything there is real and planned. None of it is in his hands this week. The difference between "in build" and "available" is the whole of our credibility with a publisher who has been sold infrastructure.

---

*Section 1 verified by measurement on 2026-10-01. Section 2 is drawn from the owning lanes' own reports, not inferred.*
