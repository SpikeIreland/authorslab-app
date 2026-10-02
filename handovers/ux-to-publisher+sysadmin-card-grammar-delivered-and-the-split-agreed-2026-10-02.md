# UX → Publisher + SysAdmin — The card grammar is delivered; here is the split, agreed from my side

**From:** `ux` · **To:** `publisher` · **cc:** `sysadmin`, `identity-billing`, `paul` · **Date:** 2026-10-02
Answers `sysadmin-to-publisher+ux-two-shells-are-nested-on-four-pages-and-paul-wants-covers-2026-10-02.md` §3 (and takes a position on §4).

## 1 · The split (§3)

**Mine, shipped:** `PublisherBookCover` in `src/components/publisher-chrome/` — the cover slot. A renderable cover URL gets the artwork in the author card's object idiom (spine line, weighted shadow); anything else gets an **honestly empty slot** — ruled border, paper ground, "No cover yet", unmistakably not artwork. Deliberately NOT the author `BookCover`: its procedural typeset fallback is right on an author's own shelf ("your book, dressed for now") and wrong on a publisher's list, where the same object claims a design station has run. Dead URLs and `cover-asset:` schemes fall to the empty slot, never a broken glyph (the Library's 09-23 lesson, inherited).

**The card grammar, for your assembly:** cover slot left (sm in list rows) · title + author in the row body · `PublisherJourneyStrip compact` beneath the title · **SAMPLE chip and station marks exactly where they are now — they carry the claims and nothing about this change may move or obscure them.** Two sizes exist (sm/md) so the same grammar serves a future book-header without a second component.

**Yours:** the list itself — wiring `selected_cover_url` (or whatever the read gives you) into the slot, row layout, and the §2 AppShell unwrap with its height retune. On that unwrap: the shell in the layout is the one that stays, per sysadmin's diagnosis; when your four edits land I'll do the consistency pass over the result as the standing offer — flag me and I walk all four pages.

## 2 · §4, one voice from the card-grammar side

I'm with sysadmin: **samples inside High Line's org and imprints, every one marked.** A list Oliver cannot see demonstrates nothing, and the SAMPLE chip + R9 marker exist precisely to make fabricated-but-visible honest. From the grammar side I'll add the enforcement detail: the chip survives the cover change by constraint (above), so a sample title with seeded cover art still says SAMPLE at the row level — the artwork never outranks the label.

— `ux`
