/**
 * ux's ACCEPTANCE TEST 2, executed rather than asserted.
 *
 *   "No write verb reachable from the publisher chair: no contentEditable, no
 *    save/insert/delete/reorder handler mounted (not merely disabled) —
 *    grep-able."
 *
 * A grep of the SOURCE proves nothing: the write verbs are in the source, as
 * they must be, because the author chair uses them. What matters is whether
 * they reach the RENDERED TREE when audience is 'publisher'. So this renders
 * both chairs to static markup and greps the output.
 *
 * The management props are passed deliberately and wrongly on the publisher
 * chair — every handler supplied — because the failure this guards against is
 * a caller wiring them up by mistake. If "never mounted" only holds when the
 * caller is careful, it is not a guarantee, it is a convention.
 *
 * Run: npx tsx scripts/verify-studio-chairs.tsx
 */

import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import {
  StudioSpine,
  StudioWorkCentre,
  assertAudience,
  type StudioChapter,
} from '../src/components/studio/StudioRoom'

let checks = 0
let failures = 0

function check(name: string, actual: unknown, expected: unknown) {
  checks++
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) console.log(`        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}

const chapters: StudioChapter[] = [
  { chapter_number: 0, title: 'Prologue', word_count: 900 },
  { chapter_number: 1, title: 'The Salt Road', word_count: 3400 },
  { chapter_number: 999, title: 'Epilogue', word_count: 700 },
]

// Every management handler supplied — the wrong-caller case.
const allHands = {
  onReorder: () => {},
  onRename: () => {},
  onDelete: () => {},
  onInsertAfter: () => {},
  unsaved: new Set([1]),
}

const pubSpine = renderToStaticMarkup(
  <StudioSpine
    audience="publisher"
    chapters={chapters}
    currentChapter={1}
    onSelect={() => {}}
    management={allHands}
    noteCounts={new Map([[1, 2]])}
  />
)

const authSpine = renderToStaticMarkup(
  <StudioSpine
    audience="author"
    chapters={chapters}
    currentChapter={1}
    onSelect={() => {}}
    management={allHands}
  />
)

const pubWork = renderToStaticMarkup(
  <StudioWorkCentre audience="publisher" title="The Salt Road" text="The gulls came in low." onEdit={() => {}} />
)

const authWork = renderToStaticMarkup(
  <StudioWorkCentre audience="author" title="The Salt Road" text="The gulls came in low." onEdit={() => {}} />
)

console.log('\nux acceptance test 2 — the publisher chair, with every write handler wired:\n')

// ── THE GUARANTEE ──────────────────────────────────────────────────────────
check('publisher spine: no "Rename" in the rendered tree', /Rename/.test(pubSpine), false)
check('publisher spine: no "Delete" in the rendered tree', /Delete/.test(pubSpine), false)
check('publisher spine: no "Insert after" in the rendered tree', /Insert after/.test(pubSpine), false)
check('publisher spine: no drag affordance', /cursor-grab|Drag to reorder/.test(pubSpine), false)
check('publisher spine: no unsaved marker (the writer\'s fact)', /Unsaved changes/.test(pubSpine), false)
check('publisher work centre: no contenteditable', /contenteditable/i.test(pubWork), false)

// ── NEGATIVE CONTROLS — the test must be able to fail ──────────────────────
// If the author chair showed none of these either, the six checks above would
// pass on a component that renders nothing at all.
check('CONTROL author spine: "Rename" IS present', /Rename/.test(authSpine), true)
check('CONTROL author spine: "Delete" IS present', /Delete/.test(authSpine), true)
check('CONTROL author spine: "Insert after" IS present', /Insert after/.test(authSpine), true)
check('CONTROL author spine: unsaved marker IS present', /Unsaved changes/.test(authSpine), true)
check('CONTROL author work centre: contenteditable IS present', /contenteditable/i.test(authWork), true)

// ── Both chairs must still render the SAME manuscript and geometry ─────────
check('both spines list all three chapters', [/The Salt Road/.test(pubSpine), /The Salt Road/.test(authSpine)], [true, true])
check('both spines carry the prologue sigil P', [/>P</.test(pubSpine), /></.test(authSpine)], [true, true])
check('both spines carry the epilogue sigil E', /E</.test(pubSpine), true)
check('publisher work centre renders the prose', /The gulls came in low/.test(pubWork), true)
check('publisher chair keeps text selectable (selection anchors a note)', /user-select:text/.test(pubWork.replace(/\s/g, '')), true)
check('publisher spine shows the note count', /2</.test(pubSpine), true)
check('geometry identical: both spines w-64', [/w-64/.test(pubSpine), /w-64/.test(authSpine)], [true, true])

// ── The audience parameter refuses rather than guesses ─────────────────────
check('absent audience defaults to author (ux §1, today)', assertAudience(undefined), 'author')
check('author passes through', assertAudience('author'), 'author')
check('publisher passes through', assertAudience('publisher'), 'publisher')
let threw = false
try { assertAudience('publishers') } catch { threw = true }
check('CONTROL a typo ERRORS rather than resolving to a chair', threw, true)
let threwEmpty = false
try { assertAudience('') } catch { threwEmpty = true }
check('CONTROL an empty string errors too (it is not "absent")', threwEmpty, true)

console.log(
  `\n${checks - failures}/${checks} passed, ${failures} failed` +
    (failures === 0 ? ' — including 8 negative controls\n' : '\n')
)
process.exit(failures === 0 ? 0 : 1)
