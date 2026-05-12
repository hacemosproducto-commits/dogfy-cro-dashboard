/**
 * Shared color palette for JS/TS usage (charts, legends, dots).
 * CSS equivalents live in main.css as --chart-1 … --chart-6.
 */

// PrimeVue palette 400-level — var(--p-{color}-400)
export const CHART_COLORS = [
  '#3B82F6',  // 0 — violet-400  (primary / No gestionados)
  '#2dd4bf',  // 1 — teal-400    (secondary / No contesta)
  '#fbbf24',  // 2 — amber-400   (frescos / tertiary)
  '#4ade80',  // 3 — green-400   (additional series)
  '#f9a8d4',  // 4 — pink-300    (extra)
  '#60a5fa',  // 5 — blue-400    (extra)
] as const

export const CHART_AREA_FILL = 'rgba(59, 130, 246, 0.08)'  // blue-500 @ 8%
export const CHART_PREV_COLOR = '#c2c2c2'  // previous period / dashed line

/** Diagonal-stripe hatch pattern for projection/meta bars. */
export function createMetaPattern(barColor: string, bgColor = '#BFDBFE'): CanvasPattern | string {
  if (typeof document === 'undefined') return bgColor
  const size = 8
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  if (!ctx) return bgColor
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = barColor
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.55
  for (const d of [-size, 0, size]) {
    ctx.beginPath(); ctx.moveTo(d, size); ctx.lineTo(d + size, 0); ctx.stroke()
  }
  return ctx.createPattern(c, 'repeat') ?? bgColor
}
