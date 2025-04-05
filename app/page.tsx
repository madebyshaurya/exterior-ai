"use client";

import Link from "next/link";
import { ArrowRight, Leaf, Sparkles, Upload, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
// Import the new components at the top of the file
import TestimonialCarousel from "@/components/testimonial-carousel";
import AnimatedCounter from "@/components/animated-counter";
import FaqAccordion from "@/components/faq-accordion";
import ParallaxElement from "@/components/parallax-element";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-green-600" />
          <span className="text-xl font-bold text-gray-900">ExteriorAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/features" className="text-gray-600 hover:text-gray-900">
            Features
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900">
            About
          </Link>
          <Link href="/login">
            <Button variant="outline" className="ml-4">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-green-600 hover:bg-green-700">Sign up</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      {/* Update the Hero section to include parallax elements */}
      <section className="container mx-auto px-6 py-20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-blue-100 rounded-full opacity-40 blur-3xl" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold leading-tight text-gray-900">
              Transform your outdoor space with{" "}
              <span className="text-green-600 relative">
                AI visualization
                <motion.span
                  className="absolute -z-10 bottom-2 left-0 right-0 h-3 bg-green-100"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600">
              Upload photos of your yard, park, or any outdoor area and see how
              it could look before hiring a landscaper.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 group transition-all duration-300"
                >
                  Get started for free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/examples">
                <Button
                  size="lg"
                  variant="outline"
                  className="transition-all duration-300 hover:bg-green-50"
                >
                  View examples
                </Button>
              </Link>
            </div>
          </motion.div>
          <div className="relative">
            <ParallaxElement
              speed={0.2}
              direction="up"
              className="relative z-10"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src="/hero.png" 
                    alt="AI landscaping transformations"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent" />
                </div>
                <motion.div
                  className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">
                      AI-powered transformations
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </ParallaxElement>
            <ParallaxElement
              speed={0.4}
              direction="down"
              className="absolute -bottom-10 -right-10 z-0"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="w-40 h-40 bg-green-200 rounded-full blur-xl"
              />
            </ParallaxElement>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* Update the Features section with staggered animations and hover effects */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900"
          >
            Visualize your dream outdoor space
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Our AI-powered platform helps you see the potential of your outdoor
            areas before making any investments.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Upload className="h-8 w-8 text-green-600" />,
              title: "Upload your photos",
              description:
                "Simply upload photos of your current outdoor space from any angle.",
            },
            {
              icon: <Sparkles className="h-8 w-8 text-green-600" />,
              title: "AI transformation",
              description:
                "Our AI analyzes your space and generates realistic visualizations of potential designs.",
            },
            {
              icon: <Zap className="h-8 w-8 text-green-600" />,
              title: "3D rendering",
              description:
                "Upload sketches or 3D models to create photorealistic renders of your vision.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                y: -5,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              className="bg-white p-8 rounded-xl shadow-lg transition-all duration-300"
            >
              <motion.div
                className="bg-green-50 p-3 rounded-full w-fit mb-6"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-4 text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Before/After Showcase */}
      {/* Update the Before/After Showcase with interactive hover effects */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900"
          >
            See the transformation
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {[1, 2].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: item * 0.1 }}
              viewport={{ once: true }}
              className="relative group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
                <motion.img
                  src={`/before(${item === 1 ? 1 : 3}).webp`}
                  alt={`Before transformation example ${item}`}
                  className="w-full h-auto"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-20">
                  Before
                </div>
                <motion.div
                  className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-md">
                    View Transformation
                  </span>
                </motion.div>
              </div>
              <div className="relative mt-4 overflow-hidden rounded-xl shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-transparent z-10" />
                <motion.img
                  src={`/after(${item === 1 ? 1 : 2}).webp`}
                  alt={`After transformation example ${item}`}
                  className="w-full h-auto"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm z-20">
                  After
                </div>
                <motion.div
                  className="absolute inset-0 bg-green-600/40 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <span className="text-white font-medium bg-green-700/70 px-4 py-2 rounded-md">
                    View Details
                  </span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <AnimatedCounter value={5000} label="Happy Users" />
          <AnimatedCounter value={12500} label="Projects Created" />
          <AnimatedCounter value={35000} label="AI Transformations" />
          <AnimatedCounter value={98} label="Satisfaction Rate %" />
        </div>
      </section>

      {/* CTA Section */}
      {/* Update the CTA section with more engaging animations */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-12 text-center text-white relative overflow-hidden"
        >
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full"
            animate={{
              x: [0, 10, 0],
              y: [0, 15, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 8,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full"
            animate={{
              x: [0, -20, 0],
              y: [0, 10, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 10,
              ease: "easeInOut",
            }}
          />

          <motion.h2
            className="text-3xl font-bold relative z-10"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Ready to transform your outdoor space?
          </motion.h2>
          <motion.p
            className="mt-4 text-xl max-w-2xl mx-auto relative z-10"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Join thousands of homeowners who have visualized their dream yards
            before spending a dime on landscaping.
          </motion.p>
          <motion.div
            className="mt-8 relative z-10"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-green-600 hover:bg-gray-100 group"
              >
                Get started for free
                <motion.span
                  className="ml-2 inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                    repeatType: "reverse",
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900"
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <FaqAccordion />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 mt-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                <span className="text-xl font-bold text-gray-900">
                  ExteriorAI
                </span>
              </div>
              <p className="mt-4 text-gray-600">
                Transforming outdoor spaces with the power of AI visualization.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Examples
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>© {new Date().getFullYear()} ExteriorAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
