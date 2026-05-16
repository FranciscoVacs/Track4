'use server'

import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { AIInspectionResultSchema, type AIInspectionResult } from '@/lib/schema'
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts'
import { validateImage, getMimeType, fileToBase64 } from '@/lib/image-utils'

let _referenceBase64: string | null = null
const CLASSIFY_TIMEOUT_MS = 20_000

async function getReferenceBase64(): Promise<string | null> {
  if (_referenceBase64) return _referenceBase64
  try {
    const { readFile } = await import('fs/promises')
    const { join } = await import('path')
    const candidates = ['p4.jpeg', 'p4.jpg']
    for (const name of candidates) {
      try {
        const buf = await readFile(join(process.cwd(), 'public/products', name))
        _referenceBase64 = buf.toString('base64')
        return _referenceBase64
      } catch {
        // try next
      }
    }
    return null
  } catch {
    return null
  }
}

type ClassifySuccess = { success: true; data: AIInspectionResult & { model: string; processingMs: number } }
type ClassifyError = { success: false; error: string }
type ClassifyResult = ClassifySuccess | ClassifyError

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`timeout:${ms}`))
    }, ms)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

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
  const referenceB64 = await getReferenceBase64()

  type ContentPart = { type: 'text'; text: string } | { type: 'image'; image: string }
  const imageContent: ContentPart[] = []
  if (referenceB64) {
    imageContent.push({ type: 'text', text: 'IMAGEN DE REFERENCIA (producto correcto — no inspeccionar):' })
    imageContent.push({ type: 'image', image: `data:image/jpeg;base64,${referenceB64}` })
    imageContent.push({ type: 'text', text: 'IMAGEN A INSPECCIONAR:' })
  }
  imageContent.push({ type: 'image', image: `data:${mimeType};base64,${base64}` })
  imageContent.push({ type: 'text', text: buildUserPrompt(typeof boxId === 'string' ? boxId : undefined) })

  try {
    const { object } = await withTimeout(
      generateObject({
        model: openai('gpt-4o-mini'),
        schema: AIInspectionResultSchema,
        system: SYSTEM_PROMPT,
        temperature: 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: [{ role: 'user', content: imageContent as any }],
      }),
      CLASSIFY_TIMEOUT_MS,
    )

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
      return { success: false, error: 'Error de autenticación con la API de OpenAI. Verificá la variable OPENAI_API_KEY en .env.local.' }
    }
    if (mensaje.includes('quota') || mensaje.includes('RESOURCE_EXHAUSTED') || mensaje.includes('free_tier')) {
      return { success: false, error: 'Cuota de OpenAI agotada o límite alcanzado. Revisá billing y límites de tu cuenta.' }
    }
    if (mensaje.includes('fetch') || mensaje.includes('network')) {
      return { success: false, error: 'No se pudo conectar con la API de OpenAI. Verificá la conexión a internet.' }
    }
    if (mensaje.includes('timeout:')) {
      return { success: false, error: 'La clasificación tardó demasiado y fue cancelada. Probá con una imagen más liviana o revisá la API.' }
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
  const referenceB64High = await getReferenceBase64()

  type ContentPartHigh = { type: 'text'; text: string } | { type: 'image'; image: string }
  const imageContentHigh: ContentPartHigh[] = []
  if (referenceB64High) {
    imageContentHigh.push({ type: 'text', text: 'IMAGEN DE REFERENCIA (producto correcto — no inspeccionar):' })
    imageContentHigh.push({ type: 'image', image: `data:image/jpeg;base64,${referenceB64High}` })
    imageContentHigh.push({ type: 'text', text: 'IMAGEN A INSPECCIONAR:' })
  }
  imageContentHigh.push({ type: 'image', image: `data:${mimeType};base64,${base64}` })
  imageContentHigh.push({ type: 'text', text: buildUserPrompt(typeof boxId === 'string' ? boxId : undefined) })

  try {
    const { object } = await withTimeout(
      generateObject({
        model: openai('gpt-4o'),
        schema: AIInspectionResultSchema,
        system: SYSTEM_PROMPT,
        temperature: 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: [{ role: 'user', content: imageContentHigh as any }],
      }),
      CLASSIFY_TIMEOUT_MS,
    )

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
      return { success: false, error: 'Error de autenticación con la API de OpenAI. Verificá la variable OPENAI_API_KEY en .env.local.' }
    }
    if (mensaje.includes('quota') || mensaje.includes('RESOURCE_EXHAUSTED') || mensaje.includes('free_tier')) {
      return { success: false, error: 'Cuota de OpenAI agotada o límite alcanzado. Revisá billing y límites de tu cuenta.' }
    }
    if (mensaje.includes('fetch') || mensaje.includes('network')) {
      return { success: false, error: 'No se pudo conectar con la API de OpenAI. Verificá la conexión a internet.' }
    }
    if (mensaje.includes('timeout:')) {
      return { success: false, error: 'La clasificación tardó demasiado y fue cancelada. Probá con una imagen más liviana o revisá la API.' }
    }
    return { success: false, error: `Error al procesar la imagen: ${mensaje}` }
  }
}
