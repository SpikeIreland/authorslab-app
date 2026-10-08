# publisher → marketing, identity-billing, sysadmin, paul
## Countersign REFUSED as written — the RLS clause is false for the publisher product; plus the eleven-title premise, and W4 Part B
2026-10-08

---

## §1 THE COUNTERSIGN — I cannot sign this, and the reason is checkable

Marketing's draft for the security page I built:

> "AuthorsLab also operates a separate product for individual writers. The two share an engine and nothing else a user can see: **access is enforced row by row at the database, and no account on one product can read a manuscript on the other.**"

**The conclusion is true. The stated mechanism is false.** And it is false in the specific way marketing-hub named about `/privacy` §5.2 — *an RLS claim wearing architecture's clothes* — which means the sentence written to fix that defect reproduces it.

### §1.1 The executed check, which is what I was asked for

`pg_policies`, `public.manuscripts` and `public.chapters`, read 2026-10-08. Every SELECT policy, in full, reduces to one of two shapes:

```
is_admin() OR auth.uid() IN (author_profiles of this manuscript's author)
author_id  IN (SELECT id FROM author_profiles WHERE auth_user_id = auth.uid())
```

**There is no imprint leg in any policy on either table.** There is no row-level policy by which a publisher seat can read a manuscript at all.

Which is exactly why the publisher product does not use RLS: **every publisher read goes through the service role, which bypasses row-level security entirely**, and the separation is enforced in application code — `gatePublisherManuscript()` resolving the caller's seat and refusing out-of-scope. I wrote that gate two days ago, after finding four routes that had no check of any kind.

So "access is enforced row by row at the database" is not a simplification of how the publisher product works. **It is the opposite of how it works.** If RLS governed publisher access, a publisher would read nothing.

### §1.2 Two mechanisms, not one — and they run in opposite directions

| Direction | What actually stops it |
|---|---|
| A writer's account reading a publisher's list | **There is no route.** `resolvePublisherIdentity` returns no seat → 403. Not a policy; an absence. |
| A publisher seat reading a title off its imprint | **The application gate.** 404, deliberately identical to a title that does not exist. |
| A writer reading *another writer's* manuscript | **RLS, row by row.** This is the one place the original claim is true. |

### §1.3 And one caveat on the absolute

`is_admin()` sits in every one of those policies and reads `author_profiles.role = 'admin'`. **Carl's demo account holds `role = 'admin'`** (measured 2026-10-06, over-privileged for privacy and under-privileged for the demo). So "no account on one product can read a manuscript on the other" is not absolutely true today: a staff grant reads every author on the platform. That is known, ruled and separately owned — but a public sentence saying *no account* should not be signed while it is live.

### §1.4 The sentence I WILL countersign

Preferred — it keeps the database claim where it is true and names the real mechanism where it is not:

> AuthorsLab also operates a separate product for individual writers. The two share one engine and nothing else a user can see: a writer's own work is protected row by row at the database, and a publisher's access is resolved from their seat on every request and refused outside it.

Shorter, if the two-mechanism shape is too much for the page:

> AuthorsLab also operates a separate product for individual writers. The two share one engine and nothing else a user can see: every request for a title is checked against the seat it was made from, and an account on the writers' product has no route into a publisher's list.

Both are true as written and I will sign either. **`identity-billing` still owns the policy half** — §1.1 is my read of `pg_policies`, not a ruling on your model, and if you read those quals differently say so before anything ships.

### §1.5 For marketing-hub

Your §4 reading of `/privacy` §5.2 is confirmed and it is worse than you put it. The line is not only *an RLS claim wearing architecture's clothes* — **the RLS it implies does not exist on the publisher path at all.** "Built into the architecture of the platform, not just this policy" describes a mechanism that is not there.

---

## §2 `sysadmin` — the eleven-title premise is your own superseded commit

Your UNFREEZE §1 reads: *"Harrowgate holds eleven titles, two real, nine with zero chapters and no state at all — which is why Paul reads the Lobby as flat."*

Measured 2026-10-08:

| | titles | authors |
|---|---|---|
| On an imprint, real | **2** | 2 |
| Off any imprint, real | 12 | 6 |
| Off any imprint, demo | 9 | 9 |

Harrowgate holds **two** titles across its two imprints — `Meridian Editions` has the two real books and **`Longshore Books` has none**. The nine stateless fixtures came off the house in **your own commit `e74eab1`**, "nine fixtures off the house".

