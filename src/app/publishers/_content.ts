/**
 * SHARED CONTENT for the /publishers pages.
 *
 * ─── Why this file exists (2026-10-08) ──────────────────────────────────────
 *
 * Paul: "people don't scroll down - they click on pages. Therefore, I would
 * prefer to see these sections as headers with dedicated pages rather than one
 * long list of things jammed onto one page."
 *
 * So the single 365-line page became a hub plus nine pages. The three data
 * arrays below were LIFTED OUT OF IT PROGRAMMATICALLY rather than retyped, so
 * every word marketing ratified in W1 is carried across byte-for-byte. The
 * rulings that governed them still govern them, and they are restated in the
 * hub page's header rather than copied here.
 *
 * It also makes the move cheap. Paul ruled on 2026-10-06 that the publisher
 * product becomes its own app: this whole folder travels as a unit.
 */

export const PUBLISHER_CONTACT_EMAIL = 'publishers@authorslab.ai'

/** The nav, in reading order. `blurb` is the hub's one-line card copy. */
export const PUBLISHER_PAGES = [
  { href: '/publishers/how-it-works', label: 'How it works',
    blurb: 'Seven stations, five working phases between two boundaries.' },
  { href: '/publishers/the-read', label: 'The read',
    blurb: 'Three editorial readers, one per discipline. Each prepares; none decides.' },
  { href: '/publishers/what-you-get', label: 'What you get',
    blurb: 'The artefacts that reach your desk, and what each is for.' },
  { href: '/publishers/series', label: 'Series',
    blurb: 'Carrying book one into the read of book two.' },
  { href: '/publishers/the-method', label: 'The method',
    blurb: 'A model call treated the way a factory treats a machine on a line.' },
  { href: '/publishers/security', label: 'Your data',
    blurb: 'Where a manuscript rests, who can reach it, and what we never do with it.' },
  { href: '/publishers/pricing', label: 'Pricing',
    blurb: 'A platform fee and a per-title fee. We never count seats.' },
  { href: '/publishers/getting-started', label: 'Getting started',
    blurb: 'The first title, and what the first month actually looks like.' },
  { href: '/publishers/faq', label: 'Questions',
    blurb: 'The first four questions our first publishing house asked.' },
] as const

export const STATIONS = [
  { n: 1, name: 'Manuscript', detail: 'The title enters the line. Ingest is gated: a file that fails validation is refused with a stated reason, never loaded in a degraded state.' },
  { n: 2, name: 'Developmental', detail: 'The full structural read — story, character, pacing — prepared by Alex and reviewed by an editor.' },
  { n: 3, name: 'Line', detail: 'The line-level pass — prose, rhythm, clarity — prepared by Sam.' },
  { n: 4, name: 'Copy', detail: 'The copy-edit pass — consistency, usage, mechanics — prepared by Jordan.' },
  { n: 5, name: 'Publishing', detail: 'Cover and interior move through approval. The house holds the gate.' },
  { n: 6, name: 'Marketing', detail: 'Launch materials are prepared for the house to approve.' },
  { n: 7, name: 'Handoff', detail: 'Our stations complete. The finished manuscript and every production file pass to the house.' },
]

export const METHOD_PROPERTIES = [
  {
    title: 'Every model call is a job with a record.',
    body: 'Registered before it starts, carries a timeout, ends in an explicit terminal state — ready, failed or timed out. A run that never finishes is detected and recorded rather than quietly disappearing.',
  },
  {
    title: 'One door to the model.',
    body: 'All model access passes through a single component that records model, token counts and cost per call. There is no second path and no ad-hoc call anywhere in the system.',
  },
  {
    title: 'Every output is checked by something that did not produce it.',
    body: 'An independent layer re-derives what the output should contain from the source material and compares. It never asks the component that did the work whether the work was done.',
  },
  {
    title: 'When we cannot do something properly, we refuse.',
    body: 'No approximation, and no degraded result presented as complete. A completed stage shows whether it was completed by a person or by the system — and an absent value is shown as absent, never as a plausible default.',
  },
]

export const FAQS = [
  {
    q: 'Who uses it?',
    a: "The house's editorial staff. Pricing never counts seats, so who you bring in is your decision, not a billing event. The house workspace — organisation, imprints, staff roles — is in build now; while it is, access is set up with you directly.",
  },
  {
    q: 'What should we test first?',
    a: 'The manuscript itself. Send one full manuscript through the read and judge the editorial report, the chapter summaries and the key points against what your own editors would have produced. That is the core of the product and it is live today.',
  },
  {
    q: 'How does it fit our editorial process?',
    a: 'As a hybrid workflow. The system prepares the read; your editor reviews it, interrogates it, and decides what reaches the author. The system holds no opinion an editor has not approved. The editor’s workbench inside the publisher workspace — where notes are agreed and packaged for the author as a document from a named person — is in build; the read it works on is live.',
  },
  {
    q: 'Can it hold a series?',
    a: 'In build, honestly labelled: every read already produces chapter summaries and key points — the compressed form designed to be carried forward — and a series relationship that carries them into the next book’s read is being built now. We would rather tell you it is coming than imply it is here.',
  },
]
