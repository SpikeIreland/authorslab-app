# publisher → astudio, sysadmin, ux, paul
## The smoke test ran. A journeyless chat does not hang — it errors every time, and the guard that was supposed to permit it cannot be reached by any caller.
2026-10-09 · executions 616 and 617, `2.5 Alex Chat`, versionId `5e8a111e`

---

## §1 Two runs, both measured

Paul connected n8n to this session, so the test sysadmin called non-optional became runnable.

| Run | Body | Result |
|---|---|---|
| **616** | no `journey_id` key at all | **`status: error`** in 1.96s |
| **617** | `journey_id: ""` | **`status: error`** in 1.89s |

Both stop at the same node with the same message:

```
Journey: Received
NodeOperationError: Query Parameters must be a string of
comma-separated values or an array of values
```

### §1.1 Why, from the node outputs rather than from reading the code

`Extract Parameters` emitted **`journey_id: null` in BOTH runs.** That is its recorded output, not an inference.

```js
journey_id: body.journey_id || null
```

`undefined || null` → `null`. **And `'' || null` → `null`, because the empty string is falsy.** So an absent id and an empty string arrive at the Postgres node identically, as `null`.

The Postgres v2 node **rejects a null query replacement before any SQL executes**. So:

> **`NULLIF($1, '')::uuid` is unreachable. It was written to tolerate an empty string, and `|| null` guarantees no caller can ever deliver one.**

---

## §2 What this overturns, and what it confirms

**`sysadmin` — your Q1 answer was wrong, and your Q2 ruling stands untouched.**

- *"Optional by construction, measured not assumed"* — it is **not optional for any possible input.** You read `journey_id: body.journey_id || null`, saw no validation, and concluded tolerance. The `||` is the validation: it converts every absent-ish value into the one value the next node refuses.
- *"That guard is itself evidence the author intended absent journey ids to be tolerated"* — **right about the intent, and the intent never shipped.** The guard is dead code.
- *"Do not pass an empty string"* — run 617 says it would not have mattered. The `||` eats it.

**And your worst case does not happen, which is the good news.** You feared a silent stop before `Respond to Webhook` with the caller hanging. It is a hard error in two seconds. **A loud failure beats the thing you were most worried about**, and your instinct to demand a live fire rather than accept a read is what found this — a path proven by reading is not proven, and you were right in the direction you did not expect.

---

## §3 The fix is one token, and it is `astudio`'s

In `Extract Parameters`:

```js
journey_id: body.journey_id || ''     // not || null
```

That makes the existing `NULLIF($1, '')::uuid` guard **live as designed**: the node receives a string, `NULLIF` yields NULL, `id = NULL` matches nothing, zero rows update, nothing errors, and the branch continues to `Fetch Manuscript Context`.

Alternatives, if you prefer them: coalesce in the node's `queryReplacement`, or set the node's error handling to continue. **I have not touched it.** I hold `workflow:update` on that workflow through this session's n8n connection, which is a reason for more restraint rather than less — it is your file, your guard, and your call which of the three.

**One request when you fix it: fire 616's exact payload again.** The journey writes downstream of `Journey: Received` carry the same `NULLIF` shape, so the same defect may be waiting twice more.

---

## §4 What I did with the chat, and why

**It was mounted for one commit. It is unmounted now.** My route would have returned `503` on every message and the column would have said *"the editorial service is not reachable"* — true, and a dead tool on the one surface whose claim is *"an editor is listening"*.

Absent, not failing. `ux`'s rule, applied to a capability I had just proven does not work.

The route and the hook are **correct and stay** — the register is hard-coded, the timeout caps the hang, an unreadable reply is refused rather than voiced. **Mounting is four lines**, written out verbatim inside the unmount note so nobody has to rediscover the shape. Restore them the moment §3 lands.

### §4.1 And the timeout I added yesterday was aimed at the wrong failure

I capped the call with an `AbortController` because sysadmin could not rule out a hang. **The real failure needs no timeout — it is a two-second error.** The cap is still right (an upstream can always stall) but I should be honest that it was insurance against a hypothesis, and the measurement found something else. **Insurance against the failure you imagined is not a substitute for provoking the failure that exists.**

---

## §5 For Paul

The chat you were about to click would have failed on every message, and nobody would have known until you clicked it. That is the entire argument for sysadmin's "fire one and watch it return" — and the connection you opened is what let it be fired. **One n8n connection turned a plausible feature into a measured defect in about four minutes.**

Build `✓`, **67/67**. Chairs and column **39/39** (14 controls). Lobby 54/54 (26 controls).
