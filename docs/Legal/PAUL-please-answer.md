# Legal placeholders — please fill in

**For:** Paul
**From:** Platform Dev
**Time to fill:** ~10 minutes if you have the facts handy; some can be answered "unknown — check with accountant" and we'll come back to them.

Just type answers in-line after each `A:` prompt and hand this back to me. Where I've suggested a **default**, "yes to default" is a fine answer.

---

## Company identity

**1. Registered company name, company number, and registered address.**
This lands in the Privacy Policy §1/§15, Terms §1.1/§15.7, and DPA opening. Every legal doc needs the entity.

- Registered name:
  A:
- Company number:
  A:
- Registered address:
  A:

**2. ICO (Information Commissioner's Office) registration number, if you have one.**
Only if you've registered with the ICO in the UK as a data controller. If not registered yet, "not registered" is a valid answer — Clarence will phrase the policy accordingly.

  A:

---

## Data infrastructure

**3. Which Supabase region is your project on?**
Default suggestion: `eu-west-2` (London). Check in the Supabase dashboard → Project Settings → General → Region if unsure.

  A:

**4. Analytics vendor — is Vercel Analytics the only one you're using?**
Or have you added Plausible / Google Analytics / anything else? Every analytics tool needs to be listed in the Cookie Policy and Subprocessors list.

  A:

**5. Self-serve chat deletion — is this feature live at MVP launch, or roadmap?**
Users being able to delete their own chat history through the UI. The Privacy Policy §10 either promises the feature or says "email us to delete."

  A:  ☐ Live at MVP launch  |  ☐ Roadmap / email to delete for now

**6. Subprocessor regions — where do the smaller vendors physically host?**
Best-effort answers OK. If unknown, "check with vendor" is fine — we'll fill later.

- APITemplate.io region:
  A:
- ConvertAPI region:
  A:
- Resend region:
  A:

**7. Confirm your transactional email provider is Resend?**
Or if you're using something else (SendGrid, Postmark, plain SMTP from another host), tell me the name.

  A:

---

## Legal framing

**8. SCC (Standard Contractual Clauses) governing law — Ireland OK?**
Default suggestion: Ireland. This is the jurisdiction under which the international-data-transfer clauses in the DPA are governed. Ireland is the standard choice for UK-based SaaS. If your legal setup points somewhere else (England & Wales, Scotland), name it.

  A:

**9. Are you VAT-registered?**
Yes/No. Affects how the refund policy is worded in the Terms.

  A:

**10. Are DPAs already signed with your key subprocessors?**
Tick each. If unsure, we can leave neutral placeholders and you check post-launch.

- Anthropic (Claude):  ☐ Signed  |  ☐ Not signed / unknown
- OpenAI (DALL-E):     ☐ Signed  |  ☐ Not signed / unknown
- Supabase:            ☐ Signed  |  ☐ Not signed / unknown

---

## Effective date

**11. When should the policies say they take effect?**
Default suggestion: pick your public-launch day (mid-August-ish per current plan). Or "today" if you want them live the moment the pages ship. The token `{{EFFECTIVE_DATE}}` appears in all five policies and gets replaced with whatever date you name here.

  A:

---

Once you fill these in, hand back the doc and I'll populate the drafts, spin up the five public routes (`/privacy`, `/terms`, `/cookies`, `/subprocessors`, `/dpa`), and add the footer links. ~2 hours of work my end after your answers arrive.
