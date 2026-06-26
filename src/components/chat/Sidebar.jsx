import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Bot, MessageSquare, Trash2, Command as CmdIcon, 
  Search, Folder, Star, Clock, FolderOpen, FileText, 
  Database, Settings, MoreHorizontal, Edit2, Pin, Copy, Brain, Check, X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipProvider } from '../ui/Tooltip';
import { toast } from 'sonner';
import SettingsModal from '../modals/SettingsModal';
import { ProjectsView, MemoryView } from './views/SidebarViews';

export default function Sidebar({ 
  currentMood, 
  sessions, 
  activeSessionId, 
  setActiveSessionId, 
  createNewChat, 
  deleteSession,
  updateSessionTitle,
  setPaletteOpen, 
  isLoading, 
  handleStop,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen
}) {
  const [hoveredSessionId, setHoveredSessionId] = useState(null);
  const [activeTab, setActiveTab] = useState('Recent Chats');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pinnedSessions, setPinnedSessions] = useState(() => {
    const saved = localStorage.getItem('brain_pinned_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('brain_projects');
    return saved ? JSON.parse(saved) : [
      { id: 1, sessionId: '1', name: 'Website Redesign', files: 12, updated: '2h ago', color: 'bg-emerald-500' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('brain_projects', JSON.stringify(projects));
  }, [projects]);

  const togglePin = (e, id) => {
    e.stopPropagation();
    setPinnedSessions(prev => {
      const newPinned = prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id];
      localStorage.setItem('brain_pinned_sessions', JSON.stringify(newPinned));
      if (newPinned.includes(id)) toast.success('Chat pinned to Favorites');
      else toast('Chat removed from Favorites');
      return newPinned;
    });
  };

  const startEdit = (e, session) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveEdit = (e, id) => {
    e?.stopPropagation();
    if (editTitle.trim() && updateSessionTitle) {
      updateSessionTitle(id, editTitle);
      toast.success('Chat renamed');
    }
    setEditingId(null);
  };

  const NavItem = ({ icon: Icon, label, badge, isActive }) => (
    <button 
      onClick={() => setActiveTab(label)}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-300 group",
        isActive 
          ? "bg-white/10 text-white font-medium" 
          : "text-white/60 hover:bg-white/5 hover:text-white/90"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon size={14} className={cn("transition-colors", isActive ? "text-white" : "group-hover:text-white/80")} />
        <span>{label}</span>
      </div>
      {badge !== undefined && badge !== null && (
        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/50">{badge}</span>
      )}
    </button>
  );

  const renderSessionsList = (listToRender) => (
    <div className="flex flex-col gap-0.5">
      <AnimatePresence>
        {listToRender.map(session => (
          <motion.div 
            key={session.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onClick={() => {
              if (session.id !== activeSessionId) {
                if (isLoading) handleStop();
                setActiveSessionId(session.id);
              }
              if (window.innerWidth < 768) setIsMobileSidebarOpen(false);
            }}
            onMouseEnter={() => setHoveredSessionId(session.id)}
            onMouseLeave={() => setHoveredSessionId(null)}
            className={cn(
              "group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 overflow-hidden",
              session.id === activeSessionId 
                ? cn("text-white font-medium bg-gradient-to-r", currentMood.bgLight, "to-transparent border-l-2", `border-${currentMood.color}-500`) 
                : "text-white/60 hover:bg-white/5 hover:text-white/90 border-l-2 border-transparent"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden flex-1 z-10">
              <MessageSquare size={14} className={cn("shrink-0 transition-colors", session.id === activeSessionId ? currentMood.primary : "")} />
              
              {editingId === session.id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={(e) => saveEdit(e, session.id)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(e, session.id)}
                  className="bg-black/50 border border-white/20 rounded px-2 py-0.5 text-xs text-white outline-none focus:border-emerald-500 w-full"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate pr-4">{session.title}</span>
              )}
            </div>
            
            {/* Hover Actions */}
            <AnimatePresence>
              {hoveredSessionId === session.id && editingId !== session.id && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#1A1A1D] px-1 py-1 rounded-md shadow-lg border border-white/10 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip content={pinnedSessions.includes(session.id) ? "Unpin" : "Pin"}>
                    <button onClick={(e) => togglePin(e, session.id)} className={cn("p-1 rounded transition-colors", pinnedSessions.includes(session.id) ? "text-amber-400 hover:bg-amber-400/20" : "text-white/40 hover:text-white hover:bg-white/10")}>
                      <Pin size={12} className={pinnedSessions.includes(session.id) ? "fill-current" : ""} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Rename">
                    <button onClick={(e) => startEdit(e, session)} className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors">
                      <Edit2 size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <button onClick={(e) => deleteSession(e, session.id)} className="p-1 text-white/40 hover:text-rose-400 hover:bg-rose-500/20 rounded transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </Tooltip>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <TooltipProvider>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          x: typeof window !== 'undefined' && window.innerWidth < 768 
            ? (isMobileSidebarOpen ? 0 : -320) 
            : 0 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "w-[280px] h-full flex flex-col border-r border-white/5 bg-[#09090b]/95 md:bg-black/40 backdrop-blur-3xl shrink-0 z-50",
          "fixed md:relative top-0 left-0 bottom-0"
        )}
      >
        {/* Header / Logo */}
        <div className="h-20 flex items-center px-5 border-b border-white/5 relative overflow-hidden group">
          {/* Subtle animated background glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center gap-3.5 w-full relative z-10">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-[0_0_15px_rgba(255,255,255,0.1)] shrink-0", currentMood.gradient)}
            >
              <Brain size={20} className={cn("drop-shadow-md", currentMood.primary)} />
            </motion.div>
            <div className="flex flex-col justify-center gap-1.5 flex-1 w-0">
              <span className="font-bold text-xl tracking-tight text-white/95 leading-none">Brain.exe</span>
              <span className={cn(
                "text-[10px] font-medium leading-snug bg-gradient-to-r from-white/60 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient pr-2 line-clamp-2",
                `via-${currentMood.color === 'emerald' ? 'emerald' : currentMood.color}-400/80`,
                `to-${currentMood.color === 'emerald' ? 'cyan' : currentMood.color}-400/80`
              )}>
                Sometimes it crashes, but it usually works.
              </span>
            </div>
            <div className="ml-auto flex gap-1">
              <Tooltip content="Command Palette (Ctrl+K)">
                <button onClick={() => setPaletteOpen(true)} className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"><Search size={14} /></button>
              </Tooltip>
              {/* Mobile Close Button */}
              <button 
                onClick={() => setIsMobileSidebarOpen(false)} 
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all ml-1 bg-white/5"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 pb-2">
          <button 
            onClick={() => createNewChat()}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-medium px-3 py-2.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95 group"
          >
            <Plus size={16} className="transition-transform group-hover:rotate-90 duration-300" />
            <span>New Workspace</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-6 custom-scrollbar mt-2">
          
          {/* Main Navigation */}
          <div className="flex flex-col gap-0.5">
            <NavItem icon={Clock} label="Recent Chats" isActive={activeTab === 'Recent Chats'} />
            <NavItem icon={Star} label="Favorites" isActive={activeTab === 'Favorites'} />
            <NavItem icon={FolderOpen} label="Projects" badge={projects.length > 0 ? projects.length : null} isActive={activeTab === 'Projects'} />
            <NavItem icon={Database} label="Memory" isActive={activeTab === 'Memory'} />
          </div>

          {/* Dynamic Tab Content */}
          <div className="flex flex-col flex-1">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 px-3 flex items-center justify-between">
              <span>{activeTab === 'Recent Chats' ? 'Conversations' : activeTab}</span>
            </div>
            
            {activeTab === 'Recent Chats' && renderSessionsList(sessions)}
            
            {activeTab === 'Favorites' && (
              sessions.filter(s => pinnedSessions.includes(s.id)).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-50 text-center px-4">
                  <Star size={24} className="mb-2 text-white/40" />
                  <p className="text-xs text-white/60">No favorites yet</p>
                  <p className="text-[10px] text-white/40 mt-1">Pin a chat to see it here</p>
                </div>
              ) : renderSessionsList(sessions.filter(s => pinnedSessions.includes(s.id)))
            )}

            {activeTab === 'Projects' && <ProjectsView 
              createNewChat={createNewChat} 
              setActiveSessionId={setActiveSessionId} 
              activeSessionId={activeSessionId}
              projects={projects}
              setProjects={setProjects}
            />}
            {activeTab === 'Memory' && <MemoryView />}
            
          </div>
        </div>
        
        {/* User Profile Footer */}
        <div onClick={() => toast('Profile coming soon')} className="p-3 m-3 mt-0 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-all duration-300 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold shadow-lg group-hover:shadow-purple-500/20 transition-all">
            AR
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium text-white/90 truncate">Aryan</span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider">PRO PLAN</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); }} className="text-white/30 hover:text-white transition-colors p-1">
            <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </motion.aside>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </TooltipProvider>
  );
}
