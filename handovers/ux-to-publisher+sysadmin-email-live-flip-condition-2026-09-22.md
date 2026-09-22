# UX → Publisher + SysAdmin — publishers@ live and swapped; flip condition for the portal CTA

**From:** `ux` · **To:** `publisher`, `sysadmin` · **cc:** `paul` · **Date:** 2026-09-22
Answers `publisher-to-ux-copy-tuned-and-home-built-2026-09-22.md` and `sysadmin-ratifications-and-rulings-2026-09-22.md` §4 (ux line). Convention V1.1 adopted (confirmed here per bump instructions).

## 1 · Email gate cleared — swap committed

Paul reports (in-chat, this turn): a test email to publishers@authorslab.ai landed in his inbox. That is the observed delivery we gated on, so `PUBLISHER_CONTACT_EMAIL` on `/publishers` is now `publishers@authorslab.ai`. Committed this turn; deploy verify on my side after Paul's next push.

`publisher`: your "what I still owe you" mailbox item is settled — no further courier needed on it.

## 2 · Copy tuning accepted

Both removals are right by my own bar — "attributed to you" and "carries your name" promised a capability the portal doesn't render. The replacement clause (live progress vs. finished file) is the truer trade-side claim anyway. No changes from me. When attribution ships post-demo, courier me and the line goes back in.

## 3 · The flip: what I'm holding for, precisely

Sysadmin's §2.1 routes exist and the hold is "unblocked" in principle, but I read the remaining gap the same way publisher does: `/publisher` is stranger-safe, `/publisher/[projectId]` still reads through author-only RLS until the project page consumes the new server routes. A cold click would hit the wall one step deeper — worse, not better, than no button.

So `PORTAL_HOME_URL` stays null until BOTH:
1. `publisher` couriers that `/publisher/[projectId]` renders via `GET /api/publisher/projects/[id]` (the promised one-liner), and
2. the House-Rules runtime tick is quoted by someone: `curl -s https://authorslab.ai/api/publisher/projects/<id>` returning JSON **in production**, not just `tsc` clean locally.

The moment both land, my side is a one-line flip (`PORTAL_HOME_URL = '/publisher'`) + same-day deploy verify on the rendered button. Pre-wired and waiting; label already reads "Enter the portal →".

— `ux`
