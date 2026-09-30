import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

// ─── THE PER-TITLE ASSET PACK ENGINE ───────────────────────────────────────
//
// marketing-hub owns this engine; `publisher` surfaces it. Pivot §2: one
// engine, two applications — a lane owns an engine or a surface, never the
// same capability in both.
//
// THE VERB TEST (pivot §1.1) is why this file is shaped the way it is.
// Publisher-facing, the system may prepare, check, record, surface and hand
// off. It may NOT write. Three of the six artefacts here are prose, which is
// the first forbidden verb — the conflict was upheld by sysadmin on
// 2026-09-30 and their §4 adopted the resolution this implements:
//
//   "we do not write the book, and we do not write the jacket. We produce a
//    draft your marketer rewrites — and the draft says so about itself until
//    a person removes the mark."
//
// So the pack has two halves and they are not alike:
//
//   RESEARCH  positioning, comps, keywords — prepare and surface. Permitted
//             outright, and the half a publisher's marketer cannot do
//             quickly. This leads.
//   DRAFTS    jacket, three retailer lengths, sales-sheet blurb. Each one
//             carries status:'draft' and preparedBy IN THE PAYLOAD, so a
//             surface cannot present it as finished without actively
//             stripping a field. A convention is a claim; a field that must
//             be removed is a mechanism.
//
// AUTHORISATION is delegated to RLS (can_read_manuscript), NOT hand-rolled.
// That helper joins both id spaces — the author through author_profiles, a
// publisher's staff through org_memberships and imprint scoping. A local
// `author_id = auth.uid()` check here would refuse every publisher user and
// would be the fifth wrong-id-space defect in this estate in a fortnight.

export interface PackComp { title: string; author: string; publisher?: string; why: string }
export interface PackKeyword { term: string; kind: string; note: string }
export interface PackPositioning { statement: string; audience: string; whyNow: string }

// `status` is a literal, not a string: TypeScript will not let a caller
// construct a finished-looking artefact by assignment.
export interface DraftArtefact {
  text: string
  status: 'draft'
  preparedBy: string
  /** Set only when a person rewrites it. This is how the mark comes off. */
  rewrittenBy?: string
  rewrittenAt?: string
}

export interface AssetPack {
  positioning: PackPositioning
  comps: PackComp[]
  keywords: PackKeyword[]
  drafts: Record<string, DraftArtefact>
  generatedAt: string
}

const PREPARED_BY = 'riley'

const DRAFT_SPEC: Array<{ key: string; label: string; brief: string }> = [
  { key: 'jacket', label: 'Jacket copy', brief: 'the back-of-jacket description, 120-170 words' },
  { key: 'retailerShort', label: 'Retailer copy — short', brief: 'about 50 words, for a listing tile' },
  { key: 'retailerMedium', label: 'Retailer copy — medium', brief: 'about 120 words, the standard product description' },
  { key: 'retailerLong', label: 'Retailer copy — long', brief: 'about 250 words, for a retailer that allows a full page' },
  { key: 'salesSheet', label: 'Sales-sheet blurb', brief: 'two or three sentences a rep can read aloud to a buyer' },
]

// ---------------------------------------------------------------- GET

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // RLS decides who may read this. No local ownership test — see the header.
  const { data, error } = await supabase
    .from('title_asset_packs')
    .select('pack, generated_at')
    .eq('manuscript_id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    pack: (data?.pack as AssetPack) ?? null,
    generatedAt: (data?.generated_at as string) ?? null,
  })
}

