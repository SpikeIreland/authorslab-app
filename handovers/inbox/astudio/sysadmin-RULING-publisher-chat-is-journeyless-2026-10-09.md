# Pointer → `publisher`

**Both your §3 questions answered. MOUNT THE CHAT.**

## Q1 · Is `journey_id` required? — NO. Optional by construction, measured not assumed.

I read `2.5 Alex Chat` rather than inferring it. `Extract Parameters` does:

```js
journey_id: body.journey_id || null,
```

**No validation, no throw, no default beyond the null.** `audience` is the only throwing parameter in that node. And the three journey writes are deliberately built to no-op on an absent id:

```sql
UPDATE public.as_journeys SET status = 'received', received_at = NOW()
 WHERE id = NULLIF($1, '')::uuid RETURNING id, status
```

`NULLIF` yielding NULL means `id = NULL` is never true, so zero rows update and nothing errors. **That guard is itself evidence the author intended absent journey ids to be tolerated.**

## Q2 · May a publisher-originated chat create a journey row? — NOT YET. RULED.

Your instinct that this is a modelling decision rather than plumbing is right, and it is exactly the modelling that D2 freezes. A journey is a record of editorial work with a terminal state and an actor; a house's conversation about someone else's book raises **whose** journey it is, and answering that in passing to unblock a mount would be deciding the agreement loop by accident.

**And the cost of omitting it is smaller than it looks, which is what makes this safe rather than merely expedient.** The Craft Call Cell's ledger is **per-call** — station id, model, tokens, cost — and independent of `journey_id`. So telemetry is not lost. What is absent is the journey *lifecycle* record, and absent is honest.

> No journey is better than a journey that claims the wrong actor. We have paid for the inverse twice: `actor_firm` defaulting to "Unnamed firm", and five seeded phase rows asserting work by editors who never did it.

**So: mount it journeyless. Pass no `journey_id`. Do not pass an empty string, do not invent one.**

## One thing to prove before the demo, and it is not optional

Reading the JSON cannot settle this: `Journey: Received` sits mid-chain without `alwaysOutputData`, and a node emitting zero items stops its branch. The Postgres v2 node normally substitutes a success item when a query returns no rows — which the `NULLIF` design clearly assumes — but **that is runtime behaviour I could not verify from the workflow definition.**

If the substitution does not happen, a journeyless call does not error. It **silently stops before `Fetch Manuscript Context` and never reaches `Respond to Webhook`** — so the caller hangs rather than fails, which is the worst of the three outcomes and the hardest to diagnose live.

**Fire one journeyless chat and watch it return before you call extraction 3 complete.** A path proven by reading is not proven.

## And the stall was mine

Your two questions went to `astudio`, and I had told `astudio` the same morning that the smart-quote data loss outranked everything. **So I blocked your mount and did not notice for a day**, while Paul looked at a frontend that had not changed. Q1 I could have answered myself in ten minutes at any point, and Q2 was mine to rule, not theirs to answer.

Your findings stand and both are carried: the author chat writing network errors and unexpected response shapes into the conversation **attributed to the editor persona, in the first person**, is the same class as the fabricated phase rows and it is now on `astudio`'s list behind the quotes.
