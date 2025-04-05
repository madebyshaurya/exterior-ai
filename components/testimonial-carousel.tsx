"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Homeowner",
    avatar: "/placeholder.svg?height=100&width=100",
    content:
      "ExteriorAI transformed my backyard planning experience. I was able to visualize exactly how my space would look before hiring a landscaper, saving me thousands in potential mistakes.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Property Developer",
    avatar: "/placeholder.svg?height=100&width=100",
    content:
      "As a property developer, I use ExteriorAI for all my projects now. The ability to show clients realistic visualizations of outdoor spaces has increased our closing rate by 40%.",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Landscape Architect",
    avatar: "/placeholder.svg?height=100&width=100",
    content:
      "I recommend ExteriorAI to all my clients. It helps them understand my vision and makes the collaboration process so much smoother. It's a game-changer for our industry.",
  },
]

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const next = () => {
    setCurrent((current) => (current === testimonials.length - 1 ? 0 : current + 1))
  }

  const prev = () => {
    setCurrent((current) => (current === 0 ? testimonials.length - 1 : current - 1))
  }

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      next()
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-xl bg-white p-8 shadow-lg mx-auto max-w-4xl"
        onMouseEnter={() => setAutoplay(false)}
        onMouseLeave={() => setAutoplay(true)}
      >
        <div className="absolute top-6 left-8 text-green-500 opacity-20">
          <Quote size={80} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <blockquote className="text-xl text-gray-700 text-center italic mb-8 pt-6">
              "{testimonials[current].content}"
            </blockquote>

            <div className="flex flex-col items-center justify-center">
              <Avatar className="h-16 w-16 mb-4 border-2 border-green-100">
                <AvatarImage src={testimonials[current].avatar} alt={testimonials[current].name} />
                <AvatarFallback>{testimonials[current].name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">{testimonials[current].name}</h4>
                <p className="text-gray-500">{testimonials[current].role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center mt-8 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === current ? "bg-green-600 w-6" : "bg-gray-300"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-md hover:bg-green-50 z-10 hidden md:flex"
        onClick={prev}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous testimonial</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-md hover:bg-green-50 z-10 hidden md:flex"
        onClick={next}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next testimonial</span>
      </Button>
    </div>
  )
}

