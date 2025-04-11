import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import "./about.css";
import { Github, Mail, Cpu, Award, BookOpen, Zap, User, Codepen, Linkedin, Globe, ExternalLink } from "lucide-react";
import { Link } from "wouter";

const techStack = [
  "React", "TypeScript", "Node.js", "Express", "MongoDB",
  "PostgreSQL", "Docker", "AWS", "Git", "Tailwind CSS", 
  "HTML", "CSS", "JavaScript", "Python", "Firebase","Supabase",
];

const socialLinks = [
  { 
    name: "GitHub", 
    icon: <Github size={24} />, 
    url: "https://github.com/Sanket3yoprogrammer",
    color: "#333",
    hoverColor: "#6e5494"
  },
  { 
    name: "CodePen", 
    icon: <Codepen size={24} />, 
    url: "https://codepen.io/Sanket-Kumar-Padhan-the-bold",
    color: "#000",
    hoverColor: "#47cf73"
  },
  { 
    name: "Chess.com", 
    icon: <i className="fas fa-chess-pawn" aria-hidden="true"></i>, 
    url: "https://www.chess.com/member/Sanket_Y07",
    color: "#769656",
    hoverColor: "#ffcf3d"
  },
  { 
    name: "Email", 
    icon: <Mail size={24} />, 
    url: "mailto:sanketkumarpadhan95@gmail.com",
    color: "#d44638",
    hoverColor: "#ea8b7b"
  },
  { 
    name: "Portfolio", 
    icon: <User size={24} />, 
    url: "https://sanketme-projects.vercel.app",
    color: "#38bdf8",
    hoverColor: "#0284c7"
  },
  { 
    name: "Projects",
    icon: <Globe size={24} />, 
    url: "/",
    color: "#38bdf8",
    hoverColor: "#0284c7"
  },
];