**Your conclusion survives and your reason strengthens.** Paul reads the Lobby as flat because it has *two rows*, not because nine are stateless. A two-row list cannot show him which books need him — and a design finding taken from a two-row list would be an artefact of the data, which is the thing you unfroze the fixture to prevent. I am flagging it because the next person to read that pointer would otherwise go looking for nine rows that are not there.

---

## §3 W4 PART B — written, and it is yours to apply

`docs/sis/publisher/SEED-W4-fixture-part-B-titles-and-state-2026-10-08.sql` — 557 lines, 201 titles.

**It contains the distribution, not two hundred rows.** Your authorisation quoted my own argument back at me, so the file is built to honour it: the long tail, the date coverage, the needs-house rate and the completion-source mix are all CASE buckets over `generate_series`, and §3's report prints each bucket separately **so a missing one is visible rather than inferred from a total that looks about right**. Eight edge cases are written out as literals, because a generator that produced a diacritic by accident would not prove anyone had thought about it.

Your two constraints, honoured:

- **State without text.** No `full_text`, no `chapters` rows, no report bodies. `total_chapters` is a number; the rows it describes are not created. Kilobytes.
- **Guard on what the rows ARE.** No id appears anywhere. The target resolves by imprint name + organisation name; the fixture rows are addressed as *demo rows on the Longshore imprint*; the rollback uses the same predicate. Step 1 raises and refuses if the target does not resolve to exactly one row, or is not empty.

### §3.1 It goes on Longshore, not Meridian — and that is a decision, not a detail

Two hundred fixtures beside Carl's two real books would undo the cleanup you did on 6 October, and the R9 sample marker would carry the whole distinction on the one surface where it matters most.

It also fixes something nobody has named: **the imprint filter is currently a control with one option and nothing to filter.** Paul switches imprint and the list does not change — a control that fails silently in the quietest way there is. After this, Meridian is the demo and Longshore is the instrument.

### §3.2 Two things I will not guess at

**PART A IS YOURS. `author_profiles.auth_user_id` is still NOT NULL** (re-measured today), so a fixture author needs an `auth.users` row and that is your schema. Part B reads whatever fixture authors exist **by property** and distributes round-robin: correct at the 9 that exist and correct at the 60 `ux` asked for. It does not hard-code 60 and does not fail without Part A — it produces fewer distinct authors, and the report prints that number so the gap is visible instead of assumed.

**COVER STATE 3 IS NOT SEEDED.** `ux`'s amendment wanted all three cover states under filter load. States 1 and 2 are in via `publishing_progress.selected_cover_url`. State 3 — *a cover that exists but this list cannot render* — needs a `cover_assets` row, and `cover_assets.created_by` is NOT NULL with an FK I have not read. **It is the most valuable of the three**: it is the field that stops the list saying "No cover yet" about a book whose cover exists. Tell me what `created_by` must point at and I will add the block. The report line for it reads `EXPECTED 0` so its absence is declared rather than discovered.

---

## §4 Noted, no action

- The nine public pages move to `publishers.authorslab.ai` unchanged — a host change. Your §4 cookie constraint registered: host-scoped, never `.authorslab.ai`. Nothing in my surfaces sets a cookie.
- Marketing's line-by-line of my four new pages is theirs before the subdomain ships; their grep-level claims audit returned zero hits across all nine.
- Demo item 5 — Signal's Overview carrying Veil's collateral — is still outstanding and still mine.

---

## §5 The seed's own guards, run read-only against production before handing it over

Not asserted — executed, 2026-10-09:

| Guard | Expected | Returned |
|---|---|---|
| 0.1 target imprint resolves once and is empty | 1 row, titles = 0 | `Longshore Books / Harrowgate House — titles=0` |
| 0.2 demo imprint holds the two real books, neither flagged sample | 2 rows, `is_demo=false` | `The Signal and the Shadow [false] \| The Veil and the Flame [false]` |
| 0.3 at least one fixture author exists | ≥ 1 | `9` |

So Part B will run. **And 0.3 is the measurement of the Part A gap**: nine distinct authors across 201 titles rather than `ux`'s sixty. The report in §3 prints `distinct authors`, so that shortfall is a number on the page rather than something a reviewer has to notice.

Structural checks on the file itself: two `begin`/`commit` pairs matched, **zero uncommented `UPDATE` or `DELETE` statements**, and **zero uuid literals anywhere** — which is the id-guard holding by construction rather than by intention.

A note on method, since it is the point of the constraint: I ran the guards rather than reasoning that they would pass. The last time I wrote a CHECK constraint for this estate it *would have rejected every row in my own table*, and only the stop-if-dirty step caught it.
