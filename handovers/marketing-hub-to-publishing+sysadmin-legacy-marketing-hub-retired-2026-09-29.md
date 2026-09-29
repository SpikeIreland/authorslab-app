# Marketing Hub → Publishing + SysAdmin — Legacy `/marketing-hub` retired to a redirect

**From:** `marketing-hub` · **To:** `publishing`, `sysadmin` · **Cc:** `paul` · **Date:** 2026-09-29
**State read at:** 2026-09-29, this turn

## 1 · What changed

`/marketing-hub` — the March 2026 standalone hub — is now a **redirect**, not a page. Commit `85cccd7`, 672 lines removed.

- `?manuscriptId=X` → `/projects/X/marketing`
- no manuscript → `/lobby`

Paul's prompt: *"this page should have been long-retired in favour of the new design."* He is right, and the reason to keep it had gone.

**Redirect rather than delete, deliberately.** Deleting the route would 404 every inbound link and every bookmark an author made. A redirect retires the UI — which is the thing that was wrong — while leaving every path working.

## 2 · `publishing` — your link still works, and this is not an ask

`publishing-hub/page.tsx:455` is now **the only live link to this route in the tracked estate**:

```
href={`/marketing-hub?manuscriptId=${manuscriptId}`}
```

It keeps working and lands the author in the right place. **I did not edit it** — House Rules route by roster, not file proximity, and that is your file. Retarget it to `/projects/${manuscriptId}/marketing` whenever it is convenient; there is no deadline and nothing is broken until you do. When nothing points at `/marketing-hub`, the directory can go.

The other four inbound links have already gone on their own: `astudio` rerouted `author-studio`, `phase-complete` already points at the project shell, and `/marketing-hub-demo` is itself retired. That is why this became cheap — **the retirement I flagged as blocked on five links unblocked itself while other lanes did their own work**, and nobody had to coordinate it.

## 3 · Why it was worth removing rather than leaving

It performed **zero writes** — no insert, update, upsert or API call anywhere in the file — while offering a Riley chat input, an assessment CTA and three prompt buttons. I made those honest this morning under the affordance rule. That was the right call for the day, but it left 26KB of UI whose only remaining job was to look like a page that does something.

Two surfaces claiming to be the marketing hub is also its own defect: an author who found the old one had no way to know the real one existed. One route, one answer.

## 4 · One note for the record

This page was the source of three of the five silent-failure defects I have reported this fortnight — the `author_profiles.user_id` column that does not exist, the `marketing_progress` table that does not exist, and sixteen stale `Quinn` strings. All three are now moot rather than fixed, which is the cheaper kind of resolution.

**The generalisable bit:** a surface nobody owns accumulates defects at the rate the schema moves, and none of them surface as errors because nobody is looking. Its age was the risk, not its code.

— `marketing-hub`
