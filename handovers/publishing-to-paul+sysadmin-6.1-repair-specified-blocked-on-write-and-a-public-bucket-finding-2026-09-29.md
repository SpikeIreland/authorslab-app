# Publishing → Paul — 6.1's repair is specified and verified by reading. I cannot apply it. Here is exactly what to change, plus one finding that matters more before Monday.

**From:** `publishing` · **To:** `paul` (the n8n write, and the boundary ruling) · **cc:** `sysadmin` (P5 status, the ruling input, and §4 which is yours), `identity-billing` (§4), `finance` (§3 firms up your sentence) · **Date:** 2026-09-29

## 0 · Status, plainly

**P5 is specified, not shipped.** I drafted the full repair as a single atomic n8n update and the call was **refused by this session's permission layer as a shared-resource modification** — the same gate that blocks my Supabase writes. I did not route around it. §2 is the change, written so you can apply it in the n8n editor in a few minutes.

**The app-side half is done** — commit `7a62e9c`, `git show --stat 7a62e9c`: `src/types/database.ts` (+29/−…) · `src/components/PublishingContentPanel.tsx` (55 changed). Pathspec commit per rule 1 clause 1. `tsc --noEmit` clean. That closes defect 4's other half: when the pipeline is fixed, the product now reads the keys it writes.

Also: I hit the lock residue again, and **clause 2 works.** `.git/HEAD.lock` mtime was `00:52:25.213938722`, the last commit's timestamp was `00:52:25` — same second, residue not contention. I cleared and re-committed immediately instead of investigating, and lost nothing. The clause earns its place.

## 1 · What the repair does, in one line each

| Defect | Fix |
|---|---|
| Success path fed the error handler | Remove that edge; wire real error outputs from the five fragile nodes instead |
| `Store Version` auth header held the migration placeholder | Delete the header; authenticate via the attached `Supabase Service Key` credential |
| `Upload to Database` was a Postgres node containing JSON | Replace with an HTTP upload, plus its own progress update |
| Three format vocabularies | Write `formatted_files.pdf` and `.docx`, which is what it produces |

## 2 · The change, node by node

**A · Delete one connection.** `Update Publishing Progress` → `Error Handler - Update to Failed`. This is the one that makes a successful run mark itself failed. Deleting this edge alone is the single highest-value change in the list.

**B · `Store Version` — fix the auth.** Delete the `Authorization` header parameter entirely (it still reads `Bearer <REMOVED - recreate as Supabase Service Key credential in authorslab>`). Then set Authentication to **Generic Credential Type → Header Auth**, selecting the existing **Supabase Service Key** credential. Keep `Content-Type: application/pdf` and `x-upsert: true`. The node already has the credential attached; it was simply never being used because the literal header overrode it.

**C · `Update Publishing Progress` — write a key something reads.** Replace the query with:

```sql
UPDATE publishing_progress
SET formatting_status = 'completed',
    formatting_completed_at = NOW(),
    formatting_error = NULL,
    formatted_files = jsonb_set(
      COALESCE(formatted_files, '{}'::jsonb), '{pdf}',
      jsonb_build_object(
        'bucket', 'manuscript-formats',
        'path',  '{{ $("Set Initial Variables").item.json.manuscriptId }}/{{ $("Set Initial Variables").item.json.manuscriptId }}.pdf',
        'url',   'https://itlkncjiifbgvmvuejgm.supabase.co/storage/v1/object/public/manuscript-formats/{{ $("Set Initial Variables").item.json.manuscriptId }}/{{ $("Set Initial Variables").item.json.manuscriptId }}.pdf',
        'generated_at', NOW()::text,
        'produced_by',  '6.1 Format Manuscript'))
WHERE manuscript_id = '{{ $("Set Initial Variables").item.json.manuscriptId }}'
RETURNING manuscript_id, formatting_status, formatting_error, formatted_files;
```

Note `formatting_error = NULL` on success — without it, a row that failed once carries its old error forever.

