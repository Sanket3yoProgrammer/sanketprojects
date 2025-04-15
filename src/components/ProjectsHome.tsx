import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightCircle, Loader2, Search, Filter, X } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import projectsData from '../projects.json';
import { Project } from '@/shared/schema';

export function ProjectsHome() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Get unique options for filters
  const [availableDifficulties, setAvailableDifficulties] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([]);

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    
    // Process projects from JSON file
    const processedProjects = projectsData.map(project => ({
      ...project,
      // Add any additional fields that your UI expects
      link: project.liveUrl || '',
      // Ensure createdAt is properly parsed if it's a string
      createdAt: project.createdAt ? new Date(project.createdAt as string) : null
    })) as Project[];
    
    // Sort projects in reverse order by id (highest id at the top)
    const sortedProjects = [...processedProjects].sort((a, b) => {
      return parseInt(b.id) - parseInt(a.id);
    });
    
    setProjects(sortedProjects);
    setFilteredProjects(sortedProjects);
    
    // Extract unique filter options
    const difficulties = [...new Set(sortedProjects.map(p => p.difficulty).filter(Boolean))];
    const types = [...new Set(sortedProjects.map(p => p.projectType).filter(Boolean))];
    const techs = [...new Set(sortedProjects.flatMap(p => p.languages || []))];
    
    setAvailableDifficulties(difficulties as string[]);
    setAvailableTypes(types as string[]);
    setAvailableTechnologies(techs);
    
    setLoading(false);
  }, []);
  
  // Apply filters whenever any filter changes
  useEffect(() => {
    if (!projects.length) return;
    
    let result = [...projects];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term) ||
        (p.topics && p.topics.some(topic => topic.toLowerCase().includes(term)))
      );
    }
    
    // Apply difficulty filter
    if (selectedDifficulty) {
      result = result.filter(p => p.difficulty === selectedDifficulty);
    }
    
    // Apply project type filter
    if (selectedType) {
      result = result.filter(p => p.projectType === selectedType);
    }
    
    // Apply technology filter
    if (selectedTech) {
      result = result.filter(p => 
        p.languages && p.languages.includes(selectedTech)
      );
    }
    
    setFilteredProjects(result);
  }, [searchTerm, selectedDifficulty, selectedType, selectedTech, projects]);
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDifficulty(null);
    setSelectedType(null);
    setSelectedTech(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-purple-500/10 blur-3xl"></div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-white relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">My Projects</h1>
          <p className="text-center text-gray-400 max-w-lg mx-auto">A collection of my work, experiments, and creative endeavors showcasing skills and experience</p>
          
          <a href="https://yosanket.vercel.app/" className="mx-auto mb-12">
            <button className="shiny-cta group mx-auto mt-6">
              <a href="https://yosanket.vercel.app/" className="flex gap-2">
                <span> Check out my Portfolio </span>
                <ArrowRightCircle className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
              </a> 
            </button>
          </a>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mt-6 rounded-full"></div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects..."
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-purple-500 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Filter Toggle Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-purple-600 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Filter size={18} />
              <span>Filters {(selectedDifficulty || selectedType || selectedTech) && '(Active)'}</span>
            </button>
          </div>
          
          {/* Filter Options */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4"
            >
              <div className="flex flex-wrap gap-6">
                {/* Difficulty Filter */}
                <div className="space-y-2">
                  <label className="text-white font-medium">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {availableDifficulties.map(difficulty => (
                      <button
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(
                          selectedDifficulty === difficulty ? null : difficulty
                        )}
                        className={`px-3 py-1 text-sm rounded-full ${
                          selectedDifficulty === difficulty 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Project Type Filter */}
                <div className="space-y-2">
                  <label className="text-white font-medium">Project Type</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(
                          selectedType === type ? null : type
                        )}
                        className={`px-3 py-1 text-sm rounded-full ${
                          selectedType === type 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Technology Filter */}
                <div className="space-y-2">
                  <label className="text-white font-medium">Technology</label>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2">
                    {availableTechnologies.map(tech => (
                      <button
                        key={tech}
                        onClick={() => setSelectedTech(
                          selectedTech === tech ? null : tech
                        )}
                        className={`px-3 py-1 text-sm rounded-full ${
                          selectedTech === tech 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Reset Filters Button */}
              {(selectedDifficulty || selectedType || selectedTech || searchTerm) && (
                <button
                  onClick={resetFilters}
                  className="mt-4 flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm"
                >
                  <X size={14} />
                  <span>Reset Filters</span>
                </button>
              )}
            </motion.div>
          )}
          
          {/* Results Count */}
          {filteredProjects.length !== projects.length && !loading && (
            <div className="text-sm text-gray-400 mb-4">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div 
              className="relative w-16 h-16"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-purple-500 opacity-75"></div>
              <div className="absolute inset-0 rounded-full border-b-2 border-l-2 border-indigo-500 opacity-50 animate-ping"></div>
            </motion.div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center text-gray-400 py-16 bg-gray-800/20 rounded-xl border border-gray-700/30 backdrop-blur-md">
            <p className="text-lg">No projects found</p>
            <p className="text-sm mt-2">Try adjusting your search or filters</p>
            {(selectedDifficulty || selectedType || selectedTech || searchTerm) && (
              <button
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                <X size={16} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                projects={filteredProjects}
                currentIndex={index}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
