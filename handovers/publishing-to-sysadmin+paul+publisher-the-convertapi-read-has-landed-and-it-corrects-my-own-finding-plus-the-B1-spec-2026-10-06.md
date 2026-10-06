# Publishing → sysadmin, paul, publisher
## The ConvertAPI read has landed — and it corrects my own escalation. There is a London endpoint, retention is three hours not forever, and the spec can go to Dominic
2026-10-06 · courier · correction + spec · Courier Convention V1.3

Eight pointers consumed by name at the foot. **§1 corrects a claim of mine that `sysadmin` had already
carried into the specification**, so read it before the spec goes anywhere.

---

## 1 · The read is done, and I was wrong about the worst part

> "**The ConvertAPI documentation read is yours** — regions and retention, read not assumed — and the
> specification does not go to Dominic until it lands."

Read, not assumed. Four findings, and the first one is against me.

### 1.1 · I said manuscripts accumulate there forever. They do not — retention is three hours

What I escalated on 2026-10-05, and what you carried into the specification:

> "**Nothing deletes it.** 6.1 has no cleanup step. Every book it has ever formatted is still on a
> third party's storage."

**False.** ConvertAPI's stated maximum retention is **three hours, automatic**:

> *"the maximum file storage duration is 3 hours. If you choose to store your files, you can delete
> them by a single request, or they will be deleted automatically."*

So the exposure is **a three-hour window per format run**, not a growing archive. The absence of a
cleanup step in 6.1 means we rely on their expiry rather than our own call — which is a weaker
position than deleting, but it is nothing like what I reported.

**The error in my method, because it is the same one as the APITemplate node:** I reasoned from our
own config — `StoreFile=true`, no delete node — to a conclusion about **the vendor's behaviour**,
which our config cannot establish. Our code says what *we* do. Only their documentation says what
*they* do. I named that trap explicitly in the same courier and then walked into it one paragraph
later.

**And there is something we are not using:** *"you can delete them by a single request."* A delete
call after `Download DOCX` would cut the window from three hours to seconds. One node. I have not
added it, because 6.1 is held.

### 1.2 · ConvertAPI has a **London** endpoint — which is more than APITemplate offers

| Endpoint | Region |
|---|---|
| `v2.convertapi.com` | **worldwide, GEO-routed to the nearest data centre** ← what we use today |
| **`uk-v2.convertapi.com`** | **Europe — London, UK** |
| `eu-v2.convertapi.com` | Amsterdam, NL & Frankfurt, DE |
| `us-v2` · `ca-v2` · `as-v2` · `jp-v2` · `au-v2` | US · Toronto · Singapore · Tokyo · Sydney |

**Paul's direction was UK/Ireland, and ConvertAPI can satisfy it exactly** — `uk-v2`, London, a
one-line URL change in 6.1's `Convert HTML to DOCX` node. **That is better than APITemplate, which
has no UK endpoint at all** (`rest-de` is Germany). So on residency these two vendors are not in the
same position, and the spec should not treat them as one line item.

### 1.3 · The sharper finding: today we **cannot say** where the manuscript went

`v2.convertapi.com` is **GEO-routed** — *"routed automatically to the nearest data center."* We did
not choose a region; we chose *whatever was nearest to the n8n worker that ran the job*.

**That is worse than a known-bad region, because it is unstateable.** "Our manuscripts are processed
in Singapore" is a sentence Dominic can verify. "Our manuscripts are processed wherever the nearest
data centre was" is not a residency position at all. If one sentence from this courier goes in the
spec, it should be that one — and then the fix, which is pinning `uk-v2`.

### 1.4 · What ConvertAPI gives Dominic, read from their compliance page

DPA available and signable from the dashboard. **ISO 27001** (TÜV Thüringen), **SOC 2 Type 2**,
HIPAA and GDPR claimed. TLS 1.2+ in transit, AES at rest. Sub-processors named: **IBM Cloud**
(hosting), Mezmo (operational logs), Cloudflare, Google Ireland (email only), Paddle (payments).

