# Demo & Content Ops — chat seed brief

**AL-PDC-DCO-SEED-001 · 2026-07-30**
**From:** Platform Developer station
**To:** Demo & Content Ops chat (new)

This seeds a new Cowork chat focused on the operational work around AuthorsLab: seeding demo accounts, preparing the Jacky Klein demo, coordinating legal content from Clarence Legal, and generally handling the "readiness" work that isn't code but has to happen.

## 1 · Immediate mission: September demo with Jacky Klein

Jacky Klein is Executive Publisher of a new Jewish imprint backed by Neil Blair of The Blair Partnership. AuthorsLab is demoing to Jacky in September 2026 with the ambition of the imprint becoming a launch partner or reference customer. This is the driving deadline for essentially all work happening right now across every station.

Framing for the demo: AuthorsLab respects the vulnerability of writing (author's sacred space with Riley as their companion) while opening a collaborative surface where publishers add real value (Design/Publishing/Marketing tabs invitable to a named publisher). This is a distinctive positioning — most tools either grant full access or none. The demo needs to show all three: the sacred author experience, the invitation flow, and the publisher's global view of their authors.

## 2 · Carl's demo accounts

Carl Lyons is co-founder and a professional working author. He has two AuthorsLab accounts serving different purposes:

- **Yahoo account (`carl@... @yahoo.com` — get exact address from Paul)** — Carl's *personal working space*. This is his real writing life. Anything in here is not to be modified for demo purposes. Sacred.
- **Spike Island account (`carl@spikeisland.tv`)** — Carl's *demo account*. Used for showing the platform to Jacky and other prospects. Everything here is mutable for demo purposes.

**Both accounts should carry Carl's two most-advanced manuscripts:**

- **The Veil and the Flame**
- **The Signal and the Shadow**

Ops task: get the manuscript files from Carl, upload both into both accounts, get each into a demo-appropriate state on the Spike Island side (probably: one book mid-editing to show Author Studio + Alex/Sam/Jordan; the other book ready for publisher-collaboration to show Design/Publishing/Marketing + the invite flow to a mock publisher account).

## 3 · Demo flow to prepare (working sketch — refine as needed)

Suggested storyline for a Jacky demo:

1. **Open on the Library** (Spike Island account, logged in as Carl). Serif greeting, two books on the shelf. Sacred space established visually.
2. **Click into one book** (say, The Veil and the Flame). Land on Overview. Show the editor greeting card, the journey stepper. Point out the persona quintet at work (Alex active, Sam next).
3. **Step into Author Studio.** Show a real chat exchange with Alex on a real chapter. Show issue resolution.
4. **Meet Riley.** From anywhere, click the Riley icon in the header (once built). Show a companion moment — Riley referencing recent work, offering perspective.
5. **Switch to the other book** (The Signal and the Shadow) — this one is at the publishing stage. Show the Design tab, the cover options Taylor has drafted.
6. **The invite moment.** From Design, invite a publisher (mock account controlled by Paul or Carl). Show the invite email, then log in as the publisher.
7. **Publisher's global view.** The publisher dashboard: this author (Carl), this book, at publishing stage, needs cover approval. Show the publisher commenting on a cover. Author sees the comment attributed to the publisher, not to Taylor. Sacred boundary intact — publisher never sees Author Studio.
8. **Close on the vision.** Frame what's not yet built: the imprint's fully-branded surface, the audience-fit tooling, the launch analytics.

This is Ghostwriter chat + Taylor Design & Publishing chat + Platform Dev chat working in coordination. This chat (Demo & Content Ops) is the coordinator making sure the pieces line up by September.

## 4 · Clarence Legal handoff

AuthorsLab public pages currently lack privacy policy, terms of service, cookie policy, and probably subprocessor list + DPA template. Paul has access to Clarence Legal (a separate legal-drafting product) and wants to use it to draft these.

The handoff document to Clarence Legal is a separate deliverable — see `docs/sis/platform-dev/2026-07-30-clarence-legal-brief.md`. This chat should:

- Own the coordination with Paul on when Clarence receives the brief
- Absorb what Clarence returns
- Hand the finished legal copy back to Platform Dev (or the UI/UX Design chat, whichever is doing the public-page copy update)
- Track anything else legal-adjacent that the demo or the platform needs

Standing note: Paul mentioned this legal-service access as a general capability we should remember for future engagements (dataroom prep, investor materials, etc.). Worth logging in this chat's future backlog.

## 5 · What is not this chat's job

- **Code changes** — Platform Dev.
- **Visual design** — UI/UX Design.
- **Taylor / Design / Publishing feature work** — Taylor Design & Publishing chat.
- **Ghostwriter / Riley feature work** — Ghostwriter Station chat.

This chat is the operational glue: making sure the right thing exists in the right account by the right date, and that external deliverables (Clarence legal, cover art, marketing collateral for the Jacky meeting) land on time.

## 6 · Standing SIS bounds

Same as every station: any new design decision that steps into stochastic (LLM-generative) territory needs deterministic guardrails articulated around it. In this chat's scope, the biggest stochastic surface is the *content* Clarence generates — treat those drafts as first drafts, always review, never ship without human sign-off.

## 7 · What to ask Paul next

- Exact email addresses for Carl's Yahoo and Spike Island accounts
- Whether he has manuscript files for both books ready to upload, or needs Carl to send them
- Preferred date for the Clarence Legal handoff (so we can queue it)
- Any other prospects beyond Jacky the demo should target
- Whether the mock publisher account should be an actual person Paul controls, or purely synthetic

## 8 · Reference documents

- `docs/sis/platform-dev/2026-07-30-ghostwriter-station-update.md` — sacred/shared architecture, Riley/Kai rename
- `docs/sis/platform-dev/2026-07-30-taylor-design-publishing-chat-seed.md` — the publisher-collaboration model in detail
- `docs/sis/platform-dev/2026-07-30-clarence-legal-brief.md` — what to send to Clarence Legal
- Prior AL-UX-004/006/007 completion docs — for context on what the demo will show

— Platform Developer station
