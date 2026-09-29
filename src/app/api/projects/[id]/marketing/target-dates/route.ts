import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// The two target dates for a book, read-only.
//
// `title_target_dates` is an append-only event table — a date that gets
// revised keeps its history, because "it has moved three times" is the fact a
// publisher asks for by month two. The CURRENT date of each kind is therefore
// the most recent row, not the only row.
//
// Marketing never writes here. Dates are set through publisher's server route;
// this lane reads them and schedules against them. That is the replace-then-
// drop sequence publisher ruled: we re-anchor onto this, and only then does
// project_marketing.launch_date go.
//
// Guard rule, verbatim from publisher: a NULL target date must read
// "no date set", NEVER "on time". Null here means null in the UI.

export interface TargetDatesResponse {
  handoff: string | null
  publication: string | null
  handoffSetBy: string | null
  publicationSetBy: string | null
  revisions: { handoff: number; publication: number }
}

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

  // Ordered newest-first; RLS (can_read_manuscript) scopes it.
  const { data, error } = await supabase
    .from('title_target_dates')
    .select('kind, target_date, set_by_label, created_at')
    .eq('manuscript_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = data ?? []
  const currentOf = (kind: string) => rows.find(r => r.kind === kind) ?? null
  const handoff = currentOf('handoff')
  const publication = currentOf('publication')

  const body: TargetDatesResponse = {
    handoff: (handoff?.target_date as string) ?? null,
    publication: (publication?.target_date as string) ?? null,
    handoffSetBy: (handoff?.set_by_label as string) ?? null,
    publicationSetBy: (publication?.set_by_label as string) ?? null,
    revisions: {
      handoff: rows.filter(r => r.kind === 'handoff').length,
      publication: rows.filter(r => r.kind === 'publication').length,
    },
  }

  return NextResponse.json(body)
}
