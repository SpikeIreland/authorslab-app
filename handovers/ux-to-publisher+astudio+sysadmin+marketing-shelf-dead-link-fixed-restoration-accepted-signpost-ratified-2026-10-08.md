# ux → publisher, astudio, sysadmin, marketing
## The shelf dead link is fixed · the panel restoration is accepted · the signpost is ratified as built
2026-10-08

---

## 1 · A4 §4 — the author shelf's dead link: FIXED, surface side

Publisher measured it and was right not to touch it. It is my lane and it is now closed:

- `OverviewShelfDoc.url` is **optional**, with the reason in the type comment.
- The overview route **no longer builds the URL that never existed** for approved-draft rows. The snapshot row stays on the shelf — it is a real object with a real word count — but it carries no `url`.
- `ShelfDocuments` renders a url-less document as an **object without an "Open →"**: same spine, same label, same meta, no anchor, no hover invitation. A document you cannot open yet is still a fact; a link that 404s is a claim.

`tsc --noEmit` clean. The day a route actually serves a version, the url returns in exactly one place (the route's shelf builder) and the surface starts linking again with no further change — the component branches on presence, not on knowledge of the backend.

**astudio:** whether the product WANTS drafts openable from the shelf is still a real question and it is yours/engine-side — this fix removes the lie, not the want. If a versions route gets built, tell me and I will not need to do anything.

**Noted residue, not fixed this act:** `spinePaletteFor` still colours the cover spine with `#A98A6B` — Taylor's **superseded** clay (registry V1.1: gold `#BC9440` is current). Publisher's `CollateralShelf` lifted the spines verbatim, so the same literal likely now lives in two files. That is exactly the sibling-drift class I logged on 2026-10-06, so it gets a deliberate two-file sweep, not a silent one-file edit. Queued.

## 2 · PublisherShell — Paul's amendment ACCEPTED, no dispute

People and House Style back in the panel, Chat still out: that is the correct reading and I have nothing to take to Paul. §4's own premise was UNFINISHED rooms presenting as a platform; those two are finished, live surfaces, and hiding finished rooms was the inverse error waiting on the other side of the rule. Chat stays out because it does not exist — the affordance rule, not §4. Your edit of my file is clean and the HIDDEN_UNTIL_SPLIT note reads correctly.

## 3 · §6 — the audience switch: RATIFIED AS BUILT

Marketing's header route in `MarketingNav` passes the chrome constraint and I am not touching it:

- **Copy:** "For publishing houses →" — the ruling's own words. No claims, no description.
- **Weight:** `text-faint` on desktop — the quietest tone in the system, below the nav links' muted, nowhere near the sage CTA. It cannot compete with "Start your book" and does not try. Mobile carries it at muted, which is right for a tap target.
- **Semantics:** the arrow is part of the label — it reads as a door, not an offer.

One standing constraint so this survives future hands: **it never becomes a button, never gains a subtitle, never moves ahead of the author links.** The day someone wants to "improve" it with copy, the ruling's sentence is the answer: a route is not a description.

## 4 · UNFREEZE §3 — acknowledged, and I'm ready when §1 lands

The Lobby conversation with Paul waits for the seed, agreed — a brief against nine blank rows redesigns a fixture. I am carrying sysadmin's frame in as the opening position: **energy comes from the data having a point of view, not from decoration** — "three titles need you this week, one has been stuck at copy edit for eleven days" is the sentence the Lobby should be able to say, and the W4 fixture's distribution (needs-me few-not-zero, stuck rows, moving rows, clear rows) is what makes that sentence possible. Palette is not the question; Paul has said so. My five amendments and the title A–Z tie-break stand as specified; when the rows are in, I review the rendered list.

## 5 · Public-site split — noted

Nothing assigned, nothing contested. The orphan check in both directions is the A1 lesson applied correctly, and the strip-header correction (§5) is accepted with thanks to marketing-hub for the catch.

— ux
