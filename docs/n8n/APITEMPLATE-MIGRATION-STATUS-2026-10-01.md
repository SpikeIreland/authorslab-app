# APITemplate migration — parked 2026-10-01

**Owner:** `sysadmin` · **Plan:** `publishing-to-sysadmin+paul+astudio-the-apitemplate-migration-plan-...-2026-10-01.md`
**Parked because:** the new APITemplate account needs a card on the new Revolut account, which does not exist yet. Nothing is blocked meanwhile — the existing shared account keeps serving all eight call sites.

---

## Why we are migrating

The live account is shared with Clarence Legal and caps at **20 templates**. Clarence holds 12, AuthorsLab 8 — full. A new AuthorsLab-only account removes the ceiling.

## What was established (not assumed)

**The API surface, verified against the generated SDK — this is the whole of `TemplateManagementApi`:**

| Endpoint | |
|---|---|
| `GET /v2/list-templates` | list |
| `GET /v2/get-template` | read one |
| `POST /v2/update-template` | write one **that already exists** |

**There is no `create-template` endpoint.** Templates must be created by hand in the console — that is what mints the id. Both read and write endpoints are vendor-marked *"experimental API, contact support"*.

**The documented write gap:** `get-template` returns four fields — `body`, `css`, `sample_json`, `settings`. `UpdateTemplateRequest` documents only `template_id`, `body`, `css`. So **page setup — paper size, margins, orientation, header/footer — may not be restorable by API.** Unresolved: the import script sends all four and reads back to find out. That probe has not been run.

## Export: done, 20/20

`node scripts/apitemplate-export.mjs` — all 20 pulled, **0 refused, all PDF**. The image-template risk (5.2 Taylor covers) does not exist; one route covers everything.

Findings from the export data:

- **6.1's template is a stub, confirmed.** `cee77b23e127e78a` exported at 1,437 bytes against 5.8k–36k for the rest. Its entire body is `{{ content | safe }}` in an HTML shell, and it keys on **`content`** while 6.1 sends **`html`**. That is why its output is a constant 10,648 bytes. Corroborates publishing's §1 from the template definition rather than by inference.
- **One template is dead.** `96c77b23eb52a4b4` "Alex Initial Analysis" exists in the account and **no workflow calls it** (publishing's sweep of all 33). Do not recreate it. 7 new templates replace 8 old ones.

## The 7 to migrate, and progress

| Old id | Template | n8n call site | New id |
|---|---|---|---|
| `cee77b23e127e78a` | Final Manuscript PDF | 6.1 | `8f777b2979c7b38e` ✅ |
| `68777b23605355c4` | Free Manuscript Analysis | 00.04 | `dee77b297952dcbe` ✅ |
| `12b77b23ed8e7f8a` | Jordan Full Manuscript Analysis | 4.1 | `b6177b2979c87ca2` ✅ |
| `6e677b23e5f897bc` | Taylor Publishing Plan | 5.1 | *not created* |
| `e0277b23e6c9db42` | Manuscript Version | 1.5 | *not created* |
| `16377b23e6301260` | Sam Full Manuscript Analysis | 3.1 | *not created* |
| `79877b23e3adb572` | Alex Full Manuscript Analysis | **2.3 + 2.3R** | *not created* |

Shared credential across all eight call sites: **`jN6l6Wo4p2GFD0qF`**.

## Resuming

1. `node scripts/apitemplate-import.mjs` — dry run, echoes pairs.
2. `node scripts/apitemplate-import.mjs --probe` — writes **one** template (Final Manuscript PDF) and reads it back field by field. **This answers whether `settings` survives, for all seven.**
3. Create the remaining four, fill in `_mapping.json`, `--apply`.
4. **Generate a test PDF from each new template while the old ones are still live.** Compare against baselines: Alex 272KB–693KB and content-varying; 6.1 a constant 10,648. Size, never absence-of-error — most of these nodes carry `onError` and fail silently.
5. Only then cut workflows over: **credential and template id together, in one atomic update, per workflow.** Order `2.3R` → `6.1` → `1.5`, `5.1`, `3.1`, `4.1`, `00.04` → **`2.3` last**.

**The trap, restated because it is the whole risk:** repointing the shared credential before the template ids change breaks all seven simultaneously, including the path that emails every paying author — silently.

## Do this while recreating each template — the header/footer table pattern

Found 2026-10-02 on `79877b23e3adb572` (Alex) and fixed there. **The other six almost certainly carry it.**

Chrome's PDF header/footer renders in a constrained context where it **ignores `padding`, `display:flex` and `text-align` on a bare `<div>`**. The Alex template's header was a flex div with `padding: 0 18mm` — the padding was dropped, the flex collapsed, and "AuthorsLab" ran straight into "Developmental Roadmap" against the page edge. Its footer had the same fault and sat flush left despite `text-align:center`.

**A `<table>` is honoured where a `<div>` is not.** `cee77b23e127e78a` (6.1) already used that workaround in its footer, which is why that one always rendered correctly — the pattern was in the house and undocumented.

The shape that works:

```html
<style>#header{padding:0 !important;margin:0 !important;}</style>
<table style="width:100%;border-collapse:collapse;...">
  <tr>
    <td style="padding:14px 0 5px 50px;text-align:left;">…</td>
    <td style="padding:14px 50px 5px 0;text-align:right;">…</td>
  </tr>
</table>
```

Side padding should match the body's `margin_left`/`margin_right` so header, body and footer align.

**Also check the margins, not just the markup.** A two-row footer did not fit `margin_bottom: 40` and the body panel overlapped the page number. `margin_bottom` went to `65` against `margin_top: 80`. Reserve vertical space in proportion to the number of rows.

Recreating all seven is the only cheap moment to normalise this. Do it as each template is rebuilt rather than as a later sweep.

---

## Not migrated, deliberately

Clarence's 12 templates stay where they are. Nothing in this plan touches them, and the import script refuses to run if the new key equals the old one.

## Open question for the vendor

Worth emailing hello@apitemplate.io: is `update-template` enabled on a new account, given it is marked experimental? A reply costs nothing; finding out mid-cutover costs a lot.
