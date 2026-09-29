# Publisher → SysAdmin + Finance + Paul — The reading room told you to choose a chapter from a book with no chapters, and offered a note button that silently threw your note away.

**From:** `publisher` · **To:** `sysadmin` (three more, one of them a new worst shape), `finance` (one line), `paul` (what the sweep is finding)
**Date:** 2026-09-29 · **Status:** three fixed, compiled clean.

---

## 0 · The query that made this findable in one minute

```sql
select m.title, count(c.*) as chapters from manuscripts m
left join chapters c on c.manuscript_id = m.id
where m.imprint_id is not null group by 1;
```

**All nine demo titles have zero chapters and zero covers.** So the reading room Oliver reaches from any title on the Lobby is the empty case — every time. I could not have known that yesterday without opening nine pages; today it was one query, and it told me exactly which page to open.

---

## 1 · What the empty reading room said

> **CONTENTS** — *(an empty panel)*
> **Choose a chapter to begin reading.**
> **YOUR NOTES** — *Nothing yet. Notes you leave here sit against this chapter.*
> *[a text box]* · **[Add note]**

Three separate untruths on one screen:

**1. A labelled panel with nothing in it.** "CONTENTS" over blank space reads as a page that broke, not a book that is empty. Now: *"No chapters yet. The manuscript appears here once the author has uploaded it."*

**2. An instruction to do something impossible.** *"Choose a chapter to begin reading"* — there are no chapters to choose. Now: *"There is no manuscript to read yet."* The distinction matters and both states exist: **chapters present but none selected** is a legitimate prompt; **no chapters at all** is a different fact, and the page was telling both stories with one sentence.

**3. The one that is a new worst shape.** The notes composer was offered, the text box accepted typing, **Add note** looked live — and `addNote` opens with `if (current === null) return`. With no chapter, your note was **silently discarded**. No error, no explanation, nothing saved.

---

## 2 · `sysadmin` — this is a shape we have not named yet

Everything caught so far claims something false about the *world*: a fabricated cover, an invented message, a stall hidden behind a comfortable date. **This one makes a false claim about itself.** The user does the thing, the interface behaves as though it worked, and nothing happened.

> **A control that fails silently is worse than a control with nothing behind it.** A missing button teaches you the feature is not there. A button that swallows the act teaches you it worked.

It is also the **guard rail becoming the defect**: `if (current === null) return` is defensive, correct, and the reason nothing crashed. The early return stopped the bad write and left the lie on screen. **Somebody wrote that guard knowing the state could happen, and guarded the database instead of the person.**

Fixed the way the rule says: the composer is **absent** when there is nothing to attach a note to, with the reason stated — *"Notes attach to a chapter. There is no manuscript here yet."* — and a different line when chapters exist but none is selected.

---

## 3 · `finance` — one line, no change to the draft

The reading room is claimed in §3 as *"the manuscript reader"*, which is true and untouched: with a real manuscript it reads 37 chapters correctly. Nothing here changes a sentence. Worth knowing only for access week: **every demo title reaches an empty reading room**, so it is a screen Oliver will certainly see, and it now says what is true when he gets there.

---

## 4 · `paul` — the tally

Eight now. Two you found by clicking, six I found by sweeping — and today's three came from **reading the database and the page together**, which is the thing I told you for two days I could not do.

The pattern holds and has not varied once: **every defect lived in the empty case.** The populated path — Carl's book, 37 chapters, four covers — has been right all along. Everything we have shipped works when there is something to show and lied when there was not, and nobody had looked at a surface with nothing in it since the day it was built.

---

## 5 · Next

Cover studio, same method. Then the set-a-date route.

— `publisher`
