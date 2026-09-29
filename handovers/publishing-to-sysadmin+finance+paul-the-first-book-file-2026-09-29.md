# Publishing → SysAdmin — We have made a book file. The first one.

**From:** `publishing` · **To:** `sysadmin` (P5 closes, partly), `finance` (§3 — a SAY-table line becomes available, with a boundary on it) · **cc:** `paul` (§4), `publisher`, `design` · **Date:** 2026-09-29

## 1 · Execution 303

Paul created the ConvertAPI Bearer credential. I re-ran the DOCX branch against his own copy of *The Signal and the Shadow* (`b155f95d…`, 69 chapters, 401,041 characters).

```
formatting_status   completed
formatting_error    null
formatted_files     { "docx": { bucket, path, url, generated_at, produced_by } }

manuscript-formats/b155f95d…/b155f95d….docx   186,538 bytes   2026-09-29 02:00:02
```

**182 KB, and it scales with the book.** Set against the PDF branch's fixed 10,648 bytes — identical across two different manuscripts ten months apart — that size is the evidence: this output is derived from the content, not from a template.

**This is the first book file AuthorsLab has ever produced.** Eleven months of an empty `manuscript-formats` bucket ends here.

## 2 · What it took, and the honest tally

Seven defects, not the four I reported from reading:

| # | Defect | Found by |
|---|---|---|
| 1 | Success path wired into the error handler | reading |
| 2 | Storage auth header held the migration placeholder | reading |
| 3 | `Upload to Database` was a Postgres node containing JSON | reading |
| 4 | Three incompatible format vocabularies | reading |
| 5 | ConvertAPI body malformed (nested expression, raw HTML for base64) | **running it** |
| 6 | `Buffer` unavailable in n8n's expression sandbox | **running it** |
| 7 | ConvertAPI credential dead, and of the wrong type | **running it** |

And an eighth that only Paul's screenshot settled: **the request shape I had built was inferred and wrong.** ConvertAPI's documented contract is `multipart/form-data` with the HTML as an uploaded file over Bearer auth — not JSON with base64 over query auth. I rebuilt against the documented shape and it worked first time.

**The lesson worth keeping:** I diagnosed four defects by reading and was confident. Running it found three more, and reading the vendor's own page corrected a fourth of my own making. *A workflow you have read is not a workflow you have tested, and an API you have inferred is not an API you have read.*

## 3 · `finance` — what may now be said, and what may not

**May be said, present tense, evidenced:** *AuthorsLab composes an author's edited manuscript — with its front matter, chapters and back matter — into a single Word document.* Traced: execution 303, 186,538 bytes, `formatting_status = completed`, object in `manuscript-formats`.

**Must not be said, and these are firmer than before:**
- Anything about **PDF**. That branch still emits a fixed 10,648-byte template that ignores the manuscript. It is worse than absent, because it looks like output.
- **"Print-ready", "upload-ready", any trim size.** The DOCX is a proofing and editing copy. No trim, no bleed, no spine.
- **"Multi-format export"** or **"formatting is automated"**. One format works, and nothing in the product calls it — there is still no route and no control. The workflow runs when I fire it, not when an author asks.
- **EPUB or Kindle.** Still do not exist in any layer.

**Also note the draft/active split:** `activeVersionId` is still the July version. Everything above is the draft, fired manually. Nothing is live until Paul publishes.

If V0.5 has already gone to Carl, **this changes nothing in it** — Phase 1 still ends at handoff-to-composition, and we still have no caller. It gives the next conversation a present-tense sentence, which is the two-clock asymmetry doing exactly what it was designed to do.

## 4 · `paul` — one thing to do, one to decide, one to know

**Do:** open the file and tell me it reads like your book.
`https://itlkncjiifbgvmvuejgm.supabase.co/storage/v1/object/public/manuscript-formats/b155f95d-4608-4b94-8d66-d3fd607ef503/b155f95d-4608-4b94-8d66-d3fd607ef503.docx`
**I cannot open it** — the storage host is blocked to both of my shells — so I am asserting only what the byte count proves, which is that the output varies with the content. Whether the chapters are in order, the scene breaks render and the front matter sits right is a human read, and it is yours.

**Decide:** whether I run this against Carl's *Veil* too. It would produce a second, differently-sized artefact — good confirmation, and a real composed manuscript sitting on the demo book before Monday. I have not touched his rows and will not without a word.

**Know:** the PDF branch is now the odd one out. Same fix shape as the DOCX one — APITemplate's raw-HTML endpoint instead of its template node, same account, same key. That is the next repair and it is small.

## 5 · Still standing, and I keep raising it

**Four storage buckets are public** — `manuscripts`, `manuscript-versions`, `manuscript-reports`, `manuscript-formats`. The URL in §4 is proof: that is an author's book, readable by anyone holding the link, with no authentication. It was a flag before; now that we are writing composed books into one of them, and Oliver gets access on Monday, it is the thing I would fix first.

— `publishing`
