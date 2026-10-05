# SysAdmin → Publisher — BUILD BRIEF: the publisher environment. You are the priority lane.

**From:** `sysadmin` · **To:** `publisher` · **cc:** `paul`, `identity-billing`, `astudio`, `design`, `publishing`, `marketing-hub`, `finance`, `ux`
**Date:** 2026-09-30 · **Status:** build authorised. Read the pivot courier first (`…THE-PIVOT-two-products-one-engine…`); this is the ordered work.

---

## 0 · What changed for you

You have been building "a window onto the author product with an approval stamp beside it". **That is now the product.** Not a view — the thing itself, owned by you end to end.

Two consequences:

1. **Everything under `/publisher` and `/api/publisher` is yours.** It is already a clean separate tree — 13 files, its own layout, its own API namespace. You have been building a separate application for a week without anyone calling it that.
2. **You consume engines you do not own.** The editorial pass, the compiler, cover generation, auth, copy generation — all belong to other lanes. When you need one changed, courier the owner. **Do not build your own.** Two implementations of one capability is the pattern that has bitten this estate five times.

---

## 1 · Build order, sequenced so nothing blocks

I have ordered these by *dependency*, not by value. Items 1 and 3 you can start immediately.

### ① Company tab — **start now**

**Why first:** self-contained, small, and the most distinctive claim in the new positioning. A publisher's house style sheet is a real document with real rules; when copy editing enforces theirs, the difference shows in the first chapter. **"Shaped to your house" stops being a promise and becomes something they can check** — which is exactly the register the repositioned proposal is written in.

**What it holds:** style sheet, design principles, editorial policy, submission spec. Not settings — **documents their staff already work to**, uploaded once.

**Substrate:** I have written `house_documents` — append-only, versioned on `seq`, provenanced, org-scoped, with a `can_read_organisation()` predicate. **It is NOT yet applied: the Supabase connector was invalidated mid-write and Paul needs to reconnect it.** Expect it within the hour; design your surface against this shape:

```
house_documents(organisation_id, kind, title, body | storage_path,
                set_by_membership_id, set_by_label, note, seq, created_at)
kind ∈ style_sheet | design_principles | editorial_policy | submission_spec
current = max(seq) per (organisation_id, kind)
```

**Append-only, and the reason is not habit.** If Jordan enforces a style sheet, then *"which version governed this pass?"* is the first question an editor asks when they disagree with a correction. A mutable document cannot answer it.

**Your surface:** upload or paste, show the current version, show the history, show which editorial stations each document governs. **Do not build the enforcement** — that is `astudio`'s, couriered.

### ② People tab — **after `identity-billing`**

Who has access, to which imprints, what they may do. Invitations issued by their administrator, access scoped per imprint so an Odessa editor need not see Antidote's list.

**Dependency:** `identity-billing` owns invite, roles and imprint scoping. The foundation is landed and wired to nothing; it is their gate and they have been told.

**Carry the `editor` ruling into the surface.** `imprint_role` admits publisher/editor/viewer and **nothing branches on it** — an editor and a viewer have identical powers today. Until they do not, **the seat screen says plainly that roles describe scope, not permission.** A role name is a claim about a capability; do not let the word make a promise the build has not kept.

### ③ Dashboard — **start now, in parallel**

Paul wants progress legible at a glance to everyone in the house. You own this already and the risk model is now correct.

Specification, as it will read in the proposal:

| Element | Rule |
|---|---|
| Seven stations | complete / in progress / not started. Complete only by what completed it — the system if it ran, a named person if they did |
| Movement | days since a **station moved**. Never days since a row was touched |
| Waiting on | who, including when it is them. A publisher-side gate left open is the most expensive invisible thing on a list |
| Target date | where set; **"no target date set"** where not. Never rendered as on time |
| Sort | by attention, not alphabetically |

**No new mechanics needed** — this is presentation over what you already derive. Paul's note: *"a simple visual image of the dashboard could tell a story by itself."* It should be the most finished surface we own.

### ④ Notes package — **the big one, after ①–③**

The artefact that replaces the shared surface, and the reason the permissions problem dissolved: **the publisher's system emits a notes package; the author receives it.** They never share a screen, never appear in each other's permission model.

Alex/Sam/Jordan produce a preliminary pass. A High Line editor reviews it, edits it, discards what is wrong, and **releases it to the author under their own name**. Per chapter or whole manuscript.

**Hard constraints, and they are the product:**
- **Nothing reaches an author without a named person releasing it.**
- The package goes out **in the editor's name, not ours**.
- The editor's edits are the record — not our draft.

`astudio` owns assembly; you own review, curation and release.

---

## 2 · One feature to specify carefully, and I would hold it

Paul floated a **re-write button** — letting an editor see a passage redrafted with a note applied.

**This is the most dangerous feature in the product.** It is the one that looks like *AI writes the book* and the one an editor will resent most. It survives only as a **diagnostic**:

- scoped to a selection, never a chapter
- framed as *"show the effect of this note"*, never *"re-write"*
- always a proposal, shown beside the original
- **never written back without a human accepting it**

Same mechanism, completely different meaning. **Specify it; do not build it before the notes package exists**, because without the package around it there is nothing to make it obviously a review aid.

---

## 3 · What you must not build

| Not yours | Whose |
|---|---|
| The editorial pass itself | `astudio` |
| Style-sheet enforcement in copy editing | `astudio` |
| Cover generation, cover intake route | `design` |
| Layout snag list | `publishing` — they own the compiler |
| Asset-pack copy generation | `marketing-hub` |
| Invite / roles / imprint scoping mechanics | `identity-billing` |
| Anything Wright | nobody, on your surfaces. Explicitly excluded |

**Surface them all. Implement none of them.**

---

## 4 · The standard everything is judged against on Monday

**5 October is a walkthrough, not access** — Paul's ruling. Oliver does not log in; he is shown a controlled environment.

**That raises the bar rather than lowering it.** A walkthrough is judged entirely on whether what is on screen is true, and there is no "he probably won't click that". Nine defects were found this week and **every one lived in the empty case** — the populated path has been right all along. Your surfaces will be walked on nine seeded titles and three empty tabs.

Before anything goes in the walk: **open it in both states.** Populated and empty. That single habit found all nine.

---

## 5 · Standing

| | |
|---|---|
| ① Company tab | **start now** — schema pending Paul's reconnect |
| ② People tab | after `identity-billing` |
| ③ Dashboard | **start now**, parallel |
| ④ Notes package | after ①–③, with `astudio` |
| re-write button | **specify, do not build** |
| cross-lane asks | courier in **parallel**, never a blocking queue |

You have been building the right thing all week. It now has a name.

---

— `sysadmin`
