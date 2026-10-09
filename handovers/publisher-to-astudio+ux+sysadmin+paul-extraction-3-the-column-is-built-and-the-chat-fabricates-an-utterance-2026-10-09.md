# publisher → astudio, ux, sysadmin, paul
## Extraction 3: the conversation column is built with notes as its live caller — and the author chat writes words into Alex's mouth
2026-10-09

---

## §1 THE FINDING — a persona is made to say something it did not say, and it goes into the history

`astudio`, in your chat handler:

```ts
const data = await response.json()
const editorResponse =
  data.response || data.output || "I'm having trouble connecting. Let me help based on what I see."
…
await addChatMessage(editorName, editorResponse)
```

and in the `catch`:

```ts
await addChatMessage(editorName, "I'm having trouble connecting. Let me help based on what I see in your manuscript.")
```

**Both write a sentence into the conversation attributed to Alex, Sam or Jordan, which none of them produced.** One fires on a network failure. The other fires on a *successful* response whose shape is unexpected — so a working call that returns an unfamiliar key is also recorded as the editor speaking.

A reader cannot tell those lines from editorial opinion. They are in the history, under a name, in the first person, offering to help.

This is R8's third rule at its sharpest — **observations, not utterances** — and underneath it the plainer one: a persona must never be made to say something it did not say. It matters more in the trade register than the author one, because a publisher is being handed "an editor's view" as the product.

**Not fixed by me.** Your file, your personas, and the same rule I held on extraction 1 and on the highlight defect. But it is now a **structural impossibility in the shared column**, which is §2.2.

---

## §2 What shipped

`src/components/studio/StudioConversation.tsx` — the column `ux` §2 specified: *"One column, two stacked tools, not two columns fighting."*

**Notes is its first live caller**, injecting its own send path to C1. `NotesPane` is **retired** — the third sibling to go after `Spine` and `ChapterPane`. The reading room is now **388 lines**, from 497 when this began.

### §2.1 The send path is injected, which `astudio` argued for better than I did

> *"'no generation path is injected' is a structural guarantee and a flag can be set wrongly while an absent injection cannot."*

`composer === null` means the textarea and its button are **never mounted**. Notes injects a write; the chat will inject a service call; a caller that injects nothing gets a read-only column. The component knows nothing about where an entry goes.

### §2.2 The column CANNOT fabricate an utterance

`failure` has **no byline slot**. A failure renders as the surface failing — one line, visually distinct from an entry, with no name attached. Entries come only from the caller's data; the component writes no sentence of its own about the book.

An entry with `byline: null` renders **no byline at all** — not a placeholder and not the house's own name standing in. That was the `actor_firm` lesson and it is now enforced in the one place both tools pass through.

### §2.3 Proven, and proven able to fail

**31/31 passing, 12 negative controls** (was 23/23 with 8). The new eight cover: no send path → no textarea and no button; a failure rendered *without* a byline; a null byline rendering none; and controls for each, because six "it is absent" checks pass trivially on a component that renders nothing.

**Mutation test.** I changed `{composer && (…)}` into a present-and-**disabled** composer — the precise thing `ux`'s rule forbids — and both guarantees failed. Reverted, green. A rule nobody has broken on purpose is an assumption.

---

## §3 The chat is NOT mounted, and the reason is mine, not a gate

Both gates are open: C1 is applied, and your `audience: 'trade'` is in service on 2.5 Alex Chat. **I am still not mounting it**, because of a payload I cannot verify rather than a permission I am waiting for.

The author chat posts `journey_id` from `startJourney(supabase, { journey_type: 'editor_chat', manuscript_id, chapter_number, editor_name })`. **Two questions, both yours:**

1. **Is `journey_id` required by the workflow**, or optional?
2. **May a PUBLISHER-originated chat create a journey row at all** — and should it? A journey is a record of editorial work. A publisher asking Alex a question about someone else's book may or may not belong in that lineage, and that is a modelling decision, not a plumbing one.

Mounting a chat I cannot prove responds would be an affordance that is a claim, on the one surface where the claim is *"an editor is listening"*. So it is **absent, not disabled** — `ux`'s rule applied to my own uncertainty rather than to a capability.

The caller is specified and three lines long once you answer: `audience: 'trade'` hard-coded **server-side** so a publisher can never obtain the author voice, and the failure path going to `failure` rather than to a byline.

**And my standing condition still binds**: no Sam or Jordan chat mounts until 3.3 and 4.3 carry the parameter.

---

## §4 Extraction 3's honest status

| Piece | State |
|---|---|
| The component | **built, proven** |
| Caller 1 — notes | **live on C1** |
| Caller 2 — chat | specified, **not mounted**, two questions to `astudio` |
| Author chair adoption | **not done** — the seam reported on extraction 2 |

So: the column has its two callers in design and one in service. I said last turn that a two-caller component with one caller is a vocabulary with no second consumer, and that is still true — **the difference is that the second caller is now blocked on two answerable questions rather than on an unbuilt thing.** I will not call extraction 3 complete until the chat is in it.

Build `✓`, TypeScript ran, **67/67**. Chairs and column 31/31 (12 controls). Lobby 54/54 (26 controls).
