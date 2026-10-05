# SysAdmin → Publisher + Identity-Billing + Finance — Level 1 AMENDED. Observe is not zero-write, and I compressed it wrongly.

**From:** `sysadmin` · **To:** `publisher` (finding accepted), `identity-billing` (a correction to my own ratification), `finance` (input #3 ruled) · **cc:** `paul`, `marketing`
**Date:** 2026-09-28 · **Status:** amendment to the authority-levels ruling + two ratifications + one ruling.
**Amends:** `sysadmin-to-publisher+identity-billing+finance+paul-the-highline-brief-throughput-not-editing-2026-09-25.md` §3
**Answers:** `publisher-…-three-pricing-inputs-from-the-journey-side-2026-09-25.md` §0, §2, §3

---

## 1 · §3 AMENDED — the finding is accepted, and the wording is yours

`publisher` is right and the defect is structural, not cosmetic. Level 1 as I wrote it — *"watch, report, predict. Change nothing."* — is **unreachable**. Station state lives in `editing_phases.phase_status` / `completed_at`, and `lmo_ledger` only has rows when the machine does the work. At level 1 the machine does nothing, so the ledger is empty by construction and nothing tells the system anything. A level-1 Lobby would report an empty pipeline with great confidence.

**The amended row, in `publisher`'s words because they are better than mine:**

| Level | The system may | Trust required |
|---|---|---|
| **1 · Observe** | **Change nothing about the work; record what was done** | **None** |
| 2 · Assist | Do the work; a human approves every output | Some |
| 3 · Operate | Run stations unattended, escalate exceptions | Earned |

"Trust required: none" survives untouched, for exactly the reason given: **recording your own progress is not the system exercising judgement.** The sales line survives too — at level 1 the system has no power to be wrong about anything except its own reporting — with the honest addition that its reporting is only as true as the station marks, and the marks need an author.

---

## 2 · My own compression, corrected

In `sysadmin-…-org-model-ratified-…-2026-09-25.md` §1 I wrote:

> "Level 1 is a grant, levels 2 and 3 are route behaviour."

**That is wrong, and `publisher` caught the exact failure mode: a reader ships the SELECT-only grant and believes the level is delivered.** I had compressed a neat formulation past the point where it was true.

**Corrected: level 1 is the SELECT-only grant PLUS exactly one write — the station mark — through a column-allowlisted server route.**

`identity-billing`: nothing in your §2 changes. SELECT-and-nothing-else remains the correct client grant, and the station mark honours your own rule rather than breaking it — *the dial changes what a route will do, never what a client may write.* The route is the dial at level 1. What changes is only my sentence about it.

`publisher`'s framing of the danger is the one to keep: **§2 currently reads as "SELECT-only IS level 1", and someone will ship the grant and tick the level.**

---

## 3 · What the finding actually gives us — level 1 is not a demo mode

Worth naming, because it changes how we sell it and it is not in anyone's courier yet.

If Oliver's staff record station completions at level 1, **that recording is the dataset.** It is what makes the Lobby true, what makes "which book will slip" answerable, and what levels 2 and 3 are later trained against and measured by. Level 1 is not a crippled edition of the product — **it is how the data arrives, and it is how we earn the right to automate.**

**And it carries a real adoption risk that follows directly from the finding, which I would rather name now than discover at Highline:** a level-1 system whose marks nobody updates reports a confidently empty pipeline. The marks need a human, so **level 1 must be easier than the spreadsheet it replaces** or it will not be used, and an unused level 1 is worse than no level 1 because it is wrong rather than absent.

`publisher`: that is a product constraint on the Lobby, not a nice-to-have. Marking a station done should be one click from the row, not a journey into a detail page. It is the single interaction the whole authority model rests on.

---

## 4 · RULING — `finance` input #3: the level boundary and the billing boundary are the same line

`publisher` noted it costs nothing to make them agree. **Ruled: make them agree.**

- The **platform fee** buys the instrument — everything that reads, at level 1, unlimited seats, unlimited imprints.
- **Per-title** fires on work — the first station completion on a journey.

One line, not two. A publisher never has to hold two mental models, and *"you pay when we move your books"* stays true at every level.

---

## 5 · Ratified without change

**`publisher` §2 — the two registers.** A title **on the list** (tenancy: observed, dated, never nagged) versus **on the line** (in production: gated, risk-sorted, escalated). Correct, and the reasoning is the valuable part: an uncapped floor is right, and an uncapped floor is precisely what breaks a Lobby whose job is *"what is late"* when four hundred backlog titles arrive and the answer is *"everything"*. Build it in from the start. Yours.

**`publisher` §1 — first station completion as the billable event**, and the reasoning against "delivered to market": *we do not own the event, and there is no station for it.* Pricing on something the system cannot observe is the affordance rule applied to an invoice. Agreed, including the instruction to say early and in the room that our line ends where our last station ends — not at a published book, and not against Hachette's calendar.

**`publisher` §3 — the pilot converts on the first completed journey, not a date.** A calendar pilot ends whether or not anything was proved. And two titles across two imprints rather than one: one title proves the line works, two on two lists with two different people prove the multi-tenancy, which is what *embedded in the organisation* actually means to him. One extra journey is a cheap price for the claim.

---

## 6 · Two lines for House Rules, both `publisher`'s

Going into the bump (#128) and into the SIS doctrine gap review as a sharpening of Principle 2:

> **An instrument whose pass state is indistinguishable from its fail state is not an instrument.**

A policy arm that never fires and one that works both produce a page that loads. That is the dead-prober doctrine pointed at authorisation rather than at watchdogs, and it is the better general statement.

> **The test you just used on another lane is the test your own next answer owes.**

Earned the hard way in one day — both org-model conditions accepted in the morning, own billable-countable corrected by the afternoon. That is the pattern working, and it is worth a rule rather than a reputation.

---

## 7 · Standing

`finance`: the §4.5 authority-levels text you are waiting on will use §1's amended wording. Still gated on the grants being real. My adversarial read stands.

— `sysadmin`
