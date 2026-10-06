# publisher → identity-billing, sysadmin, marketing, paul
## The CTA form record — owner RULED; and a conflict between the published privacy policy and the publisher product
2026-10-06

---

## §1 The ruling (Paul, this chat)

**The CTA form record goes to identity-billing.** Paul's call, and it is the right lane for a reason worth writing down: an inbound publisher enquiry is the **pre-history of an organisation**. A house that writes to us is a house that, if it converts, becomes an `organisations` row with an imprint and a seat. Putting the enquiry anywhere else invents a second tenancy concept that then has to be reconciled with the first.

I&B owns the record. **I&B does not own the other two parts, and a form needs all three:**

| What | Owner |
|---|---|
| Where the submission rests (table, policies, link to the org it may become) | **identity-billing** |
| The route + delivery (`/api/...`, env, `publishers@` deliverability) | **sysadmin** |
| Who replies, and inside what promise | **a named human — Paul's call** |

---

## §2 What exists today (measured, 2026-10-06)

- `/publishers` has two CTAs. The hero is `href="#contact"` → resolves to `<section id="contact">` at line 308. **Not a dead control.**
- Both terminal CTAs are `mailto:publishers@authorslab.ai`. The visitor's own mail client. **Nothing is recorded by us.**
- `src/app/api/` holds: `admin, auth, create-checkout, home, lobby, manuscripts, projects, publisher, subscription, webhooks, whoami`. **No contact / lead / enquiry / demo route exists.**
- The only enquiry-shaped tables in the database are `beta_feedback` and `phase_feedback`. **There is no table for an inbound publisher enquiry.**
- `publishers@` is a verified mailbox — delivery was observed, commit `373cc06`. **The destination is real.**

So the page is not currently lying. A `mailto:` records nothing and promises nothing.

### §2.1 Except that the copy already makes the promise a form would make

`/publishers` line 312–318, live on the tree:

> "Write to us — a person answers, same working day"

**That is a claim made before anyone can check it.** It is the §1 row-three ownership, committed in prose, with no named owner behind it. The form question is therefore not "should we add a form" — the commitment is already on the page. Either someone owns the same-working-day reply or the sentence comes off.

### §2.2 And the policy does not yet cover the record

`docs/Legal/drafts/privacy-policy.md` §2 covers data collected when you "communicate with us by email or through the platform" — so the channel is in scope. But **§3 enumerates what we collect and never names an enquiry record.** If the submission becomes a row, §3 needs a line. Tractable; naming it so it is not discovered later.

**If nobody will own all three rows, the `mailto:` is the better answer** — it is plainer, but it makes no promise we cannot keep.

---

## §3 The larger finding — §5.2 of the privacy policy describes a different publisher product

I hit this checking §2.2. It is not the question I was asked and it outranks it.

`docs/Legal/drafts/privacy-policy.md` §5.2, **published**, headed *"Publisher access — explicit and author-controlled only"*:

> "a planned feature that allows you to **invite** a named publisher into specific surfaces of a book project — cover design, formatting, and marketing planning. This is entirely your choice. **You initiate it. You control it. You can revoke it.**"
>
> "**No editorial feedback from Alex, Sam, or Jordan.**"
>
> "your Library, Author Studio, and all conversations with Riley — is **never** accessible to any third party. Period."
>
> "they see **only the surfaces you've opened, only for the book you've specified.**"

The publisher product on the tree is a different shape on four counts:

| §5.2 says | The product does |
|---|---|
| The **author** initiates the invite | The **seat** is granted on the imprint. The author is not asked. |
| **One book**, the one you specified | The lobby lists **every title on the imprint** |
| The author can **revoke** | There is **no author-side revoke** anywhere in the model |
| Cover, formatting, marketing planning — **no editorial feedback** | The lobby reports **developmental / line / copy-editing** station state, and the **notes package exits to the house** |

Two mitigations, stated honestly:
1. §5.2 says **"planned feature"** — so it is not a false statement about today's platform. It is a published commitment about the *shape* of a thing we are building differently.
2. Station **state** is arguably not "editorial feedback" — state is not content, and R5 holds that a surface reports state, not intent. **The notes package is not covered by that distinction.** It is feedback, and exiting it to the house is the point of it.

The empirical backstop, measured earlier in my lane: of the 9 authors on the publisher list, **9 have accounts and 0 have ever signed in.** Not one of them could have initiated an invite. The author-initiated model in §5.2 has never been exercised and the product does not have a path for it.

### §3.1 Why this matters beyond the policy

Paul's own instinct — that `/publisher/[id]` is *"too intrusive on an Author's work"* — is reading a boundary that **is already written down, published, and promised in the first person.** That is not vagueness. The pushback he reported across the chats was pushback against a model the privacy policy does not permit.

**This is a founding-ruling question, not a drafting one.** Either §5.2 is rewritten to describe seat-based imprint access honestly, or the publisher product acquires the author-side consent and revoke that §5.2 promises. One of the two has to move, and **it has to move before Carl demos it**, because the demo walks a publisher into an author's book while the published policy says that cannot happen without the author's invitation.

I am not proposing which way. Reporting it, with the four counts measured.

---

## §4 Asks

- **identity-billing** — you own the enquiry record. Nothing to build until §1 row three has a human. Also: §3's four counts land on your seat model; say whether the consent/revoke leg is yours if it is ruled in.
- **sysadmin** — the route and delivery when the record is ruled in. And §3 is your kind of finding: a published document and a built system disagreeing.
- **marketing** — §2.1 is yours: "a person answers, same working day" is live copy with no owner. §3 touches the policy drafts.
- **paul** — two decisions. (a) Who answers the mailbox, inside what promise. (b) §3: does §5.2 get rewritten, or does the product get consent and revoke?

---

## §5 House rule earned

**A published policy is a claim, and the oldest claim wins until someone changes it.** We measured the product against the courier and against the database. We had not measured it against our own published promises. `docs/Legal/drafts/` is part of the estate.
