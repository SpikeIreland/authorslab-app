# n8n Workflow Export Snapshot — Pre-Migration

**Source instance:** `spikeislandstudios.app.n8n.cloud` (Writing project)
**Target instance:** `authorslab.app.n8n.cloud`
**Export date:** 2026-07-29
**Method:** Read-only snapshot via n8n MCP `get_workflow_details` — verbatim JSON, no reformatting
**Files:** 25 workflows, ~843 KB total

This is a defensive snapshot taken immediately before migrating the AuthorsLab automation stack from the Spike Island Studios n8n instance to a dedicated `authorslab` n8n cloud account. Every file in this directory is the exact JSON returned by the n8n MCP API for that workflow. No node was modified in n8n during export.

---

## Import order (CRITICAL)

1. **`craft-call-cell.json`** MUST be imported FIRST.
   Every editor-facing workflow (2.1–2.5, 3.1–3.3, 4.1–4.3) invokes it via `executeWorkflow` using its Cell ID `crXhG5caNVHBmglo`. That ID will change when re-created in the authorslab instance.
2. After importing Cell into authorslab, its NEW workflow ID must be **re-plumbed into every downstream workflow** that has an `executeWorkflow` node pointing at the old `crXhG5caNVHBmglo`.
3. Import the numbered workflows in phase order (0.1, then 1.x, 2.x, 3.x, 4.x, 5.x, 6.x, then Token Validation).
4. Re-link all `Postgres`, `emailSend` (SMTP), `apiTemplateIo`, `httpHeaderAuth` (Supabase Storage), and `anthropicApi` credentials — node-level `credentials` blocks were stripped from the MCP export payload for every workflow, so every credential-using node will need to be re-selected on import.
5. Rewire the hardcoded n8n webhook URLs in 5.3 and 5.4 (they call `https://spikeislandstudios.app.n8n.cloud/webhook/taylor-generate-covers` via HTTP Request instead of `executeWorkflow`).
6. Rotate any hardcoded secrets found in bodies/headers (see Security flags below) before re-activation.

---

## Workflow inventory

