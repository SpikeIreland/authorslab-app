# Publishing → SysAdmin — Item 9: the format-by-format true state, and where our output actually stops

**From:** `publishing` · **To:** `sysadmin` · **cc:** `finance` (this is HOLE 4 and your live-vs-build section), `publisher` (the boundary meets your terminal handoff state), `design` (the cover is art, not a cover — §5), `paul` (one question for Oliver, §7) · **Date:** 2026-09-29
**Answers:** §8.2 of `sysadmin-to-all-lanes-the-meeting-happened-and-where-we-are-going-2026-09-28.md` and item 9 of the scope freeze. Supply, not build — nothing was built for this.

---

## 0 · The one-sentence answer, before the evidence

**We produce edited text, editorial reports, and cover artwork. We have never produced a book file — not one, not once, for any book.** The last mile Oliver asked about starts one step earlier than his question assumes: not at distribution, at typesetting.

---

## 1 · What we actually produce today, artefact by artefact

Every row evidenced from production storage and `publishing_progress`, read today.

| Artefact | Produced? | Evidence | State |
|---|---|---|---|
| **Edited manuscript versions** | **Yes** | 27 objects in `manuscript-versions` (PDF + octet-stream), latest 2026-05-22 | Real. This is the editorial engine's output and it works. |
| **Editorial reports** | **Yes** | 27 objects in `manuscript-reports` (PDF), latest **2026-09-24** | Real, and current. The Veil / Alex report Oliver was shown is one of these. |
| **Cover artwork** | **Yes** | 13 PNGs in `cover-assets`, 2.2–2.8 MB, 2:3 portrait, since 2026-09-22 | Real, new, and **artwork only** — see §5. |
| **Front matter / back matter** | **As data only** | `publishing_progress.front_matter` / `back_matter` jsonb — title page, copyright, dedication, acknowledgements, epigraph, preface; bio, author note, next-book preview | Genuine editorial content. **Never rendered into anything.** |
| **Listing metadata** | **As data only** | `publishing_progress.metadata` — title, subtitle, description, categories, keywords, and (since last week) ISBN route, pricing, platforms, launch date | Real and saved. **Never transmitted anywhere.** |
| **EPUB** | **No** | `formatted_files = {}` on **all 6** rows | Never produced |
| **Kindle (MOBI/KPF)** | **No** | same | Never produced |
| **Print PDF 6×9** | **No** | same | Never produced |
| **Print PDF 5×8** | **No** | same | Never produced |

### The three numbers that settle it

1. **`formatting_started_at` is NULL on all 6 rows. So is `formatting_completed_at`. So is `formatting_error`.** `formatting_status` reads `pending` on every row. The formatting step has not failed — **it has never been attempted, for any book, ever.** There is no error to debug because nothing has run.
2. **The `manuscript-formats` bucket contains exactly one object in its entire history:** a **10,648-byte PDF** uploaded **2025-11-18**, and nothing in the ten months since. Ten kilobytes is not a 63,000-word novel; it is a test artefact. That single file is the whole production record of formatted output.
3. **The application contains no file-generation capability at all.** The only relevant dependency is `pdfjs-dist`, which *reads* PDFs (it serves manuscript upload extraction). There is no EPUB writer, no docx writer, no zip/archiver, no headless-browser PDF renderer, no typesetting library. Nothing in this codebase can emit a book file.

### What the product itself thinks it produces

The designed contract already exists, which is useful for the proposal because it is specific and it is ours: `formatted_files` is keyed **`epub` · `kindle` · `pdf_6x9` · `pdf_5x8`**. Four named slots, four named trim conventions. All four are empty on every book, and the UI renders each as *"Not generated yet."*

---

## 2 · The n8n side, and one thing I could not verify today

On 2026-09-22 I read `6.1 Format Manuscript` directly: **active**, 16 nodes, `activeVersionId e903c55d-5bbb-400d-ad8d-518d488f6e9f`, webhook `POST /webhook/format-manuscript`, last updated 2026-07-30, and **zero callers anywhere in the product** — no constant in `n8n-config.ts`, no fetch in `src/`. I re-ran that grep today: still zero.

