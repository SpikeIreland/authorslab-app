import type { AssetPack } from '@/app/api/projects/[id]/asset-pack/route'

// ─── THE SAMPLE ASSET PACK ─────────────────────────────────────────────────
//
// R9 (sysadmin RULING 2026-10-02 §4): the Marketing Hub is simulated for the
// High Line demo, and a simulation must announce itself. This is the sample
// the Marketing station shows when there is no real pack to show.
//
// THREE CONSTRAINTS ON THIS FILE, each of which it would be easy to break:
//
// 1. IT IS TYPED `AssetPack`, the engine's own exported type — not a loose
//    local shape. The compiler therefore guarantees the simulated view and a
//    real pack render through one code path. If the engine's shape moves and
//    this file is not updated, the build fails. A fixture that drifts from
//    the thing it stands in for is how a demo starts promising a shape the
//    product does not have.
//
// 2. IT IS NOT OLIVER'S BOOK. The marker says "sample data, not your
//    titles", so the sample must not be one of his titles — a pack for
//    *CS The List* on a screen marked "not your titles" is the marker
//    contradicting the content it sits above. This is an invented title on a
//    seeded sample book, and R10 keeps seeded books out of the countables.
//
// 3. EVERY DRAFT STILL CARRIES ITS MARK. `status: 'draft'` and `preparedBy`
//    are not decorations of the simulation — they are true of real packs
//    too, and the mark comes off only when a named person rewrites the text.
//    So the sample wears them exactly as a real pack does. The alternative
//    teaches Oliver that "draft" is a feature of the preview, and he then
//    reads the real thing as finished.

const PREPARED_BY = 'riley'

function draft(text: string) {
  return { text, status: 'draft' as const, preparedBy: PREPARED_BY }
}

export const SAMPLE_BOOK_TITLE = 'The Weight of Still Water'

