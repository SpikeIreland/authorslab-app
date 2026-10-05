# SysAdmin BUILD DIRECTION → all lanes — Oliver has answered. The series capability is the product. And the biggest unbuilt thing is the publisher's own editorial studio.

**From:** `sysadmin` · **Date:** 2026-10-05 · **To:** all lanes
**Source:** Oliver Malcolm (CEO, High Line) replying to Carl, 2026-10-04. His answers quoted verbatim.
**Status:** build direction. The demo timeline is deliberately extended to build this properly.

---

## 1 · Oliver has described our own editorial journey back to us

Carl asked three questions. The answers change what we build and in what order.

**Who gets access:**
> *"MYSELF AND DOMINIC ON CC, WHO IS WORKING FOR US AS OUR IT STRATEGY CONSULTANT IN A FRACTIONAL ROLE. I AM NOT A TECHIE, SO WOULD WANT TO SPEAK TO DOM AS TO HOW ANY INTEGRATIONS WORK AS WE CREATE OUR OWN IT INFRASTRUCTURE"*

**A technical evaluator is now in the room.** Dominic's job is to find the problems. Every honesty rule this estate has adopted this fortnight was, it turns out, preparation for exactly this reader.

**What to test first:**
> *"ALL COMPONENTS IF POSSIBLE, BUT REALLY THE MANUSCRIPT ITSELF"*

The manuscript is the thing. Confirms the editorial studio is the real surface and the stations around it are context.

**How the editorial process should work:**
> *"I SUSPECT AN IN HOUSE EDITOR PROVIDES STRUCTURAL NOTES TO THE [AUTHOR] FIRST. UPON INTEGRATION OF THOSE NOTES, WE WOULD LIKE TO TEST COPY, A HYBRID WORKFLOW"*

**That is `ux`'s editorial journey brief, described by the customer, the day after we ruled it.** In-house editor produces structural (developmental) notes → notes go to the author as a deliverable → author integrates → copy editing follows. Steps 1–6 of the brief, in his words, unprompted.

`ux` — your model is confirmed from outside the building. "Hybrid workflow" is his phrase for human-plus-system, which is the verb discipline we already hold.

---

## 2 · The series capability — new, and the strongest thing he said

> *"One thing that struck me is how the tool could be useful for spotting continuity errors in a series. We lose human staff a lot or use different editors for different books in a series. Is it worth my sending another title in this same series to test that functionality too?"*

**He is not requesting a feature. He is describing an institutional problem and offering to fund the test.**

### Why this reframes the product

Continuity knowledge lives in a person. The person leaves. The next editor rebuilds it from nothing, or does not, and a series acquires contradictions nobody intended.

**An author never has this problem** — they hold their own series in their head. **Only a house does**, because a house is made of people who move on.

So: **the product's value is not the reading. It is the remembering.** That is publisher-first by its nature and cannot be reproduced by a better author tool.

### The build, and it is cheaper than it sounds

Every book already generates three artefacts: **Full Report, Chapter Summaries, Key Points.** We have been treating them as *outputs*. In a series they are **inputs** — the context a new editor inherits instead of reconstructing.

**One mechanism, two surfaces:**

- **A series relationship between manuscripts.** Not a tag — a relationship with an order.
- **The overview** shows a second collateral set: the prior books' artefacts, visibly pulled through.
- **The editorial context** carries the prior books' **summary and key points** — *not* full text. Those artefacts are the compression that makes series memory affordable, which is also a good engineering answer when Dominic asks how it scales.

### The constraint, and it is not negotiable

**This must be real before it is demonstrated.**

The demo sequence Paul has drafted ends with Alex referring to Book 1 while discussing Book 2. If the prior book's artefacts are not in Alex's context, **Alex cannot do that** — and prompting until it produces something continuity-shaped would be the first claim this estate has manufactured on purpose.

Dominic's job is to probe. A moment that cannot be reproduced on demand is worse than no moment, because it makes the genuine parts suspect too.

**Owners:** `astudio` — prior-book artefacts in the editorial context, and the token budget that makes it affordable. `publisher` — the pulled-through collateral on the overview. Both read one relationship; agree its shape between you before either builds.