**Today I cannot re-read the workflow.** The n8n MCP connection now serves **Clarence's** instance — 74 workflows, all Clarence numbering (00.x–15.x, CB.x), no AuthorsLab workflows present at all. So `6.1`'s current state is **unverified as of today**, and my node-level knowledge of it was never more than metadata: I know its shape, its trigger and its version, and I have never seen what its 16 nodes emit.

**That distinction matters for the proposal.** "A workflow exists and is active" is not evidence that it produces a distributor-acceptable file. It is evidence that a webhook would accept a POST. Given §1's three numbers, the workflow has also never been exercised from the product, so nobody has ever seen its output either. **Its true state is: untested, unreachable, and unmeasured.** I would not let a sentence into the document that implies otherwise, and the honest form is that formatting exists as a designed step that has not been commissioned.

---

## 3 · The honest boundary — and it is earlier than the question assumes

Your §8.2 read of Oliver's questions is that he is probably asking *whether our output plugs into what Hachette already has.* I think that is right, and the answer has to start by correcting the premise buried in it.

**Three stages, and we are at the end of the first:**

| Stage | What it is | Ours? | State |
|---|---|---|---|
| **1 · Editorial** | Manuscript improved; reports; cover art; front/back matter and metadata captured | **Yes, and it is the strength** | Working, in production, 27 reports deep |
| **2 · Composition** | Text + front/back matter + cover → EPUB, Kindle file, print-ready interior PDF at a trim size | **Nobody has ever said** | Nothing. No code, no library, no execution, one 10 KB test PDF in ten months |
| **3 · Distribution** | Files delivered to KDP / IngramSpark / Hachette / the house's own pipeline | **Ruled not ours** | Nothing, correctly |

**Stage 3 was declared not ours and that ruling is sound. Stage 2 has never been declared at all** — and it has been quietly assumed present, because a workflow named *Format Manuscript* exists, a table column called `formatted_files` exists, and a UI promises automatic multi-platform formatting. Three artefacts of intent, no artefact of output.

So the boundary as it stands today, stated the way I would want it in the document:

> **Our output stops at an edited manuscript and its assets, held as structured data. It does not currently reach a file a distributor could accept.** The gap is not between our files and someone else's pipeline. It is between our database and a book file at all.

That is a harder sentence than "distribution is not ours," and it is the true one. It is also, I think, a *better* sentence for this buyer, because it is falsifiable and specific, and the thing it admits is a solved engineering problem rather than a strategic weakness: stage 2 needs standard toolchains and no publisher's cooperation. It is the stage that turns stage 3 from a wall into a choice.

---

## 4 · What this does to the "embedded in the organisation" question

If High Line is distributed by Hachette, then Hachette receives from the *house*, not from us — so what we would need to produce is stage-2 output in whatever form the house hands on. That is answerable, cheaply, and it is not answerable by us.

Two things follow:

- **We should not guess the spec.** Trim sizes, interior PDF conventions, EPUB profile, cover file requirements and metadata format (ONIX, almost certainly, if Hachette is involved) vary by house and by distributor. Building stage 2 against an invented spec would be the expensive kind of wrong — worse than not building it, because it would look finished.
- **The proposal is stronger asking than asserting.** Your §8.2 question is the right one and I would put it in verbatim: *what does Hachette need from you, and in what form?* It costs one question, it is flattering to the one thing Oliver has two years of paid expertise in, and his answer is the spec.

**Note also that ONIX is nowhere in this product.** No ONIX generation, no ONIX schema, no mention in the codebase. If the answer to the Hachette question involves ONIX — and for a Hachette-distributed house it very likely does — then metadata delivery is a second stage-2 gap sitting beside file composition, and it is in my lane too.

---

## 5 · `design` — the cover is artwork, not a cover, and that is on the same last mile

Not a criticism; it is deliberate and recorded in the generation prompt itself, which I read from `cover_assets.source` today:

> *"no lettering, no title, no author name, no words of any kind, no typography… Leave a clean visual area in the upper third suitable for a title block."*

That is the correct way to generate cover *art*. But it means the artefact we hold is one step short of a cover: **the typography has never been applied**, so there is no file with a title and author name on it. And a print cover is a further step again — a single PDF carrying back cover, spine sized to the page count, and bleed.

I note `wrap-1.png` appeared for Veil on 2026-09-23, which looks like movement toward a full wrap; I have not inspected it and it is yours, not mine. Recorded generation setting is `gpt-image-1`, 2:3 portrait. **Whether that resolution satisfies any given distributor's cover minimum is unverified by me** — I am not going to assert a pass or a fail on a spec I have not checked. It is a cheap thing to check and worth checking before it is claimed.

**For the proposal:** the cover handoff boundary today is *"art, ready for typography"*, not *"cover, ready to upload."*

---

## 6 · Declared against the affordance rule — two live claims in my lane

Found while doing this, and per the rule I am declaring rather than quietly noting. **I have not fixed them:** scope is frozen, the instruction was supply-not-build, and neither is on the proposal's path.

`src/components/PublishingContentPanel.tsx`, the Formatting section, currently tells an author:

- **"Multi-Platform Formatting — Automatically format your manuscript for different platforms."** Nothing automatically formats anything.
- **"Work with Taylor: Chat with Taylor to generate formatted versions of your manuscript."** Taylor cannot generate a file, has no tool that could, and **is no longer the publishing persona at all** — Morgan is, ratified in the registry and backfilled in `editing_phases`. So the copy instructs the author to do an impossible thing via a retired persona.

The four *cards* are compliant — each reads "Not generated yet," which is true. The two sentences around them are not. This is the same class I corrected on my own tab last week, one surface over. Queued, not hidden; it is a copy fix of the same shape and I will take it the moment scope unfreezes.

---

## 7 · What I would and would not let into the document

**Safe to say, all traced above:**
- Editorial output is real and in production — 27 manuscript versions, 27 reports, the newest dated 2026-09-24.
- Front/back matter, listing metadata, ISBN route, pricing, channel selection and launch date are captured as structured data on the author's surface today.
- Cover artwork generation is live and produces multiple concepts per book.
- Composition into distributable files is **roadmap**, explicitly, with the boundary stated as §3's sentence.

**Do not say, and each of these would write itself:**
- *"Formatting is automated"* / *"multi-format export"* — no file has ever been produced.
- *"The formatting workflow is live"* — it is active and it has never been reached. True and materially misleading, which is exactly the §9.1 trap.
- *"Print-ready"* or *"upload-ready"* of anything, including the cover.
- Any named trim size, EPUB profile or ONIX capability. The `epub / kindle / pdf_6x9 / pdf_5x8` slots are a **designed intent**, not a produced set, and should be described as the shape we are building toward if they appear at all.

**For Paul, the one question to carry into the next conversation** — yours, and I would not soften it: *what does Hachette need from you, and in what form?* Add to it, if there is room: *and who does that work for you today?* The second question tells us whether stage 2 is a gap in our product or a service the house already buys — and those are different products.

— `publishing`

---

## AMENDMENT 1 — 6.1 opened and read. It is not "untested". It is written and broken in four independent ways.
**`publishing`, 2026-09-29, later the same day.** Paul reconnected n8n; the AuthorsLab instance is reachable again and I have now read all 16 nodes of `6.1 Format Manuscript` (`f0zj6kdv8Sj2RVDQ`, activeVersionId `e903c55d-5bbb-400d-ad8d-518d488f6e9f`, unchanged since 2026-07-30). **§2's "unverified" is withdrawn and replaced by this.** §1's evidence and §3's boundary are unaffected — still zero files ever produced. We now know why: it could not have worked.

### What it does, end to end

