# n8n Estate Manifest — spikeislandstudios account
**Prepared:** 2026-07-22 · AuthorsLab SysAdmin · Day-zero item #2 (estate separation)

## The finding that reframes this task

The live AuthorsLab machinery is NOT in this account. Per `src/lib/n8n-config.ts`
(the app's single source of truth for webhooks): **"Migrated from
spikeislandstudios → authorslab account on 2026-04-23."** The app defaults to
`https://authorslab.app.n8n.cloud`. Execution ground truth agrees: zero
executions in the whole spikeislandstudios account since at least 22 May 2026,
except one erroring Clarence relic (see Courier Brief).

**Therefore: the entire spikeislandstudios account is the museum.** Estate
separation already exists at account level (live = authorslab account) and at
project level within the museum (Clarence = Legal, AuthorsLab = Writing).

## Classification — Writing project (53 workflows)

MCP write access is disabled per-workflow in this account, so I could not apply
tags programmatically. Suggested tags, to apply in the n8n UI (bulk-taggable
from the workflow list):

### Tag `video-legacy` — 3 strays that belong with the Video Creation estate
All inactive: Video Generator · Character Angle Generator (has old "Upload
Image" tag) · Pre-Production

### Tag `authorslab-legacy` — all remaining 50

**⚠ Still ACTIVE (32) — live webhook endpoints on dead machinery.** These are
V2-era copies of the line now running in the authorslab account. Any stale
client, cached page, or rollback env var pointing at spikeislandstudios will
execute these against production data. Recommend deactivating after confirming
the authorslab-account twins are live (your call — behavioral change):

0.1 Admin Send Welcome Email · 1.0 Manuscript Cleanup (Re-upload) · 1.1 Extract
PDF · 1.2 PDF Word Count · 1.3 Author Onboarding · 1.4 Parse Chapters · 1.5
Generate Manuscript Versions · 2.1 Alex Generate Chapter Summaries · 2.2 Alex
Generate Summary Points · 2.3 Alex Full Manuscript Analysis · 2.4 Alex Chapter
Analysis · 2.5 Alex Chat · 3.1 Sam Full Manuscript Analysis · 3.2 Sam Chapter
Analysis · 3.3 Sam Chat · 4.1 Jordan Full Manuscript Analysis · 4.2 Jordan
Chapter Analysis · 4.3 Jordan Chat · 5.1 Taylor Assessment · 5.2 Taylor
Generate Covers · 5.3 Taylor Detect Cover Intent · 5.4 Taylor Chat · 6.1 Format
Manuscript · Ghostwriter Read Material · Eden Match · Ivy Chat · Reid Chat ·
Portal AI Chat · Store Manuscript Simple · Free Manuscript Analysis ·
Professional Manuscript Analysis · Token Validation

**Already inactive (18):**
Author Package Phase 1–4 V2.0 (×4) · Author Signup · Author Portal Login ·
Alex Developmental · Alex Character · Alex Thematic · Alex Structure · Alex
Plot · Alex Pace · Alex Initial Analysis · Load Manuscript · Parse Chapters
simple · Get Manuscript Scores · Manuscript Word Count · 5.4 Taylor Chat copy

## Other projects (for completeness)

- **Legal (130):** old Clarence estate — Clarence SysAdmin's jurisdiction; not
  touched. ~60 still active, same stale-endpoint hazard class. One live defect
  (see Courier Brief).
- **Personal (10):** sandbox/tutorial workflows, all inactive. Two 2026-04
  Clarence items (09.07 QC Timeline & Audit Log, 05.03 Parse Template
  Structure) sit here rather than in Legal — flag to Clarence SysAdmin.
- **Video Creation (0):** empty project; the three video workflows are in
  Writing (hence `video-legacy` tag).

## Open questions surfaced by n8n-config.ts (for the live-account survey)

The config's own comments flag mismatches to verify once I can see the
authorslab account:
1. `free-manuscript-analysis` and `manuscript-word-count` marked "workflow
   currently INACTIVE in n8n — activate before deploying or retire the page."
2. `ghostwriter-gap-analysis` webhook path vs workflow named "Ghostwriter Read
   Material" — path match unconfirmed.
3. 06.01 Format Manuscript: UI exists, backend incomplete, not wired.

## Recommended sequence

1. Apply the three tags in the n8n UI (minutes, non-behavioral).
2. Repoint the n8n MCP connector at the authorslab account (agreed) so the live
   estate becomes observable; I then survey it and build the Route Definition
   Packs from reality.
3. Adjudicate deactivation of the 32 still-active legacy workflows — ideally
   after the live-account survey confirms each twin.
4. Deliver the courier brief to the Clarence SysAdmin chat.
