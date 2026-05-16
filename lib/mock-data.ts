import type { DefectCategory, RosterItem, InspectionResult, DefectColor } from './types'

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

export const sampleResult: InspectionResult = {
  image: 'https://placehold.co/1280x720/F7F7F4/242E8F?text=Yerba+Mate+Pack',
  verdict: 'FLAGGED · 2 defects above threshold',
  bboxes: [
    {
      id: 'b1',
      top: '20%',
      left: '30%',
      width: '28%',
      height: '22%',
      color: 'red',
      label: 'Etiqueta desalineada',
      confidence: 94,
    },
    {
      id: 'b2',
      top: '55%',
      left: '55%',
      width: '24%',
      height: '20%',
      color: 'orange',
      label: 'Sello imperfecto',
      confidence: 76,
    },
    {
      id: 'b3',
      top: '25%',
      left: '65%',
      width: '18%',
      height: '14%',
      color: 'cyan',
      label: 'Color OK',
      confidence: 99,
    },
  ],
}

const operators = ['M. González', 'R. Pérez', 'S. Romero']
const cameras = ['CAM 01', 'CAM 02', 'CAM 03']

const defectAssignments: { defectId: string; status: 'flagged' | 'pending' | 'approved'; revisar: boolean }[] = [
  { defectId: 'etiqueta', status: 'flagged', revisar: false },
  { defectId: 'sello', status: 'flagged', revisar: false },
  { defectId: 'impresion', status: 'pending', revisar: true },
  { defectId: 'color', status: 'approved', revisar: false },
  { defectId: 'etiqueta', status: 'flagged', revisar: false },
  { defectId: 'otros', status: 'flagged', revisar: false },
  { defectId: 'sello', status: 'pending', revisar: true },
  { defectId: 'impresion', status: 'flagged', revisar: false },
  { defectId: 'etiqueta', status: 'flagged', revisar: false },
  { defectId: 'color', status: 'approved', revisar: false },
  { defectId: 'impresion', status: 'flagged', revisar: false },
  { defectId: 'etiqueta', status: 'pending', revisar: true },
  { defectId: 'sello', status: 'approved', revisar: false },
  { defectId: 'otros', status: 'flagged', revisar: false },
  { defectId: 'etiqueta', status: 'flagged', revisar: false },
  { defectId: 'impresion', status: 'approved', revisar: false },
  { defectId: 'etiqueta', status: 'flagged', revisar: false },
  { defectId: 'sello', status: 'approved', revisar: false },
]

function timestamp(minOffset: number): string {
  const base = new Date()
  base.setHours(14, 32, 8)
  base.setMinutes(base.getMinutes() - minOffset)
  const hh = String(base.getHours()).padStart(2, '0')
  const mm = String(base.getMinutes()).padStart(2, '0')
  const ss = String(base.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export const rosterItems: RosterItem[] = defectAssignments.map((a, i) => {
  const cat = categories.find((c) => c.id === a.defectId)!
  const idx = String(i + 1).padStart(2, '0')
  return {
    id: `pack-${idx}`,
    image: `https://placehold.co/400x400/F7F7F4/242E8F?text=Pack+${idx}`,
    label: cat.name,
    defectId: cat.id,
    status: a.status,
    camera: cameras[i % cameras.length],
    timestamp: timestamp(i * 3 + Math.floor(Math.random() * 2)),
    operator: operators[i % operators.length],
    confidence: 70 + ((i * 7) % 28),
    needsReview: a.revisar,
  }
})

export const rosterCounts = {
  all: rosterItems.length,
  flagged: rosterItems.filter((r) => r.status === 'flagged').length,
  pending: rosterItems.filter((r) => r.status === 'pending').length,
  approved: rosterItems.filter((r) => r.status === 'approved').length,
}