| # | Name | File | ID | Active | Trigger + webhook path | Credentials referenced | Sub-workflows called | Postgres tables | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Craft Call — Cell (DP-CC-01) | `craft-call-cell.json` | `crXhG5caNVHBmglo` | true | executeWorkflow (called by others) | anthropicApi (predefined), Postgres | — | `lmo_ledger`, `lmo_model_pricing` | Shared Anthropic caller. Import FIRST. `aiBuilderAssisted: true` |
| 1 | 0.1 Admin Send Welcome Email | `0.1-admin-send-welcome-email.json` | `3wEzAqrTreSL5ir2` | true | Webhook POST `/admin-send-welcome-email` | emailSend (SMTP, webhookId `170c8f8f`) | — | — | No auth on webhook |
| 2 | 1.0 Manuscript Cleanup (Re-upload) | `1.0-manuscript-cleanup-re-upload.json` | `RMOurvI4qVquXLPL` | true | Webhook POST `/manuscript-cleanup-webhook/manuscript-cleanup` | Postgres | — | `manuscript_issues`, `chapters`, `editor_chat_history`, `manuscript_versions`, `manuscripts`, `editing_phases` | Purges downstream state on re-upload |
| 3 | 1.1 Extract PDF | `1.1-extract-pdf.json` | `1KqM8TgwbMlEuV0T` | true | Webhook POST `/2e5690f8-.../extract-pdf-text` | — | — | — | Pure PDF text extraction |
| 4 | 1.2 PDF Word Count | `1.2-pdf-word-count.json` | `BwpkNmmWNz4LxJVK` | true | Webhook POST `/187c666d-.../pdf-word-count` | (`meta.templateCredsSetupCompleted: true`) | — | — | No Postgres nodes |
| 5 | 1.3 Author Onboarding | `1.3-author-onboarding.json` | `s56tD090y13Jh4Vt` | true | Webhook POST `/ce9cb6e0-.../onboarding` | emailSend (SMTP), Postgres, HTTP header (Supabase service_role) | — | `manuscripts`, `notifications`, `author_profiles`, `publishing_projects`, `marketing_campaigns`, `manuscript_versions` | **SECURITY:** Supabase service_role JWT hardcoded in HTTP header — rotate |
| 6 | 1.4 Parse Chapters | `1.4-parse-chapters.json` | `btmU6mpJvxXYHKGd` | true | Webhook POST `/7dcac0da-.../parse-chapters` | Postgres | — | `manuscripts`, `chapters` | |
| 7 | 1.5 Generate Manuscript Versions | `1.5-generate-manuscript-versions.json` | `UEv75wZl4yJ62sLj` | true | Webhook POST `/311644dd-.../generate-manuscript-version` | apiTemplateIo, httpHeaderAuth (Supabase upload), emailSend, Postgres | — | `manuscripts`, `chapters`, `manuscript_versions`, `author_profiles`, `as_journeys` | `versionId` ≠ `activeVersionId` — unpublished draft exists |
| 8 | 2.1 Alex Generate Chapter Summaries | `2.1-alex-generate-chapter-summaries.json` | `r9xbJrw22k5vb3zs` | true | Webhook POST `/generate-chapter-summaries` | Postgres (implicit) | **`crXhG5caNVHBmglo`** | `chapters` | Cell caller |
| 9 | 2.2 Alex Generate Summary Points | `2.2-alex-generate-summary-points.json` | `G5WgEHKUocdFT5vZ` | true | Webhook POST `/generate-summary-points` | Postgres (implicit) | **`crXhG5caNVHBmglo`** (×7: Structural, Character, Plot, Pacing, Thematic, Summary, Key Points) | `manuscripts`, `chapters` | 7 Cell calls |
| 10 | 2.3 Alex Full Manuscript Analysis | `2.3-alex-full-manuscript-analysis.json` | `oMujQsfgWI1LWD4z` | true | Webhook POST `/alex-full-manuscript-analysis` | Postgres (implicit) | **`crXhG5caNVHBmglo`** | `chapters`, `manuscripts`, `author_profiles`, `editing_phases`, `public.as_journeys` | Largest export (~137 KB) |
| 11 | 2.4 Alex Chapter Analysis | `2.4-alex-chapter-analysis.json` | `DFjLpqzX1geDA0pL` | true | Webhook POST `/alex-chapter-analysis` | Postgres (implicit) | **`crXhG5caNVHBmglo`** | `manuscripts`, `chapters`, `manuscript_issues`, `public.as_journeys` | |
| 12 | 2.5 Alex Chat | `2.5-alex-chat.json` | `CXTvanAIrKIscZuY` | true | Webhook POST `/alex-chat` | Postgres (implicit) | **`crXhG5caNVHBmglo`** | `manuscripts`, `chapters`, `public.as_journeys` | |
| 13 | 3.1 Sam Full Manuscript Analysis | `3.1-sam-full-manuscript-analysis.json` | `WlJSyub30CCJ18Wa` | true | Webhook POST `/sam-full-manuscript-analysis` | Postgres, httpHeaderAuth (Supabase Storage), emailSend, apiTemplateIo | **`crXhG5caNVHBmglo`** | `manuscripts`, `author_profiles`, `editing_phases`, `public.as_journeys` | `phase_number=2` |
| 14 | 3.2 Sam Chapter Analysis | `3.2-sam-chapter-analysis.json` | `1VuJw8Q7kdOyAZx6` | true | Webhook POST `/sam-chapter-analysis` | Postgres (implicit) | **`crXhG5caNVHBmglo`** | `manuscripts`, `chapters`, `manuscript_issues`, `public.as_journeys` | |
| 15 | 3.3 Sam Chat | `3.3-sam-chat.json` | `WJ80vikzg7Gn9tiB` | true | Webhook POST `/sam-chat` | Postgres (implicit) | **`crXhG5caNVHBmglo`** | `manuscript_issues`, `public.as_journeys` | |
| 16 | 4.1 Jordan Full Manuscript Analysis | `4.1-jordan-full-manuscript-analysis.json` | `VFYwr1EiPRKEjwDw` | true | Webhook POST `/jordan-full-manuscript-analysis` | Postgres, httpHeaderAuth (Supabase Storage), emailSend, apiTemplateIo | **`crXhG5caNVHBmglo`** | `manuscripts`, `author_profiles`, `manuscript_versions`, `editing_phases`, `public.as_journeys` | `phase_number=3` |
| 17 | 4.2 Jordan Chapter Analysis | `4.2-jordan-chapter-analysis.json` | `XzmV0P2ADRMjcLYw` | true | Webhook POST `/jordan-chapter-analysis` | Postgres (implicit) | **`crXhG5caNVHBmglo`** | `manuscripts`, `chapters`, `manuscript_issues`, `public.as_journeys` | |
| 18 | 4.3 Jordan Chat | `4.3-jordan-chat.json` | `JO0vIpNCEi0feVzM` | true | Webhook POST `/jordan-chat` | Postgres (implicit) | **`crXhG5caNVHBmglo`** | `manuscript_issues`, `public.as_journeys` | |
| 19 | 5.1 Taylor Assessment | `5.1-taylor-assessment.json` | `NSriLVliqMB3NVPE` | true | Webhook POST `/taylor-assessment` | Postgres, anthropicApi (`lmChatAnthropic`), emailSend (SMTP), apiTemplateIo; Supabase upload uses inline Bearer | — | `manuscripts`, `author_profiles`, `publishing_progress`, `editor_chat_history` | **SECURITY:** Supabase JWT hardcoded |
| 20 | 5.2 Taylor Generate Covers | `5.2-taylor-generate-covers.json` | `kmXSJR6HJpjtwSnt` | true | Webhook POST `/taylor-generate-covers` | Postgres; OpenAI (DALL-E) + Supabase inline Bearer tokens | — | `publishing_progress`, `editor_chat_history` | **SECURITY:** OpenAI + Supabase keys hardcoded |
| 21 | 5.3 Taylor Detect Cover Intent | `5.3-taylor-detect-cover-intent.json` | `YC90KNFV7O6n9XYH` | true | Webhook POST `/taylor-detect-cover-intent` | anthropicApi (`lmChatAnthropic`) | — (invokes `/taylor-generate-covers` via HTTP, not executeWorkflow) | — | Rewire webhook URL post-import |
| 22 | 5.4 Taylor Chat | `5.4-taylor-chat.json` | `aAUuV9tb7iwukBsp` | true | Webhook POST `/taylor-chat` | Postgres, anthropicApi (predefined) | — (invokes `/taylor-generate-covers` via HTTP) | `manuscripts`, `publishing_progress` | **SECURITY:** `x-api-key` also hardcoded in jsonHeaders alongside the predefined credential; rewire webhook URL |
| 23 | 6.1 Format Manuscript | `6.1-format-manuscript.json` | `evWWDBoe7z2t3jtE` | true | Webhook POST `/format-manuscript` (immediate ack response) | Postgres, apiTemplateIo, ConvertAPI (httpQueryAuth generic); Supabase inline Bearer | — | `chapters`, `publishing_progress`, `manuscripts`, `author_profiles` | **SECURITY:** Supabase JWT hardcoded |
| 24 | Token Validation | `token-validation.json` | `zpJNh1Tmwv5yyF83` | true | Webhook POST `/validate-portal-token` | Postgres | — | `author_profiles`, `user_sessions` | |

