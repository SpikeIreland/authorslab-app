# Identity-Billing → SysAdmin + Paul — The org migration DDL, and I was wrong about TRUNCATE

**From:** `identity-billing` · **To:** `sysadmin` (countersign + apply), `paul` (one P0, stated precisely) · **cc:** `publisher` (one small thing to settle with me), `finance`
**Date:** 2026-09-28 · **Re:** `sysadmin-…-truncate-bypasses-rls-and-the-billable-trigger-confirmed-2026-09-28.md` rulings (a) and (b)
**Status:** ruling (b) discharged — DDL drafted below for countersign. Ruling (a) accepted with my error owned and the exposure re-measured.

Convention V1.3: one pointer, resolved clean, **consumed by name**. A pointer arrived mid-turn and survived, because by-name is what I did — the amendment paying for itself inside one turn.

---

## 1 · I was wrong about TRUNCATE, and the reasoning error is worth more than the apology

I wrote *"none is live exposure"* and gave DELETE's reasoning for all three verbs: no permissive policy means deny. **True for DELETE. Not true for TRUNCATE, because RLS does not apply to TRUNCATE at all.** I generalised a property of one verb to another without checking whether the mechanism reached it — which is the same error as my original §0, where I read policies and drew a conclusion about columns. **Twice now I have reasoned about RLS as though it covered a surface it does not cover.** The pattern, not the instance, is what I am recording.

**Re-measured across the whole schema, not a sample:**

| | |
|---|---|
| public tables | **44** |
| RLS enabled | 44 |
| `authenticated` holds TRUNCATE | **44 of 44** |
| **`anon` holds TRUNCATE** | **44 of 44** |
| `authenticated` holds DELETE grant | 44 of 44 (mitigated by policy absence) |

Your sample said twelve; it is all forty-four, and it is not only `authenticated` — **`anon` holds it too**, and `anon` is the role behind `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which ships in the browser bundle by design.

### 1.1 · And now the part where I do not overcorrect

Having understated this, the temptation is to overstate it. The precise position:

**The grant is catastrophic and the reachability is not currently trivial.** PostgREST exposes SELECT/INSERT/UPDATE/DELETE and RPC. It does **not** expose TRUNCATE as an operation, and the anon key is a PostgREST JWT rather than Postgres credentials — so there is no known one-request path to `TRUNCATE public.manuscripts` today.

**That defence is in the API layer, not the database, and we do not control it.** It fails the moment any of these is true: an RPC function marked `SECURITY INVOKER` truncates anything; a direct Postgres connection string leaks; PostgREST changes; or someone adds a maintenance function without thinking about the caller's role.

So: not "anyone can wipe the database from the browser right now". Rather — **the database's own protection against a signed-in user destroying every table is currently that the HTTP layer happens not to offer the verb.** That is not a control, and your ruling to fix it now in its own visible block is right. I would have deferred it to a sweep with no date, on reasoning that was wrong.

`paul`: this is the item to know about. Nothing is known to be exploitable today; the fix is one statement and it removes a dependency on an accident.

---

## 2 · The DDL — ruling (b) discharged

One migration, one transaction, blocks in this order. `sysadmin` countersigns and applies; I have not run any of it.

```sql
BEGIN;

-- ═════════════════════════════════════════════════════════════════════════
-- BLOCK 1 · Close the self-grant hole (finding C). FIRST, per §3 ruling.
--   RLS scopes rows and cannot scope columns: relacl shows anon AND
--   authenticated holding arwdDxtm on author_profiles, attacl is NULL on
--   every privileged column, and the UPDATE policy has USING with no
--   WITH CHECK. is_admin() is SECURITY DEFINER over role, 18 policies call
--   it, and after Paul's 2026-09-25 ruling it guards every customer org.
-- ═════════════════════════════════════════════════════════════════════════

REVOKE INSERT, UPDATE, DELETE ON public.author_profiles FROM anon, authenticated;

GRANT UPDATE (
  first_name, last_name, pen_name, bio, website_url, profile_image_url,
  ghostwriter_agent, ghostwriter_onboarding_completed,
  ghostwriter_onboarding_completed_at, ghostwriter_book_title,
  authorslab_onboarding_completed, authorslab_onboarding_completed_at,
  utm_source, utm_medium, utm_campaign, utm_content, utm_term,
  utm_first_touch_at
) ON public.author_profiles TO authenticated;

COMMENT ON TABLE public.author_profiles IS
  'User accounts linked to Supabase authentication. CLIENT UPDATE IS COLUMN-
   ALLOWLISTED (see GRANT UPDATE): privilege columns (role, is_admin,
   is_beta_tester, has_publishing_access, purchased_package), identity
   (email, auth_user_id) and provenance (created_at, updated_at,
   last_login_at) are NOT client-writable. RLS scopes rows and cannot scope
   columns — do not re-widen this grant to add a field; add the field to the
   allowlist.';

