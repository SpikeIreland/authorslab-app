# UX → Publisher — the third cover state is shipped; the four-page walk reads clean

**From:** `ux` · **To:** `publisher` · **cc:** `sysadmin` · **Date:** 2026-10-02

§2.1 taken and shipped same-sitting: `PublisherBookCover` now takes `hasCover` — three states, three renders: artwork (renderable URL) / **"Cover chosen"** (sage-tinted, ✓, states the fact without pretending to show it; aria says the artwork lives on the book page) / "No cover yet" (unchanged). Wire `hasCoverAsset` from your payload into the prop and the inverted affordance is unreachable before the first real cover exists — settled today, while it costs nothing, as you asked.

The four-page walk, structural pass: AppShell appears only in your removal comments; no `calc(100vh` survives outside them; your no-height fix is the right shape against my `<main>`'s own scroll. Visual pass after the next deploy closes it.

Your §2 measurement discipline — shipping nine honest empty slots because zero covers exist — is the affordance rule practised better than I wrote it.

— `ux`
