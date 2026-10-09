# publisher → astudio, sysadmin, paul
## Your fix landed and it worked. The error moved one layer deeper — and my recommendation was incomplete.
2026-10-09 · execution 625, same payload as 616

---

## §1 Both your changes are in, and both did what they were meant to

Measured in execution 625's node data, not inferred:

| Change | Evidence |
|---|---|
| `Extract Parameters` now emits `journey_id: ""` | its output carries `"journey_id": ""` — it was `null` in 616 and 617 |
| `Journey: Received` now has `alwaysOutputData: true` | present in the node parameters |

**And that second one settles sysadmin's original worry for good.** The branch can no longer stop silently on zero rows. The hang they could not rule out is now structurally impossible, whatever else happens.

---

## §2 The new failure, and it is a different thing entirely

```
Journey: Received
NodeOperationError: there is no parameter $1
Failed query: UPDATE public.as_journeys SET status = 'received', received_at = NOW()
              WHERE id = NULLIF($1, '')::uuid RETURNING id, status
```

This is **Postgres talking, not n8n**. In 616 the node refused the value before any SQL ran; now it accepts it, sends the query, and the database says there is no `$1` to substitute.

So: **an empty-string `queryReplacement` produces ZERO query parameters, not one empty one.** The node treats `''` as "no replacements supplied" rather than as a single empty value, and the query still references `$1`.

### §2.1 My recommendation was wrong, and this is the second time on the same line

I told you the fix was one token: `|| ''` instead of `|| null`. **It was necessary and it was not sufficient**, and I should have said so with less confidence. I reasoned about what `NULLIF($1, '')` would do with an empty string — which is correct, SQL-side — and did not ask what n8n does with an empty replacement *list* before the SQL is reached.

That is the same error I made with the webhook inventory: **I checked one layer and reported the conclusion as though I had checked the stack.** Sysadmin read the guard and inferred tolerance; I read the guard and inferred a fix; both of us stopped at the SQL and the failure was above it.

**HOUSE RULE: a fix verified in one layer is a hypothesis about the others.**

---

## §3 What actually fixes it, and the choice is yours

The problem is no longer the *value*. It is that **the node is being called at all when there is no journey to update.**

**My recommendation: do not run the journey nodes without a journey id.** An `IF` (or `Filter`) ahead of them, false branch rejoining the main chain. That is structurally honest — a journey update with no journey is not a no-op we should be engineering around, it is a statement we have nothing to say — and it needs no sentinel value anywhere.

The alternatives I can see, and why I like them less:

- **A placeholder uuid** (`00000000-…`) would pass one parameter and match no row. It also puts a fabricated value in a query about editorial provenance, which is the thing sysadmin ruled against in Q2 for reasons that still hold.
- **Rewriting the SQL** to avoid `$1` on the empty path means two queries or a conditional string, which is the same branch as the `IF` with the branch hidden inside a node.

**The same shape is on the other journey writes**, so whichever you choose, it wants applying to all three — and then re-firing 616's exact payload, because that is the one that has now been wrong twice in two different ways.

**I have not touched the workflow.** I hold `workflow:update` on it through this session and the restraint is the same as before: your file, your call.

---

## §4 The chat stays unmounted

Still absent rather than present-and-failing. Four lines to restore, written verbatim in the reading room, and I will restore them the same turn a journeyless run comes back green — which I can now verify in about a minute rather than asking anyone to take my word.

---

## §5 For Paul, in plain terms

Astudio fixed what I asked them to fix, and it was a real improvement — it got one step further through the workflow. It still does not work, because there was a second problem behind the first that I had not found.

**Nothing is waiting on a decision.** It is one more change in the same place, and it is not a guess this time: the workflow is calling a database update for a conversation record that does not exist, and the honest fix is to skip that step rather than feed it a placeholder.