**D · Replace `Upload to Database`.** Delete it. Add an **HTTP Request** node, `Store DOCX`, wired `Download DOCX → Store DOCX`:
- POST `https://itlkncjiifbgvmvuejgm.supabase.co/storage/v1/object/manuscript-formats/{{ $('Set Initial Variables').item.json.manuscriptId }}/{{ $('Set Initial Variables').item.json.manuscriptId }}.docx`
- Generic Credential Type → Header Auth → **Supabase Service Key**
- Headers: `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `x-upsert: true`
- Body: Binary, input field `data`

Then a **Postgres** node `Update Publishing Progress (DOCX)` after it, same query as C but with `'{docx}'` and `.docx` in both path and url.

**E · Make failure visible.** On `Final Manuscript PDF`, `Store Version`, `Convert HTML to DOCX`, `Download DOCX` and `Store DOCX`, set **On Error → Continue (using error output)**, and wire each node's error output to `Error Handler - Update to Failed`. Then change that node's query to survive a missing message:

```sql
formatting_error = '{{ ($json.error && ($json.error.message || $json.error)) || "unknown error" }}'
```

Without E, deleting the edge in A leaves failures silent — status would sit on `processing` forever, which trades one lie for another.

**Read-back to quote when you publish:** 16 nodes before, 17 after (one removed, two added); one connection removed, seven added; four node queries or parameter sets changed. Per House Rules a multi-node edit gets a read-back before publish — quote the active version id afterwards and I will verify against it.

## 3 · What the repair does NOT do, and it bears on your ruling

**Nothing calls 6.1.** Fixing it does not make formatting reachable; it makes it *correct when reached*. The caller — a route and a control on the author's surface — **is** the composition feature, and I am deliberately not building it until you rule the boundary, because the shape of the control depends on which side of the line composition sits.

**And one hard limit survives the repair, which is the part I would want in your hands before you decide.** Both vendors are conversion services, not typesetting engines: APITemplate.io for PDF, ConvertAPI for DOCX. `trimSize` is captured and never used; the DOCX call reads a `pageSize` that `Set Initial Variables` never sets, so it defaults to **US Letter**. So after the repair the pipeline produces **a faithful reading and proofing copy of the book** — real front matter, real chapters, real back matter, correctly ordered — and it does **not** produce a print-ready interior: no specified trim, no bleed, no spine sized to the page count, no PDF/X. That is a vendor limit, not a wiring one, and closing it is a different and larger job.

**My recommendation on the boundary, since `sysadmin` asked for it before V0.5 assembles.** I agree with option 2 inside option 1, and I would sharpen what Phase 1 ends *at*. Not "handoff to composition" — that names a gap. Name the deliverable:

> **Phase 1 ends with a composed manuscript: your edited book, with its front and back matter, as a document you can read, print and hand to a proofreader. Turning that into the files a printer or a distributor requires is the next phase, and what it requires depends on who receives them.**

That is true after the repair, it is a thing rather than an absence, and it makes the Hachette question the natural next sentence instead of an awkward one. For High Line specifically the honesty is an advantage: **what Hachette needs is precisely the part we do not do**, so asking Oliver what they need is not a confession — it is the scoping question for phase 2, and he is the person in the world best placed to answer it.

## 4 · The finding I would act on before Monday — four buckets are public

Checked while confirming where 6.1 should write. `storage.buckets`:

| Bucket | Public? | Holds |
|---|---|---|
| `manuscripts` | **true** | uploaded manuscripts |
| `manuscript-versions` | **true** | edited manuscript versions (27 objects) |
| `manuscript-reports` | **true** | editorial reports (27 objects) |
| `manuscript-formats` | **true** | formatted output |
| `cover-assets` | false | cover art — correctly private |

**An author's unpublished manuscript, and the editorial report on it, are readable by anyone with the URL, without authentication.** Paths are `<manuscript-uuid>/<file>`, so this is obscurity, not access control — and House Rules' data section requires RLS-on-with-policies, which a public bucket routes around entirely. `design` got `cover-assets` right; the manuscript buckets predate that care.

Two reasons this is urgent rather than tidy. **Oliver gets access on Monday** and is described as the person most likely to press a button rather than watch one be pressed. And **my repair writes composed books into `manuscript-formats`** — so the moment it works, the most complete artefact we hold becomes the most exposed. I would rather flag it now than ship into it.

**Not my lane** — storage config is `sysadmin`'s and entitlement is `identity-billing`'s, and flipping a bucket to private breaks every consumer reading a public URL (including the report links Oliver saw in the demo), so it needs the signed-URL pattern `design` already built for covers. I am not touching it. But I would not let Monday arrive without a decision recorded either way.

## 5 · Asks

- **`paul`:** apply §2 and publish (n8n lane is yours; my write is refused). Then rule the boundary — §3 has my recommendation. Nothing else from me is blocked on you.
- **`sysadmin`:** P5 is specified and blocked at the write, not at the thinking. §4 is the one I would put ahead of it on the Monday list.
- **`identity-billing`:** §4 touches your entitlement model — a public bucket is an authorisation bypass that no plan gate can see.
- **`finance`:** §3's boundary sentence is stronger than my earlier one and is safe to use once Paul rules; the vendor limit in §3 is the caveat that keeps "composed manuscript" from being heard as "print-ready".

— `publishing`
