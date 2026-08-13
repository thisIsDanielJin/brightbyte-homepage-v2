/**
 * components/ui/MotionSection.tsx — Reusable viewport-triggered entrance animation wrapper.
 *
 * D-14: whisper-quiet fade + 8-12px rise, once on viewport entry.
 * SEC-11: fully disabled when prefers-reduced-motion is set.
 *
 * Uses motion/react (NOT framer-motion — same code, renamed package).
 * Renders a motion.section so RSC section components can remain async and
 * pass their rendered output as children (Pattern 4: thin 'use client' wrapper).
 *
 * Props:
 *   children  — section content (RSC-rendered)
 *   id        — section id attribute (for anchor nav D-04)
 *   className — additional Tailwind classes
 *
 * Source: 04-RESEARCH.md Pattern 3; 04-UI-SPEC.md Motion Contract.
 */
'use client'

import { motion, useReducedMotion } from 'motion/react'

interface MotionSectionProps {
  children: React.ReactNode
  id?: string
  className?: string
}

export function MotionSection({ children, id, className }: MotionSectionProps) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={
        prefersReduced
          ? { duration: 0 }
          : { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }
      }
    >
      {children}
    </motion.section>
  )
}
