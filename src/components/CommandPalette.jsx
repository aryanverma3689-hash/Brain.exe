import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, Monitor, BookOpen, Code, Sparkles } from 'lucide-react';
import { useMood, moods } from '../context/MoodContext';

export default function CommandPalette({ open, setOpen }) {
  const { setCurrentMood } = useMood();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg bg-[#121214] border border-white/10 rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <Command className="w-full">
          <div className="flex items-center px-4 py-3 border-b border-white/5">
            <Search size={18} className="text-muted-foreground mr-2" />
            <Command.Input autoFocus placeholder="Type a command or search (e.g. switch mode)..." className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-muted-foreground text-sm" />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>

            <Command.Group heading="AI Modes" className="text-xs font-medium text-muted-foreground px-2 py-1">
              <Command.Item 
                onSelect={() => { setCurrentMood(moods.general); setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 mt-1 rounded-md cursor-pointer hover:bg-white/10 text-sm text-white/90"
              >
                <Monitor size={16} /> General Assistant
              </Command.Item>
              <Command.Item 
                onSelect={() => { setCurrentMood(moods.learning); setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 mt-1 rounded-md cursor-pointer hover:bg-white/10 text-sm text-white/90"
              >
                <BookOpen size={16} className="text-blue-400" /> Learning Mode
              </Command.Item>
              <Command.Item 
                onSelect={() => { setCurrentMood(moods.coding); setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 mt-1 rounded-md cursor-pointer hover:bg-white/10 text-sm text-white/90"
              >
                <Code size={16} className="text-emerald-400" /> Coding Workspace
              </Command.Item>
              <Command.Item 
                onSelect={() => { setCurrentMood(moods.creative); setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 mt-1 rounded-md cursor-pointer hover:bg-white/10 text-sm text-white/90"
              >
                <Sparkles size={16} className="text-fuchsia-400" /> Creative Mode
              </Command.Item>
            </Command.Group>
            
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
