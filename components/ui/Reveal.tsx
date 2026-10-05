/**
 * components/ui/Reveal.tsx — Staggered entrance animation wrapper.
 *
 * Fades + rises children with a configurable delay.
 * Respects prefers-reduced-motion (renders children directly).
 * Used in the hero for sequential element reveal.
 *
 * IDENT-01: no raw hex or gray-* usage.
 */
'use client'

import { motion, useReducedMotion } from 'motion/react'

interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: delay / 1000,
        ease: [0.0, 0.0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
