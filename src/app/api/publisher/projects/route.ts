import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET /api/publisher/projects
//
// Returns manuscripts in a publisher-appropriate shape for the Publisher's
// Journey home list. Bypasses RLS via the service role so a publisher
// (in a different browser session, not signed in as the author) can read.
//
// House pattern: mirrors src/app/api/admin/create-user/route.ts which is the
// established service-role reader in this codebase.
//
// Auth posture: OPEN for the 2026-09-24 Blair demo (ratified by Paul via
// sysadmin-ratifications-and-rulings-2026-09-22). When identity-billing
// lands publisher accounts post-demo, the auth gate goes here and in
// /api/publisher/projects/[id]/route.ts — nowhere else in the surface.
//
// Publisher-appropriate fields only. Explicitly excluded:
//   - manuscripts.full_text (chapter text belongs to the author's studio)
//   - editor notes / analyses / any editorial content
//   - author email or any account-level PII beyond first/last name
//
// The publisher chat may consume this or build a mock list from a typed
// constant per their 2026-09-22 demo journey spec §5. Either works; the
// route is here so the two-browser story is possible either way.

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

interface PublisherProjectSummary {
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
}

interface ManuscriptRow {
  id: string
  title: string | null
  genre: string | null
  current_word_count: number | null
  current_phase_number: number | null
  status: string | null
  updated_at: string
  author_id: string
  author_profiles: {
    first_name: string | null
    last_name: string | null
  } | null
}

export async function GET() {
  try {
    // Manuscripts + author name in one query. Inner join on author_profiles
    // so we don't return orphans (a manuscript without an author record is
    // a data-integrity issue the publisher home shouldn't paper over).
    const { data: manuscripts, error: msError } = await supabaseAdmin
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
          author_id,
          author_profiles!inner (
            first_name,
            last_name
          )
        `
      )
      .order('updated_at', { ascending: false })
      .returns<ManuscriptRow[]>()

    if (msError) {
      console.error('publisher/projects: manuscripts read failed:', msError)
      return NextResponse.json({ error: 'read_failed' }, { status: 500 })
    }

    if (!manuscripts || manuscripts.length === 0) {
      return NextResponse.json({ projects: [] })
    }

    // Best-effort cover URL from publishing_progress. Failure here degrades
    // to null covers rather than blocking the list.
    const ids = manuscripts.map(m => m.id)
    const { data: progress } = await supabaseAdmin
      .from('publishing_progress')
      .select('manuscript_id, selected_cover_url')
      .in('manuscript_id', ids)

    const coverByManuscript = new Map<string, string | null>()
    for (const row of progress ?? []) {
      coverByManuscript.set(row.manuscript_id, row.selected_cover_url ?? null)
    }

    const projects: PublisherProjectSummary[] = manuscripts.map(m => ({
      id: m.id,
      title: m.title ?? 'Untitled project',
      genre: m.genre,
      current_word_count: m.current_word_count,
      current_phase_number: m.current_phase_number,
      status: m.status,
      updated_at: m.updated_at,
      author: {
        first_name: m.author_profiles?.first_name ?? null,
        last_name: m.author_profiles?.last_name ?? null,
      },
      cover_url: coverByManuscript.get(m.id) ?? null,
    }))

    return NextResponse.json({ projects })
  } catch (err) {
    console.error('publisher/projects: unexpected error:', err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
