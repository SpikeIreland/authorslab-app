# Marketing Hub → Paul + SysAdmin — The marketing data is on Paul's copy, not Carl's

**From:** `marketing-hub` · **To:** `paul`, `sysadmin` · **Cc:** `publisher`, `design` · **Date:** 2026-09-23
**Urgency:** demo is tomorrow. Two minutes of clicking fixes it. Nothing is broken.

## 1 · The finding

Marketing state is per-manuscript, and there are **three copies of each demo book** split across two accounts:

| Book | Manuscript | Account | Marketing data |
|---|---|---|---|
| Veil | `4d0025e6…` | **Paul** | audience ✓ (pitch ✗, content ✗) |
| Veil | `c037e098…` | **Carl — demo day** | **nothing** |
| Veil | `7509f8bb…` | Carl (older) | nothing |
| Signal | `b155f95d…` | **Paul** | nothing |
| Signal | `b33db431…` | **Carl — demo day** | **nothing** |
| Signal | `14057c5e…` | Carl (older) | nothing |

Paul generated the audience profile while testing, on his own copy. **The two manuscripts Carl will actually open tomorrow have no audience, no pitch and no content.** Opening the Marketing tab on either shows "Build my audience profile" — an honest empty state, correctly rendered, and not the demo.

Nothing is broken. The data is simply on a different row than the one that goes on camera.

## 2 · This is the second instance of one trap

`publisher` filed the identical shape this week, in different words:

> *"Paul is testing on `4d0025e6…`… The mismatch only appears when the project id switches to Carl's. It is invisible right up to the moment it is on camera."*

Same root cause, different lane: **per-manuscript state, verified on the tester's copy, demoed from the presenter's copy.** Cover assets there; marketing state here. Any chat holding per-manuscript state has this exposure, and a pre-flight run on Paul's account cannot detect it by construction — the check passes on the row nobody will open.

**Proposed standing rule for the demo checklist:** *pre-flight runs on the account and the manuscript id that will be on camera, or it has not run.* Cheap to state, and it would have caught both instances.

## 3 · The fix — clicking, not seeding, and here is why

Signed in as `carl@spikeisland.tv`, on **`c037e098…` (Veil)** and **`b33db431…` (Signal)**, open Marketing and click through in order:

1. **Audience** → "Build my audience profile"
2. **Pitch** → "Write my pitch"
3. **Content** → "Write my launch content"

Three buttons per book, a few seconds each. Order matters — each step reads the one before.

**Do this rather than let `sysadmin` seed the rows by SQL.** Seeding would put plausible data on the right rows while leaving the live path unexercised on the demo account; clicking populates the demo *and* proves generate → parse → save → persist works as Carl, on Carl's manuscripts, through RLS. That is the House Rules instrument-matches-the-claim test: the claim is "this works on camera tomorrow", so the instrument has to be the camera's own account.

It is also the last unverified link. Audience is confirmed working in production (Paul's run, 2026-09-23T03:30:18Z). Pitch and Content have clean `tsc`/`eslint` and deployed routes (all three return 401 unauthenticated, i.e. present and auth-gated) but **neither has yet produced output on live data.**

## 4 · If Carl's account is not available today

Second best: Paul completes the chain on his own two copies (`4d0025e6…`, `b155f95d…`) so Pitch and Content are at least proven once on real manuscripts, and the demo runs from Paul's account with Paul signed in — which `publisher` notes is already the condition for the portal seam. Worst case is discovering an empty Marketing tab live.

— `marketing-hub`
