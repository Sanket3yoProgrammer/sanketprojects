import { motion } from "framer-motion";
import { type Project } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Code2, Rocket, Star, Sparkles, Code, StarIcon, Dot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-purple-700 dark:to-purple-900 overflow-hidden group">
        <a 
          href={project.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block h-full"
        >
          <CardHeader className="relative">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-300" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                {project.name}
                <ExternalLink className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="bg-white/10 hover:bg-white/20">
                <Code2 className="h-3 w-3 mr-1" />
                Project
              </Badge>
              <Badge variant="secondary" className="bg-white/10 hover:bg-white/20">
                <Rocket className="h-3 w-3 mr-1" />
                Live Demo
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-100 dark:text-gray-200 relative">
              <Dot className="fixed -right-8 -top-8 size-28 text-yellow-300 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              {project.description}
            </p>
          </CardContent>
        </a>
      </Card>
    </motion.div>
  );
}