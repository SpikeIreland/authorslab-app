# `00.04 Free Manuscript Analysis` — the one-line fix

**sysadmin, 2026-10-09.** Located by reading the workflow, not inferred.

## Where

Workflow **`00.04 Free Manuscript Analysis`** (`4GIq7o4cyvk3zCWm`) → node named exactly **`Code`** → **line 3**.

## What is there now

```js
// Process merged data: extracted text + form data
const inputs = $input.all();
const journeyId = crypto.randomUUID();          // ← line 3
```

## Replace that one line with

```js
const journeyId = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
  (c ^ (Math.random() * 16) >> c / 4).toString(16)
);
```

Change nothing else in the node. Publish.

## Why it fails

n8n Code nodes run in a sandbox that does not expose `crypto` as a global unless the instance sets `NODE_FUNCTION_ALLOW_BUILTIN`, and `require('crypto')` is blocked for the same reason. It is the **only** occurrence of `crypto` in the workflow.

**This single line kills the entire run.** `Code` is the sole source of `journey_id` *and* `submissionInfo` for everything downstream — four `Call … Cell` nodes, four `Build …` prompt nodes, `Code5`, the email, and `Respond to Webhook` all read `$('Code').first().json…`. It throws before producing a single item, so nothing after it executes at all.

## Why a non-cryptographic UUID is the right replacement, and not a compromise

The value is used **only as a correlation id** — it is passed to the Cell and written to `as_journeys`. It is never a secret, never a token, never checked for unguessability.

> A hash replaced by a non-hash because an import failed would be a fabrication. A random correlation id replaced by a different random correlation id is the same thing done differently.

Had this been a hash or a signature, the honest answer would have been to stop and say so rather than substitute something weaker.

---

## A second finding in the same node, reported not fixed — `astudio`

`journeyId` is **generated here**, not received. So the id handed to the Cell corresponds to **no row in `as_journeys`** — nothing creates one. The Cell's journey write is an UPDATE guarded by `NULLIF(…)::uuid`, so it matches zero rows and no error is raised.

The consequence is not a crash. It is that **every free analysis is invisible to the journey meter** — the same shape as Jordan running uninstrumented, found on 5 October, which made the pass meter understate by two editors.

It is not in the way of the fix above and should not be bundled with it. Flagged so that the next person reading a meter knows what it is not counting.

## A third, and it belongs to nobody yet

`Code5` sets `totalWordCount: analysisText.split(/\s+/).length` — **the word count of Alex's analysis text, not of the manuscript** — and that is what is passed to the APITemplate PDF. So the report tells an author how long our assessment is while appearing to tell them how long their book is.

Same family as the `file.size / 6` fabrication fixed on the page today: a number that is real, correctly computed, and measuring the wrong thing.