export default function AboutPage() {
  const [cursor, setCursor] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursor((c) => !c);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="about-page min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-950 z-10"
    >
      {/* Animated Background */}
      <div className="stars"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
        >
          About Me
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Bio Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-6 rounded-3xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl"
          >
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white">
                <User size={32} />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-white">Sanket Kumar Padhan</h2>
                <p className="text-cyan-300">Developer & Tech Enthusiast</p>
              </div>
            </div>
            
            <div className="space-y-4 text-gray-200">
              <p className="leading-relaxed">
                Hey there! I'm a passionate developer with a love for creating beautiful, functional web applications. 
                At just 15 years old, I've already spent 3+ years exploring the vast world of programming.
              </p>
              
              <p className="leading-relaxed">
                Based in Odisha, India, I'm constantly learning and building new projects to expand my skills.
                My journey in tech is driven by curiosity and the joy of bringing ideas to life through code.
              </p>
              
              <div className="pt-4">
                <h3 className="text-xl font-semibold mb-3 text-cyan-300 flex items-center">
                  <Cpu className="mr-2" size={20} /> Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="tech-pill"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right Side - Ultimate Social Card */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-6 rounded-3xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl h-full"
          >
            <div 
              ref={cardRef}
              className="ultimate-social-card"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div 
                className="card-glow" 
                style={{ 
                  background: isHovering 
                    ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(56, 189, 248, 0.4) 0%, rgba(0, 0, 0, 0) 70%)` 
                    : 'none' 
                }}
              />
              
              <div className="profile-section">
                <motion.div 
                  className="profile-image-container"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <img 
                    src="https://img.freepik.com/free-vector/cute-man-working-laptop-with-coffee-cartoon-vector-icon-illustration-people-technology-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3869.jpg" 
                    alt="Sanket Kumar Padhan" 
                    className="profile-image" 
                  />
                  <div className="profile-image-glow" />
                </motion.div>
                
                <motion.div 
                  className="profile-info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="profile-name">Sanket Kumar Padhan</h3>
                  <p className="profile-title">Full Stack Developer</p>
                  <div className="profile-location">
                    <span className="location-dot"></span>
                    <span>Odisha, India</span>
                  </div>
                </motion.div>
              </div>
              
              <div className="social-links-grid">
                {socialLinks.map((social, index) => (
                                  <motion.a
                                  key={social.name}
                                  href={social.url}
                                  target={social.name === "Projects" ? "_self" : "_blank"} // Change made here, remember u bruhh!!
                                  rel="noopener noreferrer"
                                  className="social-link-item"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.7 + index * 0.1 }}
                                  whileHover={{ 
                                    scale: 1.05,
                                    backgroundColor: social.hoverColor,
                                    transition: { duration: 0.2 }
                                  }}
                                  onHoverStart={() => setActiveIndex(index)}
                                  onHoverEnd={() => setActiveIndex(null)}
                                >
                    <div className="social-icon-wrapper" style={{ 
                      backgroundColor: activeIndex === index ? social.hoverColor : social.color
                    }}>
                      {social.icon}
                    </div>
                    <span className="social-name">{social.name}</span>
                    <ExternalLink size={14} className="external-link-icon" />
                  </motion.a>
                ))}
              </div>
              
              <motion.div 
                className="connect-button-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                <a 
                  href="mailto:sanketkumarpadhan95@gmail.com" 
                  className="connect-button"
                >
                  <span>Let's Connect</span>
                  <div className="connect-button-arrow">→</div>
                </a>
              </motion.div>
              
              <div className="card-decoration card-decoration-1" />
              <div className="card-decoration card-decoration-2" />
              <div className="card-decoration card-decoration-3" />
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Section - Journey & Projects */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Journey Timeline */}
          <div className="glass-card p-6 rounded-3xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-cyan-300 flex items-center">
              <BookOpen className="mr-2" size={20} /> My Journey
            </h3>
            <div className="space-y-6">
              <div className="journey-item">
                <div className="journey-dot"></div>
                <div className="journey-content">
                  <h4 className="text-white font-medium">2025 - Present</h4>
                  <p className="text-gray-300">Building Cool Projects & Exploring Web Development</p>
                </div>
              </div>
              <div className="journey-item">
                <div className="journey-dot"></div>
                <div className="journey-content">
                  <h4 className="text-white font-medium">2023 - 2025</h4>
                  <p className="text-gray-300">Developed Various Projects & Learned MERN, Supabase</p>
                </div>
              </div>
              <div className="journey-item">
                <div className="journey-dot"></div>
                <div className="journey-content">
                  <h4 className="text-white font-medium">2021 - 2023</h4>
                  <p className="text-gray-300">Started Competitive Programming & Full-stack Development</p>
                </div>
              </div>
              <div className="journey-item">
                <div className="journey-dot"></div>
                <div className="journey-content">
                  <h4 className="text-white font-medium">2019 - 2021</h4>
                  <p className="text-gray-300">Discovered My Passion for Coding & Tech</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Highlights */}
          <div className="glass-card p-6 rounded-3xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-cyan-300 flex items-center">
              <Award className="mr-2" size={20} /> Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="highlight-card">
                <Zap className="highlight-icon" />
                <h4 className="text-white font-medium">3+ Years</h4>
                <p className="text-gray-300">Coding Experience</p>
              </div>
              <div className="highlight-card">
                <Github className="highlight-icon" />
                <h4 className="text-white font-medium">15+</h4>
                <p className="text-gray-300">Projects Completed</p>
              </div>
              <div className="highlight-card">
                <Globe className="highlight-icon" />
                <h4 className="text-white font-medium">Full Stack</h4>
                <p className="text-gray-300">Development Skills</p>
              </div>
              <div className="highlight-card">
                <Award className="highlight-icon" />
                <h4 className="text-white font-medium">Continuous</h4>
                <p className="text-gray-300">Learner</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link href="/" className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium hover:shadow-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300">
                View My Projects
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}