import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, Codepen, Clock, Users, Tag, ChevronLeft, ChevronRight, Calendar, BarChart4, Keyboard, Image } from 'lucide-react';
import { Project } from '@/shared/schema';

// Extended Project type to include createdAt that might exist in runtime data
interface ProjectWithDate extends Project {
  createdAt?: Date | string | null;
}

interface ProjectModalProps {
  project: ProjectWithDate;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function ProjectModal({ 
  project, 
  isOpen, 
  onClose, 
  onNext, 
  onPrevious,
  hasNext = false,
  hasPrevious = false
}: ProjectModalProps) {
  // State for showing navigation help tooltip
  const [showNavHelp, setShowNavHelp] = useState(true);
  // State for current image in slideshow
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // State for whether we're showing the slideshow
  const [showSlideshow, setShowSlideshow] = useState(false);

  // Reset current image index when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setShowSlideshow(false);
  }, [project.id]);

  // Hide navigation help after 5 seconds
  useEffect(() => {
    if (isOpen && showNavHelp) {
      const timer = setTimeout(() => {
        setShowNavHelp(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, showNavHelp]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        if (showSlideshow) {
          setShowSlideshow(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        if (showSlideshow && project.slideshowImages?.length) {
          nextImage();
        } else if (hasNext && onNext) {
          onNext();
        }
      } else if (e.key === 'ArrowLeft') {
        if (showSlideshow && project.slideshowImages?.length) {
          prevImage();
        } else if (hasPrevious && onPrevious) {
          onPrevious();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious, hasNext, hasPrevious, showSlideshow, currentImageIndex, project.slideshowImages]);

  // Prevent body scrolling when modal is open
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

  // Format date helper function
  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper to get team label
  const getTeamLabel = (count: number | undefined) => {
    if (!count) return null;
    return count === 1 ? 'Solo Project' : `Team Size: ${count}`;
  };

  // Helper to format difficulty level with proper capitalization
  const formatDifficulty = (difficulty: string | undefined) => {
    if (!difficulty) return '';
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  // Navigation functions for slideshow
  const nextImage = () => {
    if (!project.slideshowImages?.length) return;
    setCurrentImageIndex((prev) => 
      prev === project.slideshowImages!.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!project.slideshowImages?.length) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? project.slideshowImages!.length - 1 : prev - 1
    );
  };

  if (!isOpen) return null;

  // Get team size from either explicit teamSize or length of teamMembers array
  const teamSize = project.teamSize || (project.teamMembers?.length || 0);
  
  // Determine if we have slideshow images
  const hasSlideshow = project.slideshowImages && project.slideshowImages.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Navigation help tooltip */}
          {(hasPrevious || hasNext) && showNavHelp && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg z-[60] flex items-center gap-2"
            >
              <Keyboard className="text-purple-400" size={18} />
              <span className="text-sm">Use arrow keys or buttons to navigate between projects</span>
              <button 
                onClick={() => setShowNavHelp(false)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}

          {/* Full-screen slideshow */}
          <AnimatePresence>
            {showSlideshow && hasSlideshow && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center"
                onClick={() => setShowSlideshow(false)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSlideshow(false);
                  }}
                  className="absolute right-4 top-4 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-colors z-10"
                >
                  <X size={24} />
                </button>
                
                <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  {/* Slideshow image */}
                  <div className="relative w-full max-w-5xl max-h-[80vh] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentImageIndex}
                        src={project.slideshowImages![currentImageIndex]}
                        alt={`${project.name} - image ${currentImageIndex + 1}`}
                        className="object-contain max-h-[80vh] w-auto max-w-full rounded-lg shadow-2xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      />
                    </AnimatePresence>
                  </div>
                  
                  {/* Navigation buttons */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 p-3 rounded-full bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white transition-colors group"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} className="group-hover:translate-x-[-2px] transition-transform" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 p-3 rounded-full bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white transition-colors group"
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} className="group-hover:translate-x-[2px] transition-transform" />
                  </button>
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {project.slideshowImages!.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentImageIndex === index 
                            ? 'bg-purple-500 w-6' 
                            : 'bg-gray-500 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  {/* Counter */}
                  <div className="absolute top-4 left-4 bg-gray-900/60 px-3 py-1 rounded-full text-sm text-gray-300">
                    {currentImageIndex + 1} / {project.slideshowImages!.length}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons - Moved outside the modal */}
          {hasPrevious && onPrevious && !showSlideshow && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              className="fixed left-2 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 hover:text-white transition-colors z-[51] group shadow-lg border border-gray-700/50 hover:border-purple-500/50"
              aria-label="Previous project"
              whileHover={{ scale: 1.1, x: -5 }}
            >
              <ChevronLeft size={24} className="group-hover:translate-x-[-2px] transition-transform" />
            </motion.button>
          )}
          
          {hasNext && onNext && !showSlideshow && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="fixed right-2 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 hover:text-white transition-colors z-[51] group shadow-lg border border-gray-700/50 hover:border-purple-500/50"
              aria-label="Next project"
              whileHover={{ scale: 1.1, x: 5 }}
            >
              <ChevronRight size={24} className="group-hover:translate-x-[2px] transition-transform" />
            </motion.button>
          )}

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-[90%] xs:w-[85%] sm:w-[80%] md:w-[75%] max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl border border-purple-500/20 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="relative">
              {/* Hero Image */}
              <div className="relative h-48 sm:h-56 md:h-72 w-full overflow-hidden rounded-t-2xl">
                <motion.img
                  src={project.bannerImage}
                  alt={project.name}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{project.name}</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.projectType && (
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium bg-purple-500/20 text-purple-300 rounded-full backdrop-blur-sm">
                        {project.projectType}
                      </span>
                    )}
                    {project.status && (
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium bg-green-500/20 text-green-300 rounded-full backdrop-blur-sm">
                        {project.status}
                      </span>
                    )}
                    {project.difficulty && (
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium bg-blue-500/20 text-blue-300 rounded-full backdrop-blur-sm flex items-center gap-1">
                        <BarChart4 size={12} className="hidden sm:inline" />
                        {formatDifficulty(project.difficulty)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                

                {/* Description */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">About the Project</h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{project.description}</p>
                </div>

                {/* Slideshow Images Gallery */}
                {hasSlideshow && (
                  <div className="mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 flex items-center gap-2">
                      <Image size={18} className="text-purple-400" />
                      Project Gallery
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                      {project.slideshowImages!.map((image, index) => (
                        <div 
                          key={index} 
                          className="relative aspect-video cursor-pointer group overflow-hidden rounded-lg bg-gray-800"
                          onClick={() => {
                            setCurrentImageIndex(index);
                            setShowSlideshow(true);
                          }}
                        >
                          <img 
                            src={image} 
                            alt={`${project.name} - image ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                              <Image size={16} className="text-white" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setCurrentImageIndex(0);
                        setShowSlideshow(true);
                      }}
                      className="mt-3 px-4 py-2 bg-purple-600/30 hover:bg-purple-700/50 text-white rounded-lg transition-colors text-sm "
                    >
                      View Slideshow
                    </button>
                  </div>
                )}

                {/* Project Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Languages & Topics */}
                  <div className="space-y-4">
                    {project.languages && project.languages.length > 0 && (
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Tag size={16} className="text-purple-400" />
                          Technologies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.languages.map((lang, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs sm:text-sm bg-gray-800 text-gray-300 rounded-full border border-gray-700/50 hover:bg-gray-700 transition-colors"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.topics && project.topics.length > 0 && (
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Tag size={16} className="text-purple-400" />
                          Topics
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.topics.map((topic, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs sm:text-sm bg-purple-900/30 text-purple-300 rounded-full border border-purple-700/30 hover:bg-purple-800/30 transition-colors"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Team, Time, Date Info */}
                  <div className="space-y-4">
                    {/* Created Date */}
                    {project.createdAt && (
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Calendar size={16} className="text-purple-400" />
                          Created
                        </h4>
                        <p className="text-sm sm:text-base text-gray-300">
                          {formatDate(project.createdAt)}
                        </p>
                      </div>
                    )}
                    
                    {/* Time Invested */}
                     {project.timeInvested && (
                       <div>
                         <h4 className="text-base sm:text-lg font-semibold text-white mb-2 flex items-center gap-2">
                           <Clock size={16} className="text-purple-400" />
                           Time Invested
                         </h4>
                         <p className="text-sm sm:text-base text-gray-300">
                          {typeof project.timeInvested === 'string' ? project.timeInvested : `${project.timeInvested.value} ${project.timeInvested.unit}`}
                        </p>
                       </div>
                     )}

                    

                    {/* Difficulty (if not shown in header) - disabled with false condition */}
                    {project.difficulty && false && (
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <BarChart4 size={16} className="text-purple-400" />
                          Difficulty
                        </h4>
                        <span className="px-3 py-1 text-xs sm:text-sm bg-gray-800 text-blue-300 rounded-full inline-block">
                          {formatDifficulty(project.difficulty)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Team Size */}
                  {teamSize > 0 && (
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Users size={16} className="text-purple-400" />
                          {teamSize === 1 ? 'Solo Project' : 'Team'}
                        </h4>
                        <p className="text-sm sm:text-base text-gray-300 mb-2">
                          {teamSize === 1 ? 'Individual project' : `${teamSize} members`}
                        </p>
                        {project.teamMembers && project.teamMembers.length > 0 && (
                          <div className="space-y-2">
                            {project.teamMembers.map((member, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-800/50 p-2 sm:p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                                <div>
                                  <p className="text-sm sm:text-base text-white font-medium">{member.name}</p>
                                  <p className="text-xs sm:text-sm text-gray-400">{member.role}</p>
                                </div>
                                {member.socialUrl && (
                                  <a
                                    href={member.socialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 transition-colors p-2 rounded-full hover:bg-gray-700/50"
                                  >
                                    <ExternalLink size={16} />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Project Links */}
                <div className="flex flex-wrap gap-3 sm:gap-4 pt-4 border-t border-gray-700/50">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-md text-sm sm:text-base"
                    >
                      <ExternalLink size={16} />
                      <span>Live Demo</span>
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-md text-sm sm:text-base"
                    >
                      <Github size={16} />
                      <span>View Code</span>
                    </a>
                  )}
                  {project.codepenUrl && (
                    <a
                      href={project.codepenUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-md text-sm sm:text-base"
                    >
                      <Codepen size={16} />
                      <span>CodePen</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 
