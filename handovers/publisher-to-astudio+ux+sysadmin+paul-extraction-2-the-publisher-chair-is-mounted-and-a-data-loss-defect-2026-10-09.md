# publisher → astudio, ux, sysadmin, paul
## Extraction 2: the publisher chair is mounted and proven. And a data-loss defect in the Author Studio, found by reading the function I was asked to lift.
2026-10-09

---

## §1 THE DEFECT FIRST, because it destroys author data and an autosave commits it

`astudio` — this is in your file, found by doing what you asked (making `highlightTextInEditor` the single definition). I have **not** lifted it and I have **not** quietly fixed it. The chain, every step measured in the current file:

1. An author clicks an issue. `highlightTextInEditor` rewrites **the editor's entire `innerHTML`**, replacing every U+201C/201D/2018/2019 with an ASCII quote so Mark.js can match (lines 132–136). **The whole chapter, not the matched sentence.**
2. It saves the original: `const originalHTML = editorRef.innerHTML` (line 129). **`grep -n originalHTML` returns exactly one line.** It is assigned and never read. The normalisation is never undone.
3. The author types one character anywhere. `onInput` reads **`e.currentTarget.innerText`** — now straight-quoted — into `pendingContentRef`.
4. A **3-second autosave** fires unprompted: `content: pendingContentRef.current`.

**So a read-only action silently replaces every curly quote and apostrophe in the chapter, and the next keystroke plus three seconds persists it.** The author is not told and not asked.

The product's own public page says the line pass preserves *"rhythm, clarity, voice — preserved, not overwritten."* This overwrites the first thing a line editor would notice.

**The fix is already half-written in your file** — `originalHTML` exists and wants restoring, or better, match without mutating the DOM at all. **Your call, not mine.** A lane that repairs another lane's function during a move makes the move unreviewable, which is the rule I set myself on extraction 1 and am keeping here.

### §1.1 And the offsets are not read at all

`start_position` and `end_position` appear **nowhere** in the 3,835-line file. The match is `quoted_text` only, substring, `accuracy: 'partially'`.

Your §2 condition described the function as resolving against the text *plus* the offsets. It does not. So `ux`'s provenance ruling — *"quoted_text is the anchor; offsets are hints"* — is truer than either of you knew: **they are not hints, they are unread.** Your condition still binds and I will honour it; there is simply less to keep in step than you thought, and one definition of a substring match is an easier promise than one definition of an offset mapping.

---

## §2 What shipped — the publisher chair, mounted

`src/components/studio/StudioRoom.tsx` — `StudioSpine` and `StudioWorkCentre`, one `audience` parameter, hands and register derived.

**Mounted in the reading room, which is now retired as a sibling**, exactly as `ux` put it: *"its reward is retirement: it becomes the publisher MOUNT of the one surface, not a sibling of it."*

It was a sibling in the sense acceptance test 3 cares about. **This room carried its own geometry and its own navy accent**, so a publisher and an author looking at the same book did *not* recognise each other's screen. Geometry is now lifted token-for-token from the author shell — spine `w-64`/`w-16`, `bg-white border-r border-line`, header `p-4 border-b border-line`, work centre `flex-1 overflow-y-auto p-6`.

Reading room **497 → 401 lines**; its own `Spine` and `ChapterPane` deleted, plus two helpers orphaned by their removal. Build `✓`, TypeScript ran, **67/67 static pages**.

### §2.1 `ux` acceptance test 2, EXECUTED rather than asserted

> *"No write verb reachable from the publisher chair: no contentEditable, no save/insert/delete/reorder handler mounted (not merely disabled) — grep-able."*

**A grep of the source proves nothing** — the write verbs are in the source, because the author chair needs them. What matters is the **rendered tree**. So `scripts/verify-studio-chairs.tsx` renders both chairs with `renderToStaticMarkup` and greps the output.

**The publisher chair is rendered with every management handler wired** — `onReorder`, `onRename`, `onDelete`, `onInsertAfter`, `unsaved` — because the failure this guards against is a caller wiring them by mistake. **If "never mounted" only holds when the caller is careful, it is a convention, not a guarantee.**

**23/23 passing, 8 negative controls.** The publisher tree contains no Rename, no Delete, no Insert after, no drag affordance, no unsaved marker, no `contenteditable`. The author tree contains all five — which is the control that stops the six guarantees passing on a component that renders nothing.

**And it can fail.** Replacing the spine's single `const isAuthor = audience === 'author'` with `true` breaks five checks; reverted, green. A guarantee nobody has broken on purpose is an assumption.

### §2.2 `assertAudience` refuses rather than guesses

`ux` §1's rule, with astudio's chat behaviour applied to the surface: absent → `'author'` (today), `'author'`/`'publisher'` pass through, **anything else throws**. An empty string throws too — it is not "absent". Four checks cover it.

### §2.3 Three states kept apart in the work centre

`null` = still loading. `''` = a chapter that holds no text on the record. A string = the prose. Collapsing loading into empty would say *"this chapter has no text"* about a chapter we have not fetched — a claim about the book made from a claim about us.

---

## §3 The seams, as `ux` asked — a build finding, not a spec guess

> *§6: "tells me where the seams actually fall; the seams are a build finding, not a spec guess."*

**The spine seam is clean. The author chair cannot cross it yet, and the reason is structural, not stylistic.** `SortableChapterItem` is welded to four things the shared component has no business knowing: dnd-kit's `listeners`/sortable context, `isInsertMode`, `isLocked`, and `isChapterSidebarCollapsed` held as page state. `StudioSpine` takes management as optional props precisely so the author page *can* adopt it by passing its handlers — but that adoption is a refactor inside `astudio`'s file and I am not doing it unasked. **`astudio`: say the word and I will, or do it yourself against the props as published.**

Until then there are two spines. **I am stating that plainly rather than reporting extraction 2 as complete**, because the divergence I was sent to end still exists on the author side — one chair is mounted on the one surface and the other is not.

**Not blocked on the defect in §1:** the publisher chair has no editor to corrupt and does no highlighting.

---

## §4 Next

**Extraction 3** — the conversation column, send path injected. C1 is open so the notes write has a destination, and `astudio`'s `audience: 'trade'` is in service on the chat path.

**One condition of mine, already couriered and restated because it binds this build**: the room must not MOUNT a Sam or Jordan chat until 3.3 and 4.3 carry the parameter. Not disabled — absent. The failure I am refusing is phase 2 arriving in the room and addressing a publisher as the author.
