import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, get, Database } from "firebase/database";
import { getStorage } from "firebase/storage";
import type { InsertProject, Project } from "@shared/schema";

// Make sure environment variables are accessible
const getEnv = (key: string, fallback: string = ''): string => {
  // Access environment variables with fallback
  return import.meta.env[key] || fallback;
};

// Firebase configuration
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  databaseURL: getEnv('VITE_FIREBASE_DATABASE_URL'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID')
};

// Initialize Firebase
let app;
let database: Database;
let storage;

try {
  if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
    console.error('Missing required Firebase configuration. Check your .env file.');
    throw new Error('Firebase configuration incomplete');
  }
  
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  storage = getStorage(app);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Helper to normalize InsertProject to Project
function normalizeProjectData(project: InsertProject, id: string): Project {
  return {
    id: parseInt(id),
    name: project.name,
    description: project.description,
    link: project.link,
    key: project.key,
    languages: project.languages || [],
    customLanguage: project.customLanguage,
    topics: project.topics || [],
    customTopic: project.customTopic,
    projectType: project.projectType,
    status: project.status,
    completionTime: project.completionTime ? Number(project.completionTime) : null,
    completionTimeUnit: project.completionTimeUnit,
    difficulty: project.difficulty,
    teamSize: project.teamSize ? Number(project.teamSize) : null,
    githubUrl: project.githubUrl,
    codepenUrl: project.codepenUrl,
    includeGitHub: project.includeGitHub,
    includeCodePen: project.includeCodePen,
    bannerImage: project.bannerImage,
    slideshowImages: project.slideshowImages || [],
    blocks: project.blocks || [],
    createdAt: new Date()
  };
}

// Create new project in Firebase
export async function createProject(project: InsertProject): Promise<Project> {
  try {
    // Sanitize data by removing undefined values
    const sanitizedProject = Object.fromEntries(
      Object.entries(project).map(([key, value]) => {
        // Convert undefined values to null since Firebase doesn't accept undefined
        return [key, value === undefined ? null : value];
      })
    );

    const projectForFirebase = {
      ...sanitizedProject,
      languages: sanitizedProject.languages || [],
      customLanguage: sanitizedProject.customLanguage,
      topics: sanitizedProject.topics || [],
      customTopic: sanitizedProject.customTopic,
      projectType: sanitizedProject.projectType,
      status: sanitizedProject.status,
      completionTime: sanitizedProject.completionTime ? Number(sanitizedProject.completionTime) : null,
      completionTimeUnit: sanitizedProject.completionTimeUnit,
      difficulty: sanitizedProject.difficulty,
      teamSize: sanitizedProject.teamSize ? Number(sanitizedProject.teamSize) : null,
      githubUrl: sanitizedProject.githubUrl,
      codepenUrl: sanitizedProject.codepenUrl,
      includeGitHub: sanitizedProject.includeGitHub,
      includeCodePen: sanitizedProject.includeCodePen,
      bannerImage: sanitizedProject.bannerImage,
      slideshowImages: sanitizedProject.slideshowImages || [],
      blocks: sanitizedProject.blocks || [],
      createdAt: new Date().toISOString()
    };

    const projectsRef = ref(database, "myProjects");
    const newProjectRef = await push(projectsRef, projectForFirebase);

    return normalizeProjectData(project, newProjectRef.key!);
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }
}

// Fetch all projects
export async function getAllProjects(): Promise<Project[]> {
  try {
    const projectsRef = ref(database, "myProjects");
    const snapshot = await get(projectsRef);

    if (!snapshot.exists()) {
      return [];
    }

    return Object.entries(snapshot.val()).map(([key, value]: [string, any]) => ({
      id: parseInt(key) || Number(key) || 0, // Ensure ID is always a valid number
      name: value.name || "",
      description: value.description || "",
      link: value.link || "",
      key: value.key || "",
      languages: value.languages || [],
      customLanguage: value.customLanguage || null,
      topics: value.topics || [],
      customTopic: value.customTopic || null,
      projectType: value.projectType || null,
      status: value.status || null,
      completionTime: value.completionTime !== undefined ? Number(value.completionTime) : null,
      completionTimeUnit: value.completionTimeUnit || null,
      difficulty: value.difficulty || null,
      teamSize: value.teamSize !== undefined ? Number(value.teamSize) : null,
      githubUrl: value.githubUrl || null,
      codepenUrl: value.codepenUrl || null,
      includeGitHub: value.includeGitHub || false,
      includeCodePen: value.includeCodePen || false,
      bannerImage: value.bannerImage || null,
      slideshowImages: value.slideshowImages || [],
      blocks: value.blocks || [],
      createdAt: new Date(value.createdAt || Date.now())
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects");
  }
}

// Export the Firebase DB instance
export { database };
