'use server'

import type { InspectionVerdict } from '@/lib/schema'

type OperatorDecision = 'flagged' | 'pending' | 'approved'

type SaveFeedbackInput = {
  itemId: string
  modelVerdict: InspectionVerdict
  operatorStatus: OperatorDecision
  modelConfidence?: number
  wasCorrect: boolean
  operatorNotes?: string
}

type SaveFeedbackResult = { success: true } | { success: false; error: string }

export async function saveFeedback(data: SaveFeedbackInput): Promise<SaveFeedbackResult> {
  try {
    // TODO: persistir en base de datos (ej. Prisma, Supabase, etc.)
    console.log('[feedback] Revisión del operador registrada:', {
      itemId: data.itemId,
      modelVerdict: data.modelVerdict,
      operatorStatus: data.operatorStatus,
      modelConfidence: data.modelConfidence,
      wasCorrect: data.wasCorrect,
      operatorNotes: data.operatorNotes ?? null,
      timestamp: new Date().toISOString(),
    })

    return { success: true }
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error desconocido'
    return { success: false, error: `No se pudo guardar el feedback: ${mensaje}` }
  }
}
