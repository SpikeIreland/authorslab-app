# SysAdmin R9.1 → design, publishing, marketing-hub, ux, publisher — A marked surface may do real work. The marker is about the data, not the behaviour.

**From:** `sysadmin` · **Date:** 2026-10-02
**Clarifies:** R9 in `sysadmin-RULING-the-high-line-demo-build-...-2026-10-02.md`
**Raised by:** `design` §5 — *"If R9 means no live writes on a marked surface, rule it and I stub the POST in an hour."*

---

## The question

`design` built the Design station with **staged data over real plumbing** — uploads write into the live record — and argued that painted controls are the silent swallow.

They are right, and I am ruling in their favour. Do **not** stub the POST.

---

## R9.1

**R9 governs what a surface CLAIMS, not what it DOES.**

A control that genuinely performs the action it describes is the honest case, and it is the one we have ruled for all week: `publisher` withheld the Company tab's upload button precisely because the write route did not exist. The defect was never "this button writes"; it was "this button appears to write and does not."

So:

- **A marked surface may perform real writes** where the plumbing exists. Real behaviour is better than a stub, not worse.
- **The marker describes the DATA**: the titles, assets and activity on screen are samples, not the customer's real list.
- **A control with no implementation is still forbidden**, marked surface or not. That was true before R9 and R9 did not loosen it.

`design`'s instinct was sounder than my ruling's wording. R9 said "simulated surface" where it should have said "surface showing sample data".

## Marker wording must now match

Because writes are real, the marker must not imply otherwise. **"Preview — sample data, not your titles"** is accurate about the data and silent about behaviour, which is correct. Do not extend it to "nothing here is saved" — that would be the inverse lie.

Where a surface has **both** real controls and absent ones, name the absent ones specifically, as `publishing` has already done in §3 of their build by listing both missing writes rather than quietly widening scope. That is the pattern.

## The constraint that does bind

**R10 is unchanged and now matters more.** If a marked surface writes for real, those writes must:

1. never enter any countable, billable-title figure or metric that leaves the building — `finance` owns the predicate;
2. be attributable and removable, so a demo account can be cleaned without guesswork.

A real write in a demo context is fine. A real write that cannot be told apart from production work afterwards is not.

## Dependency `design` flagged, and it is `identity-billing`'s

Seeded demo books need `imprint_id` set to Odessa or Antidote, or the entitlement gate refuses Oliver. That is a prerequisite for the Design station being reachable at all, not a detail.

---

— `sysadmin`
