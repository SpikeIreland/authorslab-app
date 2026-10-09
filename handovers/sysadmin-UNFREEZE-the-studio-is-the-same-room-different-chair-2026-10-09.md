# SysAdmin UNFREEZE → publisher, ux, astudio — The reading room becomes the Author Studio, third person. This is the shared half of Paul's own frame, not the translation error returning.

**From:** `sysadmin` · **Date:** 2026-10-09 · **Called by:** Paul, twice
**Releases:** the editing-surface half of track D. **C1 is mine and is the dependency.**

---

## 1 · What Paul asked for, twice

> *"I want the manuscript editing studio to look the same but with the third-person perspective applied to the chats and reports."*

And today, looking at `/publisher/[projectId]/read`:

> *"This is the original version but I want to use the same version that the Author sees."*

**`publisher` built the reading room deliberately and well** — the author's split layout, spine left, work centre, with the AI column replaced by the publisher's own notes. Their header says *"same room, different chair"*, which was the right instinct.

**Paul wants more than the layout. He wants the surface itself, chat included, speaking in the third person.**

---

## 2 · Why this is not the thing I froze

On 6 October I froze track D because the publisher product was being built by changing the author product's pronouns, and I said so in terms. **This looks like the same request and it is not**, so the distinction goes on the record before anyone builds against it.

Paul's own frame, from 8 October, settles it:

> **Separate the buying. Share the using.**

The error was deriving the publisher **product** by culling the author product — the list, the landing, the stations, the whole shape of what a house buys. That stays dead.

**The editing surface is "using".** Reading a manuscript, discussing it with an editor who has read it, and recording a note against a page is *the same job in both products*. Building a second implementation of it was never parity — it was duplication, and it is already costing us: the notes column exists because the chat was out of scope, not because an editor wants fewer tools than an author.

> **Two implementations of one job is not separation. It is a second thing to keep correct.**

---

## 3 · What to build

**`publisher` + `ux`, sequenced as before: `ux` specs, `publisher` builds.**

- **Lift the Author Studio surface**, parameterised — not forked, not re-implemented. One component, a voice parameter, two callers. R8 already rules the voice; §6 of my 9 October courier ruled that an absent audience stays `'author'` until the publisher app is a distinct caller, then errors.
- **The chat column returns**, in the third person: an editor discussing *the author's* manuscript, never addressed as its writer. `publisher`'s own B4 ruling governs the register — *the publisher is "you", the author is "the author", the book is "the manuscript"*.
- **The notes stay**, and they stop being an alternative to the chat. An editor wants both.

**`astudio`** — released for the voice parameter in service on the chat path, and nothing else. C2, D2, E3 and E4 stay frozen.

---

## 4 · C1 is mine and it blocks the demo

`publisher` flagged this and I have been carrying it unactioned:

> Notes are real within the session and attributed, but **NOT PERSISTED** — there is no publisher-notes table.

So an editor makes a note, and it is gone when the page is. **In a demo that is worse than not having notes**, because the control claims something the system does not do. `publisher` was right to say so in the file header rather than let the surface imply otherwise.

**I will write the table and the route.** It is small and it is the dependency for everything in §3.

---

## 5 · Still frozen

C2, D2, D5, E3–E6, the Editing Studio's agreement loop and the notes package. **The editing surface is released because Paul has now asked for it twice and it is the centre of the demo. Nothing else moves.**

---

## 6 · Also fixed this turn, mine

A signed-in visitor to `/publisher/login` was served the login form **wrapped in the house chrome** — Harrowgate House in the header, People and House Style in the panel, around a form asking them to sign in.

It was never a leak: a signed-out visitor gets the page bare, which is what the layout's no-session branch is for. **But Paul could not tell those two apart by looking, and neither could a customer.** A page that cannot be distinguished from a leak costs what a leak costs.

The condition now lives in middleware, which knows the path *and* the session; the layout knows only the session, which is why it could not have been fixed there.

— `sysadmin`
