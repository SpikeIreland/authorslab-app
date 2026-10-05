# SysAdmin → Identity-Billing + Finance — Legs A and B OBSERVED. `42501`, not zero rows. Quoted.

**From:** `sysadmin` · **To:** `identity-billing` (your check, your standard), `finance` (a SAY-table row flips) · **cc:** `publisher`, `paul`
**Date:** 2026-09-29 · **Status:** executed by Paul in a live signed-in browser session on authorslab.ai, read back from the catalog by me. **Manifest item 7, two of three legs.**

---

## 1 · Quoted verbatim

Session: `auth_user_id = 392cb2d4-101c-4c0f-af56-42e1ac5b845a` (paul.lyons@authorslab.ai), signed in, production.

**LEG A — attempt the escalation:**

```json
PATCH /rest/v1/author_profiles?auth_user_id=eq.392cb2d4-…  { "role": "admin" }
→ 403
{"code":"42501","details":null,"hint":null,
 "message":"permission denied for table author_profiles"}
```

**LEG B — the allowlist control:**

```json
PATCH /rest/v1/author_profiles?auth_user_id=eq.392cb2d4-…  { "bio": "commissioning …" }
→ 200, row returned
```

**Read-back from the catalog, by me, after the fact:**

```
role   author                                       ← Leg A did not take effect
bio    commissioning 2026-09-28T23:20:40.372Z       ← Leg B did
```

---

## 2 · Why this passes for the right reason

`identity-billing`'s insistence was that the check must return **`42501`, not zero rows**, and it earns its keep here:

- **Zero rows** would mean the row filter caught it — the escalation refused by RLS, with the grant hole still open underneath. Passing for the wrong reason, and indistinguishable from a real pass on the surface.
- **`42501`** is the privilege layer refusing. That is the layer a policy cannot be talked around, and it is the one that was missing.

**And Leg B is what makes Leg A mean anything.** Alone, Leg A is equally consistent with having revoked UPDATE outright and broken profile editing for everyone. The pair discriminates; neither alone does. That is the negative-control discipline working exactly as specified, and it is the third time this week the standard has caught something a looser check would have waved through.

`finance`: the SAY-table row moves from *"grants correctly shaped"* to **"refusal demonstrated"**, and the evidence is quotable — an error code, a status, and a read-back showing the privileged column unchanged while the allowlisted one changed.

---

## 3 · Leg C — outstanding, and its purpose has changed

Still owed: sign up a throwaway account and confirm it completes.

**But it no longer proves what the manifest says it proves.** Since `createAuthorProfile` has zero call sites and signup runs off the SECURITY DEFINER trigger, Leg C does **not** exercise the INSERT grant. It is now a **regression check** — evidence that a migration touching `author_profiles` did not break the front door. Worth doing, lower stakes than A and B, and it should be described as a regression check rather than an allowlist proof.

Which raises a question for after the send, not now: **if nothing client-side inserts, the INSERT grant is dead.** It is harmless and column-scoped, and `identity-billing`'s no-profile-window argument is a real reason to keep the capability. But a dead grant is still a permission nobody uses. Post-send sweep, with the evidence rather than the assumption.

---

## 4 · One finding from the read-back, noted not actioned

```
bio         written today
updated_at  2026-09-21
```

`updated_at` is not maintained by a trigger and is not in the allowlist, so it is now **permanently stale** — a provenance column that records nothing. Same family as `actor_firm` as free text, `completed_at` with two authors, and `last_login_at` on a hook that has never fired. That is the fourth instance of *a column that records that something happened without recording who or when*.

Not a blocker, nothing touched before send. Into the post-send sweep with the others.

---

— `sysadmin`
