import React from 'react';
import { Search, LayoutGrid, Monitor, BookOpen, Code, Sparkles, Zap, Brain, Eye, Bell, User, ChevronDown, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { moods } from '../../context/MoodContext';
import { Tooltip, TooltipProvider } from '../ui/Tooltip';
import { toast } from 'sonner';
import DashboardModal from '../modals/DashboardModal';
import ProfileModal from '../modals/ProfileModal';

import NotificationsDropdown from '../modals/NotificationsDropdown';

export default function ChatHeader({ 
  activeSession, 
  currentMood, 
  setCurrentMood, 
  isMoodMenuOpen, 
  setIsMoodMenuOpen, 
  setPaletteOpen,
  sessions,
  setIsMobileSidebarOpen
}) {
  const [isDashboardOpen, setIsDashboardOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);

  return (
    <TooltipProvider>
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 backdrop-blur-xl bg-black/20 absolute top-0 left-0 right-0 z-20">
        
        {/* Left: Workspace & Status */}
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 text-white/70 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="hidden sm:flex flex-col">
            <span className="font-semibold text-sm text-white/90 truncate flex items-center gap-2">
              Brain.exe Workspace
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </span>
            <span className="text-[11px] text-white/40 truncate mt-0.5">
              {activeSession?.title || 'New Thread'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
            <Tooltip content="Model: Brain Core (Active)">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 cursor-help hover:bg-white/10 transition-colors">
                <Brain size={12} className={currentMood.primary} />
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Brain Core</span>
              </div>
            </Tooltip>
          </div>
        </div>

        {/* Center: Mode Selector Toggle */}
        <div className="flex justify-center flex-[1.5] relative shrink-0">
          <Tooltip content="Switch Model & Personality">
            <button 
              onClick={() => setIsMoodMenuOpen(!isMoodMenuOpen)}
              className={cn("group flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all hover:scale-105 shadow-sm backdrop-blur-md", currentMood.border, currentMood.bgLight)}
            >
              <span className={cn("w-2 h-2 rounded-full", currentMood.bg)} />
              <span className={cn("text-[11px] font-bold uppercase tracking-widest", currentMood.primary)}>
                {currentMood.name}
              </span>
              <ChevronDown size={14} className={cn("ml-1 transition-transform duration-300 opacity-70", isMoodMenuOpen ? "rotate-180" : "rotate-0", currentMood.primary)} />
            </button>
          </Tooltip>
          
          <AnimatePresence>
            {isMoodMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-[120%] mt-2 w-[90vw] sm:w-[500px] max-w-[500px] bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-4 z-50 left-1/2 -translate-x-1/2 flex flex-col gap-3"
              >
                <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">Select AI Personality</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(moods).map((mood, idx) => {
                    const isSelected = currentMood.id === mood.id;
                    let Icon = Brain;
                    if (mood.id === 'learning') Icon = BookOpen;
                    if (mood.id === 'coding') Icon = Code;
                    if (mood.id === 'creative') Icon = Sparkles;
                    
                    return (
                      <motion.button
                        key={mood.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                          setCurrentMood(mood);
                          setIsMoodMenuOpen(false);
                        }}
                        className={cn(
                          "relative flex flex-col gap-1 items-start p-3 rounded-xl border text-left transition-all hover:scale-[1.02]",
                          isSelected ? `bg-${mood.color}-500/10 border-${mood.color}-500/30` : "bg-white/5 border-white/5 hover:bg-white/10"
                        )}
                      >
                        {isSelected && (
                          <motion.div layoutId="activeMode" className={cn("absolute inset-0 rounded-xl ring-1 ring-inset", `ring-${mood.color}-500/50`)} />
                        )}
                        <div className="flex items-center gap-2">
                          <Icon size={14} className={isSelected ? `text-${mood.color}-400` : "text-white/60"} />
                          <span className={cn("text-xs font-semibold", isSelected ? mood.primary : "text-white/80")}>{mood.name}</span>
                        </div>
                        <span className="text-[10px] text-white/40">Optimized for {mood.id} tasks</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
          <Tooltip content="Command Palette (Ctrl+K)">
            <button 
              onClick={() => setPaletteOpen(true)} 
              className="text-white/40 hover:text-white transition-all flex items-center gap-2 text-[11px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 hidden md:flex"
            >
              <Search size={14} /> <span>Search</span>
            </button>
          </Tooltip>
          
          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="relative">
              <Tooltip content="Notifications">
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="text-white/40 hover:text-white transition-colors relative">
                  <Bell size={16} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500"></span>
                </button>
              </Tooltip>
              <NotificationsDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
            </div>
            
            <Tooltip content="Dashboard">
              <button onClick={() => setIsDashboardOpen(true)} className="text-white/40 hover:text-white transition-colors"><LayoutGrid size={16} /></button>
            </Tooltip>
            <Tooltip content="Profile">
              <button onClick={() => setIsProfileOpen(true)} className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center border border-white/20 shadow-md ml-1 hover:scale-105 transition-transform">
                <User size={14} className="text-white" />
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      <DashboardModal isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} sessions={sessions} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </TooltipProvider>
  );
}
