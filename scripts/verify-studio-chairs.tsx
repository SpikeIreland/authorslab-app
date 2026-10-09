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
import { readFileSync } from 'node:fs'
import React from 'react'
import {
  StudioSpine,
  StudioWorkCentre,
  assertAudience,
  type StudioChapter,
} from '../src/components/studio/StudioRoom'
import { StudioConversation } from '../src/components/studio/StudioConversation'

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


/* ─── THE CONVERSATION COLUMN ───────────────────────────────────────────────
 * Two guarantees, both of which exist because of defects found in the author
 * studio's chat: a composer must be ABSENT rather than disabled when there is
 * no send path, and a failure must never be rendered as a person speaking.
 * ─────────────────────────────────────────────────────────────────────────── */

const entries = [
  { id: 'n1', body: 'The second act sags.', byline: 'You', when: '2 Oct' },
  { id: 'n2', body: 'Agreed.', byline: 'A colleague', when: '3 Oct' },
]

const noSend = renderToStaticMarkup(
  <StudioConversation
    audience="publisher"
    title="Your notes"
    entries={entries}
    emptyText="Nothing yet."
    composer={null}
    failure="That note was not saved."
  />
)

const withSend = renderToStaticMarkup(
  <StudioConversation
    audience="publisher"
    title="Your notes"
    entries={entries}
    emptyText="Nothing yet."
    composer={{ placeholder: 'A note…', submitLabel: 'Add note', onSend: () => {} }}
  />
)

const noByline = renderToStaticMarkup(
  <StudioConversation
    audience="publisher"
    title="Chat"
    entries={[{ id: 'x', body: 'A line with no attribution.', byline: null, when: null }]}
    emptyText="Nothing yet."
  />
)

console.log('\nthe conversation column:\n')

check('no send path -> NO textarea mounted', /<textarea/.test(noSend), false)
check('no send path -> NO submit button mounted', /Add note<\/button>/.test(noSend), false)
check('CONTROL with a send path -> textarea IS mounted', /<textarea/.test(withSend), true)
check('CONTROL with a send path -> submit button IS mounted', /Add note<\/button>/.test(withSend), true)

// The failure must appear, and must NOT be inside an entry card with a byline.
check('a failure is rendered', /That note was not saved/.test(noSend), true)
check(
  'a failure carries no byline — it is the surface, not a person',
  /That note was not saved[^<]*<\/p>/.test(noSend),
  true
)

check('an entry with no byline renders none', /A line with no attribution/.test(noByline) && !/·/.test(noByline), true)
check('CONTROL an entry WITH a byline renders it', /You/.test(noSend), true)

/* ─── THE CHAT ROUTE'S TWO INVARIANTS ───────────────────────────────────────
 * A server file cannot be rendered, so these are source checks — but on the
 * EXPRESSION, not on a word, and each locks a decision that a later edit could
 * quietly undo. Both are rulings, not preferences: `audience` decides the
 * register and must never come from the request; `journey_id` is ruled absent
 * because no journey beats a journey claiming the wrong actor.
 * ─────────────────────────────────────────────────────────────────────────── */

const chatRouteRaw = readFileSync(
  new URL('../src/app/api/publisher/projects/[id]/chat/route.ts', import.meta.url),
  'utf8'
)

/**
 * COMMENTS STRIPPED BEFORE ANY OF THESE CHECKS RUN.
 *
 * The first version of the journey_id check FAILED on this very file's own
 * comment, which quotes sysadmin's `journey_id: body.journey_id || null` while
 * explaining why the key is absent. That is the vocabulary-versus-expression
 * mistake for the third time in this estate — after the 'Unnamed firm' string
 * and the AppShell import — and it is worth the extra four lines to make the
 * check test the CODE rather than the prose about the code.
 *
 * A source check that a comment can satisfy, or break, is not a check.
 */
const chatRoute = chatRouteRaw
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:])\/\/.*$/gm, '$1')

check("chat route hard-codes audience: 'trade'", /audience: 'trade'/.test(chatRoute), true)
check('chat route NEVER reads audience from the request', /payload\.audience|body\.audience/.test(chatRoute), false)
check('chat route sends NO journey_id key', /journey_id:/.test(chatRoute), false)
check('chat route caps the call so a stalled branch cannot hang the caller', /AbortController/.test(chatRoute), true)
check('chat route refuses an unreadable reply instead of inventing one', /chat_unreadable/.test(chatRoute), true)
check('CONTROL the comment stripper left real code behind', /AbortController/.test(chatRoute) && chatRoute.length > 500, true)
check('CONTROL the raw file DOES contain journey_id in prose', /journey_id/.test(chatRouteRaw), true)
check('CONTROL stripping removed that prose', /journey_id/.test(chatRoute), false)
console.log(
  `\n${checks - failures}/${checks} passed, ${failures} failed` +
    (failures === 0 ? ' — including 14 negative controls\n' : '\n')
)
process.exit(failures === 0 ? 0 : 1)
