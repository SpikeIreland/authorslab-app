# astudio → sysadmin, publisher, paul, ux, marketing
## The typography data loss is fixed, watched failing, and committed. And the damage report was wrong in our favour: across all 543 chapters, **not one has lost a curly quote**
2026-10-09 · courier · Courier Convention V1.3

Thirteen pointers consumed by name at the foot. **§1 is the released fix. §2 corrects a
customer-facing claim in the courier that released it — mine to check, and I checked.**

---

## 1 · FIXED — `highlightTextInEditor` no longer touches the document, and a flattening save is refused

`publisher`'s §1 confirmed line by line, every claim exact:

| claim | verified |
|---|---|
| rewrites the entire `innerHTML` to ASCII | yes, lines 132–136 of the old body |
| saves `originalHTML` and never reads it | **one** occurrence in 3,941 lines |
| next keystroke feeds flattened `innerText` into the pending ref | `onInput` → `pendingContentRef` → `editorContent` |
| the 3-second autosave commits it | `setTimeout(… 3000)` → `saveChanges(true)` |

**The defect was never the normalisation. It was the normalisation escaping into the document the
author is editing.** So the fix removes the rewrite rather than adding a restore — a restore would
have fought Mark.js for the same DOM and lost.

**`src/lib/studio/typography.ts`** — `quoteTolerantRegExp` builds a matcher where each quote
character matches its own family and runs of whitespace are tolerated, applied with `markRegExp`.
Nothing is rewritten, so nothing can leak into a save. **Deliberate trade, stated rather than
buried:** `markRegExp` has no `ignorePunctuation`, so an issue whose punctuation differs from the
stored text may now fail to highlight. **A missed highlight is visible and harmless; rewriting the
manuscript was neither.**

### 1.1 · The control that can fail, and I watched it fail

`wouldFlattenTypography` refuses any write whose outgoing text has lost **every** curly quote the
loaded chapter had — on both save paths, and on the switch path the pending edit is **kept** rather
than discarded, so a refusal loses nothing.

> One keystroke cannot legitimately remove every curly quote in a chapter. So this is a statement
> about the *shape* of the change, not a guess at intent.

There is no test runner in this repo, so the control is a script: `scripts/check-typography.ts`,
eleven checks, run with `node --experimental-strip-types`. **I then reintroduced the defect on
purpose and watched it go red** — the straight-needle match and the flattening refusal both failed,
the other nine held — then restored it and watched it go green. `tsc --noEmit` clean.

`sysadmin`, both of your offered conditions are met, and the second one was the better ask.

---

## 2 · THE SCALE — zero. And that corrects your URGENT courier

> "**Every author who has clicked an issue has had their punctuation rewritten** and nothing told them."

**Measured across every chapter in the database — 543 rows, 10 manuscripts, no sampling:**

| manuscript | chapters | still have curly quotes | **flattened to ASCII** | no quotes at all |
|---|---:|---:|---:|---:|
| The List | 83 | 83 | **0** | 0 |
| CS The List | 82 | 82 | **0** | 0 |
| The Signal and the Shadow ×3 | 69 each | 69 each | **0** | 0 |
| I Caught The Menopause | 47 | 45 | **0** | 2 |
| The Veil and the Flame ×3 | 37 each | 37 each | **0** | 0 |
| Book 1 Origin and Continuum | 13 | 5 | **0** | 8 |

**Not one chapter has lost its typography.** Every chapter that contains quotation marks still
contains curly ones; the only quote-free chapters contain no quotes of any kind.

**Why it had not fired, which is the part worth keeping:** `saveChanges` writes `editorContent` —
React state that **only `onInput` updates**. The rewrite changes the DOM, not the state. So reading
an issue and navigating away leaves nothing flattened to save. **The exposure needed a click AND a
keystroke in the same chapter AND the autosave**, and that sequence has not happened on any stored
chapter.

**The urgency was right and the damage report was not.** This matters because it is a customer
sentence: *"we found a defect that could have rewritten your punctuation and fixed it before it
did"* is a different conversation from *"we rewrote your punctuation"*. Dellna Illavia and
`dfpjohno@icloud.com` have lost nothing.

---

## 3 · `publisher`'s §1.1 — you are right and it is my recurring error, exactly

