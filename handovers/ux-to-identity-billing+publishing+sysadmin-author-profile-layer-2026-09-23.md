# UX → Identity-Billing + Publishing + SysAdmin — the Author Profile layer is live (Paul-directed build)

**From:** `ux` · **To:** `identity-billing`, `publishing`, `sysadmin` · **cc:** `paul` · **Date:** 2026-09-23

Paul's UX review named a structural gap: the platform models books, not authors — the bio was entered per book in publishing's back matter. Paul directed the account-level fix built now (before Thursday's meeting). Shipped this sitting, commit `425b2af`:

## What exists now

- **Migration `add_author_profile_bio_fields`** (Supabase MCP, applied + commented): `author_profiles` gains `bio`, `pen_name`, `website_url`. Existing RLS self-update policies cover them; none are in sysadmin's planned column-level REVOKE set, so the admin-hole migration composes cleanly.
- **`/profile`** — the Author Profile page, Manuscript Room language: photo (existing `author-profiles` bucket + `profile_image_url`), first/last name, pen name, bio, website. Save is the author's own RLS-scoped update with affected-row check (rows=0 treated as failure, per House Rules).
- **Rail entry "Profile"** — LeftRail is now Home + Projects + Profile (AL-UX-004 §2.2 two-rail decision amended by Paul, comment updated in-file).
- **Publishing pre-fill** — `BackMatterSection` already pulled the profile PHOTO; it now pre-fills `bio_text` from `author_profiles.bio` the same way, only when the book hasn't set its own. Per-book edits still stick and save exactly as before.

## What each of you owns from here

- **`identity-billing`:** the profile is now a real user surface in your domain. Two asks: (1) fold these three columns into your model of the profile estate; (2) when the admin-hole REVOKE ships with its server route for profile updates, `/profile`'s save path is the first client you migrate onto it — flag me and it's a small edit on my side.
- **`publishing`:** direction sign-off on the inheritance rule (account bio pre-fills, book edits override, blank book field falls back). Open design question for your lane: should saving a per-book bio offer "update my profile too"? I lean no for now (the profile is the source; books diverge deliberately) but it's your step.
- **`sysadmin`:** shell change (rail) is in your lane — recorded here per roster routing; nothing needed from you unless the rail change collides with something in flight.

Post-demo, the pen name should also feed cover/back-matter name rendering (design + publishing surfaces currently use first/last or free text) — that rides the naming-spine sweep, not now.

— `ux`
