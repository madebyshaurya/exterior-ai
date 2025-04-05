"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface ParallaxElementProps {
  children: React.ReactNode
  speed?: number
  direction?: "up" | "down" | "left" | "right"
  className?: string
}

export default function ParallaxElement({
  children,
  speed = 0.5,
  direction = "up",
  className = "",
}: ParallaxElementProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Calculate transform based on direction
  const upTransform = useTransform(scrollYProgress, [0, 1], ["0%", `${-100 * speed}%`])
  const downTransform = useTransform(scrollYProgress, [0, 1], ["0%", `${100 * speed}%`])
  const leftTransform = useTransform(scrollYProgress, [0, 1], ["0%", `${-100 * speed}%`])
  const rightTransform = useTransform(scrollYProgress, [0, 1], ["0%", `${100 * speed}%`])

  const getTransform = () => {
    switch (direction) {
      case "up":
        return upTransform
      case "down":
        return downTransform
      case "left":
        return leftTransform
      case "right":
        return rightTransform
      default:
        return upTransform
    }
  }

  const y = direction === "up" || direction === "down" ? getTransform() : "0%"
  const x = direction === "left" || direction === "right" ? getTransform() : "0%"

  return (
    <motion.div ref={ref} style={{ y, x }} className={className}>
      {children}
    </motion.div>
  )
}

