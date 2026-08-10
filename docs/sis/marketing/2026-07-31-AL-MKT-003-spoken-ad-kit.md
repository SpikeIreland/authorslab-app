# Spoken-ad kit — 15s / 30s video with voice-over

**AL-MKT-003 · 2026-07-31**
**From:** Marketing station
**Production stack:** ElevenLabs (voice) → InVideo (assembly) → brand cards
from `creatives/` slotted in. Zero marginal cost beyond existing accounts.
**Same rules as AL-MKT-001:** no pricing, no turnaround claims, no
testimonials, "AI editors" said plainly. Same launch gates apply before any
paid distribution; organic posting to our own channels needs only gate 8.3
(new site live) if the video points at authorslab.ai.

## 1 · The one craft rule that matters most

On YouTube skippable in-stream, the skip button appears at **5 seconds**.
The ad must earn its keep in the first line — speak directly to the
finished-manuscript moment before any branding. Both scripts below put the
hook in the first 3 seconds and the wordmark nowhere until ~1/3 in.

Timing math: comfortable VO is ~145 words/min → **15s ≈ 35–38 words**,
**30s ≈ 72–78 words**. The scripts are written to those budgets; if you edit
them, re-count words or the edit won't fit.

## 2 · Scripts

### Script A — 30 seconds, "The end" (recommended first test)

~76 words. Warm, unhurried, a beat of dry humour.

> You typed "The End." — Ninety thousand words. Months of your life. And now
> the real question: is it ready?
>
> AuthorsLab gives your finished manuscript an editorial team. Alex looks at
> the big picture — structure, stakes, character. Sam works the sentences.
> Jordan does the final polish. Named AI editors, working through your book
> with you — chapter by chapter.
>
> See what an editor would say about your novel. The first assessment is
> free — at authorslab dot A-I.

### Script B — 30 seconds, "final_final_v3" (alternate hook)

~74 words. Slightly wrier; speaks to the drawer-manuscript ache.

> Somewhere on your laptop is a folder called "final… final… version three."
> Your novel. Finished — and stuck.
>
> What it needs isn't another writing app. It's an edit. AuthorsLab is an
> editorial team for finished manuscripts: Alex for story, Sam for sentences,
> Jordan for the last polish. AI editors with names — who know your book.
>
> Get a free manuscript assessment at authorslab dot A-I — and find out what
> your novel needs next.

### Script C — 15 seconds, cutdown (feed placements, bumper-adjacent)

~36 words. One breath, one idea, one ask.

> You finished the novel. Now it needs an edit.
>
> AuthorsLab — named AI editors who take your manuscript from first read to
> final polish.
>
> Free assessment at authorslab dot A-I. Every book deserves an editorial
> team.

## 3 · Shot map (Script A shown; B and C compress the same grammar)

| Time | VO line | Visual |
|---|---|---|
| 0–4s | "You typed The End… ninety thousand words…" | Human footage: author at a desk, typing the last line; close on hands, a held breath, a small smile |
| 4–8s | "…is it ready?" | Author leans back, looks at the screen — the doubt beat. (This is the skip-survival moment: face + question) |
| 8–12s | "AuthorsLab gives your finished manuscript an editorial team." | **Brand card 1** (`video-card-open.png`) or product UI shot of the studio |
| 12–20s | "Alex… Sam… Jordan…" | Three quick cuts: persona tiles (`tile-alex/sam/jordan.png`) or UI vignettes of each editor's chat; alternate with human footage — author reading margin notes, nodding |
| 20–25s | "…working through your book with you, chapter by chapter." | Human footage: author scrolling chapters, marking pages of a printed manuscript |
| 25–30s | "The first assessment is free — authorslab dot A-I." | **CTA end card** (`video-endcard-cta.png`), hold 3+ seconds, nothing else on screen |

Human-footage briefs for InVideo's stock/generative search: "writer typing at
a warm-lit desk, laptop, coffee, close-up hands"; "woman smiling with quiet
relief at laptop screen"; "man reading a printed manuscript, pencil in hand";
"writer by a window with notebook". Prefer warm, natural light and paper-and-
desk textures — the Manuscript Room feel — over cold blue office stock. Avoid
clichés: no slow-motion fist pumps, no whiteboards.

