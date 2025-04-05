"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  onClose?: () => void;
}

export default function ImageComparison({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  onClose,
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFullBefore, setShowFullBefore] = useState(false);
  const [showFullAfter, setShowFullAfter] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Initial animation
  useEffect(() => {
    // Start with showing the before image
    setSliderPosition(0);

    // After a delay, animate to the middle position
    const timer = setTimeout(() => {
      setSliderPosition(50);
      setAnimationComplete(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;

    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;

    setSliderPosition(percentage);
  };

  // Quick toggle buttons
  const showBefore = () => {
    setShowFullBefore(true);
    setSliderPosition(0);
    setTimeout(() => setShowFullBefore(false), 1000);
  };

  const showAfter = () => {
    setShowFullAfter(true);
    setSliderPosition(100);
    setTimeout(() => setShowFullAfter(false), 1000);
  };

  const resetSlider = () => {
    setSliderPosition(50);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full rounded-lg overflow-hidden"
    >
      <div className="relative bg-black h-full">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-2 bg-gradient-to-b from-black/70 to-transparent">
          <div className="text-white text-sm font-medium">
            Compare Transformation
          </div>
        </div>

        {/* Image container */}
        <div
          ref={containerRef}
          className="relative w-full aspect-video select-none cursor-col-resize"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
        >
          {/* Before image (full width) */}
          <div className="absolute inset-0">
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {beforeLabel}
            </div>
          </div>

          {/* After image (clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={afterImage}
              alt={afterLabel}
              className="absolute top-0 left-0 w-full h-full object-cover"
              style={{ width: `${100 / (sliderPosition / 100)}%` }}
            />
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {afterLabel}
            </div>
          </div>

          {/* Slider handle */}
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-10"
            style={{ left: `${sliderPosition}%` }}
            animate={{
              x: "-50%",
              boxShadow: isDragging
                ? "0 0 0 4px rgba(255,255,255,0.5)"
                : "none",
            }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="flex items-center justify-center">
                <ArrowLeft className="h-3 w-3 text-gray-700" />
                <ArrowRight className="h-3 w-3 text-gray-700" />
              </div>
            </div>
          </motion.div>

          {/* Full before/after overlays */}
          {showFullBefore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <div className="text-white text-2xl font-bold">{beforeLabel}</div>
            </motion.div>
          )}

          {showFullAfter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <div className="text-white text-2xl font-bold">{afterLabel}</div>
            </motion.div>
          )}
        </div>

        {/* Simplified controls */}
        {animationComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-0 left-0 right-0 z-10 flex justify-center items-center p-2 bg-gradient-to-t from-black/70 to-transparent"
          >
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={showBefore}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs py-1 h-7"
              >
                Before
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetSlider}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs py-1 h-7"
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={showAfter}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs py-1 h-7"
              >
                After
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
