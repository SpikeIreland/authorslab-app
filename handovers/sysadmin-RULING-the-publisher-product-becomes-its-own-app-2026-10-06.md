# SysAdmin RULING → every lane — The publisher product becomes its own application. The founding ruling was unbuildable as written, and that is mine.

**From:** `sysadmin` · **Date:** 2026-10-06 · **Decided by:** Paul
**Status:** architectural. Supersedes the shape of everything built this week, not its content.

---

## 1 · The event that proved it

Paul signed in through the **author** sign-in link and landed on the **publisher** home page.

Not a bug. `/login` calls `/api/auth/destination`, which checks for a publisher seat — and he was given one this morning. **The author product sent him to the publisher product because one person holds both roles.**

One Next.js app. One auth system. One user table. **One front door**, with a routing rule guessing which product you meant.

---

## 2 · What that means about the ruling I wrote

On 2 October I ruled: *two products, one brand, nothing shared above the waterline* — and then set eleven lanes to honour it **inside a codebase that joins them at the root.**

Paul's reading of the week was that *"none of the chats seem capable of splitting them out."* That is not what happened.

> **The lanes were asked to separate two products that share an entry point. No amount of care achieves that. The instruction was incoherent and I issued it.**

`publisher` pushing back was the correct response. Every "pollution" finding this week — the destination redirect, the Editing Studio naming collision, the author-shaped third-person tracks, the public page that had to be told not to mention the other product — is one defect wearing different clothes.

**Acknowledgement is not adoption.** I recorded that rule yesterday about method. It applies harder to architecture: a ruling the codebase cannot express is a wish.

---

## 3 · RULED

> **The publisher product becomes its own Next.js application, on its own domain, with its own login.**
> **Shared: one Supabase database, one n8n engine, one schema. Nothing else.**

**What moves:** the publisher shell, `/publisher/*`, the publisher API routes, the public `/publishers` page.

**What does not move, because it is already correct:** the schema, the RLS policies, `can_read_manuscript`, the org/imprint model, the Craft Call Cell, the editorial workflows. **These are the only things that have been right all week and they are right because they were never asked to know which product was calling.** That is the proof the split is at the correct seam.

**What this resolves at a stroke:**

| Problem | Resolution |
|---|---|
| Sign-in sends you to the wrong product | Two apps, two logins, no destination guessing |
| W2 — the dedicated domain | Answered as a consequence, not a decision |
| `/publishers` vs `/publisher`, one letter apart | Different hosts; the collision disappears |
| Editing Studio vs Author Studio naming | Different apps; the name can just be "the studio" in each |
| Publisher surfaces built by culling author ones | No author surfaces to cull |

---

## 4 · Before the split — today, and it survives the move

**The publisher shell shows Books, People, House Style, Chat. Most of them are empty.** That is what "nothing works" feels like from inside: not one broken thing, twelve unfinished ones.

**Hide everything except Books.** Books → a title → the editorial report. One path, nothing else rendered.

Same quantity of working software. It stops presenting as a broken platform and starts presenting as a finished small one. We did exactly this for the author product in September and it is the cheapest honest improvement available.

`publisher` + `ux`, today, in the current app. It moves with everything else.

---

## 5 · Owners

- **`sysadmin`** — scaffold the new app, deployment, domain, shared Supabase client, the migration order.
- **`publisher`** — the surfaces move with you. **You are not rebuilding them.**
- **`ux`** — one shell, one door, no shared chrome with the author product. §4 first.
- **`identity-billing`** — separate auth entry. One user table still; two front doors. The `has_full_access` rename folds in here.
- **`marketing`** — W1 still stands and the page moves to the new domain. **Do not rebuild it twice** — write it once, for the new home.
- **Everyone else** — nothing changes. The engine does not move.

**C, D and E stay frozen.** This is not a reason to restart them; it is the reason they were frozen.

---

## 6 · On new chats

Paul considered replacing the lanes. **My view, and `publisher` was right to push back:** a new chat reads the same repository, meets the same single front door, and hits the same wall tomorrow. The context was never the bottleneck. **Keep the chats.**

---

## 7 · The cost, stated plainly

A few days, and the publisher surfaces move rather than being rewritten. Against that: every structural problem of this week stops recurring, instead of being fought surface by surface forever.

**This is a decision taken four days late.** The evidence for it existed on 2 October, in the ruling itself, and I spent four days enforcing a separation the architecture would not hold rather than asking whether it could.

— `sysadmin`
