import type { Scenario } from './types'

export const scenarios: Scenario[] = [
  {
    // p1 → "incorrecta": cápsulas mal posicionadas / orientación incorrecta dentro de la caja
    id: 's1',
    image: '/products/p1.jpg',
    productName: 'Cápsulas La Virginia Espresso',
    shortName: 'Cápsulas Espresso',
    camera: 'CAM 03',
    type: 'auto-defect',
    finalConfidence: 92,
    confidenceTone: 'red',
    topPredictions: [
      { label: 'Cápsulas mal posicionadas', confidence: 92, color: 'red' },
      { label: 'Faltan cápsulas', confidence: 6, color: 'orange' },
      { label: 'OK', confidence: 2, color: 'cyan' },
    ],
    bboxes: [
      {
        id: 's1-b1',
        top: '30%',
        left: '28%',
        width: '44%',
        height: '40%',
        color: 'red',
        label: 'Posición incorrecta',
        confidence: 92,
      },
    ],
    verdict: { text: 'DEFECTO DETECTADO · POSICIÓN INCORRECTA', tone: 'defect' },
  },
  {
    // p2 → "café volcado": derrame visible de café molido sobre las cápsulas
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
    // p3 → "rota": caja con daño estructural / cartón roto — momento de REVISIÓN HUMANA
    id: 's3',
    image: '/products/p3.jpg',
    productName: 'Café La Virginia Espresso Equilibrado',
    shortName: 'Espresso Equilibrado',
    camera: 'CAM 03',
    type: 'review',
    oscillation: [48, 62, 55, 68, 58],
    finalConfidence: 62,
    confidenceTone: 'orange',
    aiSuggestion: 'Caja rota (62%)',
    topPredictions: [
      { label: 'Caja rota', confidence: 62, color: 'red' },
      { label: 'Daño leve', confidence: 30, color: 'orange' },
      { label: 'OK', confidence: 8, color: 'cyan' },
    ],
    bboxes: [
      {
        id: 's3-b1',
        top: '36%',
        left: '14%',
        width: '38%',
        height: '32%',
        color: 'red',
        label: 'Caja rota',
        confidence: 62,
        flicker: true,
      },
      {
        id: 's3-b2',
        top: '34%',
        left: '52%',
        width: '34%',
        height: '34%',
        color: 'orange',
        label: 'Daño leve',
        confidence: 30,
        flicker: true,
      },
    ],
    verdict: { text: 'REQUIERE REVISIÓN HUMANA', tone: 'review' },
  },
  {
    // p4 → "bien": Equilibrado N°7 caja cerrada y prolija
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
    // p5 → "bien": Sutil N°5 caja cerrada y prolija — con badge "aprendido de tu última revisión"
    id: 's5',
    image: '/products/p5.jpg',
    productName: 'Café La Virginia Espresso Sutil N°5',
    shortName: 'Espresso Sutil N°5',
    camera: 'CAM 03',
    type: 'auto-ok',
    finalConfidence: 97,
    confidenceTone: 'cyan',
    showLearnedBadge: true,
    topPredictions: [
      { label: 'OK', confidence: 97, color: 'cyan' },
      { label: 'Etiqueta desalineada', confidence: 2, color: 'red' },
      { label: 'Defecto de impresión', confidence: 1, color: 'orange' },
    ],
    bboxes: [
      {
        id: 's5-b1',
        top: '22%',
        left: '24%',
        width: '52%',
        height: '58%',
        color: 'cyan',
        label: 'Empaque OK',
        confidence: 97,
      },
    ],
    verdict: { text: 'APROBADO · CLASIFICADO AUTOMÁTICAMENTE', tone: 'approved' },
  },
  {
    // p6 → "correcta": Té Herbal La Virginia, caja violeta sellada y centrada
    id: 's6',
    image: '/products/p6.jpg',
    productName: 'Té Herbal La Virginia · Mezcla de Hierbas',
    shortName: 'Té Herbal Mezcla',
    camera: 'CAM 03',
    type: 'auto-ok',
    finalConfidence: 99,
    confidenceTone: 'cyan',
    topPredictions: [
      { label: 'OK', confidence: 99, color: 'cyan' },
      { label: 'Etiqueta desalineada', confidence: 1, color: 'orange' },
      { label: 'Sello imperfecto', confidence: 0, color: 'red' },
    ],
    bboxes: [
      {
        id: 's6-b1',
        top: '28%',
        left: '26%',
        width: '50%',
        height: '46%',
        color: 'cyan',
        label: 'Empaque OK',
        confidence: 99,
      },
    ],
    verdict: { text: 'APROBADO · CLASIFICADO AUTOMÁTICAMENTE', tone: 'approved' },
  },
  {
    // p7 → "incorrecta": cápsulas Lovigino con café derramado y cápsula fuera de posición
    id: 's7',
    image: '/products/p7.jpg',
    productName: 'Cápsulas Lovigino L\'originale',
    shortName: 'Cápsulas Lovigino',
    camera: 'CAM 03',
    type: 'auto-defect',
    finalConfidence: 94,
    confidenceTone: 'red',
    topPredictions: [
      { label: 'Café derramado', confidence: 94, color: 'red' },
      { label: 'Posición incorrecta', confidence: 5, color: 'orange' },
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
        label: 'Café derramado',
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
    verdict: { text: 'DEFECTO DETECTADO · CAFÉ DERRAMADO', tone: 'defect' },
  },
  {
    // p8 → "correcta": cápsulas Lovigino perfectamente alineadas en cinta azul
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
    image: '/products/p3.jpg',
    productName: 'Espresso Equilibrado',
    aiSuggestion: 'Caja rota (62%)',
    aiSuggestionColor: 'orange' as const,
    topPredictions: [
      { label: 'Caja rota', confidence: 62, color: 'red' as const },
      { label: 'Daño leve', confidence: 30, color: 'orange' as const },
      { label: 'OK', confidence: 8, color: 'cyan' as const },
    ],
  },
  {
    id: 'q-002',
    image: '/products/p1.jpg',
    productName: 'Cápsulas Espresso 52g',
    aiSuggestion: 'Posición incorrecta (71%)',
    aiSuggestionColor: 'orange' as const,
    topPredictions: [
      { label: 'Posición incorrecta', confidence: 71, color: 'red' as const },
      { label: 'Faltan cápsulas', confidence: 22, color: 'orange' as const },
      { label: 'OK', confidence: 7, color: 'cyan' as const },
    ],
  },
  {
    id: 'q-003',
    image: '/products/p2.jpg',
    productName: 'Cápsulas Espresso 52g',
    aiSuggestion: 'Empaque sucio (54%)',
    aiSuggestionColor: 'orange' as const,
    topPredictions: [
      { label: 'Empaque sucio', confidence: 54, color: 'orange' as const },
      { label: 'OK', confidence: 35, color: 'cyan' as const },
      { label: 'Café derramado', confidence: 11, color: 'red' as const },
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