---

## Cross-cutting notes

### Sub-workflow references
- **11 workflows** invoke Craft Call Cell (`crXhG5caNVHBmglo`) via `executeWorkflow`: 2.1, 2.2 (×7 calls), 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3.
- No workflow invokes any other workflow via `executeWorkflow`.
- **5.3 and 5.4 call 5.2 via HTTP webhook** (`https://spikeislandstudios.app.n8n.cloud/webhook/taylor-generate-covers`) rather than executeWorkflow — those URLs are hardcoded and must be rewritten post-import.

### Credentials referenced (union across all workflows)
Expected: AuthorsLab_Anthropic_Key, AuthorsLab Production, AuthorsLab Anthropic Key, AuthorsLab Cover Generation, Supabase Storage Auth, Author Database, SMTP.

Actually observed in export payloads (node-level `credentials` blocks are stripped by the MCP API — only credential *types* / usage patterns are visible):
- `anthropicApi` (predefined) — Craft Call Cell, 5.1, 5.3, 5.4
- Postgres — nearly every workflow
- `emailSend` / SMTP — 0.1, 1.3, 1.5, 3.1, 4.1, 5.1
- `apiTemplateIo` — 1.5, 3.1, 4.1, 5.1, 6.1
- `httpHeaderAuth` (generic, for Supabase Storage) — 1.5, 3.1, 4.1 (used properly, credential-backed)
- `httpQueryAuth` (generic, for ConvertAPI) — 6.1 (new — not on the expected credentials list; verify a ConvertAPI credential exists in target instance)

