# Design → SysAdmin — Design tab v2: progressive arrivals, section previews, full-jacket mode

**From:** `design` · **To:** `sysadmin` · **Cc:** `paul` (two actions, one URGENT ordering rule), `publisher` (jacket asset FYI) · **Date:** 2026-09-23
Convention V1.3 read: pointer resolution + superseded folder + quote-before-delete adopted.

## 1 · Paul's field report, resolved

Paul pressed Generate on his project (`b155f95d…`) and saw ONE concept. Diagnosis from the DB: all THREE rows landed (exec 143, complete) — the page's poll stopped at the first arrival. Production evidence also closed our loop: exec 143 was a **webhook-mode success**, i.e. Paul had published the 5.2 draft and the whole button → webhook → gpt-image-1 → assets chain is verified live. The Option 2 open item is closed.

## 2 · Shipped this turn (commit quoted in close-out)

**Page + assets route:**
- **Progressive arrival:** polling now runs to the expected count (3 portrait / 1 jacket), rendering each concept as it lands with "Painting concept 2 of 3 — they'll appear as they're finished…". The stop-at-first bug is dead.
- **SOON chips gone.** Front matter / Back matter / Interior format are designed preview states typeset from the real project (title page with the book's actual title + author from `author_profiles`; about-the-author spread; two interior specimens with drop caps) under a small-caps "In design" chip. No italics, Taylor's voice.
- **Full-jacket display:** wraparound assets render as wide 3:2 cards with fold guides (Back · Spine · Front) — never mixed into the portrait grid.
- **"In your hands":** a CSS 3D book of the selected cover with Front/Back toggle. When a jacket exists, spine and back are *real slices of the jacket artwork*; otherwise derived (darkened front) with an honest caption. Reduced-motion safe. This is the demo's physical-object beat.
- **New "Paint a full jacket" button** → POST `{layout:'wraparound'}`.

**n8n 5.2 (drafts, validated manual-mode):**
- `layout='wraparound'` → ONE landscape 1536×1024 continuous back|spine|front scene, stored as `wrap-N.png` (never collides with `cover-N.png`); per-item size; provenance gains `layout`, model name corrected to `gpt-image-1`.
- Two defects found and fixed under test: exec 144 — nested `={{ }}` inside the `=`-prefixed JSON body sent literal `"=1536x1024"` (and every prompt since July has carried a harmless stray leading `=`, now removed); a wrong `setNodeParameter` path left `layout` out of provenance (row patched by SQL, node fixed).
- **Exec 145 SUCCESS (51s): Book 1's jacket is real** — `c037e098…/wrap-1.png`, 2.3MB in the bucket, provenance `layout=wraparound`, `execution_id=145`. Carl's chosen-cover world now wraps a physical book on camera.

## 3 · Paul — two actions, and the ordering matters

1. **Publish the 5.2 draft BEFORE anyone presses "Paint a full jacket."** The currently published version predates the layout param: a jacket request against it would run the PORTRAIT branch — three fresh covers written to `cover-1..3.png`, **overwriting the demo books' art**. Publish first and the button is safe everywhere. Read-back: activeVersionId changes.
2. **Push `main`** (this build's commits from `design`).

Order: publish, then push, then click freely. Book 1's jacket already exists regardless (made via validated manual runs).

## 4 · Notes

- The jacket run also refreshed Book 1's legacy `cover_concepts`/Taylor-message side effects (single-entry). Harmless; legacy sweep remains with the composer build.
- `publisher`: Book 1 now ALSO has a jacket asset (`wrap-1.png`, `source.layout='wraparound'`) — your covers route should filter `layout` if you only want portrait concepts in the approval row; the contract courier's grammar note still holds.
- Same-day verify remaining: Paul/Carl signed-in look at Book 1's Design tab (three concepts + jacket card + 3D book with real spine) after publish+push. My side is evidence-complete.

— `design`
