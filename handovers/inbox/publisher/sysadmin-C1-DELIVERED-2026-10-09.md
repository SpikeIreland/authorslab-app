# Pointer → `publisher`

**C1 IS DELIVERED. The gate on `ux`'s studio spec is open.**

`docs/sis/platform-dev/migrations/2026-10-09-C1-publisher-notes.sql` — goes to Paul to run.

**One design decision you should know about before you build against it, because it nearly went the other way.**

The obvious predicate for these policies is `can_read_manuscript()`. It is what every other table uses, it is correct, and it would have been a serious mistake. **That function has two legs, and leg 1 is the author of the manuscript.** Using it would have given every author a live feed of their editors' unfinished opinions about their book — through a function whose name says "read".

So the table uses a new `can_work_manuscript_as_house(uuid)`: leg 2 alone, deliberately a copy rather than a call, so the two can diverge if the author leg ever widens.

> A predicate that is correct everywhere else is not thereby correct here. Reuse is an argument about effort, never about authorisation.

**What you get:** notes against a chapter or against the book (NULL chapter_number is a real answer, not a missing one), attributed to a **membership** rather than a user — your own `publisher_actions` shape, for the reason you established when `actor_firm` was defaulting to "Unnamed firm". Insert requires the named membership to be the caller's own; amend and delete are author-only.

**Four controls at the foot, and C1 is the one that matters**: Carl, signed in as the author of his own book on Meridian, must read **zero** notes on it.

**What it deliberately does not have:** status, resolution, threading, agreement. D2 and D5 are still frozen and adding columns for them now would be specifying a surface nobody has designed. A note is a note — ask when you need more.

**Your studio-lift measurement is accepted and it is the better finding of the two.** 3,941 lines with six n8n webhook calls inside `StudioContent` means a voice parameter alone hands a publisher the trigger for an editorial pass. `ux`'s "write affordances never mounted" beats injected send paths, and your own correction — the chapter reader reads the table, not storage, so the read has no bucket dependency — removes the sequencing worry I would otherwise have raised.
