"use client";

import { useState } from 'react';
import { useAuth } from '@/components/layout/AuthProvider';
import { useTheme } from '@/components/layout/ThemeProvider';
import { fetchApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Bell, Moon, Sun, ChevronRight, Check, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [newUpi, setNewUpi] = useState(user?.upiId || '');
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  // Get up to 2 initials from the user's name
  const initials = user?.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : '?';

  const handleSaveProfile = async () => {
    if (!newName.trim()) {
      setEditing(false);
      return;
    }
    
    setSaving(true);
    try {
      const data = await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: newName, upiId: newUpi })
      });
      setUser(data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters.');
      return;
    }
    setSavingPassword(true);
    setPasswordMessage('');
    try {
      await fetchApi('/auth/profile/password', {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword })
      });
      setPasswordMessage('Password updated successfully!');
      setNewPassword('');
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (err) {
      setPasswordMessage(err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
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
              {editing ? (
                <div className="flex flex-col space-y-2">
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Name"
                    autoFocus
                    className="bg-stone-100 border border-stone-300 rounded-lg px-2 py-1.5 text-stone-900 w-full focus:outline-none focus:border-blush-400"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                  />
                  <input 
                    type="text" 
                    value={newUpi} 
                    onChange={e => setNewUpi(e.target.value)}
                    placeholder="UPI ID (e.g. name@upi)"
                    className="bg-stone-100 border border-stone-300 rounded-lg px-2 py-1.5 text-stone-900 w-full focus:outline-none focus:border-blush-400 font-mono text-sm"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                  />
                  <div className="flex justify-end space-x-2 mt-1">
                    <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm font-semibold text-stone-500 hover:text-stone-700">Cancel</button>
                    <button onClick={handleSaveProfile} disabled={saving} className="px-4 py-1.5 bg-blush-400 rounded-lg text-white flex items-center space-x-1 shadow-sm">
                      {saving ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> <span className="text-sm font-bold">Save</span></>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold truncate" style={{ color: 'var(--foreground)' }}>{user?.name}</h2>
                    <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>{user?.email}</p>
                    {user?.upiId && <p className="text-sm font-mono mt-1 text-blush-500 font-medium truncate">{user.upiId}</p>}
                    {!user?.upiId && <p className="text-xs font-semibold mt-1 text-coral-500 truncate cursor-pointer hover:underline" onClick={() => setEditing(true)}>+ Add UPI ID</p>}
                  </div>
                  <button onClick={() => setEditing(true)} className="text-blush-400 text-sm font-semibold hover:text-blush-300 transition-colors ml-3 flex-shrink-0 mt-1">
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

            {/* Account Details Removed */}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider pl-2" style={{ color: 'var(--muted)' }}>Security</h3>
          <div className="rounded-3xl border overflow-hidden shadow-soft p-4 space-y-3"
               style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center space-x-3 mb-2" style={{ color: 'var(--foreground)' }}>
              <Key className="w-5 h-5" style={{ color: 'var(--muted)' }} />
              <span className="font-semibold">Set / Change Password</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Set a new password for your account without needing the old one.</p>
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New Password (min 6 characters)"
              className="bg-stone-100 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 w-full focus:outline-none focus:border-blush-400"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className={`text-sm ${passwordMessage.includes('successfully') ? 'text-green-500' : 'text-coral-500'}`}>
                {passwordMessage}
              </span>
              <button 
                onClick={handlePasswordChange} 
                disabled={savingPassword || !newPassword} 
                className="px-4 py-2 bg-blush-400 rounded-xl text-white font-bold flex items-center space-x-1 shadow-sm disabled:opacity-50"
              >
                {savingPassword ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <span>Update</span>}
              </button>
            </div>
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
