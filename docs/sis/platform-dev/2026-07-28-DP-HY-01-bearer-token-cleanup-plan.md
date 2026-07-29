# DP-HY-01 · Hardcoded Bearer token cleanup — plan

**AL-PDC-DPHY01-P · 2026-07-28**
**Filed by:** Platform Developer station
**Status:** PLAN. Needs Paul to create/share one credential in the n8n UI; the rest is MCP-executable.
**Priority:** Elevated — token is now inline in 4 production workflows after the Wave 1 migration.

## 1 · What's wrong

The Supabase `service_role` JWT is hardcoded as an `Authorization: Bearer …` header value inside four HTTP Request nodes:

- `2.3 Alex Full Manuscript Analysis` — node `HTTP Request` (uploads Alex's report PDF)
- `3.1 Sam Full Manuscript Analysis` — node `HTTP Request` (uploads Sam's report PDF)
- `4.1 Jordan Full Manuscript Analysis` — node `HTTP Request` (uploads Jordan's report PDF)
- `1.5 Generate Manuscript Versions` — node `Store Version` (uploads phase-snapshot PDF)

The full JWT is visible to anyone with n8n workflow-read scope on the Writing project. The token has `role: "service_role"` (full DB bypass), `iat: 2025-10-15`, `exp: 2035-10-13` — so it's a long-lived key that hasn't been rotated since October last year. n8n's `validate_workflow` has been flagging `HARDCODED_CREDENTIALS` on each of these since the migrations landed.

**Blast radius if leaked:** full read/write access to the AuthorsLab Supabase project via PostgREST bypassing all RLS. Anyone who cloned the n8n project export or had temporary read access could hold it indefinitely.

## 2 · The fix

Move the token into a proper `httpHeaderAuth` n8n credential, bind the four HTTP nodes to that credential, and delete the inline header from each node's parameters.

n8n stores credentials encrypted at rest and never exposes them in workflow JSON exports. Workflow readers see only a credential reference (`{id, name}`), not the token itself.

## 3 · What Paul needs to do

**One credential creation in n8n UI** (5-minute task):

1. In n8n, go to **Credentials → New Credential → Header Auth** (the credential type is `httpHeaderAuth`).
2. Name it: `Supabase Storage Auth` (or similar; the name is what shows up in dropdowns).
3. Set:
   - **Name** field (header key): `Authorization`
   - **Value** field (header value): `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0bGtuY2ppaWZiZ3ZtdnVlamdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDUyNjUyOSwiZXhwIjoyMDc2MTAyNTI5fQ.3RdK9vvo-89qsl81fuxP1GiuT4WcoJzo7vuodPoNWwE`
   - (This is the exact token currently hardcoded; grabbed from workflow JSON. The `Bearer ` prefix goes in the value.)
4. **Assign the credential to the Writing project** so all four workflows in that project can access it. In n8n's credential settings, use "Move" or "Share" to give the Writing team project access. (If credential lives elsewhere, the four workflows won't be able to bind to it.)
5. Send me the **credential ID** (visible in the URL when you edit the credential, or in the credentials list).

**Optional but recommended:** while you're in there, **rotate the token** on Supabase side first. Get a new `service_role` key from Supabase → Settings → API, put the new value into the new n8n credential, then rotate/invalidate the old key on Supabase. That's the "clean slate" version — the old token that's currently in the workflow JSON stops working the moment you invalidate it, so any prior leak becomes moot.

## 4 · What I do once the credential exists

Four atomic `update_workflow` ops, one per workflow. For each of the four HTTP nodes:

1. `setNodeCredential` — bind the HTTP node to the new credential (`{credentialKey: 'httpHeaderAuth', credentialId: <id>, credentialName: 'Supabase Storage Auth'}`)
2. `setNodeParameter` — set `/authentication` to `'genericCredentialType'`
3. `setNodeParameter` — set `/genericAuthType` to `'httpHeaderAuth'`
4. `updateNodeParameters` — replace the `headerParameters.parameters` array to drop the `Authorization` entry (keep `Content-Type` and `x-upsert`)

Total: ~16 ops across 4 workflows.

## 5 · Rollback plan if something breaks

Each workflow's edit is atomic and versioned in n8n's history. If a workflow starts failing after the rebind, restore the prior version from n8n UI (one click). Nothing lost.

## 6 · What this dispatch does NOT include

- **`MISSING_EXPRESSION_PREFIX` sweep** — separate scope, non-security. Belongs in DP-HY-02.
- **"Store Summary is a dead-end" bug in workflow 2.2** — data-flow bug, not security. DP-HY-03.
- **Rotating the token** — Paul's decision (Supabase-side action).

## 7 · What Paul decides

**Q1:** Rotate the token now, or reuse the current one and rotate later? (Recommend rotate now — takes 2 minutes on Supabase side, invalidates any prior leak.)

**Q2:** OK to proceed once you send me the credential ID?

— Platform Developer station