### Postgres tables referenced (union)
- **Expected** (on brief): `lmo_ledger`, `lmo_model_pricing`, `as_journeys`, `notifications`.
- **Also referenced (worth flagging for schema-parity check on target):**
  - `manuscripts`, `chapters`, `author_profiles` — core author/book state
  - `manuscript_issues`, `manuscript_versions`, `editing_phases` — editing pipeline
  - `editor_chat_history` — chat persistence (5.1, 5.2)
  - `publishing_progress` — cover/publishing pipeline (5.1, 5.2, 5.4, 6.1)
  - `publishing_projects`, `marketing_campaigns` — onboarding provisions (1.3)
  - `user_sessions` — portal token validation (Token Validation)

Everything above is `public` schema. Some queries write `public.as_journeys` explicitly.

### Security flags (rotate before re-activation on authorslab)
- **1.3 Author Onboarding** — Supabase service_role JWT hardcoded in an HTTP header
- **5.1 Taylor Assessment** — Supabase JWT hardcoded in Storage upload header
- **5.2 Taylor Generate Covers** — OpenAI API key and Supabase JWT both hardcoded in headers
- **5.4 Taylor Chat** — `x-api-key` (Anthropic) hardcoded in `jsonHeaders` alongside the predefined credential (redundant + leak risk)
- **6.1 Format Manuscript** — Supabase JWT hardcoded in Storage upload header

### Version-drift flag
- **1.5 Generate Manuscript Versions** has `versionId` (`f120fbef…`) ≠ `activeVersionId` (`c3714cce…`). An unpublished draft exists in the source instance. Confirm which version is desired before migrating.

### Supabase project reference
All Supabase URLs point at `itlkncjiifbgvmvuejgm.supabase.co`. The database remains the same across the n8n migration; only the automation host is changing.

---

## Secrets scrubbed

The destination copies of the JSON files below have been redacted before commit to the `authorslab-app` repo. Each hardcoded secret was replaced in-place with a placeholder string; the raw values were never echoed and remain only in the source scratchpad. Both the primary `workflow.nodes[*]` payload and the mirrored `workflow.activeVersion.nodes[*]` payload were scrubbed for every occurrence.

| File | Secret type | Node path (in each of `workflow` and `workflow.activeVersion`) | Placeholder |
|---|---|---|---|
| `1.3-author-onboarding.json` | Supabase service_role JWT | `nodes[14].parameters.headerParameters.parameters[0].value` | `<REMOVED - recreate as Supabase Service Key credential in authorslab>` |
| `5.1-taylor-assessment.json` | Supabase service_role JWT | `nodes[11].parameters.headerParameters.parameters[0].value` | `<REMOVED - recreate as Supabase Service Key credential in authorslab>` |
| `5.2-taylor-generate-covers.json` | OpenAI API key | `nodes[2].parameters.headerParameters.parameters[0].value` | `<REMOVED - recreate as OpenAI credential in authorslab>` |
| `5.2-taylor-generate-covers.json` | Supabase service_role JWT | `nodes[5].parameters.headerParameters.parameters[0].value` | `<REMOVED - recreate as Supabase Service Key credential in authorslab>` |
| `5.4-taylor-chat.json` | Anthropic `x-api-key` | `nodes[7].parameters.jsonHeaders` | `<REMOVED - recreate as AuthorsLab_Anthropic_Key credential in authorslab>` |
| `6.1-format-manuscript.json` | Supabase service_role JWT | `nodes[10].parameters.headerParameters.parameters[0].value` | `<REMOVED - recreate as Supabase Service Key credential in authorslab>` |

Verification (post-scrub, run in destination):
- `grep -lE "eyJhbGciOiJIUzI1NiI|sk-ant-api03-|sk-proj-[A-Za-z0-9]{40}" *.json` → no matches.
- `grep -lE "eyJ[A-Za-z0-9]{20,}\.eyJ" *.json` → no matches.

The defensive sweep across all 25 workflow JSONs found no additional hardcoded secrets beyond the five files flagged in the Security flags section above.
