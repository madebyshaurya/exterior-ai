"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageResultProps {
  imageUrl: string;
  responseText: string;
  onClose: () => void;
}

export default function ImageResult({
  imageUrl,
  responseText,
  onClose
}: ImageResultProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `exteriorai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded successfully");
  };
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My ExteriorAI Design",
          text: "Check out this exterior design I created with ExteriorAI!",
          url: imageUrl
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(imageUrl);
        toast.success("Image URL copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share image");
    }
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-4xl mx-auto"
      >
        {/* Image Container */}
        <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image */}
          <div className="relative aspect-video">
            <img
              src={imageUrl}
              alt="Generated exterior design"
              className="w-full h-full object-cover"
            />
            
            {/* Fullscreen Overlay */}
            <AnimatePresence>
              {isFullscreen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
                >
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <img
                      src={imageUrl}
                      alt="Generated exterior design fullscreen"
                      className="max-w-full max-h-full object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70"
                      onClick={toggleFullscreen}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Actions Bar */}
          <div className="p-4 border-t border-gray-100 flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4 mr-2" />
              Fullscreen
            </Button>
          </div>
          
          {/* AI Response */}
          {responseText && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">AI Description:</h3>
              <p className="text-gray-700 text-sm">{responseText}</p>
            </div>
          )}
          
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
