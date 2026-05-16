'use server'

import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { AIInspectionResultSchema, type AIInspectionResult } from '@/lib/schema'
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts'
import { validateImage, getMimeType, fileToBase64 } from '@/lib/image-utils'

type ClassifySuccess = { success: true; data: AIInspectionResult & { model: string; processingMs: number } }
type ClassifyError = { success: false; error: string }
type ClassifyResult = ClassifySuccess | ClassifyError

export async function classifyImage(formData: FormData): Promise<ClassifyResult> {
  const file = formData.get('image')
  const boxId = formData.get('boxId')

  if (!(file instanceof File)) {
    return { success: false, error: 'No se recibió ninguna imagen en el campo "image".' }
  }

  const validation = validateImage(file)
  if (!validation.valid) {
    return { success: false, error: validation.error! }
  }

  let base64: string
  let mimeType: string
  try {
    mimeType = getMimeType(file)
    base64 = await fileToBase64(file)
  } catch {
    return { success: false, error: 'No se pudo procesar la imagen. Verificá que el archivo no esté corrupto.' }
  }

  const inicio = Date.now()

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: AIInspectionResultSchema,
      system: SYSTEM_PROMPT,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: `data:${mimeType};base64,${base64}`,
            },
            {
              type: 'text',
              text: buildUserPrompt(typeof boxId === 'string' ? boxId : undefined),
            },
          ],
        },
      ],
    })

    const processingMs = Date.now() - inicio

    return {
      success: true,
      data: {
        ...object,
        model: 'gpt-4o-mini',
        processingMs,
      },
    }
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error desconocido'
    if (mensaje.includes('API_KEY') || mensaje.includes('401') || mensaje.includes('403')) {
      return { success: false, error: 'Error de autenticación con la API de Gemini. Verificá la variable GOOGLE_GENERATIVE_AI_API_KEY en .env.local.' }
    }
    if (mensaje.includes('quota') || mensaje.includes('RESOURCE_EXHAUSTED') || mensaje.includes('free_tier')) {
      return { success: false, error: 'Cuota de Gemini agotada. Activá billing en console.cloud.google.com o esperá a que se resetee el límite.' }
    }
    if (mensaje.includes('fetch') || mensaje.includes('network') || mensaje.includes('timeout')) {
      return { success: false, error: 'No se pudo conectar con la API de Gemini. Verificá la conexión a internet.' }
    }
    return { success: false, error: `Error al procesar la imagen: ${mensaje}` }
  }
}

export async function classifyImageHighAccuracy(formData: FormData): Promise<ClassifyResult> {
  const file = formData.get('image')
  const boxId = formData.get('boxId')

  if (!(file instanceof File)) {
    return { success: false, error: 'No se recibió ninguna imagen en el campo "image".' }
  }

  const validation = validateImage(file)
  if (!validation.valid) {
    return { success: false, error: validation.error! }
  }

  let base64: string
  let mimeType: string
  try {
    mimeType = getMimeType(file)
    base64 = await fileToBase64(file)
  } catch {
    return { success: false, error: 'No se pudo procesar la imagen. Verificá que el archivo no esté corrupto.' }
  }

  const inicio = Date.now()

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: AIInspectionResultSchema,
      system: SYSTEM_PROMPT,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: `data:${mimeType};base64,${base64}`,
            },
            {
              type: 'text',
              text: buildUserPrompt(typeof boxId === 'string' ? boxId : undefined),
            },
          ],
        },
      ],
    })

    const processingMs = Date.now() - inicio

    return {
      success: true,
      data: {
        ...object,
        model: 'gpt-4o',
        processingMs,
      },
    }
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error desconocido'
    if (mensaje.includes('API_KEY') || mensaje.includes('401') || mensaje.includes('403')) {
      return { success: false, error: 'Error de autenticación con la API de Gemini. Verificá la variable GOOGLE_GENERATIVE_AI_API_KEY en .env.local.' }
    }
    if (mensaje.includes('quota') || mensaje.includes('RESOURCE_EXHAUSTED') || mensaje.includes('free_tier')) {
      return { success: false, error: 'Cuota de Gemini agotada. Activá billing en console.cloud.google.com o esperá a que se resetee el límite.' }
    }
    if (mensaje.includes('fetch') || mensaje.includes('network') || mensaje.includes('timeout')) {
      return { success: false, error: 'No se pudo conectar con la API de Gemini. Verificá la conexión a internet.' }
    }
    return { success: false, error: `Error al procesar la imagen: ${mensaje}` }
  }
}
