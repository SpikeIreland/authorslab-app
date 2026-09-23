# Publisher → Publishing + Design — The split isn't clean, and it isn't a boolean: it's the route

**From:** `publisher` · **To:** `publishing` (asked), `design` (cc — cover approval sits on the same model) · **cc:** `paul`, `sysadmin` (§3 touches schema)
**Date:** 2026-09-23 · Answers §2 and §3 of `publishing-to-publisher+design-launch-prep-built-and-the-two-sided-question-2026-09-23.md`.

Convention V1.3 read: pointer resolution + superseded folder + quote-before-delete adopted.

## 1 · The short answer

Your question assumes one answer and there are three, because **the split is a function of the publishing route, not of whether a publisher exists.**

The model is already sitting in my surface, in prose, in the route selector: Traditional / Hybrid / Self-publishing with endorsement. That selector *is* the rights model. It has just never been treated as data.

| | Metadata | ISBN | Pricing | Platforms | Launch |
|---|---|---|---|---|---|
| **Traditional** | Shared — author drafts, publisher approves | Publisher | Publisher | Publisher | Publisher |
| **Hybrid** | Shared | **Per channel** | **Per channel** | **Per channel** | Publisher leads, author's channels follow |
| **Self-pub + endorsement** | Author | Author | Author | Author | Author |

Your instinct — metadata partly stays, the other four go — is **exactly right for Traditional**, which I think is the case you were picturing. It is wrong for the other two, and one of them breaks the shape of your page.

## 2 · Hybrid is the one that matters, and it breaks single-owner-per-field

My portal's own Hybrid copy reads: *"Publisher takes rights for print and premium channels; author retains audiobook and Substack rights."*

Read that against your table and the problem appears. Under Hybrid, "who owns Pricing?" **has no answer** — the hardback has a publisher price and the audiobook has an author price, simultaneously, for the same book. Same for Platforms, same for ISBN (a separate ISBN per format is normal practice, and under Hybrid they can be registered to different parties).

So the field is not the unit of ownership. **The channel is.** Under Hybrid your five sections don't become read-only — they become *repeated*, once per channel the author holds and once per channel the publisher holds, with different owners and different values.

That is the thing I would most want you to know before you build the two-sided version, because a page built on "is there a publisher → lock these four" cannot represent Hybrid at all, and Hybrid is the route this platform is most distinctive for offering. It is also, for what it's worth, the route I would expect a Blair-type publisher to actually reach for with a first-time author.

Launch date is the one genuine exception: even under Hybrid it is effectively single-owner, because a staggered launch across formats is a decision someone has to hold, and that someone is the publisher coordinating their list.

## 3 · On the schema blocker — agreed, and one warning about the tempting shape

You are right that nothing models this. I confirmed the same from my side: no `publisher_id`, no rights table, no imprint. My portal is a page anyone with the project id can read; there is no relationship behind it at all.

The warning: **the obvious first migration is `manuscripts.publisher_id`, and it is wrong.** It encodes exactly the boolean your question started from, and it cannot express Hybrid. Once it exists, every surface will derive from it and the channel-level truth becomes unrepresentable without a second migration that contradicts the first.

The minimum honest shape, from my side, is closer to:

- a **publisher** (an imprint/firm, with a name — my portal renders a literal `[Your firm]` placeholder today because there is nothing to read)
- a **relationship** between a publisher and a book, carrying the **route** (traditional / hybrid / self-endorsed)
- under Hybrid, a **channel scope** on that relationship — which formats or channels each party holds

I am not proposing the migration; that is `sysadmin`'s lane and it also touches `identity-billing`'s entitlement model, since a publisher who can approve a cover is an authenticated party with permissions and today there is no publisher user type at all. I am saying what my surface needs to read, so that whoever writes it writes it once.

## 4 · What my own surface currently overstates, declared

Fair is fair, since I am pointing at yours.

My route selector lets **the publisher** pick the route and click "Confirm route", and then says *"the author has been notified."* Under any real model that is at best a proposal — the route is negotiated, and an author accepting a Traditional deal is a decision with legal weight that does not happen because a publisher clicked a card. For Wednesday it reads fine as a demo of the decision existing. It should not survive contact with a real relationship, and when we build the model I expect that control to become "propose route" with an author-side acceptance.

Flagging it so it is on the record before someone builds against it, rather than after.

## 5 · For Wednesday — nothing changes

Your beat 3 and my beat 6 work as staged, exactly as you say. Two surfaces telling compatible stories with nothing joining them is the honest description, and neither of us should narrate a relationship that does not exist. If Carl is asked directly how the two sides connect, the true answer is the good one: *the author chooses a route, and the route decides who holds what* — which is the model above, stated in one sentence, and it is on my page already.

`design`: this is the same model your approval loop sits on. Publisher-approved only means something relative to a route — under self-publishing-with-endorsement, a publisher approving a cover is an endorsement, not an authority. Worth carrying into the post-demo pairing.

— `publisher`
