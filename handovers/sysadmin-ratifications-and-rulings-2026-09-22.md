# SysAdmin — Paul ratifications + sysadmin rulings (post-inbox sweep)

**From:** `sysadmin` · **To:** `identity-billing`, `finance`, `publisher`, `ux`, `paul` · **Date:** 2026-09-22 · **Status:** ratifications relayed on Paul's authority (13:xx today), rulings by sysadmin.

## §1 · Paul ratifications (spoken in chat this turn; recorded here)

- **£9.50 founding tier: RETIRED.** Finance's recommendation (their state-of-monetisation §1) is Paul-ratified. Two users on this tier subscribe at standard rates when their current manuscripts complete. `identity-billing`: archive `author_founding` product/price alongside `single_project_pass`. `finance`: reflect in V0.5 model.
- **£119 Pass: DEAD.** Already Paul-ratified 2026-08-10 in AL-MKT-008; recorded here to close the loop with `identity-billing`. Remove `SINGLE_PROJECT_PASS` from `PUBLIC_LOOKUP_KEYS`; the 90-day bridge-credit path comes out with it.
- **Per-editor pass as the metered unit: RATIFIED** (finance recommendation, aligns with published marketing definition AL-MKT-004 §3). One "pass" = one editor's full-manuscript pass (~£2.50 at measured rates). Not a full three-editor journey. Feeds Author-annual and Pro-tier unit economics.
- **Scoped commissioning test for the admin self-grant hole (I&B §C): AUTHORISED.** `identity-billing` may run the transaction+rollback test on a preview branch (or throwaway account) — impersonate a real non-admin author, self-UPDATE `role='admin'`, read back `is_admin()` widened count, `ROLLBACK`. Reports back via canonical courier.
- **Invented author names for the publisher home mock: RATIFIED.** `publisher`: proceed with plainly invented names for the mock rows. A demo list carrying real authors' names in front of a literary agent reads as an unfounded client claim.
- **Stripe MCP re-point:** Paul reports (this turn) *"I think I have connected to the Stripe account"* — `identity-billing` please verify by re-running `list_available_accounts_or_orgs` and confirming `acct_1U0u4gEGeehw2YKO` is now reachable. If not, file back to `handovers/inbox/paul/`.

## §2 · Sysadmin rulings (my calls, per House Rules governance lane)

### 2.1 · Publisher API routes: sysadmin builds them, publisher consumes

`publisher`'s proposal in the 2026-09-22 demo journey spec §3 is adopted. Publisher surfaces read through server API routes using the service-role pattern already established in `src/app/api/admin/create-user/route.ts`. **Sysadmin has built both routes THIS TURN** (`92596fb`… next commit). Contract:

- **`GET /api/publisher/projects`** — returns `{ projects: [...] }` where each item carries `id`, `title`, `genre`, `current_word_count`, `current_phase_number`, `status`, `updated_at`, `author: { first_name, last_name }`, `cover_url`. Ordered by `updated_at` desc.
- **`GET /api/publisher/projects/[id]`** — returns `{ project: {...} }` with all list fields plus `phases: [{ phase_number, phase_status, editor_name }, ...]`. Returns 404 on unknown id.

Explicitly excluded from both routes: `manuscripts.full_text`, any chapter content, editor notes / analyses, author email or any account-level PII beyond first/last name. When `identity-billing` lands publisher accounts post-demo, the auth gate goes in these two files and nowhere else in the publisher surface.

`publisher`: proceed to build against this contract. Both routes verified via `tsc --noEmit` (clean). Runtime verification (a `curl -s https://authorslab.ai/api/publisher/projects/<carl-project-id>` returning JSON) is the tick per House Rules; whoever hits it first quotes back.

### 2.2 · Canonical admin representation: `role`

- Source of truth for admin: **`author_profiles.role`** (values include `'admin'`, `'super_admin'`, default `'author'`).
- **Retire:** the `author_profiles.is_admin` boolean column (redundant with `role`; already diverges from it on one row per I&B §E).
- **Keep:** the `is_admin()` SECURITY DEFINER function — it stays as the RLS-visible predicate, reads from `role`, no logic change needed. The value of the function is that RLS policies keep working across a schema cleanup rather than being rewritten on 18 tables.
- **Surface migrations** (small):
  - `src/lib/accessControl.ts` gates on `is_admin` boolean — migrate to `role === 'admin'` (or delete the file entirely, per I&B §D recommendation).
  - `src/app/marketing-hub/page.tsx:128` already gates on `role === 'admin'`; keep.
  - Any other reader of the boolean column — `identity-billing` please sweep and courier the list.
- **Duplicate policy drop:** the two overlapping SELECT policies + two overlapping UPDATE policies on `author_profiles` fold into the same migration as the `is_admin` column drop. Coordinate with `identity-billing`.

### 2.3 · Fix order: C → B → D confirmed

Per I&B §C and finance's addendum: **C (close the admin self-grant hole) first, B (wire the checkout path) second, D (delete `accessControl.ts` and route to the entitlement endpoint) third.** Rationale is sound — every payment gate keys on `is_beta_tester`, so C is a precondition for trusting any conversion data B produces. Publisher identity design runs in parallel (design work, blocked on nothing).

## §3 · What sysadmin executes next (own lane)

- **Admin self-grant migration (I&B §C):** REVOKE column-level UPDATE grants on `author_profiles` for `role`, `is_admin`, `is_beta_tester`, `has_publishing_access`, `purchased_package`, `email` from `authenticated` and `anon`. Add a server route for legitimate profile updates (name, avatar, etc.) that runs under service role with authenticated-user validation. Paul's scoped commissioning test authority covers verifying the fix effect before-and-after.
- **`is_admin` column retirement migration:** paired with the REVOKE above. Includes duplicate-policy drop on `author_profiles`. `identity-billing` countersigns before deploy.
- Both queued for the next sysadmin turn (not this one — this turn ships the publisher routes).

## §4 · Coordination protocol (per Convention V1.1)

- `publisher`: proceed on publisher routes contract and mock names. File any additional field asks to `handovers/inbox/sysadmin/`.
- `identity-billing`: proceed on Stripe MCP verification, catalogue reconciliation (§1 relayed), and admin-migration design. Coordinate direct with `sysadmin` on the migration; file the countersign courier when ready.
- `finance`: consume ratifications for V0.5 model rebuild; `identity-billing` implements the archive.
- `ux`: sample-project button hold is now unblocked — the publisher routes exist and their target project page can render. Coordinate with `publisher` on cutover.

— `sysadmin`
