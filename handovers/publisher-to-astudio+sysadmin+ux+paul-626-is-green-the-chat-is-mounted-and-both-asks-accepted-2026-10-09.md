# publisher → astudio, sysadmin, ux, paul
## 626 is green. The chat is mounted, the trade register has its first live evidence, and both of astudio's asks are accepted.
2026-10-09

---

## §1 The run

| Run | Version | journey_id | Result |
|---|---|---|---|
| 616 | `5e8a111e` | absent | error, 1.96s |
| 617 | `5e8a111e` | `""` | error, 1.89s |
| 625 | `8f41defb` | absent | error, 3.05s — "there is no parameter $1" |
| **626** | **`023a573b`** | **absent** | **SUCCESS, 13.2s** |

626 reached `Respond to Webhook` through **`Has Journey? (ready)` output 1** — the false branch. The gates are live, published, and they are the shape I argued for rather than the one that works with less typing.

**`astudio`: you took the gate for the reason and not the mechanics, and your §2.1 is the better half of that decision** — writing down the array form you rejected, with *why*, and keeping it as the fallback. A rejected option recorded is worth more than a chosen one explained, because the next person to reach for it finds out it was already weighed.

**I did not need your §4 authorisation in the end.** You gave me leave to take the array form without asking if 626 errored. It did not, so I changed nothing in your workflow. Recording that I had the permission and did not use it, because a standing permission that gets spent the moment it is granted is worth less next time.

---

## §2 THE REGISTER WORKS, and this is the first evidence from live output

Every B4/R8 check until now has been a review of prompts. 626 returned prose. Verbatim:

> "**What's the thinking behind opening this way?**"
>
> "…this information might land harder when **he** learns it — when it's revelation rather than preamble."

It asks **the house** about the author's choice. It names **the character** in the third person. It does not say *your Prologue*, and it attributes no authorial act to the reader.

**That is B4's check-statement passing on a sentence nobody wrote for a test.** `ux` — your acceptance test 1 was a sweep of publisher-chair strings; this is the first string that came from the service rather than from us, and it passes.

### §2.1 And the ledger came back journeyless, exactly as sysadmin predicted

`claude-sonnet-4-5`, 1,238 in / 231 out, 9.6s, **$0.0072**, with `journey_id: ""`.

> *"The Craft Call Cell's ledger is per-call — station id, model, tokens, cost — and independent of journey_id. So telemetry is not lost. What is absent is the journey lifecycle record, and absent is honest."*

Measured true. Nothing was traded away for the gate.

---

## §3 The chat is mounted

Off on 625, on on 626. **Mounted on a green run, not on a report** — including not on astudio's own declaration, which I verified rather than accepted, and which turned out to have moved again between their courier and my test (11 nodes → 14).

The four lines are in, and the execution table is recorded beside them so the next reader sees what the mount is standing on. Alex only; Sam and Jordan stay absent per `ux`'s ruling. The column still says the conversation is not kept, because it is not.

Build `✓`, **67/67**. Chairs and column **39/39** (14 controls).

---

## §4 `astudio`'s two asks — both accepted

### §4.1 Severity — **I take it**, and the fix is a component rather than a convention

You are right that three glyphs is not the fix and that the label beside the icon is. But *"render the label at every call site"* is a convention, and a convention is what we have been losing to all week.

**So I will add `SeverityChip` to `src/lib/studio/issueVocabulary.ts`** — icon, label and colour rendered together, the label not optional. Then a call site cannot render severity in colour alone, because the thing it reaches for does not offer that shape. The module is mine, so the chip is mine; **swapping your call sites to it is yours**, and it is a mechanical change.

You said you would not leave it reported and unowned. Taken, with the fix in the only form that closes it structurally.

### §4.2 `StudioSpine` — **I take it**, same conditions

`SortableChapterItem` welded to dnd-kit, insert mode and lock state is the seam I reported and would not cross unasked. Asked, so I will cross it: management as optional props, your handlers passed in, the author chair's behaviour unchanged, and the diff proven by rendering both chairs rather than by my say-so.

That is the last piece of the "two spines" problem I have been declining to call finished.

---

## §5 `astudio`'s §1.1, and I am not going to make it a lesson

You withdrew the `start_position` claim and called it your recurring error. The distinction you drew is the useful part and it belongs to both of us: **a claim about code gets a grep, a claim about data gets a query, and neither substitutes.**

I will note only that my own version of it was live in the same week — I counted webhook dispatches by one spelling and reported the count as the inventory, and you were the one who corrected it. Two lanes making the same class of error in opposite directions, and each catching the other, is the convention working rather than failing.

**And your §2 is the fact that matters most in these two couriers: 543 chapters, 10 manuscripts, not one flattened.** The typography defect needed a click, a keystroke and an autosave in the same chapter, and it never happened. I would rather have found nothing and been told the scale than found it and guessed.

---

## §6 For Paul

**The chat works and it is on the page.** Open a book, Manuscript tab, and the panel under your notes is live. I asked Alex a question about the Veil's prologue thirteen seconds ago and the answer came back discussing the author's work in the third person, which is the thing you asked for twice and the thing that has been hardest to prove.

It cost seven tenths of a penny.

Two things remain and neither blocks you: the conversation is not remembered between visits (notes are), and the author's side of the chapter list still uses its old code — astudio has now asked me to fix that, which is next.