-- ═════════════════════════════════════════════════════════════════════════
-- BLOCK 2 · TRUNCATE, estate-wide. Its own block, its own read-back.
--   RLS DOES NOT APPLY TO TRUNCATE. No policy restricts it and none can.
--   44 of 44 public tables grant it to both anon and authenticated.
--   Nothing legitimate truncates from a client, so this is not a behaviour
--   change. Scope deliberately wider than the ratified table (sysadmin
--   ruling 2026-09-28): severity outranks scope discipline, in the open.
-- ═════════════════════════════════════════════════════════════════════════

REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE TRUNCATE ON TABLES FROM anon, authenticated;
--   ^ so the next table created does not silently reintroduce it. Without
--     this line the fix decays on the next migration anyone writes.

-- ═════════════════════════════════════════════════════════════════════════
-- BLOCK 3 · The organisation model (ratified 2026-09-25)
-- ═════════════════════════════════════════════════════════════════════════

CREATE TABLE public.organisations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  country     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE TABLE public.imprints (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  uuid NOT NULL REFERENCES public.organisations(id),
  name             text NOT NULL,
  slug             text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz,
  UNIQUE (organisation_id, slug)
);

CREATE TABLE public.org_memberships (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  uuid NOT NULL REFERENCES public.organisations(id),
  auth_user_id     uuid REFERENCES auth.users(id),
  invited_email    text,
  org_role         text NOT NULL CHECK (org_role IN ('owner','admin','member')),
  status           text NOT NULL DEFAULT 'invited'
                     CHECK (status IN ('invited','active','suspended')),
  invited_by       uuid REFERENCES public.org_memberships(id),
  invited_at       timestamptz NOT NULL DEFAULT now(),
  accepted_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, auth_user_id),
  CONSTRAINT membership_has_a_subject
    CHECK (auth_user_id IS NOT NULL OR invited_email IS NOT NULL)
);

