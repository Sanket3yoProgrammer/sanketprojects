import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Codepen } from 'lucide-react';
import { Project } from '@/shared/schema';
import { ProjectModal } from './ProjectModal';

interface ProjectCardProps {
  project: Project;
  projects?: Project[];
  currentIndex?: number;
}

export function ProjectCard({ project, projects = [], currentIndex = -1 }: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [currentIdx, setCurrentIdx] = useState<number>(currentIndex);

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Helper function to get project type label
  const getProjectTypeLabel = (type: string | undefined) => {
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
      portfolio: "Portfolio",
      "Web Application": "Web Application",
      "AI Application": "AI Application"
    };
    
    return typeMap[type] || type;
  };

  // Helper function to get status label
  const getStatusLabel = (status: string | undefined) => {
    if (!status) return null;
    
    const statusMap: Record<string, string> = {
      planning: "Planning",
      started: "Started",
      in_progress: "In Progress",
      completed: "Completed",
      on_hold: "On Hold",
      abandoned: "Abandoned",
      "In Progress": "In Progress",
      "Completed": "Completed"
    };
    
    return statusMap[status] || status;
  };

  // Helper function to get status color
  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-400";
    
    const colorMap: Record<string, string> = {
      planning: "bg-blue-400",
      started: "bg-purple-400",
      in_progress: "bg-yellow-400",
      completed: "bg-green-400",
      on_hold: "bg-orange-400",
      abandoned: "bg-red-400",
      "In Progress": "bg-yellow-400",
      "Completed": "bg-green-400"
    };
    
    return colorMap[status] || "bg-gray-400";
  };

  // Navigation handlers for projects
  const handleNext = () => {
    if (projects.length <= 1 || currentIdx === -1 || currentIdx >= projects.length - 1) return;
    const nextIndex = (currentIdx + 1) % projects.length;
    setCurrentProject(projects[nextIndex]);
    setCurrentIdx(nextIndex);
  };

  const handlePrevious = () => {
    if (projects.length <= 1 || currentIdx === -1) return;
    const prevIndex = currentIdx === 0 ? projects.length - 1 : currentIdx - 1;
    setCurrentProject(projects[prevIndex]);
    setCurrentIdx(prevIndex);
  };
  
  // Determine if we have next/previous projects
  const hasNext = projects.length > 1 && currentIdx !== -1 && currentIdx < projects.length - 1;
  const hasPrevious = projects.length > 1 && currentIdx !== -1 && currentIdx > 0;

  return (
    <>
      <motion.div
        whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-xl hover:shadow-purple-500/20 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 flex flex-col h-full group cursor-pointer"
      >
        <div className="flex-grow">
          <div className="p-0">
            {project.bannerImage ? (
              <div className="h-48 overflow-hidden relative group-hover:brightness-110 transition-all duration-300">
                <motion.img 
                  src={project.bannerImage} 
                  alt={project.name} 
                  className="w-full h-full object-cover transform transition-transform duration-700 ease-in-out group-hover:scale-105"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-70"></div>
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center justify-center relative group-hover:bg-gradient-to-r group-hover:from-purple-800 group-hover:to-indigo-800 transition-all duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(120,0,255,0.15),_transparent_65%)]"></div>
                <h3 className="text-2xl font-bold text-white z-10">{project.name}</h3>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {project.projectType && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-300">
                  {getProjectTypeLabel(project.projectType)}
                </span>
              )}
              {project.status && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)} text-white`}>
                  {getStatusLabel(project.status)}
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
            <p className="text-gray-300 mb-4 text-sm">
              {truncateText(project.description, 120)}
            </p>
            
            {project.languages && project.languages.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {project.languages.map((lang, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 pt-0 border-t border-gray-700/50 mt-auto backdrop-blur-sm bg-gray-800/30">
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2 items-center">
              {project.liveUrl && (
                <a 
                  href={project.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gradient-to-br from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 text-white transition-colors shadow-md hover:shadow-purple-500/30 flex items-center justify-center"
                  title="Live Project"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={16} />
                </a>
              )}
              
              {project.githubUrl && (
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white transition-colors shadow-md flex items-center justify-center"
                  title="GitHub Repository"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github size={16} />
                </a>
              )}
              
              {project.codepenUrl && (
                <a 
                  href={project.codepenUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white transition-colors shadow-md flex items-center justify-center"
                  title="CodePen"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Codepen size={16} />
                </a>
              )}

              {!project.liveUrl && !project.githubUrl && !project.codepenUrl && (
                <span className="text-gray-500 text-sm">No links available</span>
              )}
            </div>
            
            <span className="text-purple-400 hover:text-purple-300 text-sm font-medium group-hover:text-white transition-all duration-300">
              {project.difficulty || ""}
            </span>
          </div>
        </div>
      </motion.div>

      <ProjectModal 
        project={currentProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />
    </>
  );
}