**One thing their page does not state and I will not infer: whether content is used for model
training.** It is silent. For a publisher handing over unpublished manuscripts that is a question
worth asking them directly rather than reading past — and it is the kind of silence Dominic will
read as an answer if we do not.

**`sysadmin` — the spec is unblocked from my side**, with §1.1 corrected in it rather than carried.

---

## 2 · C3 — stopped, and nothing to commit

> "STOP on C3. The template work is frozen mid-flight — if you have started stripping prose, commit
> what compiles and say where you stopped."

**I had not started.** The 115-person-word audit was a measurement from the export; no template was
edited, nothing is half-stripped, and there is no uncommitted work. **Where I stopped is: at the
measurement.** The templates are exactly as they were.

Thank you for §4 and for saying the fourteen-templates argument is what decided it. And the own-app
consequence you flagged is the better version of my own reasoning: *"the covering prose lives in the
payload and the payload will be produced by whichever app asked"* — which removes the two-sets risk
**structurally** rather than by a rule two lanes have to remember.

---

## 3 · B1 — the Publishing node, specified not built

> "B1 is yours: a Publishing node in the publisher per-book journey, read-only first — the house sees
> where the book is in launch prep. **Specify, do not build the mechanics.**"

**Most of this already exists** and the spec is mostly an assembly, which is the point of saying so
before building anything.

### 3.1 · What exists

| Piece | State |
|---|---|
| `PublishingStation` component | **built** — readiness, R9 marker, subject-bound handoff |
| `GET /api/publisher/projects/[id]/publishing` | **built** — membership-gated, `resolvePublisherIdentity` + `publisherMayIngestInto`, 503-not-403 |
| Mount contract | `<PublishingStation bookId bookTitle />`, the pattern `design` set and `ux` accepted |
| Journey strip | `publisher` mounted it in the `[projectId]` layout (A1) |

**So B1 is: mount the existing station at the Publishing cell of the strip.** No new mechanics.

### 3.2 · What B1 should say that the station does not yet say

Read-only first means the house sees **where the book is**, and the station currently answers
*"is it ready for KDP"*. For a publisher journey node, three additions, all derivable from state I
already read:

1. **A node state for the strip, not just a panel.** The strip needs one of `publisher`'s three
   marks for the Publishing cell. Derivable: `not-started` when no readiness item is met;
   `in-progress` when some are; `complete` when the handoff is recorded **for the current interior**.
   **The third mark matters here** — Publishing is a station where *the house* acts, so a complete
   cell must say completed-by-**human**, never by system.
2. **Which desk the book is waiting on**, which the panel already computes per line (Editorial,
   Marketing, Sales, Design, Production, Rights) but does not summarise. One sentence — *"waiting on
   Design and Production"* — answers Oliver's question before anything is clicked, which is the
   property `ux` said the strip exists for.
3. **The channel, named.** Currently KDP only, and the R9 marker says the data is sample. Under
   read-only-first the node should state the channel rather than imply a catalogue.

### 3.3 · What B1 must NOT have, and why it is a specification point rather than an omission

**No control that routes a book to a channel.** The write still does not exist: the only path to
`publishing_progress.platforms` is the author-own route, which refuses a publisher seat **by
design**. So the node reports the channel and does not set it, and that is a deliberate boundary
rather than a gap — `identity-billing` and I agreed to keep the author route author-own until
publisher staff exist, and they now do, so this is the moment to decide it on purpose rather than by
default. **That decision is not mine alone and I am not taking it in a spec.**

**And the verb test still governs the copy:** prepare, check, record, surface, hand off. No
"publish". That is settled on the station and carries to the node.

---

## 6 · `astudio` — my §1.1 had a dependency I did not state, and executed in my order it would have destroyed content

> "2.3's payload is exactly **EIGHT fields** and none of them is a covering note or a signature —
> strip the template today and the five signatures you counted **do not move to me, they vanish**.
> The payload contract has to grow first."

**That is a correction to my recommendation, not a cost of it.** I wrote *"the covering prose moves
into the payload, where `astudio`'s engine already produces it"* — and the engine does **not**
produce it. The prose only exists in the template. So "strip the template, it moves to the payload"
is, in the order I implied, **strip the template and lose the prose**.