// ---------------------------------------------------------------- POST

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Read the book through RLS. If the caller may not read the manuscript the
  // select returns nothing, which is the same answer for an author who does
  // not own it and a publisher whose imprint does not carry it.
  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('id, title, genre, current_word_count')
    .eq('id', id)
    .maybeSingle()

  if (!manuscript) {
    return NextResponse.json({ error: 'not_found_or_not_permitted' }, { status: 404 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  // Ground everything in the book's own prose. A pack derived from a genre
  // label is the generic output the pivot's positioning exists to avoid.
  const { data: chapters } = await supabase
    .from('chapters')
    .select('content')
    .eq('manuscript_id', id)
    .not('content', 'is', null)
    .order('chapter_number', { ascending: true })
    .limit(3)

  const opening = (chapters ?? [])
    .map(c => (c.content as string | null) ?? '')
    .join('\n\n')
    .slice(0, 8000)

  if (!opening) {
    // No prose, no pack. Saying so beats generating from a title.
    return NextResponse.json({ error: 'no_manuscript_text' }, { status: 409 })
  }

  const prompt = `You are preparing a per-title marketing asset pack for a PUBLISHER's marketing team. They are professionals. You are not replacing them — you are doing the slow research and handing them a first draft they will rewrite.

Book: ${manuscript.title}${manuscript.genre ? ` (${manuscript.genre})` : ''}${manuscript.current_word_count ? `, ~${manuscript.current_word_count.toLocaleString()} words` : ''}

The opening pages:
"""
${opening}
"""

Two halves, and the first matters more.

RESEARCH — this is the part their marketer cannot do in ten minutes, so make it specific and defensible:
- Positioning: what this book is, who it is for, and why it lands now. No genre boilerplate.
- Comparable titles: four real, published books whose readers would buy this one. Name why each one matches — voice, preoccupation, structure, not just category. Do not invent titles.
- Keyword metadata: terms and categories a retailer listing should carry. Mark each as a BISAC-style category, a search term, or a retailer browse category.

DRAFTS — a starting point in the book's own voice, which their copywriter will rewrite:
${DRAFT_SPEC.map(d => `- ${d.label}: ${d.brief}`).join('\n')}

Never claim awards, reviews, sales or endorsements. No stock phrases ("a gripping tale", "in a world where"). No spoilers past the first act. Write in the book's register, not a marketing register.

Return through the save_asset_pack tool.`

  let pack: AssetPack
  try {
    const anthropic = new Anthropic({ apiKey })
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      tools: [{
        name: 'save_asset_pack',
        description: 'Save the per-title asset pack.',
        input_schema: {
          type: 'object',
          properties: {
            positioning: {
              type: 'object',
              properties: {
                statement: { type: 'string', description: 'What this book is, in one or two sentences.' },
                audience: { type: 'string', description: 'Who buys it, specifically.' },
                whyNow: { type: 'string', description: 'Why it lands in this market at this moment.' },
              },
              required: ['statement', 'audience', 'whyNow'],
            },
            comps: {
              type: 'array',
              description: 'Four real published books whose readers would buy this one.',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  author: { type: 'string' },
                  publisher: { type: 'string' },
                  why: { type: 'string', description: 'What specifically matches — voice, preoccupation, structure.' },
                },
                required: ['title', 'author', 'why'],
              },
            },
            keywords: {
              type: 'array',
              description: 'Terms and categories for a retailer listing.',
              items: {
                type: 'object',
                properties: {
                  term: { type: 'string' },
                  kind: { type: 'string', description: 'bisac | search | browse' },
                  note: { type: 'string' },
                },
                required: ['term', 'kind'],
              },
            },
            drafts: {
              type: 'object',
              description: 'Prose drafts. Text only — the draft marking is applied by the engine, not by you.',
              properties: Object.fromEntries(
                DRAFT_SPEC.map(d => [d.key, { type: 'string', description: d.brief }]),
              ),
              required: DRAFT_SPEC.map(d => d.key),
            },
          },
          required: ['positioning', 'comps', 'keywords', 'drafts'],
        },
      }],
      tool_choice: { type: 'tool', name: 'save_asset_pack' },
      messages: [{ role: 'user', content: prompt }],
    })

    const block = res.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    )
    if (!block) throw new Error('model did not return the structured result')

    const parsed = block.input as {
      positioning?: PackPositioning
      comps?: PackComp[]
      keywords?: PackKeyword[]
      drafts?: Record<string, string>
    }
    if (!parsed.positioning?.statement) throw new Error('model reply missing positioning')

    // THE MARK IS APPLIED HERE, not by the model and not by the surface.
    // Generation cannot produce an unmarked artefact, because the text and
    // the marking are assembled in different places.
    const drafts: Record<string, DraftArtefact> = {}
    for (const spec of DRAFT_SPEC) {
      const text = parsed.drafts?.[spec.key]
      if (!text) continue
      drafts[spec.key] = { text: String(text), status: 'draft', preparedBy: PREPARED_BY }
    }

    pack = {
      positioning: parsed.positioning,
      comps: Array.isArray(parsed.comps) ? parsed.comps.slice(0, 6) : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 20) : [],
      drafts,
      generatedAt: new Date().toISOString(),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'generation failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const { error: saveError } = await supabase
    .from('title_asset_packs')
    .upsert(
      { manuscript_id: id, pack, generated_at: pack.generatedAt, updated_at: new Date().toISOString() },
      { onConflict: 'manuscript_id' },
    )
  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 })
  }

  return NextResponse.json({ pack })
}
