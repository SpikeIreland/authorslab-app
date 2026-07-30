# AuthorsLab Legal Drafts

Draft legal documents produced by Clarence Legal on 30 July 2026 and extracted from `../clarence-knowledge-2026-07-30.pdf`. These are the source-of-truth Markdown files to feed into the AuthorsLab public pages (`/legal/*`).

## What's here

| File | Public route | Notes |
| --- | --- | --- |
| `privacy-policy.md` | `/legal/privacy` | Full UK + EU GDPR privacy policy, sections 1–15 |
| `terms-of-service.md` | `/legal/terms` | Terms of Service, sections 1–15 |
| `cookie-policy.md` | `/legal/cookies` | Cookie Policy, sections 1–6 |
| `subprocessors.md` | `/legal/subprocessors` | Public subprocessor list |
| `dpa-template.md` | (not public – enterprise/publisher only) | Data Processing Addendum template for enterprise / publisher customers |

The text is Clarence's drafting verbatim. Do not rewrite the legal content when integrating — only surface-level Markdown/HTML rendering adjustments. Broken PDF line-breaks and bullet characters have already been normalised.

## Clarence's overall approach (from the delivery note)

Assumptions applied across all documents (Paul to confirm):

| Item | Assumption used |
| --- | --- |
| Registered entity | AuthorsLab Ltd (UK company) — Paul to confirm and replace |
| Jurisdiction | England & Wales, with UK GDPR as primary data law |
| EU GDPR | Also addressed (UK and EU GDPR run in parallel) |
| Supabase region | EU West (Ireland) — Paul to confirm |
| DPA scope | UK GDPR + EU GDPR (dual-regime) |
| ICO registration | Assumed required — Paul to confirm registration number |
| Governing law | England & Wales |
| Currency | GBP (with USD noted as alternative for non-UK subscribers) |
| Subscription default | Monthly and annual tiers, specific pricing not yet set |
| Effective date | `{{EFFECTIVE_DATE}}` throughout |

Clarence also noted that three unrelated documents in the Clarence folder (services agreement redlines) appear to relate to a separate matter and did not inform these drafts.

## Placeholder tokens to fill in before publication

### `{{EFFECTIVE_DATE}}`

Appears at the top of every document. Replace with the launch/effective date once decided.

- `privacy-policy.md`
- `terms-of-service.md`
- `cookie-policy.md`
- `subprocessors.md`
- `dpa-template.md`

### `[- ]` (blank fields Clarence left for AuthorsLab to fill)

| Blank | Where |
| --- | --- |
| Company number | Privacy Policy §1; Terms of Service §1.1; DPA opening block (AuthorsLab side) |
| Registered address | Privacy Policy §1 and §15; Terms of Service §1.1 and §15.7 (`[Registered address]`); DPA opening block |
| ICO registration number | Privacy Policy §1 |
| Customer company number | DPA opening block (customer side) |
| Customer registered address | DPA opening block (customer side) |

### DPA-specific counterparty placeholders

| Token | Where | What to do |
| --- | --- | --- |
| `[CUSTOMER ENTITY NAME]` | DPA opening block | Filled at signing per counterparty |
| `[jurisdiction]` | DPA opening block | Customer's country of registration |
| `[Customer Entity]` | DPA Execution block | Filled at signing per counterparty |

### `[Paul: …]` inline notes / decisions still open

These are Clarence's editorial notes to Paul. Delete once resolved, replace surrounding text with confirmed values.