export const SAMPLE_PACK: AssetPack = {
  positioning: {
    statement:
      'A drowned village surfaces after sixty years of drought, and with it the reason one family left in the night. A literary mystery about the things a community agrees not to say.',
    audience:
      'Readers of literary fiction who want a question pulling them forward — the book-club end of the mystery readership rather than the procedural end. Skews female, 40+, library-heavy, strong in trade paperback.',
    whyNow:
      'Reservoir drawdowns have put drowned villages on front pages across three continents, and the image is doing the work for us. The hook needs no explaining in a 20-second pitch, which is what a buyer meeting allows.',
  },
  comps: [
    {
      title: 'The Dry',
      author: 'Jane Harper',
      publisher: 'Little, Brown',
      why: 'The closest structural comp: drought as the force that exposes a buried past, and a returning outsider as the lens. Sets the expectation of landscape-as-pressure rather than landscape-as-scenery.',
    },
    {
      title: 'Snap',
      author: 'Belinda Bauer',
      publisher: 'Bantam',
      why: 'Carries the same crossover position — reviewed as literary, shelved as crime, longlisted rather than shortlisted. Useful for arguing the jacket should lean literary without losing the mystery reader.',
    },
    {
      title: 'The Lost Man',
      author: 'Jane Harper',
      publisher: 'Little, Brown',
      why: 'Comped here for the family-silence engine specifically rather than the setting. Shows the pattern sustains a second book, which matters if this is being acquired as the start of something.',
    },
    {
      title: 'Tom Lake',
      author: 'Ann Patchett',
      publisher: 'Harper',
      why: 'The aspirational comp, and flagged as aspirational. It argues the book-club ceiling is high for a quiet book with one withheld fact — not that these two books resemble each other.',
    },
  ],
  keywords: [
    { term: 'literary mystery', kind: 'category', note: 'Leads. Signals the shelf and the register in two words.' },
    { term: 'drought', kind: 'subject', note: 'High and rising search volume, and the cover image already carries it.' },
    { term: 'small town secrets', kind: 'theme', note: 'Heavily contested, but it is what readers of this book actually type.' },
    { term: 'family saga', kind: 'category', note: 'Secondary. Widens to the book-club buyer without misdescribing the pace.' },
    { term: 'reservoir', kind: 'subject', note: 'Low volume, almost no competition — worth a slot precisely because it is specific.' },
    { term: 'Australian fiction', kind: 'market', note: 'Include only in territories where it is a draw rather than a limit.' },
    { term: 'book club fiction', kind: 'audience', note: 'Carries the discussion-guide expectation. Confirm one is planned before claiming it.' },
    { term: 'dual timeline', kind: 'structure', note: 'Sought deliberately by this readership; omitting it loses a reader who wanted exactly this.' },
  ],
  drafts: {
    jacket: draft(
      `For sixty years, Kinnaird lay under ninety feet of water. The village was bought, emptied and flooded for the reservoir in 1964, and the forty-one families who left were paid and never spoke of it again.\n\nNow the water is going down.\n\nWhen the chimneys break the surface, Ellen Rourke comes back to the valley she was carried out of as a child — officially to catalogue what the drawdown exposes, in truth to find the house her mother would never name. What she uncovers is not a secret one family kept, but an agreement a whole village made: a thing done in the last week before the flooding, and a silence that held because everybody shared it.\n\nThe Weight of Still Water is a novel about the stories a community tells to go on living beside each other — and the cost, sixty years on, of being the one who finally says it out loud.`,
    ),
    retailerShort: draft(
      'A sixty-year drought exposes the drowned village of Kinnaird — and the agreement forty-one families made the week before the water came in. Ellen Rourke returns to catalogue the ruins and finds the one house nobody will name.',
    ),
    retailerMedium: draft(
      `The village of Kinnaird was emptied and flooded in 1964 to make a reservoir. Forty-one families were paid to leave, and they left. None of them spoke of it again.\n\nSixty years of drought have brought the water down, and the chimneys are showing. Ellen Rourke — carried out of the valley as a child, now the archaeologist sent to record what the drawdown reveals — comes back to find a house her mother refused to name.\n\nWhat she finds instead is an agreement: something done in the village's last week, and a silence that held for six decades because everyone had a share in it.\n\nFor readers of Jane Harper and Belinda Bauer, a literary mystery about the stories a community tells in order to live beside each other.`,
    ),
    retailerLong: draft(
      `In 1964 the village of Kinnaird was bought, emptied and flooded. The reservoir took the church, the school, the single street and the forty-one houses along it. The families were compensated and dispersed across two counties, and for sixty years the valley was a sheet of still water with a drowned place underneath it.\n\nThen the droughts came, one after another, and the water began to drop.\n\nEllen Rourke was four years old when her mother carried her out of Kinnaird, and she has spent a career not thinking about it — a careful archaeologist with a specialism in salvage, which is its own kind of answer. When the county commissions a survey of what the drawdown has exposed, she takes the work. She tells herself it is a job. She is looking for a house.\n\nWhat surfaces is not the private grief she prepared for. The village's final week does not match the official record, and the mismatch is not one family's lie — it is consistent across every account she can still collect, from people in three different towns who have not spoken to each other in sixty years. Forty-one families agreed on something. They have all told the same version ever since.\n\nAs the water keeps falling and the survey keeps turning things up, Ellen has to decide what she is excavating: a crime, a mercy, or the ordinary machinery by which a community decides what it can afford to know about itself.\n\nThe Weight of Still Water is a literary mystery in the tradition of Jane Harper's The Dry and Belinda Bauer's Snap — landscape as pressure, silence as plot, and one withheld fact held back with real nerve. It is a novel for anyone who has sat at a family table where a subject is not raised, and understood that the not-raising is the subject.`,
    ),
    salesSheet: draft(
      'A drought drops a reservoir and exposes the village drowned beneath it in 1964 — along with the agreement forty-one families made in its last week. Literary mystery for the Jane Harper reader, with a hook that needs no explaining: the photograph of a church spire coming out of the water does the pitch for you. Strong trade paperback and library prospects; book-club discussion guide planned.',
    ),
  },
  generatedAt: '2026-10-02T09:00:00.000Z',
}