## 4 · ElevenLabs production notes

- **Voice:** warm, mid-register, unhurried — a "trusted editor" not an
  announcer. Test one neutral-American and one warm-British voice (the
  literary register may land better in British for this audience — let the
  test decide, don't assume). Generate both; pick by ear against the footage.
- **Settings starting point:** stability ~50, similarity ~75, style low
  (0–15%), speed 1.0. High style settings make ad-voice; we want reading-
  aloud voice.
- **Delivery:** paste the script with its line breaks — ElevenLabs breathes
  at punctuation. The em-dashes and ellipses in the scripts are deliberate
  pause marks. Generate each paragraph as its own clip if you want control
  over the gaps when assembling in InVideo.
- **Say the URL as written:** "authorslab dot A-I" — spoken "dot ai" reads as
  a word otherwise.
- One retake rule: if a take sounds like it's selling, regenerate. The brand
  voice is calm and concrete on video exactly as it is in print.

## 5 · InVideo prompt (paste-ready, for Script A)

> Create a 30-second 16:9 ad for AuthorsLab, an AI editorial platform for
> authors with finished novel manuscripts. Tone: warm, literary, calm —
> absolutely no hype, no upbeat corporate energy. Music: soft, minimal,
> piano or muted strings, low in the mix under the voice-over.
>
> Scene 1 (0–4s): a writer at a warm-lit desk types the final line of a
> novel; close on hands and screen; a held breath.
> Scene 2 (4–8s): the writer leans back and looks at the screen, uncertain.
> Scene 3 (8–12s): [SLOT: AuthorsLab brand card — I will upload]
> Scene 4 (12–20s): three quick warm cuts — a writer reading editorial
> margin notes and nodding, [SLOT: uploaded editor tiles — Alex, Sam,
> Jordan], a hand turning manuscript pages.
> Scene 5 (20–25s): the writer scrolling chapters on screen, engaged,
> quietly pleased.
> Scene 6 (25–30s): [SLOT: AuthorsLab CTA end card — I will upload], hold to
> end, music resolves.
>
> On-screen text: minimal — only "authorslab.ai" as a subtle lower-third in
> scenes 4–5. Subtitles: burn in, simple, high-contrast. Color grade: warm,
> ivory/cream tones, natural light. I will replace the voice-over with my
> own audio track.

Then: replace InVideo's TTS with the ElevenLabs track, drop the PNGs into
the three SLOT positions, and export.

Assets to upload into InVideo (all in `docs/sis/marketing/creatives/`):
`video-card-open.png`, `video-endcard-cta.png`, `tile-alex.png`,
`tile-sam.png`, `tile-jordan.png`.

## 6 · Variants and versioning

- Name exports like the still ads: `vid-a-the-end-30`, `vid-b-final-v3-30`,
  `vid-c-cutdown-15` → these are `utm_content` values when links exist.
- YouTube is 16:9; if a cut works, re-frame 9:16 for Reels/Shorts later —
  don't build vertical until horizontal earns it.
- Subtitles always burned in: feed placements autoplay muted.

## 7 · Claims check

| Claim | Status |
|---|---|
| "Ninety thousand words" | ✔ illustrative of a typical novel, not a product claim |
| Alex/Sam/Jordan roles (story / sentences / polish) | ✔ matches app journey |
| "AI editors" stated aloud | ✔ required honesty — do not cut this in edits |
| "Chapter by chapter" | ✔ matches product interaction model |
| "First assessment is free" | ✔ true — contingent on the form-bug fix before traffic |
| Pricing, turnaround, testimonials | ✘ absent by design — keep them out of edits |

## 8 · Where this fits the machine

This is a **creative-format experiment**, not yet a channel test — organic
first (our own YouTube/IG/FB once the new site is live), and it becomes a
paid YouTube test only as a deliberate later step with its own budget and
brief. Everything produced here (scripts, shot grammar, voice choice) becomes
tenant material for the social engine (AL-MKT-002 §3).

— Marketing station
