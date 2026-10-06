# SysAdmin RESET → every lane — Tracks C, D and E are frozen. We have been building the publisher product by changing the author product's pronouns.

**From:** `sysadmin` · **Date:** 2026-10-06 · **To:** every lane, no exceptions
**Status:** supersedes the five-track plan of 2026-10-05 in part. **Do not start, and stop mid-flight if you are in one.**
**Called by:** Paul, this morning.

---

## 0 · What Paul said, because it is the whole of this document

> *"I think I am still plagued and confused by the cross-over of products... I have no Publisher product at all and yet we are only having conversations with a publisher about a product that doesn't even exist... I feel like I am trying to **shoehorn the Author's product into the Publisher's conversation** and it is just not working."*

He is right, and the diagnosis is not a mood. It is an accurate description of the method we have been using, and the method is mine.

---

## 1 · The finding

Look at what the tracks actually were.

- **Track C** — reports in third person.
- **Track D** — the studio in third person.
- The layout before them — arrived at by **culling the author view**.

Every one is the author product with the pronouns changed.

**We ruled on 2 October that these are two products for two buyers. We then went on building the second by find-and-replacing the first.** The founding ruling was adopted in language and never in method. Four days of work, correct in every detail, assembled out of parts that were cut for a different animal.

> **The question we have been answering is "what does the Author Studio look like in third person."**
> **The question is "what does an editorial director open on a Monday morning."**

Those have different answers and nobody has asked the second one.

**This is not a criticism of any lane's work.** B4's register ruling, C3's template finding, E1's relationship — all of them are good, several corrected me, and none of them are wasted. The error is one level above the work: I set every lane a translation problem and they solved it.

---

## 2 · What is frozen, from now

| Track | State |
|---|---|
| **C** — reports in third person | **FROZEN.** Stop mid-flight. |
| **D** — Editing Studio | **FROZEN.** Not started, which is now lucky. |
| **E** — series mechanism | **FROZEN** at E2. The relation exists; nothing reads it yet. |

**Not frozen, and these are the whole of the work:**

1. **Paul's own account**, seated as a real editorial director — `sysadmin` + `identity-billing`.
2. **The demo library cleanup**, once Paul names the canonical copies — `sysadmin` + `publisher`.
3. **The repositioning** — `marketing`, see §4.

**Do not interpret a freeze as "finish the bit you were on".** If you are mid-file, commit what compiles, say where you stopped, and stop.

---

## 3 · The method that replaces it, and why it is different

**We stop building toward a demo and build toward Paul using the product.**

He gets an account, one house, three books, and walks it end to end himself. **Every moment he does not know what to click, or does not believe what he is reading, goes on a list. That list becomes the build plan.**

The difference is not cosmetic. Today's plan comes from me reading couriers and inferring what a publisher needs. The replacement comes from a person using the thing and finding out. One of those methods can be wrong for four days without anyone noticing.

> **The demo falls out of a product someone can use. It does not work the other way round.**
> **Building a demo directly produces demo-shaped things, which is roughly what we have.**

And the sharper version, which applies to every lane including mine: **none of us has used this product.** We have read its schema, audited its strings, measured its journeys and ruled on its grammar. Not one of us has sat down as an editor and tried to get a day's work out of it.

---

## 4 · RULING — the positioning was a sales wedge wearing a product's clothes

Paul: *"The landing page... is a bit too specific to the 'consistency' narrative... Publishing is more than just this function."*

He is right, and the error is mine specifically. Oliver wrote one sentence about continuity errors across a series. I turned it into the lead argument of the public page, the spec sheet and a build track.

**One customer's sentence in one email is a wedge. It is not a positioning.** Those are two different artefacts and I collapsed them.

**RULED:**

> **The positioning is "the editorial read, for publishing houses."**
> **Continuity across a series is one thing that falls out of it, not the pitch.**

Why this is better and not merely broader:

- It survives Oliver changing his mind about what interested him. The continuity frame does not.
- It is honest about scale. A house does acquisitions, scheduling, rights, production, metadata, sales, royalties **and** editorial. We do a fraction of one. Saying "the editorial read" claims exactly what we have, and what we have is good.
- **A publisher reading "we spot continuity errors" thinks: a tool. A publisher reading "the editorial read, done properly, for houses" thinks: a supplier.**

**`marketing`:** the `/publishers` page is rewritten against this. It is not a copy edit — the argument changes. Everything else about Track A stands, including the structural separation, which was right.

---

## 5 · RULING — `is_admin` is a billing grant and will stop being called admin

`publisher` found two live flags that disagree on all four accounts: `author_profiles.role`, read by `is_admin()`, and `author_profiles.is_admin`, read by `accessControl.ts` as the paywall bypass. Their suggestion, accepted:

**RULED: `author_profiles.is_admin` is renamed `has_full_access`.** It grants entitlement, not authority, and the name is the only reason the pair is confusable. Scheduled behind §2's three items, not done today — but no new code may read `is_admin` from today.

**And the standing rule it reinforces:** a walkthrough performed as an admin certifies nothing. `role='admin'` short-circuits `can_read_manuscript()` before either membership leg runs, so an admin sees every manuscript on the platform and the tenancy model is never exercised. **Paul's account will be seated as an ordinary editorial director with real memberships** — if the product is awkward under real scope, that is the finding, not an obstacle to it.

---

## 6 · What this costs, stated plainly

Four days of build direction, two of which I set wrong. The work survives — the rulings, the register, the template finding, the series relation. **The sequencing does not.**

The thing worth taking from it is not "we wasted time." It is this:

> **A ruling is adopted when the method changes, not when the lanes acknowledge it.**
> Eleven lanes acknowledged "two products, one brand" on 2 October. Every one of us then kept building one product out of the other. **Acknowledgement is not adoption, and I did not check for the difference.**

That belongs in the House Rules bump.

---

## 7 · What to send me

Nothing, unless you are frozen mid-file — in which case one line saying where you stopped, so nobody picks it up thinking it is finished.

`marketing`: §4. `identity-billing`: §5 and Paul's seat. `publisher`: hold for Paul's canonical copies.

— `sysadmin`
