import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Monitor, Lock, Globe, Database, Bot, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl h-[80vh] sm:h-[600px] bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl flex flex-col sm:flex-row overflow-hidden"
        >
          {/* Sidebar */}
          <div className="w-full sm:w-56 border-b sm:border-b-0 sm:border-r border-white/10 bg-white/5 p-4 flex sm:flex-col gap-2 overflow-x-auto shrink-0">
            <h3 className="hidden sm:block text-xs font-bold text-white/40 uppercase tracking-widest mb-4 px-3 mt-2">App Settings</h3>
            
            <div className="flex sm:flex-col gap-2 shrink-0">
              <TabButton icon={Settings} label="General" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
              <TabButton icon={Monitor} label="Appearance" isActive={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} />
              <TabButton icon={Bot} label="AI Models" isActive={activeTab === 'models'} onClick={() => setActiveTab('models')} />
              <TabButton icon={Database} label="Data & Memory" isActive={activeTab === 'data'} onClick={() => setActiveTab('data')} />
              <TabButton icon={Bell} label="Notifications" isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl shrink-0">
              <h2 className="text-lg font-semibold text-white capitalize">{activeTab} Settings</h2>
              <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {activeTab === 'general' && <GeneralSettings />}
              {activeTab === 'appearance' && <AppearanceSettings />}
              {activeTab === 'models' && <ModelSettings />}
              {activeTab === 'data' && <DataSettings />}
              {activeTab === 'notifications' && <NotificationSettings />}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function TabButton({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
        isActive ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon size={16} className={isActive ? "text-white" : "text-white/50"} />
      <span>{label}</span>
    </button>
  );
}

function GeneralSettings() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="Language & Region">
        <div className="grid gap-4">
          <Select storageKey="lang" label="System Language" options={["English (US)", "Spanish", "French", "German", "Japanese"]} />
          <Select storageKey="timezone" label="Time Zone" options={["Pacific Time (PT)", "Eastern Time (ET)", "Coordinated Universal Time (UTC)", "Indian Standard Time (IST)"]} />
        </div>
      </Section>
      <Section title="Chat Behavior">
        <div className="grid gap-4">
          <Toggle storageKey="press_enter" label="Press Enter to send message" description="If disabled, you'll need to click the send button." defaultChecked />
          <Toggle storageKey="auto_scroll" label="Auto-scroll to new messages" defaultChecked />
          <Toggle storageKey="markdown" label="Enable Markdown rendering" defaultChecked />
        </div>
      </Section>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState(() => localStorage.getItem('brain_setting_theme') || 'System Default');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('brain_setting_theme', newTheme);
    window.dispatchEvent(new Event('brain_theme_changed'));
  };

  return (
    <div className="flex flex-col gap-8">
      <Section title="Theme">
        <div className="grid grid-cols-3 gap-4">
          <ThemeCard name="System Default" active={theme === 'System Default'} onClick={() => handleThemeChange('System Default')} />
          <ThemeCard name="Dark Mode" active={theme === 'Dark Mode'} onClick={() => handleThemeChange('Dark Mode')} />
          <ThemeCard name="Light Mode" active={theme === 'Light Mode'} onClick={() => handleThemeChange('Light Mode')} />
        </div>
      </Section>
      <Section title="Code Blocks">
        <div className="grid gap-4">
          <Select storageKey="syntax_theme" label="Syntax Highlighting Theme" options={["One Dark", "Dracula", "GitHub Dark", "Monokai"]} />
          <Toggle storageKey="line_numbers" label="Show Line Numbers" defaultChecked />
        </div>
      </Section>
    </div>
  );
}

function ModelSettings() {
  const [sysPrompt, setSysPrompt] = useState(() => localStorage.getItem('brain_setting_sys_prompt') || '');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('brain_setting_api_key') || '');
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <Section title="System Prompt">
        <p className="text-xs text-white/50 mb-3">Add global instructions that the AI should follow across all workspaces.</p>
        <textarea 
          value={sysPrompt}
          onChange={(e) => setSysPrompt(e.target.value)}
          className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white resize-none focus:border-emerald-500 outline-none transition-colors"
          placeholder="e.g. Always answer concisely and format outputs as tables when possible..."
        />
        <div className="flex justify-end mt-2">
          <button onClick={() => {
            localStorage.setItem('brain_setting_sys_prompt', sysPrompt);
            toast.success('Prompt saved');
          }} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-bold rounded-lg transition-colors">
            Save Instructions
          </button>
        </div>
      </Section>
      <Section title="Default Providers">
        <div className="grid gap-4">
          <Select storageKey="text_model" label="Default Text Model" options={["Brain Core (Flash 2.5)", "GPT-4o", "Claude 3.5 Sonnet"]} />
          <Select storageKey="search_engine" label="Default Search Engine" options={["DuckDuckGo", "Google", "Tavily"]} />
        </div>
      </Section>
      <Section title="API Configuration">
        <p className="text-xs text-white/50 mb-3">Enter your own API key to bypass built-in rate limits or if the default provider stops working.</p>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/60">Provider API Key</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <Key size={14} />
            </div>
            <input 
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-24 py-2 text-sm text-white outline-none focus:border-emerald-500 transition-colors placeholder:text-white/20"
            />
            <button 
              onClick={() => {
                localStorage.setItem('brain_setting_api_key', apiKey);
                toast.success('API Key saved successfully');
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/10 hover:bg-white/20 text-xs font-medium text-white rounded transition-colors"
            >
              Save Key
            </button>
          </div>
          <button 
            onClick={() => setShowKey(!showKey)} 
            className="text-[10px] text-white/40 hover:text-white transition-colors w-max mt-1"
          >
            {showKey ? "Hide API Key" : "Show API Key"}
          </button>
        </div>
      </Section>
    </div>
  );
}

