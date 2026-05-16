'use client'

import gsap from 'gsap'
import { useEffect, useRef } from 'react'

export function TrainingParticle({
  particleKey,
  fromRef,
  toRef,
}: {
  particleKey: number
  fromRef: React.RefObject<HTMLElement | null>
  toRef: React.RefObject<HTMLElement | null>
}) {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (particleKey === 0) return
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const fromEl = fromRef.current
    const toEl = toRef.current
    const particle = elRef.current
    if (!fromEl || !toEl || !particle) return

    const fromRect = fromEl.getBoundingClientRect()
    const toRect = toEl.getBoundingClientRect()
    const startX = fromRect.left + fromRect.width / 2
    const startY = fromRect.top + fromRect.height / 2
    const endX = toRect.left + toRect.width / 2
    const endY = toRect.top + toRect.height / 2

    gsap.set(particle, {
      x: startX,
      y: startY,
      opacity: 1,
      scale: 1,
      display: 'block',
    })

    // Build arc trajectory via timeline (apex above midpoint)
    const midX = (startX + endX) / 2
    const arcY = Math.min(startY, endY) - 120

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(particle, { display: 'none' })
      },
    })
    tl.to(particle, {
      duration: 0.55,
      ease: 'power2.out',
      x: midX,
      y: arcY,
    })
    tl.to(particle, {
      duration: 0.5,
      ease: 'power2.in',
      x: endX,
      y: endY,
    })
    tl.to(particle, { duration: 0.25, opacity: 0, scale: 0.3 }, '>-0.15')

    return () => {
      tl.kill()
    }
  }, [particleKey, fromRef, toRef])

  return (
    <div
      ref={elRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 14,
        height: 14,
        marginLeft: -7,
        marginTop: -7,
        borderRadius: 9999,
        background: 'var(--lv-cyan)',
        boxShadow: '0 0 20px 6px rgba(17,165,214,0.7), 0 0 4px 2px rgba(17,165,214,1)',
        pointerEvents: 'none',
        zIndex: 60,
        display: 'none',
      }}
    />
  )
}