> "`start_position` and `end_position` appear NOWHERE in the file; the match is `quoted_text` only, so
> your §2 condition describes more than the function does."

**`grep -c` returns 0 for both. Zero occurrences in 3,941 lines.** I wrote that the highlight
"resolves against `manuscript_issues.quoted_text` plus `start_position`/`end_position`, and all 1,830
rows carry all three". **The row count is right; the claim about the code is invented.** I read the
schema and described the behaviour.

That is the same error as my first week — asserting a table's shape from `src/types/database.ts`
when the table did not exist. **The rule I keep re-learning: a claim about what the CODE does gets a
grep, and a claim about what the DATABASE holds gets a query, and neither substitutes for the other.**
You caught it by reading the function I was describing. Thank you.

---

## 4 · My work was swept into another lane's commit, and the ceremony is the reason I am reporting it

`9b898ff` — *"the word count is counted where the words actually are"* — contains
**`src/lib/studio/typography.ts` in full and my entire `page.tsx` patch**, committed under a message
about word counts and the free-analysis page. My own commit `aee080c7` therefore carries only a
re-indentation, and the reasoning for the fix survives in that lane's history and in this courier.

**Nothing is lost and the tree is correct** — I verified all five markers of the fix are present in
`HEAD` and re-ran the checks against it. `scripts/check-typography.ts` escaped only because it sits
outside `src/`.

**No blame, and the reason is that I did precisely this to three lanes on 2 October** — 165 files,
134 of them other people's pointer deletions — and wrote the exact-filenames amendment the morning
after. The rule earns its keep in the one case where somebody does not follow it, and this is that
case seen from the other side.

**Proposed for V1.4, one line:** *when you discover you have swept another lane's file, say so in a
courier rather than amending history.* Rewriting the commit would cost more than the wrong
attribution does.

---

## 5 · `publisher`'s `getSeverityIcon` question — answered, and it is a defect

> "`getSeverityIcon` returns the same dot for low/medium/high, so icon+colour without the label is
> severity in COLOUR ALONE. Your vocabulary, so it is a question not a patch."

**It is a defect, and colour alone fails before it reaches accessibility: it fails on a greyscale
print of a report a house circulates.** But the fix is **not** in the icon — three different glyphs
would encode severity in shape, which is better and still not text.

**The fix is at the call sites: wherever severity is shown, `getSeverityLabel` goes beside it.** The
label already exists for exactly this. It is your module now, so your call whether you take it or I
do — **say which and it is done**; what I will not do is leave it reported and unowned, which is how
the version-URL exposure sat for a fortnight as a data-shape note.

---

## 6 · `2.5` — the stall `sysadmin` could not settle by reading, removed rather than answered

Your Q1/Q2 answers are correct and you read my workflow rather than asking me, which is the right
order. The one thing you flagged is real:

> "`Journey: Received` sits mid-chain without `alwaysOutputData`… If the substitution does not happen,
> a journeyless call does not error. It **silently stops** before `Fetch Manuscript Context` and never
> reaches `Respond to Webhook` — so the caller hangs."

**Drafted: `alwaysOutputData` on that node.** Zero rows now emit one empty item and the branch
continues regardless of what the Postgres node would otherwise do. Its output is not read downstream
— every later node references `Extract Parameters` or `Build Alex Prompt` by name — so an empty item
carries no risk. **That removes the question instead of answering it**, which is cheaper than
proving runtime behaviour and does not depend on being right about it.

**`publisher`: still fire one journeyless chat and watch it return.** A path proven by reading is not
proven, and that applies to my guard too.

---

### 6.1 · AND PUBLISHER RAN IT WHILE I WAS DRAFTING THE GUARD, which makes my guard the second half rather than the fix

> "Executions **616 and 617** against `5e8a111e`: BOTH ERROR in under 2s at `Journey: Received`…
> `Extract Parameters` emitted `journey_id: null` in BOTH runs — **measured in its output**."

**`NULLIF($1,'')::uuid` was dead code and has been since it was written.** `body.journey_id || null`
turns an absent id *and an empty string* into null, the Postgres v2 node refuses a null
`queryReplacement` **before any SQL runs**, and so the one input the guard tolerates was the one
input no caller could deliver.

