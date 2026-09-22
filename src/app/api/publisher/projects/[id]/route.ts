import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET /api/publisher/projects/[id]
//
// Returns one manuscript in a publisher-appropriate shape for the portal
// project page (/publisher/[projectId]). Bypasses RLS via the service role
// so a publisher in a different browser session can read.
//
// See /api/publisher/projects/route.ts for the auth posture, house pattern
// reference, and explicit-exclusion list. Same rules apply here — no
// chapter text, no editor notes, no account PII beyond first/last name.
//
// Additional fields returned vs the list endpoint:
//   - phase states for all 5 editing phases (so the portal can render
//     "developmental edit complete", "line edit in progress", etc.)

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

interface PhaseState {
  phase_number: number
  phase_status: string | null
  editor_name: string | null
}

interface PublisherProject {
  id: string
  title: string
  genre: string | null
  current_word_count: number | null
  current_phase_number: number | null
  status: string | null
  updated_at: string
  author: {
    first_name: string | null
    last_name: string | null
  }
  cover_url: string | null
  phases: PhaseState[]
}

interface ManuscriptRow {
  id: string
  title: string | null
  genre: string | null
  current_word_count: number | null
  current_phase_number: number | null
  status: string | null
  updated_at: string
  author_profiles: {
    first_name: string | null
    last_name: string | null
  } | null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { data: manuscript, error: msError } = await supabaseAdmin
      .from('manuscripts')
      .select(
        `
          id,
          title,
          genre,
          current_word_count,
          current_phase_number,
          status,
          updated_at,
          author_profiles!inner (
            first_name,
            last_name
          )
        `
      )
      .eq('id', id)
      .maybeSingle<ManuscriptRow>()

    if (msError) {
      console.error(`publisher/projects/${id}: read failed:`, msError)
      return NextResponse.json({ error: 'read_failed' }, { status: 500 })
    }

    if (!manuscript) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    // Best-effort cover URL — degrades to null on failure.
    const { data: progressRow } = await supabaseAdmin
      .from('publishing_progress')
      .select('selected_cover_url')
      .eq('manuscript_id', id)
      .maybeSingle()

    // Phase states across all 5 phases. If some phases don't exist as rows
    // yet, the array will be shorter — the frontend can render "not started"
    // for missing entries.
    const { data: phaseRows } = await supabaseAdmin
      .from('editing_phases')
      .select('phase_number, phase_status, editor_name')
      .eq('manuscript_id', id)
      .order('phase_number', { ascending: true })

    const project: PublisherProject = {
      id: manuscript.id,
      title: manuscript.title ?? 'Untitled project',
      genre: manuscript.genre,
      current_word_count: manuscript.current_word_count,
      current_phase_number: manuscript.current_phase_number,
      status: manuscript.status,
      updated_at: manuscript.updated_at,
      author: {
        first_name: manuscript.author_profiles?.first_name ?? null,
        last_name: manuscript.author_profiles?.last_name ?? null,
      },
      cover_url: progressRow?.selected_cover_url ?? null,
      phases: (phaseRows ?? []).map(p => ({
        phase_number: p.phase_number,
        phase_status: p.phase_status,
        editor_name: p.editor_name,
      })),
    }

    return NextResponse.json({ project })
  } catch (err) {
    console.error(`publisher/projects/${id}: unexpected error:`, err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
