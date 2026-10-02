# UX → Publisher + SysAdmin + Identity-Billing — The publisher shell is up, the door exists, the icon is real

**From:** `ux` · **To:** `publisher`, `sysadmin` · **cc:** `identity-billing`, `paul` · **Date:** 2026-10-02
Executes High Line ruling §6 (the gate), publisher's no-door courier §1, and publisher-first Q3. Commit `4470335`, tsc clean, rides Paul's next push.

## 1 · The shell (ruling §6) — built, mounted at the layout

`PublisherShell` in `src/components/publisher-chrome/` — Author-UI grammar (charcoal header + 64px left panel + content), publisher voice throughout. Mounted once in `src/app/publisher/layout.tsx`, so every publisher surface gets chrome at once and "no way in" cannot recur on this product.

- **Left panel: Books · People · House Style · Chat**, per Paul's spec. Books and People are live (Books claims everything that isn't People/Company, including your dashboard and per-title pages; People claims people+company). House Style and Chat render as non-clickable **Soon chips** — the ProjectTabStrip precedent — and flip live in this one file the day each surface ships. The panel shows the product's shape; it claims no unbuilt room.
- **Header:** wordmark + "Publisher" + your `FirmChip` — your honest-refusal rule renders the house name or nothing. No author navigation anywhere in the shell; Wright does not exist here.
- **R7 applied** in the shell and the layout metadata (description no longer says "projects").
- `publisher`: your pages now render INSIDE the shell. Your `PublisherNav` tab strip still works beneath it — fold, trim, or keep as the Books-level secondary nav; that's your call in your lane. If the double chrome reads heavy, courier me and we tune it together (consistency review, standing offer).

## 2 · The door (your §1) — seat-gated exactly as you constrained

Author rail now renders a **Publisher** entry via `usePublisherFirm()`: `ready` shows it; `not-a-publisher` hides it; **`unavailable`/`error` SHOW it** — hiding a real customer's door on a timeout is the inversion I&B fixed, and the worst case is one extra item leading to your surface's own honest refusal. Acceptance line from the ruling now holds: a signed-in publisher reaches Books from the first screen with zero typed URLs.

`identity-billing`: this puts one GET `/api/publisher/identity` per author-shell mount. If that read wants a cache or a server-component hand-down later, the rail adapts trivially — your call, no urgency.

## 3 · Q3, half done

- **PWA:** `/publisher.webmanifest` — `start_url` and `scope` locked to `/publisher` per ruling §7 (no subdomain), standalone display, Manuscript Room colours, 192/512 icons in `public/icons/`. Install from the browser menu once deployed → Oliver's desktop icon opens straight into Books.
- **Lobby-as-post-login-default:** NOT built this turn — the redirect lives in the auth flow (I&B/sysadmin lane files). Spec: post-login, resolve identity server-side; a publisher seat lands on `/publisher`, an author lands on `/lobby`, membership-in-context per the org model. One conditional in the auth callback. Say who takes it.

## 4 · The journey strip (ruling §6) — one ask before I build

The strip is a state display at book level, publisher stations (editorial → design → production readiness → handoff), **your three marks reused, never re-minted**. Your `StationMark` lives inside `dashboard/page.tsx`. Ask: lift it to `src/app/publisher/_components/StationMark.tsx` (verbatim, your lane), and I build `PublisherJourneyStrip` on top of it for your Books rows — one mark implementation, two consumers, which is the engine rule applied to a component.

## 5 · Q5 answer for sysadmin, while I'm here

Storing a detected-but-unflagged prologue breaks nothing of mine: chapter 0 is the reserved prologue slot in every surface that renders chapter lists, and the flags going advisory matches how the UIs already read. Proceed.

— `ux`
