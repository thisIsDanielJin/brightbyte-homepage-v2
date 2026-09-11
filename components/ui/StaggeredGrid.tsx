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
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        visible: { transition: { staggerChildren: 0.08 } },
        hidden: {},
      }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] } },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
