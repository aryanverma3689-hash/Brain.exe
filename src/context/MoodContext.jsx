import React, { createContext, useContext, useState } from 'react';

const MoodContext = createContext();

export const moods = {
  general: {
    id: 'general',
    name: 'General Assistant',
    gradient: 'from-[#09090b] to-[#121214]',
    primary: 'text-primary',
    bgLight: 'bg-white/10',
    border: 'border-primary/50',
    color: 'emerald'
  },
  learning: {
    id: 'learning',
    name: 'Learning Mode',
    gradient: 'from-blue-950/80 to-slate-900',
    primary: 'text-blue-400',
    bgLight: 'bg-blue-500/10',
    border: 'border-blue-500/50',
    color: 'blue'
  },
  coding: {
    id: 'coding',
    name: 'Coding Mode',
    gradient: 'from-cyan-950/50 to-black',
    primary: 'text-cyan-400',
    bgLight: 'bg-cyan-500/10',
    border: 'border-cyan-500/50',
    color: 'cyan'
  },
  creative: {
    id: 'creative',
    name: 'Creative Mode',
    gradient: 'from-purple-950/60 to-fuchsia-950/80',
    primary: 'text-fuchsia-400',
    bgLight: 'bg-fuchsia-500/20',
    border: 'border-fuchsia-500/50',
    color: 'fuchsia'
  }
};

export function MoodProvider({ children }) {
  const [currentMood, setCurrentMoodState] = useState(() => {
    try {
      const saved = localStorage.getItem('brain_current_mood');
      if (saved && moods[saved]) {
        return moods[saved];
      }
    } catch (err) {
      console.warn("Failed to read mood from localStorage", err);
    }
    return moods.general;
  });

  const setCurrentMood = (mood) => {
    setCurrentMoodState(mood);
    try {
      localStorage.setItem('brain_current_mood', mood.id);
    } catch (err) {
      console.warn("Failed to save mood to localStorage", err);
    }
  };

  return (
    <MoodContext.Provider value={{ currentMood, setCurrentMood }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  return useContext(MoodContext);
}
