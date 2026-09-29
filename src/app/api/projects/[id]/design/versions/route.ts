import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'

// Saved cover versions — immutable snapshots (TDP-DT-01; retention unlimited
// per Paul's July ruling). The composed export is rendered client-side by the
// studio's deterministic compositor and uploaded here as JPEG.
//
// Selection writes manuscripts.selected_cover_version_id (the July schema's
// own column). Deliberately NOT touched: publishing_progress.selected_cover_url
// and its readers — that stays on contract V1 until the V2 courier lands.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const [{ data, error }, { data: ms }] = await Promise.all([
    supabase
      .from('cover_versions')
      .select('id, label, export_path, created_at')
      .eq('manuscript_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('manuscripts')
      .select('selected_cover_version_id')
      .eq('id', id)
      .maybeSingle(),
  ])
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const versions = await Promise.all(
    (data ?? []).map(async v => {
      const { data: signed } = v.export_path
        ? await supabase.storage.from('cover-assets').createSignedUrl(v.export_path, 60 * 60 * 12)
        : { data: null }
      return { id: v.id, label: v.label, createdAt: v.created_at, url: signed?.signedUrl ?? null }
    })
  )

  return NextResponse.json({
    versions,
    selectedVersionId: (ms as { selected_cover_version_id?: string | null } | null)?.selected_cover_version_id ?? null,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('author_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) {
    return NextResponse.json({ error: 'no_profile' }, { status: 401 })
  }
  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('id', id)
    .eq('author_id', profile.id)
    .single()
  if (!manuscript) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }

  const form = await req.formData().catch(() => null)
  const file = form?.get('export')
  const docRaw = form?.get('doc')
  const label = typeof form?.get('label') === 'string' ? String(form.get('label')).slice(0, 120) : null
  const select = form?.get('select') === 'true'

  if (!(file instanceof File) || file.type !== 'image/jpeg') {
    return NextResponse.json({ error: 'missing jpeg export' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'export too large' }, { status: 413 })
  }
  let doc: unknown = null
  try {
    doc = typeof docRaw === 'string' ? JSON.parse(docRaw) : null
  } catch { /* fallthrough */ }
  if (!doc || typeof doc !== 'object') {
    return NextResponse.json({ error: 'missing doc' }, { status: 400 })
  }

  const versionId = randomUUID()
  const exportPath = `${id}/versions/${versionId}.jpg`
  const bytes = new Uint8Array(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('cover-assets')
    .upload(exportPath, bytes, { contentType: 'image/jpeg', upsert: false })
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { error: insertError } = await supabase
    .from('cover_versions')
    .insert({
      id: versionId,
      manuscript_id: id,
      doc,
      export_path: exportPath,
      label,
      created_by: user.id,
    })
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  if (select) {
    const { error: selectError } = await supabase
      .from('manuscripts')
      .update({ selected_cover_version_id: versionId })
      .eq('id', id)
    if (selectError) {
      return NextResponse.json({ error: selectError.message, versionId }, { status: 500 })
    }
  }

  const { data: signed } = await supabase.storage
    .from('cover-assets')
    .createSignedUrl(exportPath, 60 * 60 * 12)

  return NextResponse.json({
    version: { id: versionId, label, url: signed?.signedUrl ?? null },
    selected: select,
  })
}
