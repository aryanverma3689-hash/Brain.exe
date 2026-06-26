import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, ChevronRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <nav className="relative z-10 px-8 py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2 font-semibold text-xl tracking-tight text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot size={18} className="text-white" />
          </div>
          Nexus AI
        </div>
        <div className="flex gap-6 items-center">
          <Link to="/chat" className="text-sm font-medium hover:text-white/80 transition-colors">Log In</Link>
          <Link to="/chat" className="text-sm font-medium bg-white text-black px-5 py-2.5 rounded-full hover:bg-white/90 hover:scale-105 transition-all shadow-lg shadow-white/10">Get Started</Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 text-center mt-[-8vh]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="mb-10 relative"
        >
          {/* Floating Orb / AI Visualization */}
          <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-40 h-40 bg-gradient-to-tr from-primary via-indigo to-secondary rounded-full shadow-[0_0_80px_rgba(16,185,129,0.4)] flex items-center justify-center relative z-10 overflow-hidden border border-white/20"
            >
               <div className="absolute inset-0 bg-black/10 mix-blend-overlay rounded-full"></div>
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
               <Sparkles size={48} className="text-white/90 animate-pulse drop-shadow-2xl" />
            </motion.div>
            {/* Orbiting rings */}
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-white/10 border-dashed"
            ></motion.div>
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
              className="absolute -inset-8 rounded-full border border-white/5 border-dotted"
            ></motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/80 mb-6 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            Nexus OS 2.0 is live
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent drop-shadow-sm">
            Your Personal <br/> AI Operating System
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            An intelligent assistant that learns, remembers, plans, creates, researches, and grows with you. Designed for those who demand excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/chat" className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              Start Chatting
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 rounded-full text-lg font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur-md">
              Explore Features
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
