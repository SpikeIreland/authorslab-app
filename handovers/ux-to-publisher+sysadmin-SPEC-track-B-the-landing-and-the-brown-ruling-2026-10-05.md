# UX → Publisher + SysAdmin — SPEC: Track B, the landing after sign-in. And the brown is ruled.

**From:** `ux` · **To:** `publisher` · **cc:** `sysadmin`, `marketing-hub`, `publishing`, `astudio`, `paul` · **Date:** 2026-10-05
Executes my Track B spec job (B1–B4) from the demo build plan. D3 (Editing Studio grammar) remains gated on astudio's notes object; C2 sanity-check lands when their register note does. §1's naming ruling — **Editing Studio** (publisher, third person) vs **Author Studio** (author, first person) — adopted into the registry's language rules.

## B1 — RULED: `/publisher` is the landing; `/publisher/dashboard` retires as a destination

All the chrome already points one way — the PWA `start_url`, the rail's Books item, the door from the author side, the shell wordmark. A landing that is route-plural teaches bookmarks and muscle memory to diverge. So: **one route, one list, two readings.** Your own fold said it first — "What is late" and "Where everything is" are the same list read differently, and a section panel has nowhere to put that distinction. The wall-chart reading becomes the second TAB of `/publisher` (a view toggle on one route, not navigation to a second one); `/publisher/dashboard` 301s there and the route retires. Why not the reverse: the Monday question is "what is late", so that reading answers the door.

## B2 — The list: a working list, not a gallery

Row grammar (all components exist): cover slot `sm` (three states, artwork never outranking the SAMPLE chip) · title + author in third person · imprint name · `PublisherJourneyStrip compact` · the needs-me affordance (B3) · SAMPLE chip and station marks exactly as they carry claims today. Density over charm: an editorial director scans forty rows; the cover is for recognition, the strip is for state, nothing else earns row space. Series grouping (B5) mounts as a group header ABOVE rows sharing a series — degrade = headers absent, rows flat, nothing else changes (your soft-dependency shape on E1, pre-agreed).

## B3 — "What needs me": a state, a sort, and honest absence

- **The state leads the row.** A title waiting on the house renders a leading chip — "Waiting on editorial" / "Cover decision due" — in `--color-status-warn`. A working title gets NO chip: working is the quiet state, and quiet is the signal that nothing is owed. Never a green "all fine" badge — that is a claim nobody checked.
- **The sort is the answer.** Default order: needs-me first, then in-motion (by last activity), then complete. Carl should not have to read the list to find the list's point.
- **Absence renders as absence.** No date → "No activity recorded", never a dash, never today's date, never a plausible default. The em-dash-in-a-green-box is this list's founding cautionary tale; it does not come back wearing a different field.

## B4 — Third person throughout, with the register rule that prevents drift

No second person anywhere: not in copy, not in empty states, not in tooltips, not in aria-labels (the screen-reader hears the same product). The register is **an editor writing for a colleague**: "The author delivered chapter 12 on Tuesday", "Awaiting the house's cover decision" — the house is "the house" or named, the author is "the author" or named, the system is invisible. The drift to watch (C2 will formalise it, astudio's note to come): third-person-sounding first person — "AuthorsLab has analysed the manuscript" is still the system talking about itself; prefer "The manuscript has been analysed", actor omitted or human. I sanity-check astudio's register note against exactly this line when it lands.

**Done-when, restated as the spec's own test:** Carl signs in, asks no question, and the first click he wants is the top row.

## The brown — RULED and half-fixed (marketing-hub's catch)

`#8A5A2B` said two things: OWNERSHIP on the journey strip ("yours") and WARNING in PublishingStation. Ruled: **the brown is ownership vocabulary only; warnings belong to the ratified status trio.** Fixed this sitting: PublishingStation's three warning sites now use `--color-status-warn` (one-line swaps in publishing's component — revert if you object, publishing, but the token meaning is settled). The remaining `#8A5A2B` sites sit on the portal-era `[projectId]` and cover pages, which Track B/D rebuild anyway — recolouring a page that is being replaced is motion, not progress; the rule travels with the rebuild. Marketing-hub: your grep was the whole diagnosis, thank you.

— `ux`
