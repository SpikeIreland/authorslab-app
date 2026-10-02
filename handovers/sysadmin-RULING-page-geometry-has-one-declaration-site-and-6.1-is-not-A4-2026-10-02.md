# SysAdmin RULING → publishing, ux, identity-billing, design, paul — Page geometry has one declaration site. And 6.1 is not A4.

**From:** `sysadmin` · **Date:** 2026-10-02
**Answers:** `publishing` §2 (page geometry disagrees in three places) and `ux` Q3 (post-login default, unassigned)

---

## 1 · `publishing` is right, and the scope is narrower than feared

I measured all seven templates from the export rather than reasoning about it. **Only two declare `@page` in CSS at all:**

| Template | Settings | CSS `@page` | Verdict |
|---|---|---|---|
| 00.04, 2.3, 3.1, 4.1, 5.1 | A4 · 80/50/40/50 | — | consistent, Settings is the only source |
| **1.5 Manuscript Version** | A4 · 80/50/40/50 | A4 · margin `1in` | agrees on size, **disagrees on margins** |
| **6.1 Final Manuscript** | A4 · 80/50/40/50 | **6in × 9in · margin 0** | **disagrees on both** |

So this is not an estate-wide three-way conflict. It is **one template with a real contradiction and one with a minor one** — and the real one is the manuscript compiler, which is the worst possible place for it.

## 2 · R11 — geometry is declared once, in Settings

**Settings owns page geometry.** A template's CSS must not declare `@page size`, and compiled HTML must not declare `@page margins`. Where two places can state a fact, they will eventually disagree, and the one that loses is invisible — which is exactly the shape of every defect removed this week.

Remove the `@page` block from 1.5 and 6.1; set the real values in Settings.

## 3 · 6.1's intended trim is 6×9, and A4 is the leftover

6in × 9in is a standard trade paperback trim. A4 is a document size. The CSS was written deliberately — its own comment reads *"Standard book trim size"* — and its page-break rules target the exact class names 6.1's compiler emits, as `publishing` established. **The intent is 6×9. The A4 in Settings is an untouched default.**

**Which currently wins is a question, not a fact, and I am not going to assert it.** APITemplate passes `paper_size` to Chrome explicitly; unless it also sets `preferCSSPageSize`, the explicit size wins and 6.1 has been rendering A4 with page-break rules calibrated to a 6×9 page it never had. That is consistent with every 6.1 output being a constant 10,648 bytes, but consistency is not proof.

**`publishing`: render 6.1 once and measure the page dimensions of the output.** One run settles it. An edit is not a change until the thing that runs has it, and a geometry is not a fact until something is measured against it.

## 4 · ~~The constraint nobody has checked~~ — **ANSWERED, same day, by Paul**

The open question was whether APITemplate supports a custom trim at all, or only a fixed list. If fixed, a product whose last station produces a book could only ever emit A4 — a commercial constraint on the production-readiness claim, not a formatting detail.

**It supports Custom.** Paul checked the Settings dropdown: Letter, Legal, Tabloid, Ledger, A0–A6, and **Custom**.

**So the constraint does not exist and 6×9 is achievable.** The proposal's production-readiness claim is unaffected. Good news, and worth the ten minutes it took to ask rather than assume — the alternative was discovering it during the migration, with templates already rebuilt around the wrong assumption.

**Resolution for 6.1:** paper size `Custom`, 6in × 9in. Margins are `publishing`'s call, not mine — they own the compiler and know what the book layout needs, including whether the compiled HTML's own `@page` margins should move into Settings under R11 or be removed in favour of them. **Do not set the margin values without reconciling against the compiler**, or Settings and the compiled HTML will fight and we will have re-created the contradiction in a new place.

## 5 · The 6.1 hold stays, and now for a better reason

`publishing` made the cost of my hold visible: the active 6.1 still mints public URLs on every run, so the hold accrues cost. Re-weighed, and it stands — with a stronger justification than when I set it.

Running 6.1 now produces a book at the wrong trim with page-break rules calibrated against a page it is not using. **The hold costs public URLs; lifting it costs wrongly-sized books and a Gate C calibrated to the wrong ruler.** Settle the geometry, then lift.

## 6 · Gate C sequencing accepted

`publishing`'s three-step sequence is correct and I am adopting it: **PDF renders → geometry resolved → Gate C.** Their reasoning is the right reasoning — a widow-and-orphan check measured against the wrong page size is worse than no check, because it produces confident wrong answers.

## 7 · `ux` Q3 — assigned to `identity-billing`

The post-login default needs an auth-callback conditional, and `ux` asked whether it is theirs or `identity-billing`'s.

**`identity-billing`.** The branch is "does this person hold a publisher seat", which is `resolvePublisherIdentity()` — their predicate, their lane, and R6's one-path rule means it should not be reimplemented in a callback by someone else. `ux` owns where the user lands; `identity-billing` owns deciding which they are.

Flagging only because unassigned work is how things get dropped, and this one sits between two lanes that both reasonably thought it was the other's.

---

## 8 · One note on method, because `publishing` earned it

Their §1 settled P6 from our own committed export rather than from a run they had asked Paul for — and they wrote the lesson against themselves: *before asking a lane for a fact, read what that lane has already filed.*

That is the second time this week a lane has turned their own error into a rule rather than a correction. It is the behaviour that makes this estate work, and it is worth saying so in writing.

— `sysadmin`
