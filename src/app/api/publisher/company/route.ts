import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import {
  resolvePublisherIdentity,
  publisherIdentityRefusal,
  type PublisherIdentity,
} from '@/lib/publisher/identity'

// GET /api/publisher/company
//
// TENANCY COMES FROM THE CALLER (2026-09-30). This took `?org=<slug>` when it
// was written, because there was no caller identity to read. There is now, and
// the Lobby's conversion note carries the full reasoning: a tenancy key that
// arrives in a request is a tenancy key the client can change.
//
// House documents are ORG-WIDE and not imprint-scoped, so unlike the Lobby
// there is no imprint filter here — every seat in the house reads the same
// style sheet. That is a property of the documents, not an omission: a house
// style that differed by imprint would be four style sheets, and the kind
// vocabulary does not carry an imprint.
//
// THE HOUSE DOCUMENTS — a publisher's own standards, held as a record.
//
// Build brief item ①. The most distinctive claim in the repositioned product:
// when copy editing enforces a house style sheet, "shaped to your house" stops
// being a promise and becomes something a publisher can check in the first
// chapter.
//
// ─── THE VOCABULARY IS THE DATABASE'S ────────────────────────────────────────
// Read from `pg_constraint` on 2026-09-30, not from the courier that announced
// the table:
//
//   house_documents.kind IN
//     ('style_sheet','design_principles','editorial_policy','submission_spec')
//   CHECK (body IS NOT NULL OR storage_path IS NOT NULL)
//
// A vocabulary with no constraint cannot be a contract; these have one, so
// this file breaks loudly if it moves. The lane learned that the hard way when
// a hardcoded phase→editor map returned a zero that meant "no match" and was
// indistinguishable from "no work done".
//
// ─── CURRENT IS max(seq), NEVER max(created_at) ──────────────────────────────
// `created_at` here defaults to `clock_timestamp()` rather than `now()`, which
// is `sysadmin` fixing at the source the defect that bit my own target-date
// DDL: `now()` is TRANSACTION time, so two versions written in one transaction
// tie and "the latest row" stops being a single row. Ordering is on `seq`
// regardless, because the ordering should not depend on which clock was used.
//
// ─── WHAT THIS ROUTE DOES NOT DO ─────────────────────────────────────────────
// It does not enforce anything. Style-sheet enforcement inside copy editing is
// `astudio`'s and is explicitly not mine (brief §3). This surface holds the
// document, its history, and which stations it governs. Saying a document
// GOVERNS a station is a claim about our pipeline; saying it is ENFORCED there
// would be a claim about a build that is not mine and does not yet exist.

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export const DOCUMENT_KINDS = [
  'style_sheet',
  'design_principles',
  'editorial_policy',
  'submission_spec',
] as const
export type DocumentKind = (typeof DOCUMENT_KINDS)[number]

/**
 * WHICH STATIONS EACH DOCUMENT GOVERNS.
 *
 * Brief §1①: "show which editorial stations each document governs". These are
 * statements about where a document WOULD apply on our line — not claims that
 * enforcement is wired. The surface says so in as many words, because a list
 * of stations beside a document reads as a promise that it is being obeyed.
 */
const GOVERNS: Record<DocumentKind, string[]> = {
  style_sheet: ['Copy edit'],
  design_principles: ['Publishing prep'],
  editorial_policy: ['Developmental edit', 'Line edit'],
  submission_spec: ['Manuscript'],
}

const KIND_LABEL: Record<DocumentKind, string> = {
  style_sheet: 'House style sheet',
  design_principles: 'Design principles',
  editorial_policy: 'Editorial policy',
  submission_spec: 'Submission spec',
}

const KIND_BLURB: Record<DocumentKind, string> = {
  style_sheet:
    'Your spellings, punctuation and house exceptions — the rules a copy editor works to.',
  design_principles:
    'How your books look: typography, cover conventions, what your imprints do and do not do.',
  editorial_policy:
    'What a structural or line pass should and should not change in one of your authors.',
  submission_spec:
    'The shape a manuscript must arrive in before it enters the line.',
}

interface Version {
  id: string
  seq: number
  title: string
  hasBody: boolean
  hasFile: boolean
  setByLabel: string
  note: string | null
  createdAt: string
}

export interface CompanyDocument {
  kind: DocumentKind
  label: string
  blurb: string
  governs: string[]
  /** The version in force, or null where the house has not supplied one. */
  current: (Version & { body: string | null }) | null
  /** Every earlier version, newest first. Never edited, never removed. */
  history: Version[]
}

export async function GET() {
  // identity.ts no longer THROWS on multi-org and no longer conflates a read
  // failure with "no seat" (identity-billing, 2026-10-01, on publisher's §5
  // catch). The three cases are mapped in ONE place --
  // publisherIdentityRefusal() -- so no route can answer 403 to a database
  // hiccup. The 409 for multi_org is preserved exactly as this route had it.
  const resolved = await resolvePublisherIdentity()
  if (resolved.status !== 'ok') {
    const r = publisherIdentityRefusal(resolved)
    return NextResponse.json(r.body, { status: r.status })
  }
  const identity: PublisherIdentity = resolved.identity

  const org = identity.organisation

  try {

    const { data: rows, error: docErr } = await supabaseAdmin
      .from('house_documents')
      .select('id, kind, title, body, storage_path, set_by_label, note, seq, created_at')
      .eq('organisation_id', org.id)
      .order('seq', { ascending: false })

    if (docErr) {
      // The table not being there is a different fact from the house having
      // supplied nothing, and a surface that conflates them tells a publisher
      // their documents are missing when the feature is.
      if (docErr.code === '42P01') {
        return NextResponse.json({
          available: false,
          reason: 'house_documents_not_applied',
          organisation: { name: org.name, slug: org.slug },
        })
      }
      throw docErr
    }

    type Row = {
      id: string
      kind: string
      title: string
      body: string | null
      storage_path: string | null
      set_by_label: string
      note: string | null
      seq: number
      created_at: string
    }

    const toVersion = (r: Row): Version => ({
      id: r.id,
      seq: r.seq,
      title: r.title,
      hasBody: r.body !== null,
      hasFile: r.storage_path !== null,
      setByLabel: r.set_by_label,
      note: r.note,
      createdAt: r.created_at,
    })

    const documents: CompanyDocument[] = DOCUMENT_KINDS.map((kind) => {
      // Rows arrive seq-descending, so the first of a kind is the one in force.
      const ofKind = ((rows ?? []) as Row[]).filter((r) => r.kind === kind)
      const [currentRow, ...earlier] = ofKind
      return {
        kind,
        label: KIND_LABEL[kind],
        blurb: KIND_BLURB[kind],
        governs: GOVERNS[kind],
        current: currentRow
          ? { ...toVersion(currentRow), body: currentRow.body }
          : null,
        history: earlier.map(toVersion),
      }
    })

    return NextResponse.json({
      authorised: true,
      scope: 'caller-membership',
      organisation: { name: org.name, slug: org.slug },
      viewer: {
        orgRole: identity.org_role,
        scopeIsWholeOrg: identity.scope_is_whole_org,
      },
      documents,
      /** Stated in the payload, not left to the renderer — a caveat that lives
       *  only in a surface is one refactor from being dropped. */
      enforcement_disclosure:
        'These documents are held and versioned here. Enforcing them inside the editorial stations is in build.',
    })
  } catch (err) {
    console.error('[publisher/company] failed:', err)
    return NextResponse.json({ error: 'company_failed' }, { status: 500 })
  }
}
