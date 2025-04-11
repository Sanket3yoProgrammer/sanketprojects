import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Github, Heart, Mail, FolderKanban, User2 } from "lucide-react";
import { ProjectsHome } from "@/components/ProjectsHome";
import { Switch, Route, Link, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found.tsx";
import About from "@/pages/about.tsx"; 
import './styles.css'; // styles
import Cursor from "@/components/Cursor"; 
import Profile from "@/components/Profile";

// Define Block interface for proper typing
interface Block {
  id: string;
  type: 'text' | 'image' | 'link' | 'video' | 'gif' | 'icon' | 'code';
  content: string;
  metadata?: any;
}

function MobileMenu({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (value: boolean) => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="fixed inset-y-0 right-0 w-full sm:w-64 bg-gradient-to-b from-purple-900 to-black/95 backdrop-blur-lg z-50 shadow-xl border-l border-purple-700/30"
        >
          <div className="flex flex-col p-6">
            <button
              onClick={() => setIsOpen(false)}
              className="self-end text-gray-300 hover:text-white p-2 rounded-full hover:bg-purple-800/40 transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
            <nav className="flex flex-col space-y-6 mt-8">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="text-xl text-gray-300 hover:text-white flex items-center gap-3 p-3 rounded-lg hover:bg-purple-800/30 transition-all duration-300"
              >
                <FolderKanban size={24} className="text-yellow-300" />
                Projects
              </Link>
              
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className="text-xl text-gray-300 hover:text-white flex items-center gap-3 p-3 rounded-lg hover:bg-purple-800/30 transition-all duration-300"
              >
                <User2 size={24} className="text-yellow-300" />
                About Me
              </Link>

              <div className="mt-auto pt-8 border-t border-purple-700/30">
                <a
                  href="https://github.com/Sanket3yoProgrammer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 text-gray-300 hover:text-white rounded-lg hover:bg-purple-800/30 transition-all duration-300"
                >
                  <Github size={24} className="text-gray-300" />
                  GitHub
                </a>
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Navbar({ isOpen, setIsOpen }: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) {
  return (
    <nav className="fixed w-full bg-gradient-to-r from-purple-800 via-purple-900 to-indigo-900 shadow-lg backdrop-blur-md z-40 border-b border-purple-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="https://sanketme-projects.vercel.app" className="text-xl font-bold text-white flex items-center gap-2 transition-all duration-300 hover:scale-105">
            <img src="https://firebasestorage.googleapis.com/v0/b/uploadyoio.appspot.com/o/image%2Fyo-logo?alt=media&token=91f79586-a3e7-4c4d-a507-9857747f3e38" className="size-8 " />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 font-extrabold">Portfolio Projects</span>
          </a>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-100 hover:text-yellow-300 px-3 py-2 rounded-md transition-all duration-300 hover:bg-purple-800/40 flex items-center gap-2">
              <FolderKanban size={20} className="text-yellow-300" />
              <span>Projects</span>
            </Link>
            <Link to="/about" className="text-gray-100 hover:text-yellow-300 px-3 py-2 rounded-md transition-all duration-300 hover:bg-purple-800/40 flex items-center gap-2">
              <User2 size={20} className="text-yellow-300" />
              <span>About Me</span>
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full text-white hover:bg-purple-700/50 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Home() {
  return <ProjectsHome />;
}

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter>
        <div className="min-h-screen transition-colors duration-300 dark bg-gradient-to-br from-gray-900 to-purple-900 relative overflow-hidden">
          <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
          <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
          
          <Profile />
          
          <AnimatePresence mode="wait">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/about" component={About} />
              <Route component={NotFound} />
            </Switch>
          </AnimatePresence>
          <Cursor />
          <footer className="bg-gradient-to-r from-purple-900 to-indigo-900 shadow-inner py-8 mt-16 border-t border-purple-700/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center gap-2 mb-6 md:mb-0">
                  <a href="https://sanketme-projects.vercel.app" className="group flex items-center gap-3 transition-all duration-300 hover:scale-105">
                    <img src="https://firebasestorage.googleapis.com/v0/b/uploadyoio.appspot.com/o/image%2Fyo-logo?alt=media&token=91f79586-a3e7-4c4d-a507-9857747f3e38" className="size-10 filter drop-shadow-lg" />
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400 group-hover:from-purple-200 group-hover:to-white transition-all duration-300">Portfolio</span>
                      <span className="text-xs text-purple-300 opacity-80">by Sanket Kumar Padhan</span>
                    </div>
                  </a>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-300 bg-black/20 px-4 py-2 rounded-full hover:bg-black/30 transition-colors">
                    <Mail size={18} className="text-purple-300" />
                    <a href="mailto:sanketkumarpadhan95@gmail.com" className="hover:text-white transition-colors">
                      sanketkumarpadhan95@gmail.com
                    </a>
                  </div>
                  <a
                    href="https://github.com/Sanket3yoProgrammer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-300 bg-black/20 px-4 py-2 rounded-full hover:bg-black/30 transition-colors"
                  >
                    <Github size={18} className="text-purple-300" />
                    <span className="hover:text-white transition-colors">GitHub</span>
                  </a>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-purple-700/30 text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-300 mb-2">
                  <span>Made with</span>
                  <Heart className="text-red-400 animate-pulse" size={20} />
                  <span>by</span>
                  <span className="text-green-400 font-medium">Sanket Kumar Padhan</span>
                </div>
                <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Sanket Kumar Padhan. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
