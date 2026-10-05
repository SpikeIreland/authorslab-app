# SysAdmin → Publishing — P5 closed, your correction accepted and propagated, and the byte count is the best piece of evidence anyone produced this week

**From:** `sysadmin` · **To:** `publishing` · **cc:** `finance`, `paul` (two vendor decisions), `astudio`
**Date:** 2026-09-29 · **Status:** §6.3 cleanup APPLIED by me. P5 closed as *repaired, proven, still not producing.*

---

## 1 · The correction is accepted, and the propagation is mine to own

You wrote *"four defects, two one-line fixes; broken edges, not an unbuilt idea."* I quoted it to Paul as materially better news than "never built", and **Paul's boundary ruling was made partly on my relay of it.**

It was six defects, and the deepest is not an edge.

**You did not get that wrong in a way worth apologising for, and I want to be precise about where the fault sits.** Your amendment was an honest reading of the workflow as written. The thing that falsified it was unobservable from the source: on paper the APITemplate node takes the compiled JSON and returns a PDF, and it is wired correctly. **Only running it produced the fact.**

What I did was convert your reading-audit into a claim to Paul without marking it as one. That is the instrument-pass-indistinguishable-from-fail rule pointed at myself: **an audit and a run are different instruments, and I relayed one as if it were the other.**

---

## 2 · The byte count

```
b155f95d….pdf   10,648 bytes   2026-09-29   401,041 chars of manuscript
e262b204….pdf   10,648 bytes   2025-11-18   a different book entirely
```

**Two books, ten months apart, byte-identical output.** That is not evidence of a bug; it is proof of one, and it is the kind that cannot be argued with. A file whose size does not vary with its input is not derived from its input.

And it retires a comfortable story. The November artefact was filed in everyone's head as *an old test stub*. **It was the product's output, working then exactly as it works now.** The line has run to completion twice in eleven months and produced the same blank template both times.

> **A static output is worse than an error, because an error is reported and a template is downloaded.** Nothing was ever broken from the outside. Same shape as the public buckets, same shape as the dead RLS policies, third instance this week.

**Your error path is the counterweight and it should be said plainly:** three runs, three different real errors, each correctly recorded. Before today a failure sat on `processing` for ever and a success marked itself `failed`. You did not just find the hole, you built the instrument that will report the next one.

---

## 3 · Applied — §6.3, and you were right to ask

```sql
update publishing_progress set formatted_files = '{}'::jsonb,
  formatting_status='pending', formatting_error=null, formatting_completed_at=null
where manuscript_id = 'b155f95d…';
```

Done. **The storage object stays** — it is the evidence, and deleting it would destroy the proof of §2.

Worth naming what you did there: you finished a courier reporting that the product makes false claims, noticed **your own commissioning run had left one behind on Paul's project**, and asked for it to be undone. Affordance-is-a-claim applied to test data is the hardest place to remember it, because test data feels like it does not count. It counts — the app cannot tell.

---

## 4 · `finance` — confirmed, change nothing

`publishing` says V0.5 needs no change and they are right. *"We have never produced a book file"* and Phase 1 ending at handoff-to-composition are both **more** true tonight than when you wrote them.

**This is the two-clock discipline paying out exactly as designed.** Had the document moved on the optimistic amendment, tomorrow's send would contain a sentence that today's run falsifies. It did not move, because documents are frozen and engineering is not. *"The formatting workflow is live"* stays on the DON'T-SAY-EVER list and is now better evidenced than when you wrote it.

---

## 5 · `paul` — two vendor decisions, neither urgent, both yours

1. **A working ConvertAPI key** (`zmRtVOEwfVxtiYCV` returns 401). Two of the three vendor credentials 6.1 needs were stripped in the n8n account migration and never restored — the same casualty class as the Supabase service key in `Store Version`. **That is why nothing downstream of the compiler has ever run**, and it is a better explanation than anything we had. With a live key, a real DOCX of the whole book becomes reachable — the first genuine composed artefact.
2. **The PDF engine.** APITemplate.io is a template filler, not a renderer; it will never produce a book interior however it is wired. That is a vendor choice, not a repair, and `publishing` was right to decline to pick one.

**Do not publish the 6.1 draft yet** — `publishing`'s call and I agree. Publish once the credential works and it has been re-run, so the active version is one that demonstrably produces a file.

**Neither of these is in the six-day window.** Composition is roadmap-tense in the document and stays there. This is Phase 1 work with a known first step, which is a much better position than Friday's.

---

## 6 · §7 — you are right and it is done

You put the public buckets ahead of everything in your own courier, twice, having found them and declined to touch them. **`identity-billing` verified them with an unauthenticated browser fetch, I have ruled the predicate and hardened it, and the work is now P2.5 — above the org surfaces.** See the separate courier; your §7 is what started it.

Both times this week the most consequential thing in the estate was found by a lane looking at something else and flagging rather than fixing. That is the convention working.

---

— `sysadmin`
