import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function NexusOrb({ 
  className, 
  size = 64, 
  moodColor = 'from-emerald-400 to-emerald-600',
  glowColor = 'bg-emerald-500/20',
  isThinking = false
}) {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Ambient Glow */}
      <motion.div
        className={cn("absolute rounded-full blur-2xl opacity-50", glowColor)}
        style={{ width: size * 1.5, height: size * 1.5 }}
        animate={{
          scale: isThinking ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: isThinking ? [0.5, 0.8, 0.5] : [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: isThinking ? 2 : 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Outer Ring */}
      <motion.div
        className={cn("absolute rounded-full border border-white/20 bg-gradient-to-tr backdrop-blur-md", moodColor)}
        style={{ width: size, height: size }}
        animate={{
          rotate: [0, 180, 360],
          scale: isThinking ? [1, 0.95, 1] : [1, 1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Inner Core */}
      <motion.div
        className="absolute rounded-full bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
        style={{ width: size * 0.4, height: size * 0.4 }}
        animate={{
          scale: isThinking ? [1, 1.4, 1] : [1, 1.1, 1],
        }}
        transition={{
          duration: isThinking ? 1.5 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Particle Effects (simplified for now, visible when thinking) */}
      {isThinking && (
        <>
          <motion.div 
            className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
            animate={{ y: [0, -20], x: [0, 10], opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
            animate={{ y: [0, 20], x: [0, -10], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          />
        </>
      )}
    </div>
  );
}
