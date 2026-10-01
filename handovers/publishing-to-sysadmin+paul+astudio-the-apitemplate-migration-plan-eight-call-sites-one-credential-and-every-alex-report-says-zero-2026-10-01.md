# Publishing → sysadmin (implementation), paul (decisions), astudio (§5 is yours)
## The APITemplate migration plan — 8 call sites, 7 templates, ONE credential. And the variable-name class of defect is already live in the author report
2026-10-01 · courier · plan of action requested by Paul · Courier Convention V1.3

Paul asked for a plan of action and named `sysadmin` to implement it. This is that plan.
It is bigger than one template, and the sweep that produced it found two live defects nobody was
looking for.

---

## 1 · Paul's question, answered straight: no, I did not know how APITemplate works

> "Just to clarify, are you aware of how the API Template environment works?"

**No, and that is the whole reason P6 sat blocked for three days.** I had never seen the
environment. I inferred from one broken output that the n8n node "only supports the template
path", inferred from that that we needed a raw-HTML endpoint, and then asked you for an endpoint
spec to satisfy an inference. Four tabs — Jinja2 template, CSS, JSON variables, Settings for
header and footer — is the thing I should have asked for on day one instead of reasoning around
its absence.

**And your Template-tab snippet is almost certainly the answer to P6.** Here is the chain:

```
Your template body:        {{ content | safe }}
6.1 sends (verified):      { html, manuscriptId, title, author, formats, settings }
```

**It sends `html`. The template renders `content`.** `{{ title }}` resolves — 6.1 does send
`title` — and the body resolves to nothing. **A title page with an empty body is a small file
that is the same size for every book**, which is exactly what we measured: 10,648 bytes,
byte-identical across runs, for a 401,041-character manuscript.

**Stated as a hypothesis, because I am not going to repeat this week's mistake.** I have not seen
template `cee77b23e127e78a` itself. You showed me *a* Template tab; I do not know whether it is
6.1's, one of the other six, or a new blank one in the new account. The evidence is strong and
circumstantial, not direct. **One test settles it** — §3.

---

## 2 · The fix, applied, and it cannot make anything worse

Rather than rename `html` in the compiler, I aliased it **at the template call**, where adapting
to a template's vocabulary belongs:

```
Final Manuscript PDF · propertiesJson
  was:  ={{ $json }}
  now:  ={{ { ...$json, content: $json.html } }}
```

**Strictly additive.** `html` is still sent, so if the template is keyed on `html` after all,
nothing changes. If it is keyed on `content`, it now fills. There is no configuration of the
template under which this is worse than before.

**6.1 draft only. `sysadmin`'s hold stands and I am not asking for it to be lifted.** The active
version is untouched — and still mints public URLs, per my last courier.

---

## 3 · The test that proves it, and it needs no dashboard

**Output size varies with content, or it does not.** I used this today and it is decisive:
eleven `alex_report.pdf` objects in `manuscript-reports` range **272,492 to 693,626 bytes** and
track their manuscripts. 6.1's PDF is a constant 10,648.

So: run 6.1 once on `b155f95d` with the aliased payload and read the stored object's size.
**Over ~100KB for a 401,041-character book means it rendered. Still 10,648 means the variable name
is not the fault and the template itself is a stub.** One run, one number, no guessing. That is
the "a check must prove it can fail" property from your own Sentinel design.

---

## 4 · The migration, and the trap in it

I swept **all 33 workflows** for APITemplate nodes. I read `6.1` and `2.3` myself; the other six
come from a full sweep, and where the two overlap they agree exactly.

**8 call sites. 7 distinct templates. ONE credential.**

| Workflow | Node | Template ID | Body variable it sends |
|---|---|---|---|
| 00.04 Free Manuscript Analysis | `PDF Generator` | `68777b23605355c4` | `reportContent` |
| 1.5 Generate Manuscript Versions | `Create a pdf` | `e0277b23e6c9db42` | `manuscriptContent` |
| **2.3 Alex Full Manuscript Analysis** | `PDF Generator` | `79877b23e3adb572` | `analysisReport` |
| 2.3R Re-render Alex Report *(inactive)* | `Render PDF` | `79877b23e3adb572` | `analysisReport` |
| 3.1 Sam Full Manuscript Analysis | `Create a pdf` | `16377b23e6301260` | `analysisReport` |
| 4.1 Jordan Full Manuscript Analysis | `Create a pdf` | `12b77b23ed8e7f8a` | `analysisReport` |
| 5.1 Taylor Assessment | `PDF Generation` | `6e677b23e5f897bc` | `planHtml` |
| **6.1 Format Manuscript** | `Final Manuscript PDF` | `cee77b23e127e78a` | **`html`** |

Credential: **`jN6l6Wo4p2GFD0qF`, "APITemplate.io account"** — the only `apiTemplateIoApi`
credential in the instance, and it is attached to all eight nodes.

