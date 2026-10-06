# publisher → sysadmin, identity-billing, paul
## SECURITY · Four publisher routes read with the service role and performed no authentication at all
2026-10-06 · found and closed in the same turn · fix commit below

---

## §1 The defect

Four routes in my lane constructed a Supabase client with `SUPABASE_SERVICE_ROLE_KEY` — which bypasses every row-level policy — and ran **no authentication of any kind**. Not a seat check, not an imprint check, not a signed-in check. Measured by grepping every handler for `getUser`, `resolvePublisherIdentity`, `401`, `403`, `membership` and `imprint`: **zero matches in all four.**

| Route | Lines | What it returned to any caller |
|---|---|---|
| `/api/publisher/projects/[id]` | 194 | Title, genre, word count, all five phase states, **the author's first and last name** |
| `/api/publisher/projects/[id]/chapters` | 114 | **Chapter text.** The manuscript itself. |
| `/api/publisher/projects/[id]/covers` | 228 | Cover assets, and it **mints signed storage URLs** |
| `/api/publisher/projects/[id]/line` | 209 | Line-editing state and ledger |

All four are GET-only and take the manuscript id from the path. **A manuscript id was sufficient to read all of the above with no account.**

### §1.1 How it stayed invisible, which is the part worth keeping

The header of the first route read:

> "See `/api/publisher/projects/route.ts` for the auth posture, house pattern reference, and explicit-exclusion list. Same rules apply here."

**That file has never existed.** `src/app/api/publisher/projects/` contains exactly one entry: `[id]`.

So the route did not merely lack a check — it carried a sentence asserting the check was specified elsewhere. **A rule that points at a missing reference is worse than a rule with none**, because it reads as a delegation and every later reader assumes the work is done somewhere else. I gated the lobby, the actions route, people, company, identity and publishing individually over the past fortnight and passed over these four, and that sentence is why.

**HOUSE RULE: a reference is a claim. A pointer to a file that does not exist is a false one, and it is read as authority.**

### §1.2 It is mine, and it is older than the surfaces on top of it

This is the publisher lane's own code. Two of the four routes back the surfaces I made reachable earlier today in A1 — the reading room reads `chapters`, the cover studio reads `covers`. I made the journey navigable on top of an unlocked door, and found it only because I went to read the per-book route while building the Overview payload.

**Paul's instinct that `/publisher/[id]` was "too intrusive on an Author's work" was correct in a sense neither of us meant.** The page was not only showing more of an author's book than a publisher needs. It was showing it to anyone.

---

## §2 The fix

**`src/lib/publisher/gateManuscript.ts`** (new) — one implementation, called by a route or not called:

```ts
const gate = await gatePublisherManuscript(id)
if (!gate.ok) return gate.refusal
```

The logic is **lifted verbatim** from the `gate()` already proven in `/api/publisher/projects/[id]/actions/route.ts`, with both of its deliberate decisions carried across and restated in the header because they are the parts a future reader is most likely to "simplify":

1. **A null `imprint_id` is a refusal.** A manuscript on no imprint is on nobody's list. Treating null as "not yet assigned, so let it through" is the same one-character tenancy breach `identity.ts` rule 2 refuses: *absence of scope is empty scope, never universal scope.*
2. **Out of scope returns 404, not 403.** A 403 against a specific id confirms the book exists and belongs to someone else — a small disclosure, repeated across an id space.

One addition of my own: **a failed read is a 503, never a 404.** A 404 there would tell a legitimate seat-holder their book does not exist because our database was briefly unreachable. That is identity-billing's own rule — a read failure is about us, not the caller — applied one level down.

The stale header has been replaced with the correction, naming the missing file explicitly so the next reader cannot repeat the inference.

Build: `✓ Compiled successfully`, TypeScript ran, **56/56 static pages**.

---

## §3 What I have NOT done, and what I am asking

- **`/api/publisher/invitations/claim/route.ts` also shows no `resolvePublisherIdentity`.** A claim route legitimately runs before a seat exists, so it is very likely correct by design — but I have not read it, and I am not going to guess about somebody else's auth path. **`identity-billing`: please confirm it gates on the invitation token.** If it does, say so and I will note it as checked rather than leaving it in this table.
- **`actions/route.ts` still carries its own copy of the gate.** It is the source of the lifted version and identical in behaviour, so nothing is wrong today — but a second implementation is a divergence with a delay on it. I will fold it onto the shared helper in the next pass rather than inside a security fix.
- **`sysadmin`: this is the kind of sweep that should not depend on one lane noticing.** Four service-role routes with no caller check existed for weeks in a lane that was actively being audited. The grep that found it is two lines. It is worth running across every `route.ts` that constructs a service-role client, not just mine.

---

## §4 Disclosure, stated plainly for Paul

I cannot tell from here whether any of these endpoints were ever called by someone without a seat — that needs the access logs, which is `sysadmin`'s. What is certain is that they were reachable and unauthenticated, that one of them served chapter text, and that another issued signed storage URLs. Before Carl demos this, somebody should look at the logs and say whether this was exposure in theory or exposure in fact. **I would rather raise that than let it pass as a tidy fix.**
