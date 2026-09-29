'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  TRIM_SIZES, type TrimSize, type Paper, type Binding,
  estimatePages, jacketGeometry, inches,
} from '@/lib/jacket'

// ============================================================================
// The Jacket Studio — TDP-DT-03 v0.1
// One flat sheet: [fold wrap][back][spine][front][fold wrap] + bleed.
// Text layers are zone-anchored (dx/dy in inches from their zone's top-left),
// so spine re-flow from page-count changes never scatters the layout.
// ============================================================================

interface CoverAsset {
  id: string
  kind: string
  layout: 'front' | 'wraparound'
  url: string | null
  coverIndex: number | null
}

type ZoneId = 'back' | 'spine' | 'front'

interface TextLayer {
  id: string
  role: 'title' | 'subtitle' | 'author' | 'publisher' | 'spine-text' | 'back-text' | 'custom'
  text: string
  zone: ZoneId
  dx: number      // inches from zone left
  dy: number      // inches from zone top
  size: number    // px at 1x scale (≈ pt feel)
  family: 'serif' | 'sans'
  weight: 500 | 700
  color: string
  rotated?: boolean
  align?: 'left' | 'center'
  maxWidthIn?: number
}

interface JacketDoc {
  v: 1
  trimId: string
  paper: Paper
  binding: Binding
  pages: number
  pagesOverridden: boolean
  artworkAssetId: string | null
  layers: TextLayer[]
}

const FAMILIES = { serif: 'Georgia, "Times New Roman", serif', sans: 'system-ui, -apple-system, sans-serif' }
const SWATCHES = ['#FAF8F4', '#2C2C2A', '#BC9440', '#5C7A6B', '#8E4A72', '#84500E']

function seedLayers(title: string, author: string, trim: TrimSize): TextLayer[] {
  const cx = trim.width / 2
  return [
    { id: 'l-title', role: 'title', text: title, zone: 'front', dx: cx, dy: trim.height * 0.16, size: 34, family: 'serif', weight: 700, color: '#FAF8F4', align: 'center', maxWidthIn: trim.width * 0.84 },
    { id: 'l-author', role: 'author', text: author, zone: 'front', dx: cx, dy: trim.height * 0.82, size: 16, family: 'sans', weight: 500, color: '#FAF8F4', align: 'center' },
    { id: 'l-publisher', role: 'publisher', text: 'AuthorsLab', zone: 'front', dx: cx, dy: trim.height * 0.93, size: 10, family: 'sans', weight: 500, color: '#FAF8F4', align: 'center' },
    { id: 'l-spine', role: 'spine-text', text: `${title}  ·  ${author}`, zone: 'spine', dx: 0.5, dy: trim.height * 0.5, size: 12, family: 'serif', weight: 500, color: '#FAF8F4', rotated: true, align: 'center' },
    { id: 'l-back', role: 'back-text', text: 'Your back-cover description goes here — a few sentences that make a browser turn to page one.', zone: 'back', dx: cx, dy: trim.height * 0.22, size: 11, family: 'serif', weight: 500, color: '#FAF8F4', align: 'center', maxWidthIn: trim.width * 0.72 },
  ]
}