> ### The trap, stated plainly
> **One credential serves eight nodes.** If the credential is repointed at the new account before
> the template IDs are changed, **all seven templates break simultaneously** — including `2.3`,
> which is the live path that emails a report to every paying author. The old IDs will not exist
> in the new account, so every call 404s or renders empty, and `onError` on most of these nodes
> means they will **fail quietly rather than loudly**.
>
> So: **never swap the credential as a step of its own.** Credential and template ID change
> together, per workflow, in one atomic update. n8n's update is atomic per batch, which makes this
> safe to do exactly that way.

### The plan of action

| Phase | What | Whose |
|---|---|---|
| **0** | **Do not touch the credential yet.** | — |
| **1** | Inventory — **done, §4 above.** Record the 7 IDs and each one's variable contract. | mine, delivered |
| **2** | Export all four tabs (Template, CSS, JSON, Settings) for each of the 7 from the old account. **Check first whether APITemplate's management API exposes template read/create** — if it does, this is a script, not 28 tabs copied by hand. I am naming that as a thing to check, not a thing I know. | `sysadmin` · Paul's API key |
| **3** | Recreate in the AuthorsLab account → **7 new template IDs**. | `sysadmin` |
| **4** | Cutover **per workflow, atomically**: template ID **and** credential in one `update_workflow` batch. Order them lowest-risk first — `2.3R` (inactive) as the pilot, `6.1` next (held draft anyway), then `1.5`, `5.1`, `3.1`, `4.1`, `00.04`, and **`2.3` last**, because it is the one a customer sees. | `sysadmin` |
| **5** | Verify each by the §3 size test, not by the absence of an error. | `sysadmin` |

**One recommendation, and it is a scope decision for Paul rather than a technical one.** Phase 3
is the only moment when recreating these is cheap. Seven templates with seven different variable
vocabularies — `reportContent`, `manuscriptContent`, `analysisReport`, `planHtml`, `html` — is
the thing that produced P6 in the first place. **Recreating them on one shared vocabulary costs a
little more now and removes the whole class.** Migrating seven divergent templates faithfully
reproduces the problem in a new account.

---

## 5 · `astudio` — the sweep found two live defects in 2.3, and one is in every report you have sent

Not my lane, found on the way, and the second one is the sort a publisher notices.

**(a) Every Alex report says zero.** `2.3`'s `Report Formatting` builds the template payload from a
`manuscripts` row and reads `manuscriptData.totalWordCount` and `.totalChapters`. **Those columns
do not exist** — they are `current_word_count` and `total_chapters`. So `totalWordCount` resolves
to `"0"` and `totalChapters` to `0`, and both go into the rendered PDF.

**Every developmental report emailed to a paying author states that their manuscript is 0 words
and 0 chapters.** The report renders, the email sends, nothing errors, and the PDF is 600KB of
real analysis with a zero on the summary line.

**(b) `2.3` omits `reportType` entirely**, which the template presumably titles the document with.

**`2.3R`, your inactive manual re-render, has both of these right** — real counts from
`current_word_count` with a chapter-sum fallback, and `reportType: 'Developmental Editing
Roadmap'`. The correct code already exists in the estate; the live path is the one that is wrong.

**(c) Noted, lower stakes:** `2.3` injects inline styles (`#27ae60`, `border-left` rules) into
`analysisReport`, which `2.3R`'s own code comments say override the template's CSS. If Phase 3
restyles anything, `2.3` will ignore it.

This is the same class as §1 — **a Code node renaming or missing a key that a template silently
needs** — and all eight nodes pass `{{ $json }}` straight through, so there is no validation
anywhere between a Code node's output and a template's expectations. Nothing errors. The PDF just
has a hole in it.

**`sysadmin`, that is a Gate-B candidate**: *"a rendered report contains the values the record
says it should"*. A4 already checks the artefact exists. Nothing checks it is not full of zeros.

---

## 6 · What I am not doing

- **Not implementing the migration.** Paul named `sysadmin`, and the credential is a single point
  of failure across eight nodes — that is a sysadmin-lane act, not a publishing-lane one.
- **Not touching 2.3, 3.1, 4.1, 00.04, 1.5 or 5.1.** §5 is `astudio`'s and the Taylor one is
  `design`-adjacent. I read them; I changed nothing.
- **Not lifting 6.1's hold.**

---

## 7 · Standing

| | |
|---|---|
| P6 | root cause identified with high confidence (§1), additive fix in the draft (§2), **one run settles it** (§3) |
| My blocker on Paul | **dissolved** — no endpoint spec needed, ever |
| Migration | planned (§4), `sysadmin` to implement, one scope question for Paul |
| Gate C (layout snag list) | still gated on P6 — needs real pages |
| Signing leg | clickable, not clicked |
| 6.1 active version | still mints public URLs (prior courier) |

— `publishing`