function DataSettings() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="Memory">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <h4 className="text-sm font-medium text-white">Continuous Memory</h4>
            <p className="text-xs text-white/50 mt-1">Allow the AI to remember context across different chat sessions.</p>
          </div>
          <Toggle storageKey="continuous_memory" defaultChecked noLabel />
        </div>
      </Section>
      <Section title="Data Export">
        <p className="text-xs text-white/50 mb-4">Download a copy of all your conversations, uploaded documents, and memory blocks.</p>
        <button onClick={() => toast.success('Data exported to JSON successfully')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/5">
          Export All Data
        </button>
      </Section>
      <Section title="Danger Zone">
        <div className="p-4 border border-rose-500/30 bg-rose-500/5 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-rose-500">Delete Account</h4>
            <p className="text-xs text-rose-500/70 mt-1">Permanently delete your account and all data.</p>
          </div>
          <button onClick={() => toast('Account deletion initiated...')} className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-sm font-medium rounded-lg transition-colors">
            Delete Account
          </button>
        </div>
      </Section>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="Email Notifications">
        <div className="grid gap-4">
          <Toggle storageKey="notif_updates" label="Product Updates" description="Receive emails about new features and models." defaultChecked />
          <Toggle storageKey="notif_billing" label="Billing & Security" description="Important updates regarding your account." defaultChecked />
        </div>
      </Section>
      <Section title="In-App Notifications">
        <div className="grid gap-4">
          <Toggle storageKey="notif_task" label="Task Completion" description="Notify when long-running AI tasks finish." defaultChecked />
          <Toggle storageKey="notif_sound" label="Sound Effects" description="Play soft UI sounds on actions." />
        </div>
      </Section>
    </div>
  );
}

/* Reusable UI Components */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-white/80 tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ label, description, defaultChecked, noLabel, storageKey }) {
  const [checked, setChecked] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`brain_setting_${storageKey}`);
      if (saved !== null) return JSON.parse(saved);
    }
    return defaultChecked || false;
  });

  const handleToggle = () => {
    const newVal = !checked;
    setChecked(newVal);
    if (storageKey) {
      localStorage.setItem(`brain_setting_${storageKey}`, JSON.stringify(newVal));
    }
  };

  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={handleToggle}>
      {!noLabel && (
        <div className="flex flex-col pr-4">
          <span className="text-sm font-medium text-white/90">{label}</span>
          {description && <span className="text-xs text-white/40 mt-0.5">{description}</span>}
        </div>
      )}
      <div className={cn("w-10 h-6 rounded-full flex items-center p-1 transition-colors shrink-0", checked ? "bg-emerald-500" : "bg-white/10")}>
        <div className={cn("w-4 h-4 bg-white rounded-full transition-transform shadow-sm", checked ? "translate-x-4" : "translate-x-0")} />
      </div>
    </div>
  );
}

function Select({ label, options, storageKey }) {
  const [value, setValue] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`brain_setting_${storageKey}`);
      if (saved) return saved;
    }
    return options[0];
  });

  const handleChange = (e) => {
    const newVal = e.target.value;
    setValue(newVal);
    if (storageKey) {
      localStorage.setItem(`brain_setting_${storageKey}`, newVal);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/60">{label}</label>
      <div className="relative">
        <select 
          value={value}
          onChange={handleChange}
          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
        >
          {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown size={14} className="text-white/40" />
        </div>
      </div>
    </div>
  );
}

import { ChevronDown, Key } from 'lucide-react';

function ThemeCard({ name, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
      "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all",
      active ? "bg-emerald-500/10 border-emerald-500/50" : "bg-white/5 border-white/10 hover:bg-white/10"
    )}>
      <div className="w-full aspect-video rounded-lg bg-black/50 border border-white/5 flex flex-col p-2 gap-1.5 overflow-hidden">
        <div className="w-full h-2 bg-white/10 rounded-full" />
        <div className="w-2/3 h-2 bg-white/5 rounded-full" />
        <div className="w-1/2 h-2 bg-emerald-500/50 rounded-full mt-auto" />
      </div>
      <span className={cn("text-xs font-medium", active ? "text-emerald-400" : "text-white/60")}>{name}</span>
    </button>
  );
}
