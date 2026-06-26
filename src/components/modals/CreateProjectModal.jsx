import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProjectName('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (projectName.trim()) {
      onCreate(projectName.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-[#111113] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden flex flex-col"
            >
              <div className="flex items-center gap-3 p-5 border-b border-white/5 bg-white/[0.02]">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <FolderPlus className="text-emerald-400" size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white tracking-tight">Create Workspace</h2>
                  <p className="text-xs text-white/50">Start a new project environment</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">
                    Project Name
                  </label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Website Redesign"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!projectName.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 disabled:text-white/30 text-sm font-medium text-black transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
