import type { Scenario } from './types'

export const scenarios: Scenario[] = [
  {
    // p1 → OK: cápsulas bien posicionadas
    id: 's1',
    image: '/products/p1.jpg',
    productName: 'Cápsulas La Virginia Espresso',
    shortName: 'Cápsulas Espresso',
    camera: 'CAM 03',
    type: 'auto-ok',
    finalConfidence: 97,
    confidenceTone: 'cyan',
    topPredictions: [
      { label: 'OK', confidence: 97, color: 'cyan' },
      { label: 'Posición incorrecta', confidence: 2, color: 'orange' },
      { label: 'Faltan cápsulas', confidence: 1, color: 'red' },
    ],
    bboxes: [
      {
        id: 's1-b1',
        top: '22%',
        left: '24%',
        width: '52%',
        height: '56%',
        color: 'cyan',
        label: 'Cápsulas OK',
        confidence: 97,
      },
    ],
    verdict: { text: 'APROBADO · CLASIFICADO AUTOMÁTICAMENTE', tone: 'approved' },
  },
  {
    // p2 → DEFECTO: café derramado sobre las cápsulas
    id: 's2',
    image: '/products/p2.jpg',
    productName: 'Cápsulas La Virginia Espresso',
    shortName: 'Cápsulas Espresso',
    camera: 'CAM 03',
    type: 'auto-defect',
    hasBarcode: true,
    barcodeText: '7790520001234 → Cápsulas Espresso 52g',
    finalConfidence: 96,
    confidenceTone: 'red',
    topPredictions: [
      { label: 'Café derramado', confidence: 96, color: 'red' },
      { label: 'Empaque sucio', confidence: 3, color: 'orange' },
      { label: 'OK', confidence: 1, color: 'cyan' },
    ],
    bboxes: [
      {
        id: 's2-b1',
        top: '40%',
        left: '58%',
        width: '34%',
        height: '36%',
        color: 'red',
        label: 'Café derramado',
        confidence: 96,
      },
    ],
    verdict: { text: 'DEFECTO DETECTADO · CAFÉ DERRAMADO', tone: 'defect' },
  },
  {
    // p4 → OK: caja cerrada y prolija
    id: 's4',
    image: '/products/p4.jpg',
    productName: 'Café La Virginia Espresso Equilibrado N°7',
    shortName: 'Espresso Equilibrado N°7',
    camera: 'CAM 03',
    type: 'auto-ok',
    finalConfidence: 98,
    confidenceTone: 'cyan',
    topPredictions: [
      { label: 'OK', confidence: 98, color: 'cyan' },
      { label: 'Etiqueta desalineada', confidence: 1, color: 'red' },
      { label: 'Defecto de impresión', confidence: 1, color: 'orange' },
    ],
    bboxes: [
      {
        id: 's4-b1',
        top: '20%',
        left: '24%',
        width: '52%',
        height: '58%',
        color: 'cyan',
        label: 'Empaque OK',
        confidence: 98,
      },
    ],
    verdict: { text: 'APROBADO · CLASIFICADO AUTOMÁTICAMENTE', tone: 'approved' },
  },
  {
    // p6 → OK: caja de té detectada correctamente
    id: 's6',
    image: '/products/p6.jpg',
    productName: 'Té Herbal La Virginia · Mezcla de Hierbas',
    shortName: 'Té Herbal Mezcla',
    camera: 'CAM 03',
    type: 'auto-ok',
    finalConfidence: 99,
    confidenceTone: 'cyan',
    topPredictions: [
      { label: 'Caja de té OK', confidence: 99, color: 'cyan' },
      { label: 'Etiqueta desalineada', confidence: 1, color: 'orange' },
      { label: 'Sello imperfecto', confidence: 0, color: 'red' },
    ],
    bboxes: [
      {
        id: 's6-b1',
        top: '20%',
        left: '22%',
        width: '56%',
        height: '58%',
        color: 'cyan',
        label: 'Caja de té',
        confidence: 99,
      },
    ],
    verdict: { text: 'APROBADO · CAJA DE TÉ CLASIFICADA OK', tone: 'approved' },
  },
  {
    // p7 → DEFECTO: café tirado
    id: 's7',
    image: '/products/p7.jpg',
    productName: 'Cápsulas Lovigino L\'originale',
    shortName: 'Cápsulas Lovigino',
    camera: 'CAM 03',
    type: 'auto-defect',
    finalConfidence: 94,
    confidenceTone: 'red',
    topPredictions: [
      { label: 'Café tirado', confidence: 94, color: 'red' },
      { label: 'Cápsula fuera de lugar', confidence: 5, color: 'orange' },
      { label: 'OK', confidence: 1, color: 'cyan' },
    ],
    bboxes: [
      {
        id: 's7-b1',
        top: '58%',
        left: '52%',
        width: '36%',
        height: '32%',
        color: 'red',
        label: 'Café tirado',
        confidence: 94,
      },
      {
        id: 's7-b2',
        top: '36%',
        left: '58%',
        width: '22%',
        height: '22%',
        color: 'orange',
        label: 'Cápsula fuera de lugar',
        confidence: 71,
      },
    ],
    verdict: { text: 'DEFECTO DETECTADO · CAFÉ TIRADO', tone: 'defect' },
  },
  {
    // p8 → OK: cápsulas perfectamente alineadas
    id: 's8',
    image: '/products/p8.jpg',
    productName: 'Cápsulas Lovigino L\'originale',
    shortName: 'Cápsulas Lovigino',
    camera: 'CAM 03',
    type: 'auto-ok',
    finalConfidence: 99,
    confidenceTone: 'cyan',
    topPredictions: [
      { label: 'OK', confidence: 99, color: 'cyan' },
      { label: 'Faltan cápsulas', confidence: 1, color: 'orange' },
      { label: 'Posición incorrecta', confidence: 0, color: 'red' },
    ],
    bboxes: [
      {
        id: 's8-b1',
        top: '14%',
        left: '22%',
        width: '56%',
        height: '70%',
        color: 'cyan',
        label: '10/10 cápsulas alineadas',
        confidence: 99,
      },
    ],
    verdict: { text: 'APROBADO · CLASIFICADO AUTOMÁTICAMENTE', tone: 'approved' },
  },
]

