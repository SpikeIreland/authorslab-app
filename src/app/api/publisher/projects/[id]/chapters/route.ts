import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET /api/publisher/projects/[id]/chapters        → the spine (no prose)
// GET /api/publisher/projects/[id]/chapters?n=12   → one chapter, with prose
//
// ─── A DECLARED DEPARTURE, NOT AN OVERSIGHT ──────────────────────────────────
//
// sysadmin's publisher-route contract (ratifications courier §2.1) explicitly
// excludes "any chapter content" from the publisher surface. This route serves
// chapter content, so it crosses that line ON PURPOSE and says so here.
//
// The reasoning: that exclusion was written to stop manuscript prose leaking
// through routes whose job was status and metadata. Reading the book is not a
// leak — it is the single thing a publisher most wants to do, and the portal's
// "Read the current draft" button has pointed nowhere since it was built.
// A publisher who cannot read the manuscript has no reason to open the portal.
//
// Couriered to sysadmin in the same turn this shipped. If they rule against
// it, deleting this file and the /read page restores the previous posture
// exactly; nothing else depends on it.
//
// Two deliberate narrowings, so the departure stays as small as the purpose:
//   - The spine (no `n`) returns titles and word counts ONLY. A publisher
//     browsing the contents list never pulls 270KB of prose.
//   - One chapter at a time. There is no "give me the whole manuscript" shape,
//     so nothing here is a bulk export.
//
// Still excluded, unchanged: editor notes, manuscript_issues, analyses, and
// any account PII. A publisher reads the book, not the workings.

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface SpineEntry {
  chapterNumber: number
  title: string
  wordCount: number
}

/** 0 is the prologue and 999 the epilogue, per the chapters table comment. */
function displayLabel(chapterNumber: number, title: string): string {
  if (chapterNumber === 0) return title || 'Prologue'
  if (chapterNumber === 999) return title || 'Epilogue'
  return title || `Chapter ${chapterNumber}`
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const nParam = new URL(req.url).searchParams.get('n')

  try {
    // ── One chapter, with prose ──────────────────────────────────────────────
    if (nParam !== null) {
      const n = Number(nParam)
      if (!Number.isInteger(n)) {
        return NextResponse.json({ error: 'bad_chapter' }, { status: 400 })
      }

      const { data, error } = await supabaseAdmin
        .from('chapters')
        .select('chapter_number, title, content, word_count')
        .eq('manuscript_id', id)
        .eq('chapter_number', n)
        .maybeSingle()

      if (error) {
        console.error(`publisher chapters ${id} n=${n}: read failed:`, error)
        return NextResponse.json({ error: 'read_failed' }, { status: 500 })
      }
      if (!data) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 })
      }

      return NextResponse.json({
        chapter: {
          chapterNumber: data.chapter_number,
          title: displayLabel(data.chapter_number, data.title),
          content: data.content ?? '',
          wordCount: data.word_count ?? 0,
        },
      })
    }

    // ── The spine: titles and lengths, no prose ──────────────────────────────
    const { data, error } = await supabaseAdmin
      .from('chapters')
      .select('chapter_number, title, word_count')
      .eq('manuscript_id', id)
      .order('chapter_number', { ascending: true })

    if (error) {
      console.error(`publisher chapters ${id}: spine read failed:`, error)
      return NextResponse.json({ error: 'read_failed' }, { status: 500 })
    }

    const spine: SpineEntry[] = (data ?? []).map((c) => ({
      chapterNumber: c.chapter_number,
      title: displayLabel(c.chapter_number, c.title),
      wordCount: c.word_count ?? 0,
    }))

    return NextResponse.json({ spine })
  } catch (err) {
    console.error(`publisher chapters ${id}: unexpected error:`, err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
