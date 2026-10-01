import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'

// Author-side artwork upload — TDP-DT-01 pathway 2 / TDP-DT-03 §1.3.
// Writes the collision-proof namespace `<manuscript>/upload-<uuid>.<ext>`
// (contract V1 revision: generation can never clobber uploads). This is the
// AUTHOR route, behind the author's own session + RLS; publisher intake is
// the separate, membership-gated engine at
// /api/publisher/projects/[id]/covers/intake (2026-10-01).
//
// origin='supplied' since the 2026-09-30 schema delta: an upload is a human's
// work whoever the human is, and the supplied_has_supplier constraint asks
// for the person's name — here, the author's own.

const MAX_BYTES = 20 * 1024 * 1024
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
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
    .select('id, first_name, last_name')
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
  const file = form?.get('file')
  const rightsConfirmed = form?.get('rightsConfirmed') === 'true'
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'missing file' }, { status: 400 })
  }
  if (!rightsConfirmed) {
    return NextResponse.json({ error: 'rights_not_confirmed' }, { status: 400 })
  }
  const ext = ALLOWED[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'unsupported type (jpeg, png, webp only)' }, { status: 415 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'file too large (20MB max)' }, { status: 413 })
  }

  const suppliedByLabel =
    [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() ||
    user.email ||
    'Author'

  const assetId = randomUUID()
  const storagePath = `${id}/upload-${assetId}.${ext}`
  const bytes = new Uint8Array(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('cover-assets')
    .upload(storagePath, bytes, { contentType: file.type, upsert: false })
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: row, error: insertError } = await supabase
    .from('cover_assets')
    .insert({
      id: assetId,
      manuscript_id: id,
      kind: 'uploaded',
      origin: 'supplied',
      supplied_by_label: suppliedByLabel,
      storage_path: storagePath,
      rights_confirmed: true,
      source: { original_filename: file.name, mime: file.type, bytes: file.size },
      created_by: user.id,
    })
    .select('id, storage_path')
    .single()
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  const { data: signed } = await supabase.storage
    .from('cover-assets')
    .createSignedUrl(storagePath, 60 * 60 * 12)

  return NextResponse.json({
    asset: { id: row.id, storagePath: row.storage_path, url: signed?.signedUrl ?? null, kind: 'uploaded' },
  })
}