| Note | Where | Decision needed |
| --- | --- | --- |
| `[Paul: confirm registered name]` | Privacy Policy §1 and §15 | Confirm the exact legal entity name is "AuthorsLab Ltd" |
| `[Paul: confirm]` | Terms of Service §1.1 | Same — confirm registered name |
| `[Paul: confirm region]` (Supabase) | Privacy Policy §5.1; Subprocessors table | Confirm Supabase project region is EU West (Ireland) |
| `[Paul: confirm or update]` (analytics) | Privacy Policy §3.6 | Confirm Vercel Analytics is the analytics vendor at launch |
| `[Paul: confirm if self-serve deletion is available at launch]` | Privacy Policy §10 | Confirm whether users will have UI-level chat-history deletion at launch |
| `[Paul: Vercel Analytics is privacy-friendly by design ... update this table.]` | Cookie Policy §2.2 | Informational — remove if keeping Vercel; update if switching |
| `[Paul: update this table as platform features develop. Include any onboarding/tour cookies.]` | Cookie Policy §2.3 | Reminder — expand cookie table once onboarding/tour cookies exist |
| `[Paul: confirm region]` (APITemplate.io) | Subprocessors table | Confirm APITemplate.io processing region |
| `[Paul: confirm region - EU preferred]` (ConvertAPI) | Subprocessors table | Confirm ConvertAPI processing region — Clarence prefers EU |
| `[or confirm SMTP provider]` (Resend) | Subprocessors table | Confirm the transactional email provider is Resend (or substitute) |
| `[Paul: confirm]` (Resend region) | Subprocessors table | Confirm US region for Resend |
| `[Paul: add mechanism if implemented]` | Subprocessors — Changes section | Wire up (or remove reference to) a subprocessor-change email subscription |
| `[Paul: consider a dedicated notification mechanism for enterprise customers]` | DPA §5.2 | Decide whether enterprise DPA counterparties get a dedicated sub-processor notice channel |
| `[Paul: update if another EEA member state is preferred]` | DPA Schedule 2, EU SCCs clause 17 | Confirm Ireland as governing law for SCCs (or change) |

## Paul's action list (verbatim from Clarence's "Delivery summary and next steps")

| Item | Needed in | Urgency |
| --- | --- | --- |
| Confirm registered company name | All documents | High |
| Confirm company number and registered address | All documents | High |
| Confirm ICO registration number | Privacy Policy (§1) | High |
| Confirm Supabase region | Privacy Policy (§5.1), Subprocessor List | High |
| Confirm all subprocessor regions (APITemplate.io, ConvertAPI, Resend) | Subprocessor List | Medium |
| Confirm analytics vendor (Vercel Analytics vs alternative) | Privacy Policy (§3.6), Cookie Policy (§2.2) | Medium |
| Confirm whether self-serve conversation history deletion is in scope at launch | Privacy Policy (§10) | Medium |
| Confirm DPA governing law for SCCs (Ireland preferred?) | DPA Schedule 2 | Medium |
| Confirm any existing data processing agreements with Anthropic/OpenAI/Supabase | DPA + Privacy Policy | Medium |
| Confirm VAT registration status | Relevant to refund policy (nice-to-have) | Low |

## Post-launch documents Clarence offered to draft next

- Standalone Acceptable Use Policy (the AUP clause in ToS §6 is deliberately brief)
- DMCA / copyright infringement policy
- Refund policy

## Extraction notes

- Source PDF: `../clarence-knowledge-2026-07-30.pdf` (35 pages, extracted 30 July 2026 via pypdf).
- Every-page footer "Generated by Clarence Knowledge — clarencelegal.ai" and the closing "This document is provided for informational purposes only and does not constitute legal advice" were stripped from the individual policy files — they belong to the delivery wrapper, not the policies themselves.
- All tables (Privacy §4 legal bases, Privacy §8 retention, Cookie §2.1–2.3, Subprocessors, DPA Schedule 1, DPA Schedule 2 UK IDTA + EU SCCs) were reconstructed as Markdown tables — the raw PDF text had column values split across multiple lines and needs a spot-check on final rendering.
- Bullet characters (`•`) from the PDF have been normalised to Markdown `-`.
- Numbered sub-clauses (e.g. `1.1`, `2.1`) in the Terms of Service and DPA are rendered as bold labels on their own line (Clarence's preferred style, matches the PDF layout).
- No content was rewritten, summarised, or reordered — the text is verbatim from Clarence's draft.

## Suggested next steps

1. Legal review by Paul against the action list above.
2. Fill placeholders and replace `{{EFFECTIVE_DATE}}` with the launch date.
3. Delete/resolve `[Paul: …]` inline notes as decisions land.
4. Wire the four public files into the Next.js `/legal/*` routes; keep `dpa-template.md` internal (not linked publicly).
5. Confirm the subprocessor-change notification mechanism referenced in `subprocessors.md` and DPA §5.2.
