# Free-analysis template — header & footer, ready to paste

**Raw HTML, not JSON.** No backslashes. Copy each block whole and replace what is in the field.

---

## 1 · Header HTML

```html
<style>#header{padding:0 !important;margin:0 !important;}</style><table style="width:100%;border-collapse:collapse;font-family:Georgia,serif;font-size:8pt;color:#8A857C;"><tr><td style="padding:10px 0 5px 18mm;text-align:left;border-bottom:1px solid #8FAF8A;"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#5C7A6B;margin-right:6px;"></span>AuthorsLab</td><td style="padding:10px 18mm 5px 0;text-align:right;border-bottom:1px solid #8FAF8A;font-family:-apple-system,'Segoe UI',sans-serif;font-size:7pt;letter-spacing:0.12em;text-transform:uppercase;">Manuscript Assessment</td></tr></table>
```

---

## 2 · Footer HTML

```html
<style>#footer{padding:0 !important;margin:0 !important;}</style><table style="width:100%;border-collapse:collapse;font-family:-apple-system,'Segoe UI',sans-serif;color:#B5AFA4;"><tr><td style="padding:6px 18mm 0 18mm;text-align:center;font-size:7pt;">Page <span class="pageNumber"></span> of <span class="totalPages"></span> &nbsp;&middot;&nbsp; <a style="color:#5C7A6B;text-decoration:none;font-weight:600;" href="https://authorslab.ai/pricing?utm_source=pdf&utm_medium=report&utm_campaign=free-analysis&utm_content=footer">Continue the journey &rarr; authorslab.ai/pricing</a></td></tr><tr><td style="padding:2px 18mm 6px 18mm;text-align:center;font-size:6.5pt;">&copy; 2026 AuthorsLab &middot; a Spike Island Studios company &middot; authorslab.ai</td></tr></table>
```

---

## 3 · One setting

**`margin_bottom`: `18mm` → `26mm`**

The footer is two rows and did not have the vertical space for them. The same fault on the Alex template let the body panel overlap the page number.

---

## What changed and why

**`<div>` → `<table>`, and that is the whole fix.**

Chrome renders PDF headers and footers in a constrained print context that **ignores `padding`, `display:flex` and `text-align` on a bare `<div>`**. The old header asked for all three. So the 18mm padding vanished, the flex collapsed, and the two spans concatenated against the page edge — `AuthorsLabManuscript Assessment`.

A `<table>` is honoured where a `<div>` is not. The 18mm now sits on the outer cells, matching `margin_left` / `margin_right`, so header, body and footer align on one vertical.

Found on the Alex template 2026-10-02, fixed there, and written up with the warning that the other six almost certainly carried it. **They did. This is one of them.**

## And one removal

`{{manuscriptId}}` is gone from the footer. **A free analysis creates no manuscript record**, so there is nothing behind that token — it would render as the literal string on a customer's document, or as empty space with two stray separators around it.

The sample JSON has `"manuscriptId": "SAMPLE-0000"`, which is why it has always looked fine in preview and wrong in production. **A sample payload that supplies a field the real payload does not is a preview that tests the template against a lie.**
