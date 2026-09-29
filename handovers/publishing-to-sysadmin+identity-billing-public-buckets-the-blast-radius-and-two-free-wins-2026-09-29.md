# Publishing → SysAdmin — The public-bucket fix splits in two, and half of it is free

**From:** `publishing` · **To:** `sysadmin` (storage config is your lane; this is the evidence, not the act) · **cc:** `identity-billing` (authorisation model), `astudio` (27 report URLs are yours), `publisher` (portal reads), `design` (your signed-URL route is the pattern), `paul` (§4 — two clicks, today) · **Date:** 2026-09-29
**Paul directed this next**, ahead of the PDF repair. I have done the audit and **not** touched any bucket.

## 1 · The exposure, stated once

Four buckets are `public: true`. A public Supabase bucket serves `/object/public/<bucket>/<path>` **with no authentication at all** — RLS does not apply to it. Paths are manuscript UUIDs, so what protects an author's unpublished novel today is that nobody has guessed a UUID. That is obscurity, and House Rules' data section asks for RLS-on-with-policies.

| Bucket | Public | Holds |
|---|---|---|
| `manuscripts` | **yes** | authors' original uploaded manuscripts |
| `manuscript-formats` | **yes** | composed book files (as of today, real ones) |
| `manuscript-versions` | **yes** | edited manuscript versions |
| `manuscript-reports` | **yes** | editorial reports |
| `cover-assets` | no | cover art — `design` got this right |

## 2 · The blast radius — 47 stored URLs, and none of them where you'd fear

Flipping a bucket to private instantly 404s every **stored** public URL. I counted them rather than guessing:

| Column | Public URLs stored | Bucket |
|---|---|---|
| `editing_phases.report_pdf_url` | **19** | manuscript-reports |
| `manuscript_versions.file_url` | **15** | manuscript-versions |
| `manuscripts.report_pdf_url` | **6** | manuscript-reports |
| `author_profiles.profile_image_url` | **5** | author-profiles |
| `publishing_progress.plan_pdf_url` | **2** | manuscript-reports |

Plus three code sites calling `getPublicUrl`, all for profile images: `profile/page.tsx`, `onboarding/page.tsx`, `components/BackMatterSection.tsx`.

**And the finding that matters: `manuscripts` and `manuscript-formats` have ZERO stored public URLs and zero code building them.**

## 3 · So it is two jobs, not one

**TIER 1 — free. No consumers, nothing to fix, flip whenever you like.**
- **`manuscripts`** — the raw uploaded manuscript. The single most sensitive artefact we hold, and nothing reads it by public URL.
- **`manuscript-formats`** — composed books. One stored public URL exists, written by me an hour ago; I also store `bucket` and `path` on the same object precisely so it can be signed instead, and **no product code reads it**, because there is still no caller.

Two buckets, two toggles, zero breakage. This is the highest-value, lowest-risk security change available to us and it costs minutes.

**TIER 2 — needs the signed-URL pattern first.**
- **`manuscript-reports`** (27 stored URLs) — `astudio`'s, and the reports Oliver was shown
- **`manuscript-versions`** (15) — `astudio`'s
- **`author-profiles`** (5 + 3 code sites) — arguably *legitimately* public: it is a photo the author chose to display. I would leave it public deliberately and write that down, rather than leave it public by accident.

Tier 2 is a real build: a route that resolves a stored path into a short-lived signed URL, plus a sweep of the five columns and three call sites. **`design` has already built this twice** — `api/projects/[id]/design/assets/route.ts` and `api/publisher/projects/[id]/covers/route.ts` — so the pattern is house-proven, not new.

## 4 · `paul` — the two-click version

Supabase dashboard → **Storage** → `manuscripts` → settings → turn **Public** off. Same for `manuscript-formats`. Nothing in the product reads either by public URL, so nothing breaks.

That closes the exposure on the author's original manuscript and on every composed book we make from here — before Oliver gets access on Monday. The other three want the signed-URL work first and should not be flipped today.

My own Supabase access is read-only, so I cannot do it; and per House Rules storage config is `sysadmin`'s lane regardless.

## 5 · One thing I would decide deliberately rather than inherit

`author-profiles` being public is probably *correct* — a public author photo is the point. But right now it is public for the same reason the manuscripts are: nobody chose. **Whatever we decide, it should be a decision with a line in the record**, so the next person to audit this finds an intent rather than an accident. That is the whole difference between a policy and a default.

## 6 · What I am not doing

Not flipping anything. Not touching `astudio`'s 27 report URLs. Not building the signed-URL route — it is shared infrastructure across at least three lanes, and if it lands in one lane's shape it will be rebuilt twice more. **`sysadmin`: if you want that route owned somewhere, I will take it**, since I already consume two buckets and will consume a third; but I would rather be assigned it than assume it.

— `publishing`
