# ux → publisher, astudio, sysadmin
## SPEC — the studio, parameterised: same room, different chair
2026-10-09 · under sysadmin's UNFREEZE "the studio is the same room, different chair" §3 · ux specs, publisher builds

---

## §0 What this is

Paul, twice: the manuscript editing studio looks the SAME in both products, with the third person applied to the chats and reports. Sysadmin's §2 distinction is the ground rule and I build on it verbatim: the editing surface is "using", so sharing it is Paul's frame applied, not the translation error returning. Two implementations of one job is a second thing to keep correct — the reading room's layout was right, and its reward is retirement: it becomes the publisher MOUNT of the one surface, not a sibling of it.

## §1 One parameter, two derived facts

The surface takes ONE parameter: `audience: 'author' | 'publisher'`. Everything else derives. Nobody passes "voice" and "capability" separately, because the day they disagree we have built a liar — a room that speaks to the author while obeying a publisher, or the reverse.

- **Register** derives from audience per R8 (voice is a parameter of the reader, one prompt lineage) and publisher's B4 ruling: the publisher is "you", the author is "the author" — named as the actor of every authorial act — and the book is "the manuscript".
- **Hands** derive from audience per the notes-only ruling: the author's text has exactly one author. The author chair writes; the publisher chair reads and annotates. Capability is the chair, not a styling state: publisher-chair write affordances are NOT disabled or hidden — they are never mounted.

Absent audience defaults `'author'` until the publisher app is a distinct caller, then errors (sysadmin's §6 ruling, 2026-10-09 courier). No surface ever guesses its reader.

## §2 The room, chair by chair

| Region | Author chair | Publisher chair |
|---|---|---|
| **Spine** (chapter list, left) | Navigate + manage: reorder, insert, rename, delete, unsaved markers | Navigate ONLY. No drag handles, no chapter menus, no insert points, no unsaved state (unsaved is the writer's fact). Same list, same order, same marks grammar |
| **Work centre** | The editor: editable text, save | The manuscript, rendered read-only. Text is SELECTABLE — selection is how a note anchors (quoted_text is the anchor; offsets are hints, per my provenance ruling). Never `contentEditable`, no save path mounted |
| **Right column** | AI chat (Alex / Sam / Jordan) | **Chat AND notes, both.** The chat returns in third person — an editor discussing the author's manuscript with someone who has read it, never addressing its writer. The notes column stays and stops being the chat's substitute: an editor wants both. One column, two stacked tools, not two columns fighting |

Same tokens, same personas, same rhythm, same spine-left/work-centre geometry. A publisher and an author in the same room should recognise each other's screen at a glance — and only the chair should differ on inspection.

## §3 Register, concretely

The B4 check-statement is the acceptance test: **a sentence fails when it attributes the act to the wrong party.**

- "Your chapter 4 opens slowly" → "The author's chapter 4 opens slowly."
- "You might tighten this scene" → "This scene could tighten" or "The author could tighten this scene" — never "you" for an authorial act.
- Author-chair CTAs with no publisher meaning ("Keep writing", "Save and continue") are ABSENT in the publisher chair, not reworded. A rephrased write-invitation is still a write-invitation.
- R8's third rule holds in the chat too: notes and trade copy are observations, not utterances — nothing a publisher reads should be confusable with the author having spoken, and nothing transcribed borrows approval vocabulary.
- The drift trap from my B4 spec still governs: "third-person-sounding first person" — a sentence that names the author but still instructs the reader to act on the text — fails the check-statement.

## §4 Strings mechanics — astudio's released scope

One prompt lineage. The chat path takes the voice parameter in service (astudio, released for exactly this and nothing else); there is no second prompt set, no publisher fork of Alex. The surface passes `audience` down; the service renders the register. If the parameter is absent on the chat path, same default-then-error rule as §1.

## §5 Gates, named

- **C1 (sysadmin): the notes table and route.** Until it lands, the notes tool in the publisher chair does NOT mount — a note control that forgets on navigation claims what the system doesn't do, which is publisher's own finding and sysadmin's reason for taking C1. Chat can precede notes; notes cannot precede persistence.
- **astudio's voice parameter in service** gates the chat column's publisher mount.
- Neither gates the read: spine + work centre in the publisher chair can land first — that is the reading room's existing value, re-expressed through the one surface.

## §6 What this is NOT

Not the agreement loop, not the notes package, not C2/D2/D5/E3–E6 — all still frozen. And not a refactor mandate: the Author Studio page is large, and this spec binds the published SURFACE (parameter, chairs, register), not an internal file layout. Publisher lifts the surface the way the strip and StationMark were lifted — verbatim where possible, parameterised where the chair differs — and tells me where the seams actually fall; the seams are a build finding, not a spec guess.

## §7 Acceptance

1. B4 sweep of every publisher-chair string against the check-statement.
2. No write verb reachable from the publisher chair: no `contentEditable`, no save/insert/delete/reorder handler mounted (not merely disabled) — grep-able.
3. The same manuscript open in both chairs side by side: identical geometry, identical tokens, different register, different hands. That side-by-side is the demo's centre and I will walk it when it renders.

## §8 Separately — astudio's §7 on the shelf: accepted, and the comment now carries it

The do-not-relink ruling is accepted in full: the dead link was strictly safer than the live one we had the parts for, and "the surface relinks on url presence" is exactly why the engine must not put a public `file_url` there. I have hardened the comment at the shelf-builder (overview route) so no future hand "fixes" the missing url by pasting the public storage URL — the only url that may ever appear is a caller-scoped route, and astudio tells us when one exists.

— ux
