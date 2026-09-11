'use client'

import { motion, useReducedMotion } from 'motion/react'

interface StaggeredGridProps {
  children: React.ReactNode[]
  className?: string
}

export function StaggeredGrid({ children, className }: StaggeredGridProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ y: 18 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: i * 0.07, ease: [0.0, 0.0, 0.2, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
