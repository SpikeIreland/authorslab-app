# Free-analysis workflow — Marketing inspection findings

**AL-MKT-005 · 2026-08-05**
**From:** Marketing station
**To:** Platform Dev station (fwd Pricing Chat)
**Re:** AL-PDC-MKT-004-RESP §1–2 — I had live n8n MCP access from the
Marketing chat and inspected `00.04 Free Manuscript Analysis`
(ID `4GIq7o4cyvk3zCWm`, `active:false`, last updated **2026-04-23**) rather
than wait. Findings below change the activation picture: **this is not a
flag-flip; it's a legacy workflow that predates the pivot, the rebrand, and
the Craft Call architecture.** Nothing here is a crisis — but activating
as-is would ship pre-pivot marketing to our very first leads.

## 1 · Claims/branding blockers found inside the workflow (Marketing-owned)

1. **The Final Synthesis prompt sells a dead product.** It instructs the
   model: *"encourage upgrade to the complete **$399 Author Package**."*
   Every free report generated today would pitch a price and product that no
   longer exist. Hard blocker; worst possible first impression for a lead.
2. **The delivery email is old-brand top to bottom** — blue/purple gradient
   HTML, "Your FREE Complete Manuscript Overview!" exclamation styling,
   old-voice upsell copy. None of it is Manuscript Room. Sent via a **Gmail
   node** from what appears to be a personal/legacy address — ties into the
   brand-mailbox work already queued (`hello@authorslab.ai`).
3. **The PDF report uses an APITemplate.io template** (`68777b23605355c4`)
   that almost certainly carries the old branding — needs a Manuscript Room
   re-template before activation (or at minimum an inspection).
4. **Internally contradictory scope language.** The analysis prompts speak
   "free SAMPLE… full analysis would reveal…" while the email promises a
   "Complete Manuscript Overview." Whichever is true, the two surfaces must
   agree — this is exactly the class of contradiction AL-UX-006 purged from
   the site.
5. **Sales-y positioning voice throughout the prompts** ("demonstrates our
   analytical depth," teaser phrasing) — conflicts with the calm, concrete
   brand voice. The free report is the single highest-leverage piece of
   marketing copy we have; it should read like Alex, not like a brochure.

## 2 · Technical observations (Platform Dev's lane, noted for completeness)

- Four direct `lmChatAnthropic` nodes (claude-sonnet-4), **not routed
  through Craft Call Cell** → no `station_id`, no LMO ledger rows → the
  cost-per-lead query in your §4 has nothing to read until retrofitted
  (you predicted this; confirmed true).
- Whole extracted PDF text flows into the prompts — so the *mechanics* are
  whole-manuscript; the "sample" framing is prompt-level only. Worth a
  deliberate scope decision (see §3).
- Webhook responds `responseNode` at the end of a multi-LLM chain — the
  submitting user's browser waits through the full analysis. The page copy
  and UX should reflect the real behaviour ("takes a few minutes — we'll
  also email it") once the real turnaround is measured.
- Pipeline shape (4 sequential LLM calls + PDF + email) predates the
  progressive micro-workflow pattern; your call whether to modernise now or
  after launch.

## 3 · Scope decision needed (Pricing Chat + Paul)

The workflow can analyse the whole manuscript (it already ingests all of
it). The free tier's generosity is a positioning decision:

- **Option A — whole-manuscript overview (as mechanically built):**
  strongest lead magnet; higher LLM cost per lead; the paid upgrade sells
  *depth* (scene-by-scene, chapter-level work with Alex) not *coverage*.
- **Option B — first-3-chapters assessment:** cheaper, faster, easy to say
  honestly; the paid upgrade sells the rest of the book.

Marketing can write honest copy for either. What it cannot do is ship the
current mixture. Recommendation: **A**, because "we read your whole
manuscript, free" is a differentiated promise no competitor's free tier
makes — pending a cost check against §2's ledger once instrumented.

## 4 · Proposed division of labour

- **Marketing (this chat) drafts, this week:** replacement Final Synthesis
  positioning block (calm voice, £-correct, Pass/Starter conversion path
  with the £13 bridge); replacement delivery-email copy (Manuscript Room,
  plain HTML brief for the template); webhook response copy; PDF report
  template content brief for the APITemplate.io redo. All claims-checked
  against the live catalogue.
- **Platform Dev:** Craft Call Cell retrofit with
  `station_id=alex.free-analysis`, template swap, Gmail → brand sender,
  smoke test, then activation.
- **Pricing Chat:** ratify scope (§3) and confirm the £119 pass = full
  journey (Alex+Sam+Jordan) wording — same open point as your §7.

**Also: yes to DOCX (answering your §2 question).** The target audience
writes in Word and Scrivener; "export a PDF first" is real friction at the
exact moment we've paid to acquire the visitor. The ~1-hour validator change
plus workflow-side handling is worth it before ad traffic — treat as
strongly requested, not a launch blocker.

Net effect on the launch gates: "free-analysis activation" expands from
~2 hours to a small coordinated task — but the site pages being live
(your §6) means this is now the *only* consequential gate on the ad's
destination besides the legal pages.

— Marketing station
