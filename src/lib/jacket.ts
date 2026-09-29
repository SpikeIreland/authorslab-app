// Jacket geometry — TDP-DT-03 §2–3.
// One flat sheet: [fold wrap][back][spine][front][fold wrap] + bleed.
// All physical units are inches; rendering converts via pxPerInch.

export type Binding = 'paperback' | 'hardcover'
export type Paper = 'white' | 'cream'

export interface TrimSize {
  id: string
  label: string
  width: number   // inches
  height: number  // inches
}

export const TRIM_SIZES: TrimSize[] = [
  { id: '5x8', label: '5″ × 8″', width: 5, height: 8 },
  { id: '5.5x8.5', label: '5.5″ × 8.5″', width: 5.5, height: 8.5 },
  { id: '6x9', label: '6″ × 9″', width: 6, height: 9 },
]

// KDP-published paper thickness factors (inches per page).
const PAPER_FACTOR: Record<Paper, number> = {
  white: 0.002252,
  cream: 0.0025,
}

// Case binding adds board + wrap thickness to the spine.
const HARDCOVER_SPINE_ALLOWANCE = 0.25
export const BLEED = 0.125            // paperback bleed, all outer edges
export const CASEWRAP_FOLD = 0.75     // hardcover fold-under wrap, all edges

export function estimatePages(wordCount: number | null | undefined): number {
  if (!wordCount || wordCount <= 0) return 200
  return Math.max(24, Math.ceil(wordCount / 280))
}

export function spineWidth(pages: number, paper: Paper, binding: Binding): number {
  const base = Math.max(pages, 24) * PAPER_FACTOR[paper]
  return binding === 'hardcover' ? base + HARDCOVER_SPINE_ALLOWANCE : base
}

export interface JacketZone {
  id: 'wrap-left' | 'back' | 'spine' | 'front' | 'wrap-right'
  label: string
  x: number       // inches from sheet left
  width: number   // inches
  hidden: boolean // true = not visible to the observer (fold wraps)
}

export interface JacketGeometry {
  binding: Binding
  sheetWidth: number   // inches, including wraps + bleed
  sheetHeight: number
  bleed: number
  fold: number         // fold-under wrap width (0 for paperback)
  spine: number
  trim: TrimSize
  zones: JacketZone[]  // left → right, excluding bleed
}

export function jacketGeometry(opts: {
  trim: TrimSize
  pages: number
  paper: Paper
  binding: Binding
}): JacketGeometry {
  const { trim, pages, paper, binding } = opts
  const spine = spineWidth(pages, paper, binding)
  const fold = binding === 'hardcover' ? CASEWRAP_FOLD : 0
  const bleed = BLEED

  // Zone x-positions measured inside the bleed box.
  const zones: JacketZone[] = []
  let x = 0
  if (fold > 0) {
    zones.push({ id: 'wrap-left', label: 'Folds under', x, width: fold, hidden: true })
    x += fold
  }
  zones.push({ id: 'back', label: 'Back', x, width: trim.width, hidden: false })
  x += trim.width
  zones.push({ id: 'spine', label: 'Spine', x, width: spine, hidden: false })
  x += spine
  zones.push({ id: 'front', label: 'Front', x, width: trim.width, hidden: false })
  x += trim.width
  if (fold > 0) {
    zones.push({ id: 'wrap-right', label: 'Folds under', x, width: fold, hidden: true })
    x += fold
  }

  return {
    binding,
    sheetWidth: x + bleed * 2,
    sheetHeight: trim.height + (fold > 0 ? fold * 2 : bleed * 2),
    bleed,
    fold,
    spine,
    trim,
    zones,
  }
}

// Round for display: spine to thousandths, sheet to hundredths.
export const inches = (n: number, dp = 2) => `${n.toFixed(dp)}″`