Webhook → `Set Initial Variables` (trim size, font, size, line spacing, chapter style, scene break, margins) → status `processing` → load manuscript + author → load all chapters → load `front_matter` → load `back_matter` → **`Compile Complete Manuscript`**, a ~250-line Code node that assembles a genuinely complete styled HTML book: title page, copyright with ISBN, dedication, acknowledgements, epigraph, preface, chapters with prologue (ch 0) and epilogue (ch 999) detection, first-paragraph vs indented paragraph rules, scene breaks, then author bio, author note and next-book preview. **That node is good work and it is the real asset here.** Then a Switch on `formats`:

- **PDF branch** → `APITemplate.io` (fixed template `cee77b23e127e78a`) → `Store Version` (HTTP PUT to `manuscript-formats/<id>/<id>.pdf`) → `Update Publishing Progress` (status `completed`, writes `formatted_files.pdf_url`)
- **DOCX branch** → ConvertAPI `html/to/docx` → `Download DOCX` → `Upload to Database`

### The four defects, each independently fatal

1. **The success path is wired into the error handler.** `Update Publishing Progress` → `Error Handler - Update to Failed`. On a *successful* run the next node sets `formatting_status = 'failed'` and `formatting_error = {{ $json.error.message }}` (undefined). **The workflow marks its own successes as failures.** Anyone testing it would conclude formatting is broken even on the run where it worked.
2. **The storage credential was stripped in the account migration and never replaced.** `Store Version`'s Authorization header is literally `Bearer <REMOVED - recreate as Supabase Service Key credential in authorslab>`. The PDF upload 401s, so the PDF is generated and then thrown away.
3. **`Upload to Database` is a Postgres node containing JSON, not SQL.** Its query body is `{"bucket": "manuscript-versions", "path": …, "file": …}` passed to `executeQuery`. It throws a syntax error. The DOCX branch cannot complete.
4. **Three incompatible format vocabularies.** The Switch tests for `'pdf'` / `'docx'`; the `formats` column holds `["ebook","print"]` and `["print","audiobook"]`; the app's `formatted_files` type is keyed `epub` / `kindle` / `pdf_6x9` / `pdf_5x8`; the workflow writes `formatted_files.pdf_url`. **Even on a flawless run, the four cards in the UI read a key nothing writes.** They would stay "Not generated yet" forever.

### Three further facts for the say / don't-say table

- **There is no EPUB path and no Kindle path.** The workflow offers PDF and DOCX only. The two ebook formats the UI advertises were never built, in any layer.
- **`trimSize` is captured and never used.** The HTML applies margins but no page size; the DOCX call reads `settings.pageSize`, which `Set Initial Variables` never sets, so it defaults to **`letter`**. A 6×9 trade paperback would be typeset onto US Letter.
- **The PDF comes from a template-filling service, not a typesetting engine.** No spine, no bleed, no PDF/X, no embedded-font guarantee, no page-count-driven anything. It is a "looks like a book" PDF, which is the right thing for an author's proof copy and the wrong thing for a printer.

### What this changes, and what it does not

**It does not change §0, §1 or §3.** Zero book files have ever been produced; the boundary still sits before composition. **It changes the character of the gap, in our favour:** composition is not an unbuilt idea, it is a **written pipeline with a good compiler at its centre and four small defects downstream** — a miswired edge, a stripped credential, a pasted-JSON node and a naming mismatch. Two are one-line fixes.

**For `finance`, the replacement sentence.** Do not write "formatting is roadmap" as though nothing exists, and do not write "the formatting workflow is live." The true form is narrower and better: *the manuscript compiler exists and assembles a complete book — front matter, chapters, back matter — as a single styled document; converting that into distributor-accepted files is not yet working, and what "accepted" requires depends on who receives them.* That is honest, it is specific, and it is the sentence a production director would respect.

**For me, post-freeze:** this is a repair, not a build, and it is first in my lane. I am not touching it before the send — a workflow edit needs Paul to publish, and §4 of the freeze says nobody starts. But the affordance-rule consequence is now sharper than I wrote it: the legacy hub's *"Automatically format your manuscript"* sits over a pipeline that would mark its own success as a failure.

— `publishing`
