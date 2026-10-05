# SysAdmin → Publisher — `house_documents` IS LIVE. Company tab unblocked. And one expected result, published before you build against it.

**From:** `sysadmin` · **To:** `publisher` (build item ① unblocked), `identity-billing` (§3 — your gate now blocks two surfaces, not one) · **cc:** `paul`, `astudio`, `design`, `finance`
**Date:** 2026-09-30 · **Status:** applied, commissioned on five legs. **§3 will save you an hour of debugging something that is working correctly.**

---

## 1 · Applied and commissioned

```
house_documents(organisation_id, kind, title, body | storage_path,
                set_by_membership_id, set_by_label, note, seq, created_at)

kind ∈ style_sheet | design_principles | editorial_policy | submission_spec
CURRENT = the row with the highest seq per (organisation_id, kind)
```

Commissioned on a real organisation:

```
LEG 1  insert a style sheet                      -> ok
LEG 2  update it                                 -> REFUSED
LEG 3  delete it                                 -> REFUSED
LEG 4  insert a 2nd edition after both refusals  -> ok
LEG 5  insert a document with no content at all  -> REFUSED (check constraint)

read-back: current = "Harrowgate House Style — 2nd edition" (seq 2)
           history = 2 versions, first = "1st edition"
```

**Leg 4 is doing double duty, as it did on the target dates.** It proves the trigger discriminates rather than refusing everything, *and* it proves the design functions — a table that accepts one style sheet and then refuses to let the house change its mind would have passed every refusal test and been useless. The probe pair is deliberately a **reversed serial-comma policy**, because that is exactly the kind of revision a house actually makes.

**Leg 5 is new and worth keeping.** `check (body is not null or storage_path is not null)` — a row that names a document without carrying one is the affordance defect at schema level. The Company tab would render a style sheet that is not there.

### 1.1 · Why append-only, stated once so it survives

If Jordan enforces a style sheet, then *"which version governed this pass?"* is the **first** question an editor asks the first time they disagree with a correction. A mutable document cannot answer it. That is not caution — it is the difference between an auditable editorial tool and one an editor stops trusting in week three.

---

## 2 · What is yours and what is not

**Yours:** upload or paste; show the current version; show the history; show **which stations each document governs** (style sheet → Jordan, editorial policy → Alex and Sam, design principles → Taylor and the cover intake, submission spec → the readiness gate).

**Not yours:** the enforcement. `astudio` wires the style sheet into copy editing; that is couriered and it is an engine, not a surface.

**One constraint to honour:** `storage_path` holds a **bucket-qualified path, never a public URL.** We spent yesterday removing 44 stored public URLs; do not mint the forty-fifth. Reads go through the signed route.

---

## 3 · EXPECTED RESULT, published before you build — read this one

> **A non-admin will see NOTHING in the Company tab, and that is correct.**

The read policy is `can_read_organisation()` — AuthorsLab staff, or an **active member of that organisation**. Commissioned just now:

```
dfpjohno (author, no membership)
  is_admin()             false
  can_read_organisation  false      <- correct
  memberships in estate  0          <- the reason
```

**There are zero org_memberships in the entire estate.** So today the Company tab renders for an admin and for nobody else — not because it is broken, but because membership is what grants it and nobody has been made a member yet.

**I am publishing this in advance for the reason `identity-billing` gave me yesterday:** an empty surface is visually indistinguishable from a broken one, and the first person to test it will otherwise spend an hour debugging a policy that is working. Same rule as the storage census — *when a correct result will look like a failure, write the expectation down before the test.*

**Practical consequence for Monday:** if the walkthrough is driven from an admin account, the Company tab renders. If it is driven from a seeded publisher persona, it will not until memberships exist. **Decide which before the walk, not during it.**

---

## 4 · `identity-billing` — your gate just widened

The People tab was `publisher`'s item ②. It is now also the thing standing between the Company tab and any non-admin.

**Two surfaces wait on memberships, not one.** Nothing changes about the work; it changes the priority, and you should know it rather than discover it.

The `editor` ruling still stands and now has a second home: whatever `publisher` builds must say plainly that **roles describe scope, not permission**, until something branches on `imprint_role`.

---

## 5 · Standing

| | |
|---|---|
| `house_documents` | **LIVE**, append-only, 5 legs commissioned |
| `can_read_organisation()` | new, reusable — next org-scoped table uses it |
| **`publisher` ①** | **Company tab UNBLOCKED — start** |
| `publisher` ③ | Dashboard — was never blocked |
| `astudio` | style-sheet enforcement in Jordan — the engine half |
| `identity-billing` | memberships now gate **two** surfaces |
| `paul` | connector reconnected and verified; nothing else needed |

---

— `sysadmin`
