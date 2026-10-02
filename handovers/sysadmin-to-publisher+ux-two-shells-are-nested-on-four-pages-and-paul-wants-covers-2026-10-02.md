# SysAdmin → publisher + ux — Two shells are nested on four pages. And Paul wants covers on the Books list.

**From:** `sysadmin` · **Date:** 2026-10-02 · **Found by:** Paul, by opening it

---

## 1 · The defect, diagnosed

`/publisher` renders **two headers and two left rails**. Paul's screenshot shows "AuthorsLab Publisher" twice, the publisher's 64px panel, and a second floating column with a green **A** tile and a **Portal** tile.

**Cause.** `src/app/publisher/layout.tsx` wraps the whole tree in `PublisherShell`. Four pages *also* wrap their own content in `AppShell` — the **author** chrome, which brings `Header` and the author `LeftRail` (Home · Projects · Portal · Profile) with it.

```
PublisherShell  (layout — correct)
└── AppShell    (page — now redundant)
    └── content
```

| File | Line |
|---|---|
| `src/app/publisher/page.tsx` | 48 import · 430 open · 756 close |
| `src/app/publisher/dashboard/page.tsx` | 40 · 182 · 424 |
| `src/app/publisher/people/page.tsx` | 44 · 214 · 349 |
| `src/app/publisher/company/page.tsx` | 37 · 265 · 363 |

**Nobody did anything wrong.** `publisher` built those pages when no layout shell existed, and `AppShell` was the correct choice then — `page.tsx`'s own comment says *"Same shell as the author's Library, one visual grammar"*, which was right. `ux` then added the shell underneath, per §6 of the demo-build ruling, which was also right. **This is the seam, not a mistake by either lane**, and it is the predictable cost of two lanes shipping into the same surface in one day. Worth naming because it will recur as the other stations mount.

## 2 · The fix — `publisher`'s, four files

Remove the `AppShell` wrapper and its import from each of the four. Keep the children. The layout already supplies header, rail and content area.

**One thing to watch, and the reason I am not doing this myself.** Those pages contain tuned inner heights — `page.tsx` has `h-[calc(100vh-100px)]`, sized against `AppShell`'s header. `PublisherShell`'s header is `h-14` (56px). **The arithmetic will be wrong after the wrapper goes**, and I cannot render the result to check it. You can. I would rather hand you a correct diagnosis than a structural edit I cannot verify — that is the same rule I have been applying to everyone else all week.

## 3 · Paul's preference — covers on the Books list

> *"my preference is for the page to display the books in the same way as it does in the Author's view where the book cover design is visible where the design has been completed."*

The Books list currently renders text rows. The author Library renders cover cards. Paul wants the publisher list to match **where a cover exists**.

This is squarely the demo-build ruling's logic — replicate the author grammar, cull what does not apply — and it is a real improvement, not decoration: a publisher scanning forty titles recognises a cover faster than a line of text.

**Two constraints.** A title with no cover must not render a fake one — an empty cover slot is honest, a placeholder that looks like artwork is not. And the station marks and the SAMPLE chip must survive the change; they are the part of that list that carries claims.

`publisher` owns the list, `ux` owns the card grammar. Agree the split between you rather than routing it through me.

## 4 · A question for whoever builds Oliver's account

The seeded samples currently sit under **Harrowgate House**, imprints **Longshore Books** and **Meridian Editions**. Oliver's organisation will be **High Line Publishing**, imprints **Odessa** and **Antidote**.

If the samples stay in a different organisation, **Oliver will not see any of them** — the entitlement gate is per-org, which is `design`'s dependency from a different angle. If they move into High Line, they are fabricated titles inside a real customer's house, carried only by the SAMPLE chip and the R9 marker.

I lean towards: **samples inside his org and imprints, every one marked**, because the marker is doing exactly the job it was ruled for, and a list he cannot see demonstrates nothing. But it is worth one deliberate decision rather than a default, and `identity-billing` should hear it before they seed.

— `sysadmin`
