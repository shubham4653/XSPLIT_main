"use client";

import { useState } from 'react';
import { useAuth } from '@/components/layout/AuthProvider';
import { useTheme } from '@/components/layout/ThemeProvider';
import { fetchApi } from '@/lib/api';
import { LogOut, User as UserIcon, Bell, Moon, Sun, ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  // Get up to 2 initials from the user's name
  const initials = user?.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : '?';

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
          <h1 className="text-2xl font-bold text-stone-900 mb-6">Settings</h1>
          
          <div className="flex items-center space-x-4 bg-white p-4 rounded-3xl border border-stone-200 shadow-soft"
               style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            {/* Avatar — initials only */}
            <div className="w-16 h-16 bg-gradient-to-br from-blush-300 to-blush-400 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-blush select-none flex-shrink-0">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    autoFocus
                    className="bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 text-stone-900 w-full focus:outline-none focus:border-blush-400"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                  />
                  <button onClick={handleSaveName} disabled={saving} className="p-1.5 bg-blush-400 rounded-lg text-white flex-shrink-0">
                    {saving ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold truncate" style={{ color: 'var(--foreground)' }}>{user?.name}</h2>
                    <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>{user?.email}</p>
                  </div>
                  <button onClick={() => setEditingName(true)} className="text-blush-400 text-sm font-semibold hover:text-blush-300 transition-colors ml-3 flex-shrink-0">
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider pl-2" style={{ color: 'var(--muted)' }}>Preferences</h3>
          
          <div className="rounded-3xl border overflow-hidden shadow-soft"
               style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>

            {/* Notifications */}
            <button className="w-full flex items-center justify-between p-4 transition-colors border-b"
                    style={{ borderColor: 'var(--card-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? '#3f3f46' : '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div className="flex items-center space-x-3" style={{ color: 'var(--foreground)' }}>
                <Bell className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                <span>Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--muted)' }} />
            </button>
            
            {/* Dark Mode toggle */}
            <div className="w-full flex items-center justify-between p-4 border-b"
                 style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-center space-x-3" style={{ color: 'var(--foreground)' }}>
                {isDark
                  ? <Moon className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                  : <Sun className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                }
                <span>Dark Mode</span>
              </div>

              {/* Animated toggle switch */}
              <button
                id="dark-mode-toggle"
                onClick={toggleDark}
                aria-label="Toggle dark mode"
                className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blush-400 focus:ring-offset-2"
                style={{ background: isDark ? '#FF9DB7' : '#D1CFC8' }}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                  style={{ left: isDark ? '26px' : '2px' }}
                />
              </button>
            </div>

            {/* Account Details */}
            <button className="w-full flex items-center justify-between p-4 transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? '#3f3f46' : '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div className="flex items-center space-x-3" style={{ color: 'var(--foreground)' }}>
                <UserIcon className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                <span>Account Details</span>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--muted)' }} />
            </button>
          </div>
        </section>

        <section className="pt-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 hover:bg-red-500/10 text-red-400 font-bold rounded-2xl py-4 transition-colors border border-red-500/20"
            style={{ background: 'var(--card-bg)' }}
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </motion.button>
        </section>

      </div>
    </div>
  );
}
