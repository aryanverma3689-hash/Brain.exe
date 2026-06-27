import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, CreditCard, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function ProfileModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('account');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl flex flex-col sm:flex-row overflow-hidden max-h-[90vh]"
        >
          {/* Sidebar */}
          <div className="w-full sm:w-48 border-b sm:border-b-0 sm:border-r border-white/10 bg-white/5 p-4 flex sm:flex-col gap-2 overflow-x-auto shrink-0">
            <h3 className="hidden sm:block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 px-3">Settings</h3>
            
            <div className="flex sm:flex-col gap-2 shrink-0">
              <TabButton icon={User} label="Account" isActive={activeTab === 'account'} onClick={() => setActiveTab('account')} />
              <TabButton icon={CreditCard} label="Billing" isActive={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
              <TabButton icon={Shield} label="Security" isActive={activeTab === 'security'} onClick={() => setActiveTab('security')} />
            </div>
            
            <div className="sm:mt-auto sm:pt-4 sm:border-t border-white/10 ml-auto sm:ml-0 shrink-0">
              <button onClick={() => { toast.success('Logged out successfully'); onClose(); window.location.href = '/'; }} className="h-full sm:w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 whitespace-nowrap">
                <LogOut size={16} />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-[60vh] sm:h-[500px] min-h-[400px]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white capitalize">{activeTab} Settings</h2>
              <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {activeTab === 'account' && <AccountSettings />}
              {activeTab === 'billing' && <BillingSettings />}
              {activeTab === 'security' && <SecuritySettings />}
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
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon size={16} className={isActive ? "text-white" : "text-white/50"} />
      <span>{label}</span>
    </button>
  );
}

function AccountSettings() {
  const [name, setName] = useState(localStorage.getItem('userName') || 'User');

  const handleSave = () => {
    localStorage.setItem('userName', name);
    window.dispatchEvent(new Event('profileUpdate'));
    toast.success('Profile updated!');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold shadow-lg">
          {name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <button onClick={() => toast('Avatar upload coming soon')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/5">
            Change Avatar
          </button>
          <p className="text-xs text-white/40 mt-2">JPG, GIF or PNG. Max size of 800K</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-white/80">Display Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors" 
          />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-white/80">Email Address</label>
          <input type="email" defaultValue="hello@aryan.com" className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors" />
        </div>
      </div>

      <button onClick={handleSave} className="mt-4 w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-bold rounded-lg transition-colors">
        Save Changes
      </button>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="flex flex-col gap-6">
      <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Brain.exe Pro <CheckCircle2 size={16} className="text-emerald-400" />
        </h3>
        <p className="text-sm text-white/60 mt-1">You are currently on the Pro plan.</p>
        
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">$20<span className="text-sm text-white/40 font-normal">/month</span></p>
            <p className="text-xs text-white/40 mt-1">Next billing date: July 25, 2026</p>
          </div>
          <button onClick={() => toast('Manage subscription portal coming soon')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/5">
            Manage Plan
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white/80 mb-3">Payment Method</h4>
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-xs font-bold">VISA</div>
            <div>
              <p className="text-sm text-white">•••• •••• •••• 4242</p>
              <p className="text-xs text-white/40">Expires 12/28</p>
            </div>
          </div>
          <button className="text-xs text-white/50 hover:text-white">Edit</button>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-white/80">Current Password</label>
        <input type="password" placeholder="••••••••" className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors" />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-white/80">New Password</label>
        <input type="password" placeholder="••••••••" className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors" />
      </div>
      <button onClick={() => toast.success('Password updated')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/5 w-fit">
        Update Password
      </button>

      <hr className="border-white/10 my-2" />

      <div>
        <h4 className="text-sm font-medium text-white/80 mb-2">Two-Factor Authentication</h4>
        <p className="text-xs text-white/50 mb-4">Add an extra layer of security to your account.</p>
        <button onClick={() => toast('2FA setup coming soon')} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium rounded-lg transition-colors border border-emerald-500/20 w-fit">
          Enable 2FA
        </button>
      </div>
    </div>
  );
}