export const initialQueue = [
  {
    id: 'q-001',
    image: '/products/p2.jpg',
    productName: 'Cápsulas Espresso',
    aiSuggestion: 'Café derramado (96%)',
    aiSuggestionColor: 'red' as const,
    topPredictions: [
      { label: 'Café derramado', confidence: 96, color: 'red' as const },
      { label: 'Empaque sucio', confidence: 3, color: 'orange' as const },
      { label: 'OK', confidence: 1, color: 'cyan' as const },
    ],
  },
  {
    id: 'q-002',
    image: '/products/p7.jpg',
    productName: 'Cápsulas Lovigino',
    aiSuggestion: 'Café tirado (94%)',
    aiSuggestionColor: 'red' as const,
    topPredictions: [
      { label: 'Café tirado', confidence: 94, color: 'red' as const },
      { label: 'Cápsula fuera de lugar', confidence: 5, color: 'orange' as const },
      { label: 'OK', confidence: 1, color: 'cyan' as const },
    ],
  },
]

export const initialPoolDecisions = [
  { id: 'd1', initial: 'M.G', timestamp: '14:31:02', decisionColor: 'red' as const, label: 'Caja rota' },
  { id: 'd2', initial: 'R.P', timestamp: '14:29:48', decisionColor: 'navy' as const, label: 'OK confirmado' },
  { id: 'd3', initial: 'S.R', timestamp: '14:28:11', decisionColor: 'orange' as const, label: 'Café derramado' },
]

export const categories = [
  { id: 'rota', name: 'Caja rota', color: 'red' as const, count: 4 },
  { id: 'derrame', name: 'Café derramado', color: 'orange' as const, count: 3 },
  { id: 'posicion', name: 'Posición incorrecta', color: 'cyan' as const, count: 5 },
  { id: 'sello', name: 'Sello imperfecto', color: 'navy' as const, count: 2 },
  { id: 'objeto', name: 'Objeto extraño', color: 'red' as const, count: 0 },
]

export const accuracyHistory = [94.1, 95.0, 95.6, 96.4, 97.0, 97.8, 98.4]
