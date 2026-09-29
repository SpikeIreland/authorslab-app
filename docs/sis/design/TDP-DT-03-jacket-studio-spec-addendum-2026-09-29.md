# TDP-DT-03 · The Jacket Studio — spec addendum to TDP-DT-01

**AL-PDC-TDP-DT-03 · 2026-09-29 · `design`**
**Status:** Paul-commissioned 2026-09-29 (in-chat); amends TDP-DT-01 (the composer) — IA and data model carry over; this addendum upgrades the document from front-cover-first to **jacket-first**.
**Consumes:** Paul's three requirements (this date), AL-UX-008 (visual contract, still binding), publishing's first-book-file note (6.1 DOCX works — the page-count seam now has a producer coming).

## 1 · Paul's three requirements, mapped

1. **Front + back + spine accounting for book thickness and invisible folded edges** → the composer's document becomes the FULL FLAT JACKET (§2–3). New capability over TDP-DT-01, which deferred print-wrap; Paul has pulled it into the core studio.
2. **Move layout items, Canva-like (Title, publishing house, author…)** → TDP-DT-01's layer model unchanged (drag/style/select; Taylor drives, editor refines). One addition: a **`publisher` text role** joins title/subtitle/author as a seeded-optional layer, and a **rotated spine text layer** (title · author) is seeded on the spine zone.
3. **Upload a design from outside** → TDP-DT-01 pathway 2, now built: author-side, behind the author's own auth + RLS (distinct from publisher upload, which stays gated on I&B per the 09-24 courier). Uploads write the collision-proof namespace `<manuscript>/upload-<uuid>.<ext>` per contract V1's planned revision.

## 2 · The jacket document

Canvas = one flat sheet, left to right: **[fold wrap] [back] [spine] [front] [fold wrap]**, plus bleed on all outer edges. Fold wraps and bleed are shaded and labelled — visible while editing, excluded from the observer's view and from exports. Two binding models:

- **Paperback:** no fold wraps; 0.125″ bleed all round (KDP/Ingram standard).
- **Hardcover (casewrap):** 0.75″ fold-under wrap on all edges (the "folded edges not visible" Paul described), plus hinge allowance at the spine joints rendered as quiet guide lines.

## 3 · Spine width — computed, never guessed silently

`spine = pages × paper_factor (+ binding allowance)`. Paper factors (KDP-published): white 0.002252″/page, cream 0.0025″/page; hardcover adds board allowance. Trim presets: 5×8, 5.5×8.5, 6×9.

**Page-count source, in order of truth:** (1) the formatting tool — publishing's 6.1 output is the real producer; a `pages` handoff lands when their PDF branch stabilises (their courier: "cover + interior become the same conversation" — this is that conversation's first concrete field); (2) until then, **estimate `ceil(words / 280)`** from `current_word_count`, displayed as "≈ estimated — from your manuscript" with an **editable page-count override**. The number is never hidden and never claims precision it lacks (affordance rule applied to arithmetic). Changing pages/trim/paper re-flows the spine live; text layers keep their zone-relative positions.

## 4 · Artwork on the jacket

A wraparound asset (5.2 `layout='wraparound'`, live since 09-23) maps zone-to-zone. A portrait concept covers the front zone, with back/spine taking a derived treatment (dominant-tone fill v0.1; art-extension generation is a later stage). Uploads may be either shape — width/height ratio decides the mapping, author can override.

## 5 · Out of scope for v0.1 (named so nothing is implied)

Print-resolution export (blocked on upscaling — the true-state courier to finance stands: ebook-grade on composer completion, print-grade later); CMYK/PDF wrap output; barcode/ISBN block (needs the ISBN field that V0.5 just learned doesn't exist); image/shape freeform layers beyond text (Stage 2); Taylor's edit_ops driving the studio (the 5.4 contract exists — wiring it is the fast-follow after v0.1 renders).

## 6 · Build order

**v0.1 (now):** jacket math lib · draft + upload routes · studio page (zones, artwork, draggable/styleable text layers incl. spine, live spine width, autosave to `cover_drafts`, upload intake) · Design-tab entry point.
**v0.2:** versions + "Use this cover" export (1600×2560 front crop = the KDP-recommended file) · Taylor pre-placement + edit_ops wiring · AL-UX-008 full visual pass (Manuscript Room language, working states).
**v0.3:** 6.1 page-count seam · art-extension for portrait-only jackets · Stage-2 freeform layers.

— `design`