export default function JacketStudioPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const projectId = params.id

  const [assets, setAssets] = useState<CoverAsset[]>([])
  const [project, setProject] = useState({ title: 'Untitled', authorName: 'Author Name', wordCount: null as number | null })
  const [doc, setDoc] = useState<JacketDoc | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [rightsOk, setRightsOk] = useState(false)
  const [loading, setLoading] = useState(true)
  const [versions, setVersions] = useState<Array<{ id: string; label: string | null; createdAt: string; url: string | null }>>([])
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [exporting, setExporting] = useState<null | 'version' | 'select'>(null)
  const [exportMsg, setExportMsg] = useState<string | null>(null)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ layerId: string; startX: number; startY: number; origDx: number; origDy: number; origZone: ZoneId } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // ---- Load assets + project + draft --------------------------------------
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [assetsRes, draftRes, versionsRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/design/assets`),
          fetch(`/api/projects/${projectId}/design/draft`),
          fetch(`/api/projects/${projectId}/design/versions`),
        ])
        if (versionsRes.ok) {
          const j = await versionsRes.json() as { versions: Array<{ id: string; label: string | null; createdAt: string; url: string | null }>; selectedVersionId: string | null }
          if (!cancelled) { setVersions(j.versions); setSelectedVersionId(j.selectedVersionId) }
        }
        let meta = { title: 'Untitled', authorName: 'Author Name', wordCount: null as number | null }
        let assetList: CoverAsset[] = []
        if (assetsRes.ok) {
          const j = await assetsRes.json() as { assets: CoverAsset[]; project?: { title: string; authorName: string; wordCount: number | null } }
          assetList = j.assets
          if (j.project) meta = { title: j.project.title, authorName: j.project.authorName, wordCount: j.project.wordCount }
        }
        let loadedDoc: JacketDoc | null = null
        if (draftRes.ok) {
          const j = await draftRes.json() as { doc: JacketDoc | null }
          if (j.doc && j.doc.v === 1 && Array.isArray(j.doc.layers)) loadedDoc = j.doc
        }
        if (cancelled) return
        setAssets(assetList)
        setProject(meta)
        if (loadedDoc) {
          setDoc(loadedDoc)
        } else {
          const trim = TRIM_SIZES[0]
          const wrap = assetList.filter(a => a.layout === 'wraparound').pop()
          const front = assetList.filter(a => a.layout !== 'wraparound').pop()
          setDoc({
            v: 1,
            trimId: trim.id,
            paper: 'cream',
            binding: 'hardcover',
            pages: estimatePages(meta.wordCount),
            pagesOverridden: false,
            artworkAssetId: (wrap ?? front)?.id ?? null,
            layers: seedLayers(meta.title, meta.authorName, trim),
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [projectId])

  // ---- Autosave (debounced) ----------------------------------------------
  const scheduleSave = useCallback((next: JacketDoc) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveState('saving')
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/design/draft`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doc: next }),
        })
        setSaveState(res.ok ? 'saved' : 'error')
      } catch {
        setSaveState('error')
      }
    }, 1200)
  }, [projectId])

  const update = useCallback((mutate: (d: JacketDoc) => JacketDoc) => {
    setDoc(prev => {
      if (!prev) return prev
      const next = mutate(prev)
      scheduleSave(next)
      return next
    })
  }, [scheduleSave])

  // ---- Geometry -----------------------------------------------------------
  const trim = TRIM_SIZES.find(t => t.id === doc?.trimId) ?? TRIM_SIZES[0]
  const geo = useMemo(
    () => doc ? jacketGeometry({ trim, pages: doc.pages, paper: doc.paper, binding: doc.binding }) : null,
    [doc, trim]
  )
  // Fit the sheet to ~860px working width.
  const scale = geo ? Math.min(52, 860 / geo.sheetWidth) : 48

  const artwork = assets.find(a => a.id === doc?.artworkAssetId) ?? null
  const selectedLayer = doc?.layers.find(l => l.id === selected) ?? null

  // ---- Dragging -----------------------------------------------------------
  const onLayerPointerDown = useCallback((e: React.PointerEvent, layer: TextLayer) => {
    e.preventDefault()
    e.stopPropagation()
    setSelected(layer.id)
    dragRef.current = { layerId: layer.id, startX: e.clientX, startY: e.clientY, origDx: layer.dx, origDy: layer.dy, origZone: layer.zone }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || !geo || !doc) return
    const dxIn = (e.clientX - drag.startX) / scale
    const dyIn = (e.clientY - drag.startY) / scale
    update(d => ({
      ...d,
      layers: d.layers.map(l => {
        if (l.id !== drag.layerId) return l
        // Absolute position on the visible sheet (from the zone the drag began in).
        const origZone = geo.zones.find(z => z.id === drag.origZone)!
        let absX = origZone.x + drag.origDx + dxIn
        let absY = drag.origDy + dyIn
        // Re-anchor to whichever visible zone now contains absX.
        const visible = geo.zones.filter(z => !z.hidden)
        const target = visible.find(z => absX >= z.x && absX < z.x + z.width) ?? origZone
        absX = Math.max(visible[0].x, Math.min(absX, visible[visible.length - 1].x + visible[visible.length - 1].width))
        absY = Math.max(0, Math.min(absY, trim.height))
        return { ...l, zone: target.id as ZoneId, dx: absX - target.x, dy: absY }
      }),
    }))
  }, [geo, doc, scale, trim.height, update])

  const onPointerUp = useCallback(() => { dragRef.current = null }, [])

  // ---- Upload -------------------------------------------------------------
  const onUpload = useCallback(async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('rightsConfirmed', String(rightsOk))
      const res = await fetch(`/api/projects/${projectId}/design/upload`, { method: 'POST', body: form })
      const j = await res.json().catch(() => ({})) as { asset?: { id: string; url: string | null }; error?: string }
      if (!res.ok || !j.asset) throw new Error(j.error || `upload failed (${res.status})`)
      const added: CoverAsset = { id: j.asset.id, kind: 'uploaded', layout: 'front', url: j.asset.url, coverIndex: null }
      setAssets(prev => [...prev, added])
      update(d => ({ ...d, artworkAssetId: added.id }))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [projectId, rightsOk, update])

  // ---- Export: deterministic front-cover compositor (TDP-DT-03 v0.2) -----
  // Renders the FRONT trim zone at width 1600 (Amazon's recommended width;
  // height follows the trim ratio) — artwork crop + text layers, no DOM.
  const renderFrontExport = useCallback(async (): Promise<Blob> => {
    if (!doc || !geo) throw new Error('no document')
    const front = geo.zones.find(z => z.id === 'front')!
    const visible = geo.zones.filter(z => !z.hidden)
    const visLeft = visible[0].x
    const visWidth = visible.reduce((s, z) => s + z.width, 0)
    const ppi = 1600 / trim.width
    const W = 1600
    const H = Math.round(trim.height * ppi)
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas unavailable')

    ctx.fillStyle = '#2C2C2A'
    ctx.fillRect(0, 0, W, H)

    if (artwork?.url) {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image()
        el.crossOrigin = 'anonymous'
        el.onload = () => resolve(el)
        el.onerror = () => reject(new Error('artwork failed to load'))
        el.src = artwork.url!
      })
      if (artwork.layout === 'wraparound') {
        // Cover-fit the art onto the full visible sheet, then let the canvas
        // window (the front zone) crop it — same geometry as the on-screen view.
        const artW = visWidth * ppi
        const artH = geo.sheetHeight * ppi
        const s = Math.max(artW / img.width, artH / img.height)
        const dx = (front.x - visLeft) * -ppi + (artW - img.width * s) / 2
        const topOffset = (geo.fold || geo.bleed) * ppi
        const dy = -topOffset + (artH - img.height * s) / 2
        ctx.drawImage(img, dx, dy, img.width * s, img.height * s)
      } else {
        const s = Math.max(W / img.width, H / img.height)
        ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s)
      }
    }

    // Text layers on the front zone. Display font size l.size ≈ px at 48px/in.
    const wrapText = (text: string, maxPx: number, font: string): string[] => {
      ctx.font = font
      const words = text.split(/\s+/)
      const lines: string[] = []
      let line = ''
      for (const w of words) {
        const probe = line ? `${line} ${w}` : w
        if (ctx.measureText(probe).width > maxPx && line) { lines.push(line); line = w } else { line = probe }
      }
      if (line) lines.push(line)
      return lines
    }
    for (const l of doc.layers.filter(l => l.zone === 'front' && !l.rotated)) {
      const sizePx = (l.size / 48) * ppi
      const font = `${l.weight} ${sizePx}px ${FAMILIES[l.family]}`
      ctx.font = font
      ctx.fillStyle = l.color
      ctx.textAlign = l.align === 'center' ? 'center' : 'left'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0,0,0,0.35)'
      ctx.shadowBlur = sizePx * 0.25
      ctx.shadowOffsetY = Math.max(1, sizePx * 0.03)
      const x = l.dx * ppi
      const y = l.dy * ppi
      if (l.maxWidthIn) {
        const lines = wrapText(l.text, l.maxWidthIn * ppi, font)
        const lh = sizePx * 1.25
        const startY = y - ((lines.length - 1) * lh) / 2
        lines.forEach((ln, i) => ctx.fillText(ln, x, startY + i * lh))
      } else {
        ctx.fillText(l.text, x, y)
      }
      ctx.shadowColor = 'transparent'
    }

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('export failed'))), 'image/jpeg', 0.92)
    )
  }, [doc, geo, trim, artwork])

  const saveVersion = useCallback(async (select: boolean) => {
    if (exporting) return
    setExporting(select ? 'select' : 'version')
    setExportMsg(null)
    try {
      const blob = await renderFrontExport()
      const form = new FormData()
      form.append('export', new File([blob], 'cover.jpg', { type: 'image/jpeg' }))
      form.append('doc', JSON.stringify(doc))
      form.append('select', String(select))
      const res = await fetch(`/api/projects/${projectId}/design/versions`, { method: 'POST', body: form })
      const j = await res.json().catch(() => ({})) as { version?: { id: string; label: string | null; url: string | null }; error?: string }
      if (!res.ok || !j.version) throw new Error(j.error || `save failed (${res.status})`)
      setVersions(prev => [{ id: j.version!.id, label: j.version!.label, createdAt: new Date().toISOString(), url: j.version!.url }, ...prev])
      if (select) setSelectedVersionId(j.version.id)
      setExportMsg(select ? 'It’s on the book — version saved and selected.' : 'Version saved.')
    } catch (err) {
      const m = err instanceof Error ? err.message : 'export failed'
      setExportMsg(/taint|cross|security/i.test(m) ? 'The artwork blocked export (image security) — reload the studio and try again.' : `Couldn’t save: ${m}`)
    } finally {
      setExporting(null)
    }
  }, [exporting, renderFrontExport, doc, projectId])

  if (loading || !doc || !geo) {
    return <div className="p-10 text-sm text-slate-500">Opening the studio…</div>
  }

  const visibleZones = geo.zones.filter(z => !z.hidden)
  const visibleLeft = visibleZones[0].x
  const visibleWidth = visibleZones.reduce((s, z) => s + z.width, 0)
  const frontZone = geo.zones.find(z => z.id === 'front')!
  const wrapArt = artwork?.layout === 'wraparound'

  return (
    <div className="min-h-screen bg-[#EDE9E1] p-6" onPointerMove={onPointerMove} onPointerUp={onPointerUp}>

      {/* Top bar */}
      <div className="max-w-[980px] mx-auto flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push(`/projects/${projectId}/design`)} className="text-xs text-slate-600 hover:text-slate-900">
            ← Design
          </button>
          <h1 className="font-serif text-lg text-slate-900">{project.title} — jacket</h1>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-slate-500 mr-1">
            {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved just now' : saveState === 'error' ? 'Save failed — retrying on next change' : ''}
          </p>
          <button type="button" disabled={!!exporting} onClick={() => saveVersion(false)}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-400 text-slate-700 hover:bg-white disabled:opacity-50">
            {exporting === 'version' ? 'Saving…' : 'Save version'}
          </button>
          <button type="button" disabled={!!exporting} onClick={() => saveVersion(true)}
            className="text-xs px-3 py-1.5 rounded-md text-white bg-[#5C7A6B] hover:opacity-90 font-medium disabled:opacity-50">
            {exporting === 'select' ? 'Working…' : 'Use this cover'}
          </button>
        </div>
      </div>
      {exportMsg && (
        <p className="max-w-[980px] mx-auto text-[11px] text-slate-600 mb-2">{exportMsg}</p>
      )}

      {/* Controls row */}
      <div className="max-w-[980px] mx-auto flex flex-wrap items-end gap-4 mb-4 text-xs">
        <label className="flex flex-col gap-1">
          <span className="text-slate-500">Trim</span>
          <select value={doc.trimId} onChange={e => update(d => ({ ...d, trimId: e.target.value }))} className="border border-slate-300 rounded px-2 py-1 bg-white">
            {TRIM_SIZES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-slate-500">Binding</span>
          <select value={doc.binding} onChange={e => update(d => ({ ...d, binding: e.target.value as Binding }))} className="border border-slate-300 rounded px-2 py-1 bg-white">
            <option value="hardcover">Hardcover (casewrap)</option>
            <option value="paperback">Paperback</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-slate-500">Paper</span>
          <select value={doc.paper} onChange={e => update(d => ({ ...d, paper: e.target.value as Paper }))} className="border border-slate-300 rounded px-2 py-1 bg-white">
            <option value="cream">Cream</option>
            <option value="white">White</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-slate-500">
            Pages {doc.pagesOverridden ? '' : `(≈ estimated${project.wordCount ? ' from your manuscript' : ''})`}
          </span>
          <input
            type="number" min={24} max={2000} value={doc.pages}
            onChange={e => update(d => ({ ...d, pages: Math.max(24, Number(e.target.value) || 24), pagesOverridden: true }))}
            className="border border-slate-300 rounded px-2 py-1 w-24 bg-white"
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-slate-500">Spine</span>
          <span className="px-2 py-1 border border-transparent font-medium text-slate-800">{inches(geo.spine, 3)}</span>
        </div>
        <p className="text-[10px] text-slate-400 basis-full">
          Page count comes from the formatting stage when your interior is set; until then it’s an estimate you can correct. Sheet {inches(geo.sheetWidth)} × {inches(geo.sheetHeight)} incl. bleed{geo.fold ? ' and fold wraps' : ''}.
        </p>
      </div>

      {/* The sheet */}
      <div className="max-w-[980px] mx-auto overflow-x-auto pb-2">
        <div
          ref={sheetRef}
          className="relative bg-white shadow-[14px_18px_40px_rgba(44,44,42,.30)] select-none"
          style={{ width: geo.sheetWidth * scale, height: geo.sheetHeight * scale }}
          onPointerDown={() => setSelected(null)}
        >
          {/* Bleed frame */}
          <div className="absolute border border-dashed border-rose-300 pointer-events-none"
            style={{ left: geo.bleed * scale, right: geo.bleed * scale, top: (geo.fold || geo.bleed) * scale, bottom: (geo.fold || geo.bleed) * scale }} />

          {/* Zones (offset by bleed horizontally; wraps/bleed vertically) */}
          {geo.zones.map(z => (
            <div key={z.id}
              className={`absolute top-0 bottom-0 ${z.hidden ? 'bg-slate-900/10' : ''} pointer-events-none`}
              style={{
                left: (geo.bleed + z.x) * scale,
                width: z.width * scale,
                backgroundImage: z.hidden ? 'repeating-linear-gradient(45deg, rgba(44,44,42,.12) 0 6px, transparent 6px 12px)' : undefined,
              }}
            >
              <span className="absolute -top-0 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-wider text-slate-500 bg-white/80 px-1 rounded-b">
                {z.label}
              </span>
              {!z.hidden && z.id !== 'back' && (
                <span className="absolute inset-y-0 left-0 border-l border-dashed border-slate-900/25" />
              )}
            </div>
          ))}

          {/* Artwork under the visible zones */}
          <div className="absolute overflow-hidden pointer-events-none"
            style={{
              left: (geo.bleed + visibleLeft) * scale,
              width: visibleWidth * scale,
              top: 0, bottom: 0,
              background: '#2C2C2A',
            }}
          >
            {artwork?.url && wrapArt && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={artwork.url} alt="" className="w-full h-full object-cover" draggable={false} />
            )}
            {artwork?.url && !wrapArt && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={artwork.url} alt="" draggable={false}
                className="absolute top-0 bottom-0 object-cover"
                style={{ left: (frontZone.x - visibleLeft) * scale, width: frontZone.width * scale, height: '100%' }} />
            )}
          </div>

          {/* Text layers */}
          {doc.layers.map(l => {
            const zone = geo.zones.find(z => z.id === l.zone)
            if (!zone) return null
            const isSel = selected === l.id
            const left = (geo.bleed + zone.x + l.dx) * scale
            const top = ((geo.fold || geo.bleed) + l.dy) * scale
            return (
              <div key={l.id}
                onPointerDown={e => onLayerPointerDown(e, l)}
                className={`absolute cursor-grab active:cursor-grabbing px-0.5 ${isSel ? 'outline outline-1 outline-[#5C7A6B]' : 'hover:outline hover:outline-1 hover:outline-slate-400/60'}`}
                style={{
                  left, top,
                  transform: `translate(${l.align === 'center' ? '-50%' : '0'}, -50%) ${l.rotated ? 'rotate(90deg)' : ''}`,
                  fontFamily: FAMILIES[l.family],
                  fontWeight: l.weight,
                  fontSize: l.size * (scale / 48),
                  color: l.color,
                  textAlign: l.align ?? 'left',
                  maxWidth: l.maxWidthIn ? l.maxWidthIn * scale : undefined,
                  lineHeight: 1.25,
                  textShadow: '0 1px 8px rgba(0,0,0,.35)',
                  whiteSpace: l.maxWidthIn ? 'normal' : 'nowrap',
                }}
              >
                {l.text}
              </div>
            )
          })}
        </div>
      </div>

      {/* Layer toolbar */}
      <div className="max-w-[980px] mx-auto mt-3 bg-white border border-slate-200 rounded-md px-3 py-2.5 flex flex-wrap items-center gap-3 text-xs min-h-[46px]">
        {selectedLayer ? (
          <>
            <input
              value={selectedLayer.text}
              onChange={e => update(d => ({ ...d, layers: d.layers.map(l => l.id === selectedLayer.id ? { ...l, text: e.target.value } : l) }))}
              className="border border-slate-300 rounded px-2 py-1 min-w-[220px] flex-1"
            />
            <label className="flex items-center gap-1.5">
              <span className="text-slate-500">Size</span>
              <input type="range" min={8} max={72} value={selectedLayer.size}
                onChange={e => update(d => ({ ...d, layers: d.layers.map(l => l.id === selectedLayer.id ? { ...l, size: Number(e.target.value) } : l) }))} />
            </label>
            <button type="button"
              onClick={() => update(d => ({ ...d, layers: d.layers.map(l => l.id === selectedLayer.id ? { ...l, family: l.family === 'serif' ? 'sans' : 'serif' } : l) }))}
              className="border border-slate-300 rounded px-2 py-1 hover:bg-slate-50">
              {selectedLayer.family === 'serif' ? 'Serif' : 'Sans'}
            </button>
            <button type="button"
              onClick={() => update(d => ({ ...d, layers: d.layers.map(l => l.id === selectedLayer.id ? { ...l, weight: l.weight === 700 ? 500 : 700 } : l) }))}
              className={`border rounded px-2 py-1 font-bold ${selectedLayer.weight === 700 ? 'border-slate-500 bg-slate-100' : 'border-slate-300 hover:bg-slate-50'}`}>
              B
            </button>
            <span className="flex items-center gap-1">
              {SWATCHES.map(c => (
                <button key={c} type="button" aria-label={`colour ${c}`}
                  onClick={() => update(d => ({ ...d, layers: d.layers.map(l => l.id === selectedLayer.id ? { ...l, color: c } : l) }))}
                  className={`w-4 h-4 rounded-full border ${selectedLayer.color === c ? 'ring-2 ring-offset-1 ring-slate-500' : 'border-slate-300'}`}
                  style={{ background: c }} />
              ))}
            </span>
            <button type="button"
              onClick={() => { update(d => ({ ...d, layers: d.layers.filter(l => l.id !== selectedLayer.id) })); setSelected(null) }}
              className="text-rose-700 hover:underline ml-auto">
              Remove
            </button>
          </>
        ) : (
          <>
            <span className="text-slate-500">Select a layer to edit it, or</span>
            <button type="button"
              onClick={() => {
                const id = `l-${Date.now()}`
                update(d => ({ ...d, layers: [...d.layers, { id, role: 'custom', text: 'New text', zone: 'front', dx: trim.width / 2, dy: trim.height / 2, size: 16, family: 'sans', weight: 500, color: '#FAF8F4', align: 'center' }] }))
                setSelected(id)
              }}
              className="border border-slate-300 rounded px-2 py-1 hover:bg-slate-50">
              + Add text
            </button>
          </>
        )}
      </div>

      {/* Artwork picker + upload */}
      <div className="max-w-[980px] mx-auto mt-4">
        <p className="text-[10px] uppercase tracking-wider font-medium text-slate-500 mb-2">Artwork</p>
        <div className="flex flex-wrap items-start gap-3">
          {assets.filter(a => a.url).map(a => (
            <button key={a.id} type="button" onClick={() => update(d => ({ ...d, artworkAssetId: a.id }))}
              className={`rounded overflow-hidden border-2 ${doc.artworkAssetId === a.id ? 'border-[#5C7A6B]' : 'border-transparent hover:border-slate-300'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.url!} alt="" className={a.layout === 'wraparound' ? 'h-16 w-24 object-cover' : 'h-16 w-11 object-cover'} />
            </button>
          ))}
          <div className="flex flex-col gap-1.5 text-[11px]">
            <label className="flex items-center gap-1.5 text-slate-600">
              <input type="checkbox" checked={rightsOk} onChange={e => setRightsOk(e.target.checked)} />
              I have the right to use this image
            </label>
            <button type="button" disabled={!rightsOk || uploading} onClick={() => fileRef.current?.click()}
              className="border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed w-max">
              {uploading ? 'Uploading…' : 'Upload artwork'}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f) }} />
            {uploadError && <p className="text-rose-700">{uploadError}</p>}
          </div>
        </div>
      </div>

      {/* Versions */}
      {versions.length > 0 && (
        <div className="max-w-[980px] mx-auto mt-5 pb-8">
          <p className="text-[10px] uppercase tracking-wider font-medium text-slate-500 mb-2">
            Versions <span className="text-slate-400 normal-case tracking-normal">— newest first</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {versions.map(v => {
              const isSel = v.id === selectedVersionId
              return (
                <figure key={v.id} className="w-[88px]">
                  <div className={`aspect-[2/3] rounded overflow-hidden bg-slate-200 ${isSel ? 'ring-2 ring-[#5C7A6B] ring-offset-1' : 'border border-slate-300'}`}>
                    {v.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.url} alt={v.label ?? 'Saved version'} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <figcaption className="text-[10px] text-slate-500 mt-1 leading-tight">
                    {isSel && <span className="text-[#5C7A6B] font-medium">✓ Your cover · </span>}
                    {new Date(v.createdAt).toLocaleDateString()}
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
