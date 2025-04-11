import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRoute, useLocation } from 'wouter';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { Project as ProjectType, ProjectTypeType, ProjectStatusType } from '@shared/schema';
import { 
  ArrowLeft, 
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
  FileCode2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';

// Define Block interface for proper typing
interface BlockMetadata {
  caption?: string;
  title?: string;
  language?: string;
  [key: string]: any;
}

interface Block {
  id: string;
  type: 'text' | 'image' | 'link' | 'video' | 'gif' | 'icon' | 'code' | 'title' | 'space' | 'divider' | 'callout' | 'quote'; // Ensure this matches the schema
  content: string;
  metadata?: BlockMetadata;
}

// Extend the Project type with proper typing for arrays
interface Project extends ProjectType {
  languages: string[];
  topics: string[];
  blocks: Block[];
  slideshowImages: string[];
  createdAt: Date | string | null;
}

export default function ProjectDetails() {
  const [, params] = useRoute('/project/:id');
  const [, navigate] = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextProject, setNextProject] = useState<Project | null>(null);
  const [prevProject, setPrevProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!params || !params.id) {
        navigate('/');
        return;
      }

      setLoading(true);
      
      try {
        // Fetch current project
        const projectRef = ref(database, `myProjects/${params.id}`);
        const snapshot = await get(projectRef);
        
        if (!snapshot.exists()) {
          navigate('/');
          return;
        }
        
        const projectData = snapshot.val();
        const currentProject: Project = {
          id: parseInt(params.id),
          name: projectData.name || "",
          description: projectData.description || "",
          link: projectData.link || "",
          createdAt: projectData.createdAt ? new Date(projectData.createdAt) : null,
          key: projectData.key || "",
          languages: projectData.languages || [],
          customLanguage: projectData.customLanguage || "",
          topics: projectData.topics || [],
          customTopic: projectData.customTopic || "",
          projectType: projectData.projectType || undefined,
          status: projectData.status || undefined,
          completionTime: projectData.completionTime || undefined,
          completionTimeUnit: projectData.completionTimeUnit || undefined,
          difficulty: projectData.difficulty || undefined,
          teamSize: projectData.teamSize || undefined,
          githubUrl: projectData.githubUrl || "",
          codepenUrl: projectData.codepenUrl || "",
          includeGitHub: projectData.includeGitHub ?? false,
          includeCodePen: projectData.includeCodePen ?? false,
          bannerImage: projectData.bannerImage || "",
          slideshowImages: projectData.slideshowImages || [],
          blocks: projectData.blocks || [],
        };
        
        setProject(currentProject);
        
        // Fetch all projects to determine next and previous
        const allProjectsRef = ref(database, 'myProjects');
        const allSnapshot = await get(allProjectsRef);
        
        if (allSnapshot.exists()) {
          const projectsData = allSnapshot.val();
          const projectsList = Object.entries(projectsData).map(([key, value]: [string, any]) => ({
            id: parseInt(key),
            name: value.name || "",
            description: value.description || "",
            link: value.link || "",
            createdAt: new Date(value.createdAt) || new Date(),
            key: value.key || "",
          }));
          
          // Sort projects by ID
          projectsList.sort((a, b) => a.id - b.id);
          
          // Find current project index
          const currentIndex = projectsList.findIndex(p => p.id === currentProject.id);
          
          // Set next and previous projects
          if (currentIndex > 0) {
            setPrevProject({
              ...projectsList[currentIndex - 1],
              languages: [],
              customLanguage: "",
              topics: [],
              customTopic: "",
              projectType: undefined,
              status: undefined,
              completionTime: undefined,
              completionTimeUnit: undefined,
              difficulty: undefined,
              teamSize: undefined,
              githubUrl: "",
              codepenUrl: "",
              includeGitHub: false,
              includeCodePen: false,
              bannerImage: "",
              slideshowImages: [],
              blocks: [],
            });
          } else {
            setPrevProject(null);
          }
          
          if (currentIndex < projectsList.length - 1) {
            setNextProject({
              ...projectsList[currentIndex + 1],
              languages: [],
              customLanguage: "",
              topics: [],
              customTopic: "",
              projectType: undefined,
              status: undefined,
              completionTime: undefined,
              completionTimeUnit: undefined,
              difficulty: undefined,
              teamSize: undefined,
              githubUrl: "",
              codepenUrl: "",
              includeGitHub: false,
              includeCodePen: false,
              bannerImage: "",
              slideshowImages: [],
              blocks: [],
            });
          } else {
            setNextProject(null);
          }
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [params, navigate]);

  // Helper function to get status color
  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-400";
    
    const colorMap: Record<string, string> = {
      planning: "bg-blue-400 text-blue-900",
      started: "bg-purple-400 text-purple-900",
      in_progress: "bg-yellow-400 text-yellow-900",
      completed: "bg-green-400 text-green-900",
      on_hold: "bg-orange-400 text-orange-900",
      abandoned: "bg-red-400 text-red-900"
    };
    
    return colorMap[status] || "bg-gray-400 text-gray-900";
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Project not found</h1>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-16"
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-24 left-4 z-10 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-800/70"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>

      {/* Project banner */}
      <div className="relative h-[50vh] w-full">
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
        
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-4xl mx-auto">
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
          <h1 className="text-4xl md:text-5xl font-bold text-white">{project.name}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mt-8 space-y-10">
          {/* Project description */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Description</h2>
            <p className="text-gray-300 text-lg leading-relaxed">{project.description}</p>
          </div>

          {/* Project details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            {/* Left column */}
            <div className="space-y-6">
              {/* Languages */}
              {(project.languages && project.languages.length > 0) || project.customLanguage ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Code size={20} className="text-purple-400" />
                    <h3 className="text-xl font-medium text-white">Languages</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.languages.map((lang: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-200 px-3 py-1">
                        {lang}
                      </Badge>
                    ))}
                    {project.customLanguage && (
                      <Badge variant="secondary" className="bg-gray-700 text-gray-200 px-3 py-1">
                        {project.customLanguage}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Topics */}
              {(project.topics && project.topics.length > 0) || project.customTopic ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={20} className="text-purple-400" />
                    <h3 className="text-xl font-medium text-white">Topics</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.topics.map((topic: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-200 px-3 py-1">
                        {topic}
                      </Badge>
                    ))}
                    {project.customTopic && (
                      <Badge variant="secondary" className="bg-gray-700 text-gray-200 px-3 py-1">
                        {project.customTopic}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Difficulty */}
              {project.difficulty && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart4 size={20} className="text-purple-400" />
                    <h3 className="text-xl font-medium text-white">Difficulty</h3>
                  </div>
                  <Badge variant="outline" className="text-gray-200 border-gray-600 px-3 py-1">
                    {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
                  </Badge>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Team Size */}
              {project.teamSize && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={20} className="text-purple-400" />
                    <h3 className="text-xl font-medium text-white">Team Size</h3>
                  </div>
                  <p className="text-gray-300">{project.teamSize}</p>
                </div>
              )}

              {/* Completion Time */}
              {project.completionTime && project.completionTimeUnit && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={20} className="text-purple-400" />
                    <h3 className="text-xl font-medium text-white">Completion Time</h3>
                  </div>
                  <p className="text-gray-300">
                    {project.completionTime} {project.completionTimeUnit}
                  </p>
                </div>
              )}

              {/* Created Date */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={20} className="text-purple-400" />
                  <h3 className="text-xl font-medium text-white">Created</h3>
                </div>
                <p className="text-gray-300">{formatDate(project.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Links section */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Links</h2>
            <div className="flex flex-wrap gap-3">
              {project.link && (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  <ExternalLink size={18} />
                  <span>Live Project</span>
                </a>
              )}
              
              {project.githubUrl && (
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Github size={18} />
                  <span>GitHub Repository</span>
                </a>
              )}
              
              {project.codepenUrl && (
                <a 
                  href={project.codepenUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Codepen size={18} />
                  <span>CodePen</span>
                </a>
              )}
            </div>
          </div>

          {/* Slideshow images */}
          {project.slideshowImages && project.slideshowImages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileCode2 size={22} className="text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">Project Gallery</h2>
              </div>
              <Carousel className="w-full">
                <CarouselContent>
                  {project.slideshowImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <div className="overflow-hidden rounded-lg">
                          <img 
                            src={image} 
                            alt={`Slideshow image ${index + 1}`} 
                            className="w-full h-64 object-cover"
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          )}

          {/* Project content blocks */}
          {project.blocks && project.blocks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Layers size={22} className="text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">Project Content</h2>
              </div>
              <div className="space-y-8">
                {project.blocks.map((block, index) => {
                  switch (block.type) {
                    case 'text':
                      return (
                        <div key={index} className="text-gray-300 text-lg">
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
                          <ExternalLink size={18} />
                          {block.metadata?.title || block.content}
                        </a>
                      );
                    case 'code':
                      return (
                        <div key={index} className="bg-gray-900 rounded-lg p-4 overflow-auto">
                          <pre className="text-gray-300 whitespace-pre-wrap">
                            <code>{block.content}</code>
                          </pre>
                          {block.metadata?.language && (
                            <div className="mt-2 text-xs text-gray-500">
                              Language: {block.metadata.language}
                            </div>
                          )}
                        </div>
                      );
                    case 'video':
                      return (
                        <div key={index} className="aspect-video">
                          <iframe
                            src={block.content}
                            title={`Video ${index}`}
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                          ></iframe>
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-800">
            {prevProject ? (
              <Button
                variant="outline"
                onClick={() => navigate(`/project/${prevProject.id}`)}
                className="group"
              >
                <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-400">Previous</span>
                  <span className="text-sm">{prevProject.name}</span>
                </div>
              </Button>
            ) : (
              <div></div>
            )}
            
            {nextProject ? (
              <Button
                variant="outline"
                onClick={() => navigate(`/project/${nextProject.id}`)}
                className="group"
              >
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">Next</span>
                  <span className="text-sm">{nextProject.name}</span>
                </div>
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
