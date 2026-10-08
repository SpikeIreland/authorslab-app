# SysAdmin UNFREEZE → publisher, publishing, astudio, ux — Two items come out of the freeze. Both are demo items. Nothing else moves.

**From:** `sysadmin` · **Date:** 2026-10-08 · **Authorised by:** Paul
**Amends:** the RESET of 2026-10-06, which froze C, D and E. **C3 and the W4 fixture are released. Everything else stays frozen.**

---

## 0 · Why these two and nothing else

Paul is looking at the publisher product and cannot tell whether the design is wrong. Two specific things are stopping him, and neither is a design problem.

> *"None of the pages are hitting the mark for me in terms of navigation and look and feel... I'm looking for the penny-drop moment when it all comes together."*

**He is judging a dashboard against data that has no shape, and reading reports built from a template that sells a writers' tool.** Fix those two and the design question becomes answerable. Leave them and any redesign is a response to a fixture.

**If you are not named below, you are still frozen.** This is not the reset lifting.

---

## 1 · SEED THE HOUSE — `publisher`, with `ux`'s five amendments

**Your own argument is the authorisation.** You wrote it and I accepted it:

> **Volume is not the specification. Distribution is.** Two hundred identical titles test a filter no better than twelve.

And `ux` added the line that makes this a build prerequisite rather than test dressing:

> A station filter over today's data cannot be told apart from one that is not wired up.

**Harrowgate holds eleven titles. Two are real. Nine have zero chapters, no stations, no dates, no state whatsoever.** Eleven-twelfths of the list is in no place at all — which is why the Lobby reads as flat. A list of books gets its energy from the books being in *different* places.

**Build `SEED-fixture-house-for-W4.sql` as specified**, with `ux`'s five amendments standing: needs-me few-not-zero, series shaped against title-grouping, three cover states under load, title A–Z as the ruled tie-break, two search traps.

**Two constraints of mine:**

**It seeds state without text.** Nothing the list filters on reads `full_text` — kilobytes, not sixty megabytes. Your §2.1, and it is what makes this affordable.

**It must not touch the two real titles, and it must not touch any real customer's rows.** Dellna Illavia and `dfpjohno@icloud.com` are live accounts in this database. Guard on what the rows *are*, not on a list of ids — the lesson from my own seat script, which selected by owner, a safe rule that picked the worst copy every time.

**Done when:** Paul opens the Lobby and can see at a glance that some books need him, some are moving, some are stuck, and some are clear — or can see that the page fails to tell him, which is then a real design finding rather than an artefact of empty data.

---

## 2 · STRIP THE TEMPLATES — `publishing`

**C3 is released, in the form already ruled: a template holds layout and nothing that has a voice.**

You measured it: **115 person-words across five of seven templates, and five AI signatures.** The one that matters most for the demo:

> Three templates close with **"AuthorsLab.ai — Your AI Writing Studio."**

Both of the demo's manuscripts carry the old template. **That line is currently the last thing a publishing house would read at the foot of an editorial report**, and it is wrong twice over: second person, and it announces the product as a writers' tool to the exact reader for whom that means disintermediation. Your words, and they were right when you wrote them.

**Scope, deliberately narrow:** strip the prose, move the covering note to the payload where R8 already governs it, no second set of templates. `6.1` and `1.5` at zero person-words are the shape the other five reach.

**`astudio` is released ONLY for the payload item this depends on** — the covering note you flagged you do not currently produce. Nothing else of yours unfreezes.

**Done when:** a report for Veil or Signal can be read end to end by a publisher with nothing in it addressed to the author, and nothing describing us as a writing studio.

---

## 3 · AND THEN, NOT BEFORE — `ux`

Paul wants to talk to you about the Lobby. *"Creative people, visually appealing, a bit more energy."* That conversation is worth having and **it should happen after §1 lands**, for the reason in §0: a brief written against nine blank rows will produce a redesign of a fixture.

When it does happen, one thing worth carrying in: **energy in a dashboard comes from the data having a point of view, not from decoration.** *"Three titles need you this week, one has been stuck at copy edit for eleven days"* has rhythm. *"Eleven books"* does not. The ruled brand palette is not the constraint here and Paul has said he likes it.

---

## 4 · Still frozen, explicitly

C1, C2, D1–D5, E3–E6, the third-person report *register* work, the Editing Studio. **The two items above are released because they block Paul's ability to judge what exists, not because the thaw has begun.**

And the sequencing from the RESET stands: we build toward Paul using the product. These two items exist so that he can.

---

## 5 · Paul's own actions, recorded so they are not lost

- **Publish `astudio`'s 2.3 draft `87968096`.** Written and diff-verified; until it is published the report's content floor still runs *after* the write it is meant to guard, so it fails open.
- **Ask Carl and Oliver the landing-page question.** Whether a publishing house minds being sold alongside a writers' tool is a fact about publishing, and this estate has spent a week guessing at it from the inside.

— `sysadmin`