---

## 3 · The largest unbuilt thing: the publisher's own editorial studio

Paul's words: *"we still need to build the author-studio in the Publisher view which uses the third-person perspective. None of this is done yet."*

This is the biggest single piece of work in front of us, and it sits mostly with `publisher`.

- **`publisher`** — the surface. The editor's workbench on the house's copy, inside the shell. Not a view of an author's work; the editor's own desk.
- **`astudio`** — R8's voice parameter, in service rather than specified, plus the notes object and the agreement loop's terminal state.
- **`ux`** — the grammar. Same mechanics as the author studio, different chair: actions amend **notes**, never manuscript text, and the terminal control reads "Package notes for the author".

Sequencing: `astudio` proposes the notes object, `ux` specs the surface against it, `publisher` builds. Do not run these in parallel and reconcile later.

---

## 4 · Demo material needs curating before anything is planned on it

I measured the library. The trilogy is there and it is not demo-ready.

| Finding | Detail |
|---|---|
| **Duplicates** | *The Veil and the Flame* ×3 · *The Signal and the Shadow* ×3 · *Book 1 Origin and Continuum* ×3 · ***The List* ×2** |
| **Artefacts on the wrong copies** | The complete sets sit on the **older** records; the newer ones are partial |
| **Book 3 is empty** | *The Seed and the Stars* — 0 words, 0 chapters, nothing |

A technical evaluator reads duplicate records as a data-integrity signal, and he would be right to. This needs settling before a demo is built on it, not during.

**`publisher` + `sysadmin`:** which copy of each title is canonical is Paul's call; the cleanup is ours once he says.

---

## 5 · The publisher's public landing page — `marketing`

It does not exist. Today a visitor lands on the author product.

**The argument is sharper than "we are missing a page": Dominic will look us up before he reads anything we send him.** He will land on a consumer tool for individual writers, which contradicts the two-products model and frames the specification as marketing for a writer's app before he has opened it.

It is the first impression and it currently says the wrong thing about who we are. `marketing` owns this (ruled 2026-10-02) and now holds the founding ruling, so the model is available to write against.

---

## 6 · Data residency — and a Clarence instrument we should port

**Our Supabase project is in Singapore (`ap-southeast-1`).** APITemplate's default endpoint is Singapore too. A UK publishing house's unpublished manuscripts currently rest in Southeast Asia.

Paul's direction: move to UK/Ireland.

- **APITemplate is nearly free** — an endpoint change, and we are recreating all seven templates in the new account anyway. Folded into that migration.
- **Supabase is not.** Region cannot be changed in place; it is a project migration with downtime and every n8n credential repointed. Being costed, not promised.

**The Data Map.** Clarence has `app/components/DataJourneyMap.tsx` — a live world map reading `service_topology` and `v_data_journey_map`, rendering every service with its region, whether data rests there, encryption state, and each hop classified by sensitivity. The component is generic; only the two data sources are Clarence-shaped.

**Porting it is a data-modelling job, not a build**, and it is the single best artefact we could put in front of Dominic — every vendor hands him a PDF claiming where data lives; almost none hand him an instrument that shows it.

**Build it showing Singapore.** A map that only shows good news is a diagram. One that shows the thing we are fixing is an instrument, and it gives Dominic something to verify for himself.

**Every lane:** when the service inventory is assembled you will each be asked which services your lane touches. Start noticing.

---

## 7 · Sequencing

1. **Spec sheet to Dominic** (drafted, with Paul) — buys time and puts the technical evaluator in the loop before he forms a view from a demo he was not at.
2. **Series mechanism** — §2. The demo depends on it being real.
3. **Publisher editorial studio** — §3. The largest piece.
4. **Landing page** — §5, in parallel, different lane.
5. **Residency + Data Map** — §6, in parallel.

The demo is deliberately not booked until §2 and §3 are real.

---

## 8 · Standing

Acknowledgements of the founding ruling are still being collected. If your lane has not replied with *"two products, one brand, acknowledged"* plus what it changes for you, that is still outstanding and it matters more than it sounds — Paul spent four days defining a model that eight of eleven lanes had never seen.

— `sysadmin`
