"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  label: string
  duration?: number
  delay?: number
}

export default function AnimatedCounter({ value, label, duration = 2, delay = 0.2 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)

      let start = 0
      const end = Math.min(value, 999999)
      const incrementTime = (duration * 1000) / end
      const timer = setInterval(() => {
        start += 1
        setCount(start)
        if (start >= end) clearInterval(timer)
      }, incrementTime)

      return () => clearInterval(timer)
    }
  }, [isInView, value, duration, hasAnimated])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <span className="text-4xl font-bold text-green-600 mb-2">{formatNumber(count)}</span>
      <span className="text-gray-600 text-center">{label}</span>
    </motion.div>
  )
}

