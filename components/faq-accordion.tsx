"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How does ExteriorAI work?",
    answer:
      "ExteriorAI uses advanced AI algorithms to transform photos of your outdoor spaces. Simply upload images of your yard, garden, or patio, and our AI will generate realistic visualizations of potential designs based on your preferences.",
  },
  {
    question: "Do I need any design experience to use ExteriorAI?",
    answer:
      "Not at all! ExteriorAI is designed for everyone, from homeowners to professional landscapers. Our intuitive interface makes it easy to create stunning outdoor visualizations without any design experience.",
  },
  {
    question: "How accurate are the AI visualizations?",
    answer:
      "Our AI generates highly realistic visualizations that accurately represent how your space could look. While minor details may vary in the final implementation, the overall design and feel will be very close to what you see in the visualizations.",
  },
  {
    question: "Can I share my designs with my landscaper?",
    answer:
      "You can easily download and share your visualizations with landscapers, contractors, or friends. This helps ensure everyone is on the same page about your vision before any work begins.",
  },
  {
    question: "Is there a limit to how many projects I can create?",
    answer:
      "Free accounts can create up to 3 projects with 2 visualizations each. Premium subscribers enjoy unlimited projects and visualizations, along with additional features like higher resolution exports and priority processing.",
  },
]

export default function FaqAccordion() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => toggleFaq(index)}
            className="flex items-center justify-between w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">{faq.question}</span>
            <ChevronDown
              className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                activeIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {activeIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 text-gray-600 bg-white">{faq.answer}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

