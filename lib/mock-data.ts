import type { DefectCategory, DefectColor } from './types'

export const categories: DefectCategory[] = [
  { id: 'etiqueta', name: 'Etiqueta desalineada', color: 'red', count: 7 },
  { id: 'sello', name: 'Sello imperfecto', color: 'orange', count: 3 },
  { id: 'impresion', name: 'Calidad de impresión', color: 'yellow', count: 5 },
  { id: 'color', name: 'Variación de color', color: 'cyan', count: 1 },
  { id: 'objeto', name: 'Objeto extraño', color: 'navy', count: 0 },
  { id: 'otros', name: 'Otros', color: 'gray', count: 2 },
]

export const colorHex: Record<DefectColor, string> = {
  red: 'var(--lv-red)',
  orange: 'var(--lv-orange)',
  yellow: 'var(--lv-yellow)',
  cyan: 'var(--lv-cyan)',
  navy: 'var(--lv-navy)',
  gray: '#9A9A9A',
}
