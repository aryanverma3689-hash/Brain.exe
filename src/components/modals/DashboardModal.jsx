import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, MessageSquare, Zap, Cpu, BarChart3, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DashboardModal({ isOpen, onClose, sessions = [] }) {
  if (!isOpen) return null;

  // Calculate generic stats
  const totalSessions = sessions.length;
  const totalMessages = sessions.reduce((acc, s) => acc + (s.messages?.length || 0), 0);
  
  const allText = sessions.flatMap(s => s.messages || []).map(m => m.content).join(" ");
  const wordCount = allText.split(/\s+/).filter(Boolean).length;
  const estimatedTokens = Math.round(wordCount * 1.3);
  const formattedTokens = estimatedTokens > 1000000 ? (estimatedTokens / 1000000).toFixed(1) + 'M' : 
                          estimatedTokens > 1000 ? (estimatedTokens / 1000).toFixed(1) + 'k' : 
                          estimatedTokens.toString();

  const aiText = sessions.flatMap(s => s.messages || []).filter(m => m.role === 'assistant').map(m => m.content).join(" ");
  const aiWordCount = aiText.split(/\s+/).filter(Boolean).length;
  const computeSavedHrs = Math.max(0, Math.round(aiWordCount / 1000));

  // Activity chart (group by day of week)
  const weekCounts = [0, 0, 0, 0, 0, 0, 0];
  sessions.forEach(s => {
    const d = new Date(parseInt(s.id));
    if (!isNaN(d.getTime())) {
      let dayIndex = d.getDay();
      let chartIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Mon=0, Sun=6
      weekCounts[chartIndex]++;
    }
  });
  const maxCount = Math.max(...weekCounts, 1);
  const chartHeights = weekCounts.map(count => Math.max(5, Math.round((count / maxCount) * 100))); // min 5% height

  // Model Distribution
  const moodCounts = {};
  sessions.forEach(s => {
    const m = s.mood || 'general';
    moodCounts[m] = (moodCounts[m] || 0) + 1;
  });
  const getPct = (key) => Math.round(((moodCounts[key] || 0) / Math.max(1, totalSessions)) * 100);

  // Recent logs
  const sortedSessions = [...sessions].sort((a, b) => parseInt(b.id) - parseInt(a.id)).slice(0, 4);
  const timeSince = (timestamp) => {
    if (isNaN(parseInt(timestamp))) return "Unknown";
    const diff = Math.max(0, Date.now() - parseInt(timestamp));
    const mins = Math.floor(diff / 60000);
    if (mins === 0) return "Just now";
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    const days = Math.floor(hrs / 24);
    return days === 1 ? "Yesterday" : `${days} days ago`;
  };
  
  const logs = sortedSessions.map(s => {
    const msgCount = s.messages?.length || 0;
    return {
      action: msgCount > 0 ? `Sent ${msgCount} messages` : "Created session",
      target: s.title || "New Thread",
      time: timeSince(s.id)
    };
  });
  // Pad logs if empty
  if (logs.length === 0) {
    logs.push({ action: "No activity yet", target: "-", time: "-" });
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto custom-scrollbar bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BarChart3 size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">System Dashboard</h2>
                <p className="text-xs text-white/50">Real-time usage and system metrics</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 grid gap-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={MessageSquare} label="Total Messages" value={totalMessages.toLocaleString()} trend="All time" color="text-blue-400" bg="bg-blue-400/10" />
              <StatCard icon={Activity} label="Active Sessions" value={totalSessions.toString()} trend="Workspaces created" color="text-emerald-400" bg="bg-emerald-400/10" />
              <StatCard icon={Zap} label="Tokens Generated" value={formattedTokens} trend="Estimated usage" color="text-amber-400" bg="bg-amber-400/10" />
              <StatCard icon={Cpu} label="Compute Saved" value={`${computeSavedHrs} hrs`} trend="vs manual coding" color="text-purple-400" bg="bg-purple-400/10" />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white/80">Activity Overview</h3>
                  <select className="bg-black border border-white/10 rounded text-xs px-2 py-1 text-white/70 outline-none">
                    <option>Last 7 Days</option>
                  </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-2 px-2">
                  {chartHeights.map((h, i) => (
                    <div key={i} className="w-full bg-white/5 rounded-t-sm hover:bg-white/10 transition-colors relative group">
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500/20 to-emerald-400/80 rounded-t-sm transition-all duration-500 group-hover:brightness-125" 
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-white/40 px-2">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>

              {/* Model Usage */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col">
                <h3 className="text-sm font-medium text-white/80 mb-4">Model Distribution</h3>
                <div className="flex-1 flex flex-col justify-center gap-4">
                  <ModelBar name="Brain Core" percentage={getPct('general')} color="bg-emerald-400" />
                  <ModelBar name="Coding Mode" percentage={getPct('coding')} color="bg-cyan-400" />
                  <ModelBar name="Creative Mode" percentage={getPct('creative')} color="bg-fuchsia-400" />
                  <ModelBar name="Learning Mode" percentage={getPct('learning')} color="bg-blue-400" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="text-sm font-medium text-white/80">Recent Activity Logs</h3>
              </div>
              <div className="divide-y divide-white/5">
                {logs.map((log, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-white/40" />
                      <span className="text-sm text-white/80">{log.action}</span>
                      <span className="text-sm font-medium text-white">{log.target}</span>
                    </div>
                    <span className="text-xs text-white/40">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function StatCard({ icon: Icon, label, value, trend, color, bg }) {
  return (
    <div className="p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-3 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bg, color)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-white">{value}</h4>
        <p className="text-[10px] text-white/40 mt-1">{trend}</p>
      </div>
    </div>
  );
}

function ModelBar({ name, percentage, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/70">{name}</span>
        <span className="text-white font-medium">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-black rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