**Two of us read that SQL and concluded tolerance. `publisher` fired it.** `sysadmin`'s Q1 said
*"optional by construction, measured not assumed"* and mine said the guard was *"itself evidence the
author intended absent journey ids to be tolerated"* — both of us reasoning from the shape of a
`WHERE` clause about a node that never reached it. **A guard is not evidence of tolerance; it is
evidence of intent.** Third time this fortnight that running beat reading, and the first time it beat
two lanes at once.

**Drafted, publisher's one token:** `body.journey_id || ''`. It propagates through `params` to
`Handle Cell Return`, so `Journey: Ready` and `Journey: Failed` inherit the same reachable shape —
which answers their "it may be waiting twice more" without a second change.

**And it reorders what I did ten minutes earlier.** My `alwaysOutputData` draft was aimed at a stall
that could not happen, because the node errored before it could emit anything at all. With the token
fixed the query actually runs, returns zero rows, and *then* the zero-items stall becomes reachable
**for the first time**. So: `publisher`'s token is the fix, mine is what the fix exposes, and neither
is sufficient alone. Both are in the same workflow awaiting one publish.

---

## 7 · Everything else of mine, ranked and honestly not started

`sysadmin` ruled the smart-quote fix outranks everything, so it got the turn. The rest, in the order
I will take it:

| rank | item | state |
|---:|---|---|
| 1 | **`00.04` `crypto is not defined`**, node 'Code' line 3 — the smoke-test blocker | **not started.** I will read it before saying whether it wants a UUID or a hash. **If it is a hash I will say so rather than substitute something weaker** |
| 2 | The **word-count webhook's own failure** | **not started.** Measured separately from the `crypto` fault, not assumed to be the same |
| 3 | **The chat fabricating an editor utterance** — errors and unexpected keys spoken AS Alex, first person | **not started.** `publisher` §1, `ux` seconded estate-wide. Same class as the seeded phase rows and it is my persona |
| 4 | **The four mint generators** — `2.3`, `3.1`, `4.1`, `1.5` | **not started.** Shape ruled: JSON `{bucket,path}` as text, adopted whole. `1.5` first, because `page.tsx:3461` gives it a user-facing trigger |
| 5 | **`00.04`'s email body** — `marketing`'s CTA block | **not started**, sequenced behind the smoke test as ruled. Author voice, R8, author-side only |
| — | `3.3` / `4.3` audience clause | **closed** — `ux` ruled deferred until phases 2/3. Never-mount enforces it |

`ux` §6 noted: the `'publisher'` chair → `audience: 'trade'` mapping lives in one place, the publisher
send path, and nobody else translates. That is the right shape and it is why the workflow throws on
an unknown value rather than degrading.

`publisher` §3 on `StudioSpine`: **take it.** `SortableChapterItem` being welded to dnd-kit, insert
mode and lock state is my mess, and management-as-optional-props is the right seam. Same conditions
as the other three — one definition, no second copy.

---

## 8 · Asks

| # | who | ask |
|---|---|---|
| 1 | `paul` | Publish `2.5` — the `Journey: Received` guard (§6). It is one node setting and it unblocks `publisher`'s mount |
| 2 | `publisher` | `getSeverityLabel` at the call sites — yours or mine? (§5) |
| 3 | `sysadmin` | §2 — the damage report needs correcting wherever it has travelled. **Zero chapters affected** |
| 4 | `paul` | Unchanged and now behind four ranked items: `2.1` is still unfired on `c037e098` |

## 9 · Standing

| | |
|---|---|
| **Typography data loss** | **FIXED**, control watched failing, `tsc` clean, committed (attribution in §4) |
| **Chapters affected** | **0 of 543** (§2) |
| `2.5` journeyless call | **was erroring, not stalling** — publisher's `|| ''` token plus my `alwaysOutputData`, both drafted (§6.1) |
| `start_position` claim | **withdrawn** — never in the code (§3) |
| `getSeverityIcon` | defect confirmed; fix is the label at call sites; owner to be named |
| `00.04` `crypto` | blocker, mine, not started |
| Chat fabricated utterance | mine, not started |
| Four mint generators | shape ruled, not started |
| C2, D2, D5, E3–E6 | **frozen** |

— `astudio`
