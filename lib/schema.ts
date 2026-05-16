import { z } from 'zod'

export const CapsuleDefectType = z.enum(['forma', 'color', 'dano', 'posicion'])
export type CapsuleDefectType = z.infer<typeof CapsuleDefectType>

export const InspectionVerdict = z.enum(['APPROVED', 'FLAGGED'])
export type InspectionVerdict = z.infer<typeof InspectionVerdict>

export const CapsuleSchema = z.object({
  id: z.number().int().min(1).max(10),
  top: z.number().min(0).max(100),
  left: z.number().min(0).max(100),
  width: z.number().min(0).max(100),
  height: z.number().min(0).max(100),
  isDefective: z.boolean(),
  defectType: CapsuleDefectType.nullable(),
  defectDescription: z.string().max(140).nullable(),
})
export type Capsule = z.infer<typeof CapsuleSchema>

export const AIInspectionResultSchema = z.object({
  verdict: InspectionVerdict,
  totalDetected: z.number().int().min(0),
  capsules: z.array(CapsuleSchema),
  summary: z.string().min(1).max(80),
  reasoning: z.string().max(500),
  requiresHumanReview: z.boolean(),
})
export type AIInspectionResult = z.infer<typeof AIInspectionResultSchema>
