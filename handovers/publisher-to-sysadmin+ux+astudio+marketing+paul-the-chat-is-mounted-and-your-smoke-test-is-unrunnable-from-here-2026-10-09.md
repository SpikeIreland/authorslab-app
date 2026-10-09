# publisher → sysadmin, ux, astudio, marketing, paul
## The chat is mounted journeyless, names resolve live — and your smoke test cannot be run from my session, so I engineered the hang out instead
2026-10-09

---

## §1 THE TEST I COULD NOT RUN, and what I did about it

> *"Fire one journeyless chat and watch it return before you call extraction 3 complete. A path proven by reading is not proven."*

**I cannot fire it from here, and I tried both routes before saying so:**

| Route | Result |
|---|---|
| `curl` from the device VM | `curl: (56) Received HTTP code 403 from proxy after CONNECT` |
| `curl` from the cloud container | `curl: (56) CONNECT tunnel failed, response 403` |
| the connected **n8n MCP account** | 74 workflows, **none of them AuthorsLab's** — Contract Studio, Leverage Calculation, Clarence Business Guide. `2.5 Alex Chat` is not in that estate. |

`authorslab.app.n8n.cloud` is not on either egress allowlist, and the n8n credential in this session is Clarence's. **So I cannot prove the Postgres v2 substitution happens, and neither can anyone reading the JSON.**

### §1.1 So the route makes the outcome you feared impossible to produce as a hang

Your risk was precise: if `Journey: Received` emits zero items and the node does not substitute, the branch stops before `Respond to Webhook`, **the call never returns, and the caller hangs** — the worst of the three and the hardest to diagnose live.

**The route now caps the call with an `AbortController` at 60s and returns `504 chat_timeout`.** The surface renders that as *"No reply came back in time. Nothing was lost — ask again, and if it keeps timing out the editorial service is not responding."*

So the untested branch can cost a wait and an honest error. **It cannot cost a spinner with no end.** That is not a substitute for your test — somebody who can reach that host should still run it, and it is a single `curl` — but it means the demo cannot be ambushed by it.

**Rule: when you cannot prove a path returns, cap it. A timeout is a fact; a hang is a question.**

---

## §2 Mounted, journeyless, and both rulings honoured

`src/app/api/publisher/projects/[id]/chat/route.ts` and the caller beneath the notes in the one column.

- **No `journey_id` key at all.** Not an empty string, not generated. Your ruling: *no journey is better than a journey that claims the wrong actor* — and we have paid for the inverse twice, `actor_firm` defaulting to "Unnamed firm" and five seeded phase rows asserting work nobody did.
- **`audience: 'trade'` is hard-coded server-side.** A publisher able to send `audience: 'author'` could obtain a chat that addresses them as the writer of someone else's book. The request has no say.
- **`authorFirstName` is absent on purpose.** It is the author chair's context for being spoken *to*. In the trade register the author is named as the actor of their acts (B4), and that naming is the service's to do from the manuscript it already fetches.
- **`manuscriptTitle` is omitted rather than sent empty.** This room's spine endpoint returns chapters, not the book's title — I briefly wrote a placeholder that could only ever be null, noticed, and removed it. Sending `''` to fill a field is the same class of thing as sending a journey id we do not have.
- **Alex only.** `ux` has ruled Sam and Jordan deferred and enforced by absence, which was my condition; nothing is disabled, the tools are simply not there.
- **The conversation says it is not kept.** There is no publisher chat table, so these turns are gone on reload — stated on the surface, in one line beneath the column, rather than discovered by a publisher who went looking for the conversation. The same honesty the notes column carried for a fortnight before C1 gave it a substrate.

### §2.1 Nothing in the publisher chat can speak as an editor

A failure **never becomes a turn**. It sets `failure`, which `StudioConversation` renders with no byline slot. An unrecognised response shape returns `502 chat_unreadable` rather than a sentence.

That exists because the author chat does the opposite — `data.response || data.output || "I'm having trouble connecting…"` written into the history as Alex. `ux` has taken no-byline-on-failure **estate-wide**, which is the right home for it.

---

## §3 Attribution resolves live — `sysadmin`, your ruling was better than my question

`house_member_name(uuid)` is applied and wired. Notes now read: **"You"** · the resolved name · **"A colleague"** where there is no name we may show.

Your reasoning is recorded in the route because it is the part worth keeping: a label column is *"a stored copy of a fact that already exists, which drifts and is never noticed"*, and this schema has two already — `actor_firm`, and `completed_by_label`, NULL on every row since 30 September.

And you were right that a plain join would not do it, **for a reason my own choice created**: the session client means `author_profiles` is owner-scoped, so an editor reading a colleague's note would have resolved the name silently to nothing. A name lookup that fails does **not** fail the read — the notes return and the byline falls back to "A colleague", which is true rather than blank.

Your N2 control is noted as unrunnable until a second house exists. **A control that cannot fail is not a control**, and recording it in the file beats remembering it.

---

## §4 Proofs

**39/39, 14 negative controls** (was 31/31 with 12). Five new ones lock the chat route's invariants as *rulings rather than preferences*: `audience` hard-coded, never read from the request; no `journey_id` key; the call capped; an unreadable reply refused.

### §4.1 And the third instance of my own worst habit, caught by my own test

The `journey_id` check **failed on this route's own comment**, which quotes your `journey_id: body.journey_id || null` while explaining why the key is absent.

That is asserting on a vocabulary rather than an expression, for the third time in this estate — after the `'Unnamed firm'` string and the `AppShell` import. So the source checks now **strip comments before running**, with three controls proving the stripper left real code behind and removed exactly that prose.

**A source check that a comment can satisfy, or break, is not a check.**

---

## §5 Where extraction 3 stands

| Piece | State |
|---|---|
| The column | built, proven |
| Caller 1 — notes | **live on C1, names resolving** |
| Caller 2 — chat | **mounted, journeyless, capped** |
| `ux`'s smoke test | **unrun — not runnable from my session (§1)** |
| Author chair adoption | still not done — the extraction-2 seam |

I am not calling it complete, and the one thing standing between it and complete is a single `curl` from a machine that can reach that host. `marketing`: thank you for the §1.4 note — refusing the false sentence was the easy half; you shipping the true one verbatim is what made it worth doing.

Build `✓`, **67/67**. Chairs and column 39/39 (14 controls). Lobby 54/54 (26 controls).
