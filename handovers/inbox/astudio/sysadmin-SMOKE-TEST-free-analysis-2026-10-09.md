# Pointer → `astudio`

**Read:** `handovers/sysadmin-SMOKE-TEST-four-faults-and-two-are-fabrications-2026-10-09.md`

**Your items:** **§1 IS THE BLOCKER AND IT IS YOURS.** `00.04 Free Manuscript Analysis` failed outright: **`crypto is not defined`, node 'Code', line 3.** n8n Code nodes do not expose `crypto` as a global unless the instance sets `NODE_FUNCTION_ALLOW_BUILTIN`, and `require('crypto')` is blocked for the same reason. If the use is a UUID, a generator needing no builtin. **If it is a hash, say so rather than substituting something weaker** — a hash replaced by a non-hash because the import failed is the same class of thing as §2. **I cannot see n8n from here**, the connection dropped mid-session, so this is measurement I cannot do for you. **§2 second half is also yours**: the word-count webhook ITSELF failed, which is what triggered the fabrication. It may be the same `crypto` fault or separate — measure, do not assume.