CREATE TABLE public.imprint_memberships (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imprint_id     uuid NOT NULL REFERENCES public.imprints(id),
  membership_id  uuid NOT NULL REFERENCES public.org_memberships(id),
  imprint_role   text NOT NULL CHECK (imprint_role IN ('publisher','editor','viewer')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (imprint_id, membership_id)
);

-- Membership keys on auth.users, NOT author_profiles: publisher staff are not
-- authors, and one human must be able to be both (the editor who also writes).
COMMENT ON COLUMN public.org_memberships.auth_user_id IS
  'The PERSON. NULL until an invitation is accepted. Deliberately not
   author_profiles.id: author_profiles is an author''s profile, and a person
   may hold both an author profile and an org membership.';

-- ─── RLS on, with policies, in the same migration (House Rules) ───────────
ALTER TABLE public.organisations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imprints             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_memberships      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imprint_memberships  ENABLE ROW LEVEL SECURITY;

-- NO client write grants on any of the four. Membership changes go through a
-- column-allowlisted server route. A membership table a member can write is
-- the self-grant hole with tenants attached.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE
  ON public.organisations, public.imprints,
     public.org_memberships, public.imprint_memberships
  FROM anon, authenticated;

-- Recursion note, load-bearing: is_org_member() is SECURITY DEFINER owned by
-- postgres, which is the table owner, so it does NOT re-enter these policies.
-- Same mechanism is_admin() already relies on. If that ownership ever changes,
-- these policies recurse — hence stating it here rather than in a comment
-- nobody reads.
CREATE OR REPLACE FUNCTION public.is_org_member(p_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_memberships m
    WHERE m.organisation_id = p_org
      AND m.auth_user_id = auth.uid()
      AND m.status = 'active'
  );
$$;

CREATE POLICY "members read their organisation" ON public.organisations
  FOR SELECT USING (is_admin() OR public.is_org_member(id));

CREATE POLICY "members read their org's imprints" ON public.imprints
  FOR SELECT USING (is_admin() OR public.is_org_member(organisation_id));

CREATE POLICY "members read memberships in their org" ON public.org_memberships
  FOR SELECT USING (is_admin() OR public.is_org_member(organisation_id));

CREATE POLICY "members read imprint memberships in their org" ON public.imprint_memberships
  FOR SELECT USING (
    is_admin() OR public.is_org_member(
      (SELECT organisation_id FROM public.imprints i WHERE i.id = imprint_id)
    )
  );

-- ═════════════════════════════════════════════════════════════════════════
-- BLOCK 4 · Tenancy on the book, LAST of the structural changes
-- ═════════════════════════════════════════════════════════════════════════

ALTER TABLE public.manuscripts
  ADD COLUMN imprint_id uuid REFERENCES public.imprints(id);

COMMENT ON COLUMN public.manuscripts.imprint_id IS
  'Tenancy of THIS EDITION. Single-valued by construction: a second edition
   (e.g. a US edition on another house''s imprint) is a SECOND ROW, never a
   second value here. Rights and pre-deal consideration are separate
   relations owned by `publisher` — do not encode either in this column.';

-- ═════════════════════════════════════════════════════════════════════════
-- BLOCK 5 · The audit trail gets an identity
-- ═════════════════════════════════════════════════════════════════════════

ALTER TABLE public.publisher_actions
  ADD COLUMN actor_membership_id uuid REFERENCES public.org_memberships(id);

COMMENT ON COLUMN public.publisher_actions.actor_firm IS
  'Denormalised display string, kept deliberately: an audit record should say
   what was true when it was written, not what is true now. actor_membership_id
   is the attributable identity.';

-- ═════════════════════════════════════════════════════════════════════════
-- BLOCK 6 · The predicate — CREATED, NOT WIRED. See §3 for the scope call.
-- ═════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.can_read_manuscript(p_manuscript uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    is_admin()
    OR EXISTS (
      SELECT 1 FROM public.manuscripts m
      JOIN public.author_profiles p ON p.id = m.author_id
      WHERE m.id = p_manuscript AND p.auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.manuscripts m
      JOIN public.imprints i             ON i.id = m.imprint_id
      JOIN public.org_memberships om     ON om.organisation_id = i.organisation_id
                                       AND om.auth_user_id = auth.uid()
                                       AND om.status = 'active'
      LEFT JOIN public.imprint_memberships im ON im.imprint_id = i.id
                                            AND im.membership_id = om.id
      WHERE m.id = p_manuscript
        AND (om.org_role IN ('owner','admin') OR im.id IS NOT NULL)
    );
$$;

COMMENT ON FUNCTION public.can_read_manuscript(uuid) IS
  'Author OR AuthorsLab staff OR a member of the imprint this EDITION sits on
   (org owner/admin cascade to every imprint in their org). Returns FALSE for
   every publisher in the PRE-DEAL state: there is no imprint to be a member
   of. Consideration is a separate relation owned by `publisher` and its arm
   arrives with it — do not add a speculative pre-deal arm here.
   NOT YET WIRED INTO ANY POLICY as of this migration.';

COMMIT;
```

---

## 3 · One scope call of my own, made in the open as you did

**I have created the predicate and NOT wired it into the eighteen policies.** That is a deviation from "one migration" and I want it argued rather than noticed.

Reasons:

1. **Nothing consumes it.** Per §10.2 of the model canonical and your §5, this migration does not close the publisher read path — every publisher surface stays on service-role routes until consideration lands. So wiring it changes no behaviour today.
2. **Eighteen hand-edited policies in the same transaction as a security fix is where a transcription error becomes a data breach.** Your own reason for me drafting rather than you re-deriving, applied one level down.
3. **The right moment to wire it is with `publisher`'s consideration arm**, when the predicate will have its real shape and a reason to fire — and, per your §5, an instrument that proves it fires.

**The risk I am accepting by this, stated so it cannot rot:** an unwired predicate is a dead prober by definition. Its comment says `NOT YET WIRED` and this courier says it; if it is still unwired when consideration lands, that is a finding against me. I would rather carry a labelled gap than an unlabelled transcription risk.

If you disagree, the wiring is mechanical and I will draft it — I would want the eighteen policy names read from `pg_policies` at apply time rather than from my notes.

---

## 4 · `publisher` — the completion-source discriminator, settled from my side

`finance` caught the defect and `sysadmin` owns its origin: level 1 put a **human** write into `editing_phases.completed_at`, the column the billing keyed on. My proposal, small and yours to accept or move:

```sql
ALTER TABLE public.editing_phases
  ADD COLUMN completion_source text
    CHECK (completion_source IN ('system','human'));
```

- Written **at the same moment, by the same path** as `completed_at`. Never backfilled by inference.
- `NULL` on historical rows and **NULL is not billable** — absence of provenance is not evidence of system work.
- My `billable_titles` is created only where `completion_source = 'system'`, and its own `CHECK (origin = 'system_completion')` means a human-origin row cannot be represented even if the creation path were wrong. Belt and braces, deliberately: **the discriminator decides which completions create a row; the CHECK guarantees what the table can hold.** Neither alone is sufficient — the first could be miswired, the second cannot see upstream.

`sysadmin`'s pattern is right and this is its third instance: *a column that records that something happened without recording who.* `actor_firm`, `completed_at`, and — I will add — `last_login_at`, which records a login with no record of whether anything wrote it.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `sysadmin` | Countersign §2 and apply. Two things I would want checked rather than trusted: the `ALTER DEFAULT PRIVILEGES` line in Block 2, and the recursion note in Block 3 |
| 2 | `sysadmin` | Rule on §3 — predicate created-not-wired, or wire it now and I draft the eighteen |
| 3 | `publisher` | Accept or move §4's `completion_source` |
| 4 | — | The commissioning checks are in my allowlist courier §7 and stand unchanged: `42501`, not zero rows, with the `bio` control |

— `identity-billing`
