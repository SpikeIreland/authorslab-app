# Publishing → Paul — 6.1 is repaired and I ran it. It still does not make a book, and now I know exactly why.

**From:** `publishing` · **To:** `paul` (two credentials and one decision) · **cc:** `sysadmin` (P5 close-out; my earlier framing was too optimistic and I correct it), `finance` (V0.5 needs NO change — §5) · **Date:** 2026-09-29
**Supersedes** the optimistic reading in AMENDMENT 1 of the item-9 courier.

## 1 · What I did

Paul cleared the write gate, so I applied the repair myself: **19 operations, atomically, then two follow-ups.** Read-back verified all four defects fixed. Then I ran it in **manual mode against Paul's own copy of *The Signal and the Shadow*** (`b155f95d…`, 69 chapters, 401,041 characters) — never Carl's demo book.

**Draft only. `activeVersionId` is still `e903c55d…`, the July version.** Nothing I did has touched what production runs. Publishing is yours and I would not publish this yet — see §4.

## 2 · Execution 299 — the first success, and the finding that matters

`formatting_status: completed` · `formatting_error: null` · 10.7 seconds · `formatted_files.pdf` written with bucket, path, url, generated_at, produced_by. **The first time in this product's history that formatting has recorded a completion.** The storage write landed too — `manuscript-formats` gained its second object in eleven months.

**And then the object size:**

```
b155f95d…/b155f95d….pdf   10,648 bytes   2026-09-29  ← Paul's book, 401,041 chars
e262b204…/e262b204….pdf   10,648 bytes   2025-11-18  ← a different book, ten months earlier
```

**Byte-for-byte identical.** Two different manuscripts, 401k and (whatever the 2025 book was) characters, ten months apart, same file to the byte. That cannot be content-derived.

**The PDF branch does not render the manuscript.** `Final Manuscript PDF` is an APITemplate.io node with a fixed template id (`cee77b23e127e78a`) and `propertiesJson: {{ $json }}`. The compiler's 401,041 characters of composed HTML are handed over as *template properties* and **the template does not consume them.** It renders the same static document every time.

**So the November 2025 artefact was never a test stub.** It was this pipeline, working exactly as it does today, producing a file that isn't a book. My item-9 courier called it "a 10KB test artefact"; it was the output. I was right that we have never produced a book file and wrong about why.

I could not open the PDF to describe its contents — the storage host is blocked to both of my shells — so I am asserting only what the byte-identity proves, which is that the content does not vary with the book.

## 3 · Executions 300–302 — the DOCX branch, and the error path proving itself

Three runs, three *different* real errors, each one correctly recorded in `formatting_error`. **That is the repair's other half working**: before today a failure left `formatting_status` on `processing` for ever, and a success marked itself `failed`.

| Run | Error recorded | Defect |
|---|---|---|
| 300 | `The value in the "JSON Body" field is not valid JSON` | **5th defect** — the body nested an inner `={{ }}` inside an already-expression body, and sent raw HTML where ConvertAPI wants base64 |
| 301 | same | My first fix used `Buffer` in an expression. **n8n's expression sandbox does not expose `Buffer`**, so the encode returned nothing |
| 302 | `401 — {"Code":4011,"Message":"Unauthorized. Invalid or missing API credentials."}` | **6th defect** — body now correct; the **ConvertAPI credential is dead** |

Body construction moved into a Code node (`Build DOCX Request`), where `Buffer` exists. That is closed. The 401 is not mine to close: **the `ConvertAPI HTML to DOCX` credential (`zmRtVOEwfVxtiYCV`) is invalid or empty** — the same account-migration casualty as the Supabase service key I found in `Store Version`. Two of the three vendor credentials this workflow needs were stripped in that migration and never restored, which is why nothing downstream of the compiler has ever run.

## 4 · What I got wrong, stated plainly

My AMENDMENT 1 said: *"four independent defects, two of them one-line fixes; a written pipeline with broken edges, not an unbuilt idea."* `sysadmin` quoted that to Paul as materially better news than "never built", and Paul's boundary ruling was made partly on it.

**It was too optimistic, and running it is what showed that.** There were six defects, not four. And the deepest one is not an edge at all: **the PDF engine was never pointed at the content.** A reading-only audit could not see it, because on paper the node is wired correctly — it takes the compiled JSON and returns a PDF. Only the byte count gives it away.

The honest version: **the compiler is real and good. Everything downstream of it is either mis-wired, dead-credentialled, or pointed at the wrong thing.** The plumbing is now fixed and proven; the two engines are not producing the book.

## 5 · `finance` — V0.5 needs no change, and that is the point

V0.5 says we have never produced a book file, and ends Phase 1 at handoff-to-composition. **Both still true after everything above.** Do not upgrade a word on the strength of today; the ruling holds, and the two-clock discipline is vindicated — I would have made the document worse if it had been written on my optimistic amendment.

Your v2.6 §3 DON'T-SAY-EVER list is now better evidenced than when you wrote it. Add nothing; *"the formatting workflow is live"* is if anything more forbidden than before.

## 6 · Paul — three things, and one is a data cleanup I cannot do

1. **A working ConvertAPI key** (or a decision to drop ConvertAPI). This is the single thing standing between us and a real composed book file — a DOCX of the whole book, front matter to back matter, which a proofreader or a typesetter can actually use. I do not handle API keys; that is yours.
2. **A decision on the PDF engine.** APITemplate.io is a template filler, not a renderer. Producing a real interior PDF means an HTML-to-PDF renderer instead. Not a repair — a vendor choice, and it deserves its own conversation rather than me picking one.
3. **One SQL statement I cannot run** (the Supabase MCP is read-only to me). My test runs left your project asserting a PDF that is not your book:

```sql
update publishing_progress
set formatted_files = '{}'::jsonb, formatting_status = 'pending',
    formatting_error = null, formatting_completed_at = null, updated_at = now()
where manuscript_id = 'b155f95d-4608-4b94-8d66-d3fd607ef503';
```

Worth running: until it is, the app would offer that 10KB template as a download of your book — which is the affordance rule broken by my own test data, and I would rather not leave it there. The storage object can stay; it is evidence.

**Do not publish the draft yet.** Publishing it makes the repaired-but-still-not-producing pipeline the live version, which is harmless (nothing calls it) but pointless. Publish once the ConvertAPI credential works and I have re-run it — then the active version is one that demonstrably produces a file.

## 7 · Still standing from my last courier

**Four storage buckets are public** — `manuscripts`, `manuscript-versions`, `manuscript-reports`, `manuscript-formats`. Unchanged, still flagged, still not mine. Oliver gets access Monday. I would put it ahead of everything above.

— `publishing`
