import type { Scenario, ScenarioBox, ScenarioType } from '@/lib/types'
import type { AIInspectionResult, Capsule } from '@/lib/schema'

export const MAX_FILE_SIZE = 4_000_000 // 4 MB
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export type AllowedMimeType = (typeof ALLOWED_TYPES)[number]

export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type as AllowedMimeType)) {
    return {
      valid: false,
      error: `Formato no soportado: ${file.type}. Usá JPEG, PNG o WebP.`,
    }
  }
  if (file.size > MAX_FILE_SIZE) {
    const mb = (file.size / 1_000_000).toFixed(1)
    return {
      valid: false,
      error: `La imagen pesa ${mb} MB. El máximo permitido es 4 MB.`,
    }
  }
  return { valid: true }
}

export function getMimeType(file: File): AllowedMimeType {
  if (!ALLOWED_TYPES.includes(file.type as AllowedMimeType)) {
    throw new Error(`Tipo de imagen no soportado: ${file.type}`)
  }
  return file.type as AllowedMimeType
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

export const DEFECT_COLOR: Record<string, ScenarioBox['color']> = {
  forma: 'orange',
  color: 'orange',
  dano: 'red',
  posicion: 'cyan',
}

const DEFECT_LABEL: Record<string, string> = {
  forma: 'Forma incorrecta',
  color: 'Color incorrecto',
  dano: 'Daño físico',
  posicion: 'Posición incorrecta',
}

export function capsulesToBboxes(capsules: Capsule[]): ScenarioBox[] {
  return capsules
    .filter((c) => c.isDefective)
    .map((c, i) => ({
      id: `cap-${i}-${c.id}`,
      top: `${c.top}%`,
      left: `${c.left}%`,
      width: `${c.width}%`,
      height: `${c.height}%`,
      color: DEFECT_COLOR[c.defectType ?? ''] ?? ('red' as ScenarioBox['color']),
      label: c.defectType ?? 'defecto',
      confidence: 95,
    }))
}

function buildTopPredictions(result: AIInspectionResult): Scenario['topPredictions'] {
  if (result.verdict === 'APPROVED') {
    return [{ label: 'OK · Sin defectos', confidence: 99, color: 'cyan' }]
  }
  const counts: Record<string, number> = {}
  for (const c of result.capsules) {
    if (c.isDefective && c.defectType) {
      counts[c.defectType] = (counts[c.defectType] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) => ({
      label: `${DEFECT_LABEL[type] ?? type} (×${count})`,
      confidence: Math.max(70, 95 - count * 5),
      color: (DEFECT_COLOR[type] ?? 'red') as 'red' | 'orange' | 'cyan' | 'navy',
    }))
}

export function buildSyntheticScenario(
  feedItemId: string,
  imageUrl: string,
  productShortName: string,
  result: AIInspectionResult,
): Scenario {
  const isApproved = result.verdict === 'APPROVED'
  // Sanity check: si el LLM no detectó cápsulas, forzar revisión humana
  // en vez de tratarlo como defecto automático
  const noCapsulesDetected = !isApproved && result.totalDetected === 0
  const needsReview = result.requiresHumanReview || noCapsulesDetected

  let type: ScenarioType
  let confidenceTone: Scenario['confidenceTone']
  let verdictTone: Scenario['verdict']['tone']

  if (isApproved) {
    type = 'auto-ok'
    confidenceTone = 'cyan'
    verdictTone = 'approved'
  } else {
    // Todo lo FLAGGED va a la cola del operador para decisión humana
    type = 'review'
    if (needsReview) {
      confidenceTone = 'orange'
      verdictTone = 'review'
    } else {
      confidenceTone = 'red'
      verdictTone = 'defect'
    }
  }

  // Texto del veredicto: usar el summary específico del LLM en vez de algo genérico
  const summary = (result.summary || '').trim()
  const prefix = isApproved ? 'APROBADO' : needsReview ? 'REVISIÓN HUMANA' : 'DEFECTO'
  const verdictText = summary ? `${prefix} · ${summary.toUpperCase()}` : prefix

  return {
    id: feedItemId,
    image: imageUrl,
    productName: 'Cápsulas LaVirginia (imagen subida)',
    shortName: productShortName,
    camera: 'CAM 03',
    type,
    finalConfidence: isApproved ? 96 : needsReview ? 62 : 88,
    confidenceTone,
    topPredictions: buildTopPredictions(result),
    bboxes: capsulesToBboxes(result.capsules),
    verdict: { text: verdictText, tone: verdictTone },
    // El reasoning largo del LLM se muestra al operador en la cola
    aiSuggestion: result.reasoning || summary || 'Sin detalles disponibles',
  }
}
