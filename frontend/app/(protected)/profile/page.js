"use client";

import { useState } from 'react';
import { useAuth } from '@/components/layout/AuthProvider';
import { fetchApi } from '@/lib/api';
import { LogOut, User as UserIcon, Bell, Moon, ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSaveName = async () => {
    if (!newName.trim() || newName === user.name) {
      setEditingName(false);
      return;
    }
    
    setSaving(true);
    try {
      const data = await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: newName })
      });
      setUser(data);
      setEditingName(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-md mx-auto space-y-8">
        
        <header>
          <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
          
          <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-3xl border border-white/10 neo-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-pink to-accent-purple rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-inner">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    autoFocus
                    className="bg-background border border-white/20 rounded-lg px-2 py-1 text-white w-full focus:outline-none focus:border-accent-pink"
                  />
                  <button onClick={handleSaveName} disabled={saving} className="p-1.5 bg-accent-pink rounded-lg text-white">
                    {saving ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                  <button onClick={() => setEditingName(true)} className="text-accent-cyan text-sm font-medium">
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-2">Preferences</h3>
          
          <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5">
              <div className="flex items-center space-x-3 text-white">
                <Bell className="w-5 h-5 text-gray-400" />
                <span>Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5">
              <div className="flex items-center space-x-3 text-white">
                <Moon className="w-5 h-5 text-gray-400" />
                <span>Dark Mode</span>
              </div>
              <div className="w-12 h-6 bg-accent-pink rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
              </div>
            </div>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center space-x-3 text-white">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <span>Account Details</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </section>

        <section className="pt-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 bg-white/5 hover:bg-red-500/10 text-red-400 font-bold rounded-2xl py-4 transition-colors border border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </motion.button>
        </section>

      </div>
    </div>
  );
}
