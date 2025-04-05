"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Image, 
  Maximize2,
  ArrowLeftRight
} from "lucide-react";
import { format } from "date-fns";
import { TransformationRecord } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ImageComparison from "@/components/image-comparison";

interface TransformationHistoryProps {
  transformations: TransformationRecord[];
  onCompare: (before: string, after: string) => void;
}

export default function TransformationHistory({
  transformations,
  onCompare
}: TransformationHistoryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTransformation, setSelectedTransformation] = useState<TransformationRecord | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIndex, setCompareIndex] = useState<number | null>(null);

  const sortedTransformations = [...transformations].sort(
    (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()
  );

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(sortedTransformations.length - 1, currentIndex + 1));
  };

  const handleSelectTransformation = (transformation: TransformationRecord) => {
    setSelectedTransformation(transformation);
  };

  const handleCompareClick = (index: number) => {
    if (compareMode) {
      if (compareIndex !== null && compareIndex !== index) {
        // Compare the two selected transformations
        const before = sortedTransformations[Math.min(compareIndex, index)].imageUrl;
        const after = sortedTransformations[Math.max(compareIndex, index)].imageUrl;
        onCompare(before, after);
        setCompareMode(false);
        setCompareIndex(null);
      } else {
        setCompareIndex(index);
      }
    } else {
      setCompareMode(true);
      setCompareIndex(index);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Transformation History</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {currentIndex + 1} / {sortedTransformations.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === sortedTransformations.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative mb-8">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2"></div>
        <div className="relative flex justify-between">
          {sortedTransformations.map((transformation, index) => (
            <div
              key={transformation.id}
              className="relative"
              style={{
                left: `${(index / (sortedTransformations.length - 1)) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              <button
                className={`w-4 h-4 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-green-500 scale-125"
                    : compareMode && compareIndex === index
                    ? "bg-purple-500 scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                } ${
                  compareMode && compareIndex !== null && compareIndex !== index
                    ? "hover:bg-purple-300"
                    : ""
                }`}
                onClick={() => {
                  if (compareMode) {
                    handleCompareClick(index);
                  } else {
                    setCurrentIndex(index);
                  }
                }}
              ></button>
              {index === currentIndex && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-medium bg-white px-2 py-1 rounded shadow">
                  {format(transformation.timestamp.toDate(), "MMM d")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Transformation */}
      <AnimatePresence mode="wait">
        {sortedTransformations.length > 0 && (
          <motion.div
            key={sortedTransformations[currentIndex].id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={sortedTransformations[currentIndex].imageUrl}
                  alt={`Transformation ${currentIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Compare button */}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/80 hover:bg-white"
                    onClick={() => handleCompareClick(currentIndex)}
                  >
                    {compareMode && compareIndex === currentIndex ? (
                      "Cancel Compare"
                    ) : compareMode ? (
                      "Select for Compare"
                    ) : (
                      <>
                        <ArrowLeftRight className="h-3 w-3 mr-1" />
                        Compare
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Previous image indicator */}
                {sortedTransformations[currentIndex].previousImageUrl && (
                  <div className="absolute bottom-2 left-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/80 hover:bg-white"
                      onClick={() => {
                        if (sortedTransformations[currentIndex].previousImageUrl) {
                          onCompare(
                            sortedTransformations[currentIndex].previousImageUrl!,
                            sortedTransformations[currentIndex].imageUrl
                          );
                        }
                      }}
                    >
                      <Maximize2 className="h-3 w-3 mr-1" />
                      View Before/After
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium">
                    Transformation #{sortedTransformations.length - currentIndex}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(
                      sortedTransformations[currentIndex].timestamp.toDate(),
                      "MMM d, yyyy"
                    )}
                    <Clock className="h-3 w-3 ml-2 mr-1" />
                    {format(
                      sortedTransformations[currentIndex].timestamp.toDate(),
                      "h:mm a"
                    )}
                  </div>
                </div>
                
                {sortedTransformations[currentIndex].prompt && (
                  <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Prompt
                    </div>
                    {sortedTransformations[currentIndex].prompt}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Mode Instructions */}
      {compareMode && (
        <div className="mt-4 bg-purple-50 p-3 rounded-md text-sm text-purple-700 flex items-center">
          <ArrowLeftRight className="h-4 w-4 mr-2 text-purple-500" />
          {compareIndex === null
            ? "Select the first image to compare"
            : "Now select the second image to compare"}
        </div>
      )}

      {/* Thumbnails */}
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-3">All Transformations</h4>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {sortedTransformations.map((transformation, index) => (
            <div
              key={transformation.id}
              className={`relative aspect-square rounded-md overflow-hidden cursor-pointer transition-all ${
                index === currentIndex
                  ? "ring-2 ring-green-500"
                  : compareMode && compareIndex === index
                  ? "ring-2 ring-purple-500"
                  : "hover:opacity-80"
              }`}
              onClick={() => {
                if (compareMode) {
                  handleCompareClick(index);
                } else {
                  setCurrentIndex(index);
                }
              }}
            >
              <img
                src={transformation.imageUrl}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors">
                {compareMode && compareIndex === index && (
                  <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20">
                    <div className="bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      1
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
