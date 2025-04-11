import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { 
  X, 
  ExternalLink, 
  Github, 
  Codepen, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Clock,
  Users,
  BarChart4,
  Code,
  Tag,
  Layers,
  FileCode2,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ArrowRight,
  Info,
  Copy,
  Check,
  Download,
  PlayCircle,
  ImageIcon,
  Quote as QuoteIcon,
  AlertCircle,
  Minus,
  Type
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Project as ProjectType, Block } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';

// Customize the Project type with proper typing for arrays
type Project = Omit<ProjectType, 'createdAt'> & {
  languages: string[] | null;
  topics: string[] | null;
  blocks: Block[] | null;
  slideshowImages: string[] | null;
  createdAt: Date | string | null;
}

interface ProjectDetailsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

// Add this function at the top level, before the component
const downloadCode = (code: string, language: string) => {
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `code.${language}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}: ProjectDetailsModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fullscreenGallery, setFullscreenGallery] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<null | 'left' | 'right'>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  const modalControls = useAnimation();
  const dragThreshold = 100; // Pixels to drag before closing
  const horizontalDragThreshold = 150; // Pixels to drag horizontally for navigation
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Control body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close when clicking outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Handle drag end for swipe to close
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.y > dragThreshold) {
      onClose();
    } else {
      modalControls.start({ y: 0 });
    }
  };

  // Handle horizontal drag end for project navigation
  const handleHorizontalDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > horizontalDragThreshold) {
      if (info.offset.x > 0 && hasPrevious) {
        // Swiped right, go to previous
        setSwipeDirection('right');
        setTimeout(() => {
          onPrevious?.();
          setSwipeDirection(null);
        }, 300);
      } else if (info.offset.x < 0 && hasNext) {
        // Swiped left, go to next
        setSwipeDirection('left');
        setTimeout(() => {
          onNext?.();
          setSwipeDirection(null);
        }, 300);
      }
    }
  };

  // Helper function to format date
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Unknown';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get project type label
  const getProjectTypeLabel = (type: string | null) => {
    if (!type) return null;
    
    const typeMap: Record<string, string> = {
      personal: "Personal",
      fun: "Fun",
      design: "Design",
      practice: "Practice",
      client: "Client",
      group: "Group",
      challenge: "Challenge",
      school: "School",
      hackathon: "Hackathon",
      open_source: "Open Source",
      portfolio: "Portfolio"
    };
    
    return typeMap[type] || type;
  };

  // Helper function to get status label
  const getStatusLabel = (status: string | null) => {
    if (!status) return null;
    
    const statusMap: Record<string, string> = {
      planning: "Planning",
      started: "Started",
      in_progress: "In Progress",
      completed: "Completed",
      on_hold: "On Hold",
      abandoned: "Abandoned"
    };
    
    return statusMap[status] || status;
  };

  // Helper function to get status color
  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-400";
    
    const colorMap: Record<string, string> = {
      planning: "bg-blue-400",
      started: "bg-purple-400",
      in_progress: "bg-yellow-400",
      completed: "bg-green-400",
      on_hold: "bg-orange-400",
      abandoned: "bg-red-400"
    };
    
    return colorMap[status] || "bg-gray-400";
  };

  // Handle keyboard navigation for fullscreen gallery
  useEffect(() => {
    if (!fullscreenGallery || !project.slideshowImages) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActiveSlideIndex((prev) => 
          prev === 0 ? project.slideshowImages!.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setActiveSlideIndex((prev) => 
          prev === project.slideshowImages!.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === 'Escape') {
        setFullscreenGallery(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenGallery, project.slideshowImages]);

  // Handle mouse wheel scrolling for fullscreen gallery with smoother transitions
  useEffect(() => {
    if (!fullscreenGallery || !project.slideshowImages || !fullscreenRef.current) return;
    
    // If there's only one image, don't add wheel listeners
    if (project.slideshowImages.length <= 1) return;
    
    let isProcessingWheel = false;
    
    const handleWheel = (e: WheelEvent) => {
      // Prevent default scrolling behavior
      e.preventDefault();
      
      // Don't process if we're already handling a wheel event
      if (isProcessingWheel) return;
      
      isProcessingWheel = true;
      
      // Use a more significant threshold to prevent accidental scrolling
      const wheelThreshold = 50;
      
      // Only change slides if the wheel delta is significant
      if (Math.abs(e.deltaY) > wheelThreshold) {
        if (e.deltaY > 0) {
          // Scroll down/right - next image
          setActiveSlideIndex((prev) => 
            prev === project.slideshowImages!.length - 1 ? 0 : prev + 1
          );
        } else if (e.deltaY < 0) {
          // Scroll up/left - previous image
          setActiveSlideIndex((prev) => 
            prev === 0 ? project.slideshowImages!.length - 1 : prev - 1
          );
        }
      }
      
      // Debounce to prevent rapid scrolling
      setTimeout(() => {
        isProcessingWheel = false;
      }, 300);
    };
    
    const currentRef = fullscreenRef.current;
    currentRef.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      currentRef.removeEventListener('wheel', handleWheel);
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    };
  }, [fullscreenGallery, project.slideshowImages]);

  // Handle keyboard navigation for project navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrevious) {
        onPrevious?.();
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext?.();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrevious, hasNext, onPrevious, onNext, onClose]);

  // Handle vertical swipe/drag for closing
  const handleVerticalSwipe = (info: PanInfo) => {
    if (Math.abs(info.offset.y) > dragThreshold) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md overflow-hidden"
          onClick={handleOverlayClick}
          ref={overlayRef}
        >
          {/* Improved keyboard shortcut indicator */}
          <div className="fixed bottom-6 right-6 bg-black/70 px-3 py-2 rounded-lg backdrop-blur-sm text-white/90 text-xs z-20 shadow-lg border border-white/10 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">←→</span>
              <span>Navigate</span>
            </div>
            <div className="h-3 w-px bg-gray-500/50"></div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Esc</span>
              <span>Close</span>
            </div>
          </div>

          {/* Next/Previous Project Navigation - Outside the modal */}
          {hasPrevious && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={(e) => {
                e.stopPropagation();
                onPrevious?.();
              }}
              className="fixed left-4 md:left-6 top-1/2 -translate-y-1/2 z-[51] w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 text-white/70 hover:text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 hover:scale-110 shadow-lg"
              whileHover={{ scale: 1.1, x: -5 }}
            >
              <ChevronLeft size={24} />
            </motion.button>
          )}
          
          {hasNext && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                onNext?.();
              }}
              className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-[51] w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 text-white/70 hover:text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 hover:scale-110 shadow-lg"
              whileHover={{ scale: 1.1, x: 5 }}
            >
              <ChevronRight size={24} />
            </motion.button>
          )}

          {/* Fullscreen Gallery Mode - Fixed above everything else */}
          <AnimatePresence>
            {fullscreenGallery && project.slideshowImages && project.slideshowImages.length > 0 && (
              <motion.div 
                ref={fullscreenRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                  // Only close fullscreen gallery, not the entire modal
                  if (Math.abs(info.offset.y) > 100) {
                    if (isZoomed) {
                      setIsZoomed(false);
                    } else {
                      setFullscreenGallery(false);
                    }
                  }
                }}
                onClick={(e) => {
                  // Only close if clicking directly on the background
                  if (e.target === e.currentTarget) {
                    if (isZoomed) {
                      setIsZoomed(false);
                    } else {
                      setFullscreenGallery(false);
                    }
                  }
                }}
              >
                {/* Improved instruction indicator - more visible and minimal */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-white/90 z-10 flex items-center gap-3 shadow-lg border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">←→</span>
                    <span className="text-xs">Arrow Keys</span>
                  </div>
                  <div className="h-4 w-px bg-gray-500/50"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Double-tap</span>
                    <span className="text-xs font-medium">Zoom</span>
                  </div>
                  <div className="h-4 w-px bg-gray-500/50"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Swipe</span>
                    <span className="text-xs font-medium">Up/Down</span>
                    <span className="text-xs">to close</span>
                  </div>
                </div>
                
                <button 
                  className="absolute top-4 right-4 p-3 rounded-full bg-black/60 hover:bg-gray-800/80 text-white z-10 shadow-lg hover:scale-110 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenGallery(false);
                  }}
                >
                  <Minimize2 size={24} />
                </button>
                
                <div className="relative w-full h-full flex items-center justify-center">
                  <motion.div 
                    className="w-full h-full flex items-center justify-center"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, info) => {
                      // Improved drag detection with better threshold
                      if (info.offset.x > 100 && activeSlideIndex > 0) {
                        // Swiped right, go to previous image
                        setSwipeDirection('right');
                        setActiveSlideIndex(prev => prev - 1);
                        // Reset swipe direction after animation
                        setTimeout(() => setSwipeDirection(null), 300);
                      } else if (info.offset.x < -100 && activeSlideIndex < project.slideshowImages!.length - 1) {
                        // Swiped left, go to next image
                        setSwipeDirection('left');
                        setActiveSlideIndex(prev => prev + 1);
                        // Reset swipe direction after animation
                        setTimeout(() => setSwipeDirection(null), 300);
                      }
                    }}
                    whileTap={{ scale: 0.98, opacity: 0.8 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={activeSlideIndex}
                        className="relative w-full h-full flex justify-center items-center"
                        initial={{ opacity: 0, x: swipeDirection === 'left' ? 100 : swipeDirection === 'right' ? -100 : 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0 }}
                        transition={{ 
                          duration: 0.3, 
                          ease: "easeInOut",
                          opacity: { duration: 0.2 } 
                        }}
                        style={{ touchAction: "none" }}
                      >
                        {/* Tap zone for previous image */}
                        {project.slideshowImages.length > 1 && activeSlideIndex > 0 && (
                          <div 
                            className="absolute left-0 top-0 w-1/4 h-full z-10 cursor-w-resize group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSwipeDirection('right');
                              setActiveSlideIndex(prev => 
                                prev === 0 ? project.slideshowImages!.length - 1 : prev - 1
                              );
                              setTimeout(() => setSwipeDirection(null), 300);
                            }}
                          >
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                              <ChevronLeft size={20} className="text-white/0 group-hover:text-white/100 transition-all duration-300" />
                            </div>
                          </div>
                        )}
                        
                        {/* Tap zone for next image */}
                        {project.slideshowImages.length > 1 && activeSlideIndex < project.slideshowImages.length - 1 && (
                          <div 
                            className="absolute right-0 top-0 w-1/4 h-full z-10 cursor-e-resize group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSwipeDirection('left');
                              setActiveSlideIndex(prev => 
                                prev === project.slideshowImages!.length - 1 ? 0 : prev + 1
                              );
                              setTimeout(() => setSwipeDirection(null), 300);
                            }}
                          >
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                              <ChevronRight size={20} className="text-white/0 group-hover:text-white/100 transition-all duration-300" />
                            </div>
                          </div>
                        )}
                        
                        <img 
                          src={project.slideshowImages[activeSlideIndex]} 
                          alt={`Project fullscreen image ${activeSlideIndex + 1}`}
                          className={`max-w-[90%] max-h-[90vh] object-contain select-none cursor-grab active:cursor-grabbing transition-transform duration-300 ${isZoomed ? 'scale-150' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle double tap/click to zoom
                            const now = new Date().getTime();
                            const timeSince = now - lastTapTime;
                            if (timeSince < 300 && timeSince > 0) {
                              // Double tap detected
                              setIsZoomed(!isZoomed);
                            }
                            setLastTapTime(now);
                          }}
                          onTouchStart={(e) => {
                            setTouchStartX(e.touches[0].clientX);
                          }}
                          onTouchEnd={(e) => {
                            if (isZoomed) return; // Don't handle swipes when zoomed
                            
                            const touchEndX = e.changedTouches[0].clientX;
                            const diff = touchEndX - touchStartX;
                            
                            // Only process if it's a significant horizontal swipe
                            if (Math.abs(diff) > 50) {
                              if (diff > 0 && activeSlideIndex > 0) {
                                // Swiped right, go to previous image
                                setSwipeDirection('right');
                                setActiveSlideIndex(prev => prev - 1);
                                setTimeout(() => setSwipeDirection(null), 300);
                              } else if (diff < 0 && activeSlideIndex < project.slideshowImages!.length - 1) {
                                // Swiped left, go to next image
                                setSwipeDirection('left');
                                setActiveSlideIndex(prev => prev + 1);
                                setTimeout(() => setSwipeDirection(null), 300);
                              }
                            }
                          }}
                          draggable="false"
                        />
                      </motion.div>
                    </AnimatePresence>
                    
                    {/* Drag guides - show when dragging */}
                    <motion.div 
                      className="absolute inset-0 pointer-events-none flex items-center"
                      initial={{ opacity: 0 }}
                      whileTap={{ opacity: 1 }}
                    >
                      <div className="w-full flex justify-between px-8">
                        <div className={`bg-white/10 backdrop-blur-sm h-16 w-16 rounded-full flex items-center justify-center ${activeSlideIndex === 0 ? 'opacity-30' : 'opacity-70'}`}>
                          <ChevronLeft size={30} className="text-white" />
                        </div>
                        <div className={`bg-white/10 backdrop-blur-sm h-16 w-16 rounded-full flex items-center justify-center ${activeSlideIndex === project.slideshowImages.length - 1 ? 'opacity-30' : 'opacity-70'}`}>
                          <ChevronRight size={30} className="text-white" />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm text-white/80 text-sm">
                    {activeSlideIndex + 1} / {project.slideshowImages.length}
                  </div>
                  
                  {/* Zoom indicator */}
                  {isZoomed && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm text-white/80 text-sm flex items-center gap-2">
                      <span>Zoomed</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsZoomed(false);
                        }}
                        className="ml-2 text-white/70 hover:text-white/100 transition-colors"
                      >
                        <Minimize2 size={14} />
                      </button>
                    </div>
                  )}

                  {/* Only show navigation buttons if there are more than 1 image and not zoomed */}
                  {project.slideshowImages.length > 1 && !isZoomed && (
                    <>
                      <button 
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSlideIndex((prev) => 
                            prev === 0 ? project.slideshowImages!.length - 1 : prev - 1
                          );
                        }}
                      >
                        <ArrowLeft size={20} />
                      </button>
                      
                      <button 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSlideIndex((prev) => 
                            prev === project.slideshowImages!.length - 1 ? 0 : prev + 1
                          );
                        }}
                      >
                        <ArrowRight size={20} />
                      </button>
                    </>
                  )}
                  
                  {/* Only show indicators if there are more than 1 image and not zoomed */}
                  {project.slideshowImages.length > 1 && !isZoomed && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {project.slideshowImages.map((_, index) => (
                        <button
                          key={index}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === activeSlideIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-gray-500 hover:bg-gray-400'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlideIndex(index);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={{
              opacity: 1,
              scale: 1,
              x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0,
            }}
            initial={{ opacity: 0, scale: 0.95, x: 0 }}
            exit={{ 
              opacity: 0, 
              scale: 0.95,
              x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0,
            }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300 
            }}
            className="relative w-full max-w-4xl mx-auto my-8 max-h-[90vh] overflow-y-auto rounded-xl bg-gray-900 border border-gray-800 shadow-2xl custom-scrollbar"
            data-open={isOpen}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Swipe indicators - only show during swipe */}
            <AnimatePresence>
              {swipeDirection === 'left' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-start"
                >
                  <div className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center ml-4 backdrop-blur-sm">
                    <ChevronRight size={30} className="text-white" />
                  </div>
                </motion.div>
              )}
              {swipeDirection === 'right' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-end"
                >
                  <div className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm">
                    <ChevronLeft size={30} className="text-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drag handle indicator */}
            <div className="absolute top-2 left-0 right-0 flex justify-center">
              <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Project banner */}
            <div className="relative h-64 w-full">
              {project.bannerImage ? (
                <img 
                  src={project.bannerImage} 
                  alt={project.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-900 to-indigo-900" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.projectType && (
                    <span className="px-3 py-1 text-sm font-medium bg-indigo-900 text-indigo-200 rounded-full">
                      {getProjectTypeLabel(project.projectType)}
                    </span>
                  )}
                  {project.status && (
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-white">{project.name}</h2>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Project description */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-300">{project.description}</p>
              </div>

              {/* Project details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - always render */}
                <div className="space-y-6">
                  {/* Languages */}
                  {(project.languages && project.languages.length > 0) || project.customLanguage ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Code size={18} className="text-purple-400" />
                        <h4 className="text-lg font-medium text-white">Languages</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.languages && project.languages.map((lang, index) => (
                          <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-200">
                            {lang}
                          </Badge>
                        ))}
                        {project.customLanguage && (
                          <Badge variant="secondary" className="bg-gray-800 text-gray-200">
                            {project.customLanguage}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Topics */}
                  {(project.topics && project.topics.length > 0) || project.customTopic ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag size={18} className="text-purple-400" />
                        <h4 className="text-lg font-medium text-white">Topics</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.topics && project.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-200">
                            {topic}
                          </Badge>
                        ))}
                        {project.customTopic && (
                          <Badge variant="secondary" className="bg-gray-800 text-gray-200">
                            {project.customTopic}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Difficulty */}
                  {project.difficulty && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart4 size={18} className="text-purple-400" />
                        <h4 className="text-lg font-medium text-white">Difficulty</h4>
                      </div>
                      <Badge variant="outline" className="text-gray-200 border-gray-700">
                        {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Created Date - Moved to left column if it's the only content */}
                  {(!project.teamSize && !(project.completionTime && project.completionTimeUnit)) && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={18} className="text-purple-400" />
                        <h4 className="text-lg font-medium text-white">Created</h4>
                      </div>
                      <p className="text-gray-300">{formatDate(project.createdAt)}</p>
                    </div>
                  )}
                </div>

                {/* Right column - only render if there's content for it */}
                {(project.teamSize || (project.completionTime && project.completionTimeUnit)) && (
                  <div className="space-y-6">
                    {/* Team Size */}
                    {project.teamSize && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users size={18} className="text-purple-400" />
                          <h4 className="text-lg font-medium text-white">Team Size</h4>
                        </div>
                        <p className="text-gray-300">{project.teamSize}</p>
                      </div>
                    )}

                    {/* Completion Time */}
                    {project.completionTime && project.completionTimeUnit && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={18} className="text-purple-400" />
                          <h4 className="text-lg font-medium text-white">Completion Time</h4>
                        </div>
                        <p className="text-gray-300">
                          {project.completionTime} {project.completionTimeUnit}
                        </p>
                      </div>
                    )}

                    {/* Created Date - Only show here if there's other content in right column */}
                    {(project.teamSize || (project.completionTime && project.completionTimeUnit)) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={18} className="text-purple-400" />
                          <h4 className="text-lg font-medium text-white">Created</h4>
                        </div>
                        <p className="text-gray-300">{formatDate(project.createdAt)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Links section */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Links</h3>
                <div className="flex flex-wrap gap-3 justify-start">
                  {project.link ? (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span>Live Project</span>
                    </a>
                  ) : null}
                  
                  {project.githubUrl && project.includeGitHub ? (
                    <a 
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <Github size={16} />
                      <span>GitHub Repository</span>
                    </a>
                  ) : null}
                  
                  {project.codepenUrl && project.includeCodePen ? (
                    <a 
                      href={project.codepenUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <Codepen size={16} />
                      <span>CodePen</span>
                    </a>
                  ) : null}

                  {!project.link && !(project.githubUrl && project.includeGitHub) && !(project.codepenUrl && project.includeCodePen) && (
                    <span className="text-gray-500">No links available</span>
                  )}
                </div>
              </div>

              {/* Slideshow images */}
              {project.slideshowImages && project.slideshowImages.length > 0 && (
                <div className="mb-8 relative">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white">Gallery</h3>
                  </div>
                  
                  {/* Fullscreen button positioned at top-right of gallery */}
                  <button 
                    onClick={() => {
                      setFullscreenGallery(true);
                      setActiveSlideIndex(0);
                    }}
                    className="absolute top-12 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white hover:scale-110 transition-all duration-300 shadow-lg backdrop-blur-sm flex items-center justify-center"
                    title="View fullscreen gallery"
                  >
                    <Maximize2 size={20} />
                  </button>
                  
                  <div className="relative overflow-hidden rounded-xl group">
                    <Carousel className="w-full" opts={{ slidesToScroll: 1, align: 'start' }}>
                      <CarouselContent className="-ml-2 md:-ml-4">
                        {project.slideshowImages.map((image, index) => (
                          <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 cursor-pointer">
                            <div 
                              className="overflow-hidden rounded-xl relative group h-56 transition-all duration-300 transform hover:shadow-lg hover:shadow-purple-500/20 border-2 border-transparent hover:border-purple-500/30"
                              onClick={() => {
                                setActiveSlideIndex(index);
                                setFullscreenGallery(true);
                              }}
                            >
                              <img 
                                src={image} 
                                alt={`Project image ${index + 1}`} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-start p-3">
                                <div className="flex items-center gap-2">
                                  <Maximize2 className="text-white" size={16} />
                                  <span className="text-white text-sm font-medium">View</span>
                                </div>
                              </div>
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <div className="bg-black/60 rounded-full h-6 w-6 flex items-center justify-center backdrop-blur-sm">
                                  <span className="text-white text-xs">{index + 1}</span>
                                </div>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {project.slideshowImages.length > 2 && (
                        <>
                          <CarouselPrevious className="left-2 w-10 h-10 bg-black/60 hover:bg-black/80 border-purple-600/30 hover:border-purple-600 text-white shadow-lg transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                          <CarouselNext className="right-2 w-10 h-10 bg-black/60 hover:bg-black/80 border-purple-600/30 hover:border-purple-600 text-white shadow-lg transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </>
                      )}
                    </Carousel>
                  </div>
                </div>
              )}

              {/* Project content blocks */}
              {project.blocks && project.blocks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers size={20} className="text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">Project Content</h3>
                  </div>
                  <div className="space-y-6">
                    {project.blocks.map((block, index) => {
                      switch (block.type) {
                        case 'text':
                          return (
                            <div key={index} className="text-gray-300">
                              {block.content}
                            </div>
                          );
                        case 'image':
                          return (
                            <div key={index} className="rounded-lg overflow-hidden">
                              <img 
                                src={block.content} 
                                alt={`Content ${index}`} 
                                className="w-full max-h-96 object-contain"
                              />
                              {block.metadata?.caption && (
                                <p className="text-sm text-gray-400 mt-2">{block.metadata.caption}</p>
                              )}
                            </div>
                          );
                        case 'link':
                          return (
                            <a 
                              key={index}
                              href={block.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                            >
                              <ExternalLink size={16} />
                              {block.metadata?.title || block.content}
                            </a>
                          );
                        case 'code':
                          return (
                            <div key={index} className="relative mt-12 pb-4 border border-gray-800 rounded-lg overflow-hidden">
                              {/* Code block header - now positioned as a normal element at the top with padding */}
                              <div className="bg-gray-800 flex items-center justify-between px-4 py-2 border-b border-gray-700">
                                <div className="flex items-center gap-2">
                                  <FileCode2 size={16} className="text-purple-400" />
                                  <span className="text-sm text-gray-300 font-medium">
                                    {block.metadata?.language || 'Code'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(block.content);
                                      setCopiedIndex(index);
                                      setTimeout(() => setCopiedIndex(null), 2000);
                                    }}
                                    className="p-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                                    title="Copy code"
                                  >
                                    {copiedIndex === index ? (
                                      <>
                                        <Check size={14} className="text-green-400" />
                                        <span className="text-xs">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={14} />
                                        <span className="text-xs">Copy</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => downloadCode(block.content, block.metadata?.language || 'txt')}
                                    className="p-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                                    title="Download code"
                                  >
                                    <Download size={14} />
                                    <span className="text-xs">Download</span>
                                  </button>
                                </div>
                              </div>
                              
                              {/* Code content */}
                              <div>
                                <SyntaxHighlighter
                                  language={block.metadata?.language || 'text'}
                                  style={vscDarkPlus}
                                  customStyle={{
                                    margin: 0,
                                    padding: '1rem',
                                    borderRadius: '0',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.5',
                                    background: 'rgb(17, 24, 39)',
                                    borderTop: 'none'
                                  }}
                                  showLineNumbers={true}
                                  wrapLines={true}
                                  lineNumberStyle={{
                                    color: 'rgb(156, 163, 175)',
                                    minWidth: '2.5em',
                                    paddingRight: '1em',
                                    textAlign: 'right',
                                    userSelect: 'none'
                                  }}
                                >
                                  {block.content}
                                </SyntaxHighlighter>
                              </div>
                            </div>
                          );
                        case 'video':
                          return (
                            <div key={index} className="rounded-lg overflow-hidden border border-gray-800">
                              <div className="aspect-video w-full">
                                {block.content.includes('youtube.com') || block.content.includes('youtu.be') ? (
                                  <iframe
                                    src={block.content.replace('watch?v=', 'embed/')}
                                    className="w-full h-full"
                                    title={`Video content ${index}`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                ) : (
                                  <video 
                                    src={block.content} 
                                    controls 
                                    className="w-full h-full object-cover"
                                    poster={block.metadata?.thumbnail}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                )}
                              </div>
                              {block.metadata?.caption && (
                                <div className="p-3 bg-gray-900 border-t border-gray-800">
                                  <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <PlayCircle size={14} className="text-purple-400" />
                                    <p>{block.metadata.caption}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        case 'gif':
                          return (
                            <div key={index} className="rounded-lg overflow-hidden">
                              <img 
                                src={block.content} 
                                alt={`GIF content ${index}`} 
                                className="w-full object-contain"
                              />
                              {block.metadata?.caption && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                                  <ImageIcon size={14} className="text-purple-400" />
                                  <p>{block.metadata.caption}</p>
                                </div>
                              )}
                            </div>
                          );
                        case 'icon':
                          return (
                            <div key={index} className="flex justify-center p-6">
                              <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 flex flex-col items-center gap-3">
                                <img 
                                  src={block.content} 
                                  alt={`Icon content ${index}`} 
                                  className="w-16 h-16 object-contain"
                                />
                                {block.metadata?.caption && (
                                  <p className="text-sm text-gray-300 font-medium">{block.metadata.caption}</p>
                                )}
                              </div>
                            </div>
                          );
                        case 'title':
                          return (
                            <div key={index} className="py-2">
                              <div className="flex items-center gap-2 mb-2">
                                {/* <Type size={18} className="text-purple-400" /> */}
                                <h3 className="text-xl font-bold text-purple-400">
                                  {block.content}
                                </h3>
                              </div>
                              {block.metadata?.subtitle && (
                                <p className="text-gray-400 ml-6">{block.metadata.subtitle}</p>
                              )}
                            </div>
                          );
                        case 'space':
                          const height = block.metadata?.height || 40;
                          return (
                            <div 
                              key={index} 
                              style={{ height: `${height}px` }} 
                              className="w-full"
                            ></div>
                          );
                        case 'divider':
                          return (
                            <div key={index} className="flex items-center gap-3 py-2">
                              <div className="flex-grow h-px bg-gray-800"></div>
                              {block.content ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Minus size={14} />
                                  <span>{block.content}</span>
                                  <Minus size={14} />
                                </div>
                              ) : null}
                              <div className="flex-grow h-px bg-gray-800"></div>
                            </div>
                          );
                        case 'callout':
                          return (
                            <div key={index} className="bg-gray-800/50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                              <div className="flex gap-3">
                                <AlertCircle size={20} className="text-purple-400 shrink-0 mt-0.5" />
                                <div className="text-gray-300">
                                  {block.content}
                                </div>
                              </div>
                            </div>
                          );
                        case 'quote':
                          return (
                            <div key={index} className="border-l-4 border-gray-700 pl-4 py-1 my-4">
                              <div className="flex gap-3">
                                <QuoteIcon size={20} className="text-gray-500 shrink-0 mt-0.5" />
                                <div>
                                  <blockquote className="text-gray-300 italic">
                                    "{block.content}"
                                  </blockquote>
                                  {block.metadata?.author && (
                                    <div className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                      <span>—</span>
                                      <span>{block.metadata.author}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              )}

              {/* Subtle navigation indicator */}
              <div className="mt-8 flex justify-center items-center gap-2 text-xs text-gray-500">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center gap-1"
                >
                  {hasPrevious && (
                    <span className="flex items-center gap-1">
                      <ChevronLeft size={12} />
                      <span>Previous</span>
                    </span>
                  )}
                  <span className="px-2">|</span>
                  {hasNext && (
                    <span className="flex items-center gap-1">
                      <span>Next</span>
                      <ChevronRight size={12} />
                    </span>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
