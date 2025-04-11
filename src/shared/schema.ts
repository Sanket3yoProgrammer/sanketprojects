export interface Project {
  id: string;
  name: string;
  description: string;
  bannerImage: string;
  slideshowImages?: string[];
  languages?: string[];
  difficulty?: string;
  status?: string;
  projectType?: string;
  topics?: string[];
  teamSize?: number;
  teamMembers?: {
    name: string;
    role: string;
    socialUrl: string;
  }[];
  timeInvested?: {
    value: number;
    unit: string;
  };
  liveUrl?: string;
  githubUrl?: string;
  codepenUrl?: string;
} 