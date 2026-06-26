import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, Database, Brain, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function NotificationsDropdown({ isOpen, onClose }) {
  const notifications = [
    {
      id: 1,
      icon: Brain,
      title: 'Brain Core Updated',
      description: 'The core model has been updated with 30% faster inference times and improved reasoning.',
      time: '2 hours ago',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 2,
      icon: Database,
      title: 'Memory Indexed',
      description: 'Your recent conversation about the Q3 Roadmap has been indexed into long-term memory.',
      time: '5 hours ago',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      id: 3,
      icon: Zap,
      title: 'Pro Plan Active',
      description: 'Your payment was successful. You now have unlimited access to all AI models.',
      time: '1 day ago',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose} 
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 w-80 bg-[#0A0A0C]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <button onClick={onClose} className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors">
                <CheckCircle2 size={12} />
                Mark all read
              </button>
            </div>
            
            <div className="flex flex-col max-h-[350px] overflow-y-auto custom-scrollbar">
              {notifications.map((notif, idx) => (
                <div key={notif.id} className={cn("p-4 flex gap-3 hover:bg-white/5 transition-colors cursor-pointer", idx !== notifications.length - 1 && "border-b border-white/5")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", notif.bg, notif.color)}>
                    <notif.icon size={14} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-white/90 leading-tight">{notif.title}</p>
                    <p className="text-xs text-white/50 leading-relaxed">{notif.description}</p>
                    <span className="text-[10px] text-white/30 mt-1">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/10 text-center bg-white/[0.02]">
              <button onClick={onClose} className="text-xs font-medium text-white/40 hover:text-white transition-colors">
                View All Notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
