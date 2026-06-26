import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Folder, Database, Star, MessageSquare, Clock, ArrowRight, Brain, Zap, Trash2, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';
import CreateProjectModal from '../../modals/CreateProjectModal';

export function ProjectsView({ createNewChat, setActiveSessionId, activeSessionId, projects, setProjects }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateProject = async (name) => {
    try {
      const sessionId = await createNewChat(name);
      
      const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      setProjects(prev => [...prev, { 
        id: Date.now(), 
        sessionId: sessionId, 
        name, 
        files: 0, 
        updated: 'Just now', 
        color: randomColor 
      }]);
      
      setActiveSessionId(sessionId);
      setIsModalOpen(false);
      toast.success("Workspace created");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create workspace");
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setProjects(prev => prev.filter(p => p.id !== id));
    toast('Workspace deleted');
  };

  const openProject = (proj) => {
    setActiveSessionId(proj.sessionId);
    toast.success(`Opened project workspace: ${proj.name}`);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {projects.map((proj, i) => (
          <motion.div 
            key={proj.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => openProject(proj)}
            className={cn(
              "group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors relative border",
              activeSessionId === proj.sessionId ? "bg-white/10 border-white/20" : "hover:bg-white/5 border-transparent"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Folder size={14} className={cn("text-white/70", proj.color.replace('bg-', 'text-'))} />
            </div>
            <div className="flex flex-col flex-1 min-w-0 pr-4">
              <span className="text-sm font-medium text-white/90 truncate">{proj.name}</span>
              <div className="flex items-center gap-2 text-[10px] text-white/40">
                <span>{proj.files} files</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{proj.updated}</span>
              </div>
            </div>
            <button 
              onClick={(e) => handleDelete(e, proj.id)}
              className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 text-white/40 hover:text-rose-400 transition-all hover:bg-rose-500/20 rounded-md"
            >
              <Trash2 size={12} />
            </button>
          </motion.div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-4 text-xs text-white/40">No workspaces found.</div>
        )}
        <button onClick={() => setIsModalOpen(true)} className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-white/20 rounded-xl text-xs font-medium text-white/40 hover:text-white hover:border-white/40 transition-colors hover:bg-white/5">
          <Plus size={14} /> Create Workspace
        </button>
      </div>
      
      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </>
  );
}

export function MemoryView() {
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem('brain_memories');
    return saved ? JSON.parse(saved) : [
      { id: 1, category: 'Preferences', fact: 'Prefers React & Tailwind for frontend.', color: 'text-amber-400' },
      { id: 2, category: 'Context', fact: 'Building a premium AI SaaS application.', color: 'text-emerald-400' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('brain_memories', JSON.stringify(memories));
  }, [memories]);

  const handleAddMemory = () => {
    const fact = window.prompt("Enter new fact for AI to remember:");
    if (fact) {
      setMemories(prev => [...prev, { 
        id: Date.now(), 
        category: 'User Added', 
        fact, 
        color: 'text-blue-400' 
      }]);
      toast.success("Fact added to memory");
    }
  };

  const handleDelete = (id) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    toast('Memory forgotten');
  };

  const getIcon = (category) => {
    if (category === 'Preferences') return <Zap size={12} className="text-amber-400" />;
    if (category === 'Context') return <Brain size={12} className="text-emerald-400" />;
    return <Database size={12} className="text-blue-400" />;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col gap-1.5 mb-2">
        <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5"><Database size={12}/> Auto-Memory Active</h4>
        <p className="text-[10px] text-purple-400/70 leading-relaxed">The AI automatically extracts key facts from your conversations to personalize future responses.</p>
      </div>

      <div className="flex items-center justify-between pl-1 mt-1">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Saved Facts</span>
        <button onClick={handleAddMemory} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider flex items-center gap-1">
          <Plus size={10} /> Add
        </button>
      </div>
      
      {memories.length === 0 && (
        <div className="text-center py-4 text-xs text-white/40">Memory is empty.</div>
      )}

      {memories.map((mem, i) => (
        <motion.div 
          key={mem.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2 hover:border-white/10 transition-colors group"
        >
          <div className="flex items-center gap-1.5">
            {getIcon(mem.category)}
            <span className={cn("text-[10px] font-bold uppercase tracking-wider", mem.color)}>{mem.category}</span>
          </div>
          <p className="text-sm text-white/90 leading-snug">{mem.fact}</p>
          <div className="mt-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleDelete(mem.id)} className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors">Forget</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