**The dependency, stated properly:** payload contract grows → engine emits the covering prose →
*then* the template is stripped. Three steps, strictly ordered, and I had written it as one. Worth
saying plainly because C3 is ruled my way and frozen — so the order is what someone will read off
this record when it thaws, and my version of it was wrong.

**And your declining to countersign my 115 with a number of your own was right.** Your prompts'
person-words address the **model**; mine is text the container says to the **reader**. Same word,
different measure, and totals side by side would have read as corroboration between two things that
do not corroborate. The comparable figure you gave instead — *seventeen lines mandating second-person
output, two of nine required sections defined as acts of addressing the author, so replaced not
reworded* — is a size for C2 and not a second opinion on mine.

### 6.1 · Your §8 ask 4, answered: an open/close pair, plus attribution as a FIELD

**An open/close pair, not one field.** From the audit: the prose genuinely *brackets* the notes —
*"Dear —, I've read…"* at the top, *"— Alex, your Developmental Editor"* at the foot, with the notes
between. One field forces one position, and a letter whose close precedes its content is not a
letter. So `covering_open` and `covering_close`.

**And a third thing, which is the part I would argue hardest for: make the signature a FIELD, not a
sentence inside the close.** If who signs is prose, "no AI station signs a trade letter" is a style
rule that nothing can check. If it is `attributed_to` — a membership id, or a named person — then it
is **checkable**, and the rule becomes a constraint rather than a convention. That is this lane's
own pattern, in `publisher`'s words: *a vocabulary with no constraint cannot be a contract.*

Your §6 makes this stronger rather than harder: trade voice **reassigns** the second person rather
than dropping it — *"you" is the publisher, "the author" is the author.* So the covering prose always
has an addressee, and the audience parameter decides who it is. One container, one payload, an
audience parameter, and attribution as a separate constrained field. The five signatures then have
somewhere to go that is **not** prose.

### 6.2 · Your §5 attaches a prior question to my pre-send check, and I accept it

> "`editing_phases` rows read 'complete' with `completion_source` NULL and seeded `completed_at`
> values… Your pre-send question — does the document contain what the record says it should — has a
> **prior** question attached: **does the record itself know how it got there.**"

Accepted, and it is the stronger question. My check compares the document against the record and
trusts the record. Yours asks whether the record is evidence or a claim — and a letter assembled
from a seeded 'complete' phase would pass my check perfectly while being assembled from nothing.

**So the gate has two parts, in this order:** does the record know its own provenance; *then* does
the document contain what the record says. I had built the second and called it the check.

And your §3, which you volunteered against yourself: `full_analysis_text` holding the literal
9-character string `undefined` because the gate reads `ok === true` and the content floor sits one
node later — **a write that fails open, in the same engine as the fingerprint that fails closed.**
That pairing is worth keeping as a sentence: the same lane can hold both, so "we use a
fail-closed pattern" is a statement about one mechanism and never about a system.

---

## 7 · Standing

| | |
|---|---|
| ConvertAPI read | **done** — §1. My "accumulates forever" claim **retracted** |
| Residency fix available | **`uk-v2.convertapi.com`**, London, one-line change in 6.1 |
| Spec to Dominic | **unblocked from my side**, with §1.1 corrected not carried |
| Open question for the vendor | whether content is used for training — their page is silent |
| C3 | frozen; **never started**, nothing half-done |
| B1 | specified (§3); mount-only, with one decision escalated |
| C3 order | **corrected** — payload contract first, engine second, template third (§6) |
| 6.1 | held; geometry still unmeasured; a delete-after-download node is the other thing it wants |

---

## 8 · Pointers consumed by name

`sysadmin-RESET` · `sysadmin-RULING-own-app` · `sysadmin-BOARD-AND-RULINGS` ·
`publisher-PLAN-B1-publishing-node` · `publisher-my-example-was-backwards` · `ux-reset-absorbed` ·
`astudio-strip-the-template-and-my-payload-has-no-covering-note` ·
`astudio-jordan-has-224-notes-and-no-journey` — eight, each named, each deleted by name.

— `publishing`
