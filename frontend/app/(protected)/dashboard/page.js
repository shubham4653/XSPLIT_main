"use client";

import { useAuth } from '@/components/layout/AuthProvider';
import { LogOut, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import GroupCard from '@/components/group/GroupCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, notifData] = await Promise.all([
          fetchApi('/users/dashboard'),
          fetchApi('/users/notifications')
        ]);
        setSummary(dashData);
        setNotifications(notifData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await fetchApi(`/users/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-pink"></div>
      </div>
    );
  }

  const { totalBalance = 0, totalYouOwe = 0, totalOwesYou = 0, groups = [] } = summary || {};
  const safeTotalBalance = Number(totalBalance) || 0;
  const safeTotalYouOwe = Number(totalYouOwe) || 0;
  const safeTotalOwesYou = Number(totalOwesYou) || 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex justify-between items-center p-5 rounded-3xl border shadow-soft relative z-20"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div>
            <h1 className="text-2xl font-bold font-serif tracking-tight" style={{ color: 'var(--foreground)' }}>Dashboard</h1>
            <p className="text-sm font-light mt-0.5" style={{ color: 'var(--muted)' }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-full border transition-all hover:scale-105"
                style={{
                  background: unreadCount > 0 ? 'rgba(255,179,200,0.15)' : 'var(--card-border)',
                  borderColor: unreadCount > 0 ? '#FF9DB7' : 'var(--card-border)',
                  color: 'var(--foreground)'
                }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-blush-400 rounded-full border-2 animate-pulse"
                    style={{ borderColor: 'var(--card-bg)' }} />
                )}
              </button>

              {/* Click-outside overlay */}
              {showNotifications && (
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              )}

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto shadow-xl rounded-3xl z-50 p-3 border"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                  >
                    <div className="flex items-center justify-between p-2 border-b mb-2" style={{ borderColor: 'var(--card-border)' }}>
                      <h3 className="font-bold font-serif" style={{ color: 'var(--foreground)' }}>Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blush-200 text-stone-900">{unreadCount} new</span>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--muted)' }} />
                        <p className="text-sm font-light" style={{ color: 'var(--muted)' }}>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif._id}
                          onClick={() => !notif.read && markAsRead(notif._id)}
                          className={`p-3 rounded-2xl mb-1 cursor-pointer transition-all hover:scale-[1.01] ${notif.read ? 'opacity-50' : 'bg-blush-300/15 border border-blush-400/25'}`}
                        >
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blush-400 mt-1.5 flex-shrink-0" style={{ opacity: notif.read ? 0 : 1 }} />
                            <div>
                              <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--foreground)' }}>{notif.title || 'Notification'}</p>
                              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted)' }}>{notif.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="glass-card p-6 col-span-2 text-center"
          >
            <h3 className="font-medium mb-2 uppercase tracking-wide text-xs" style={{ color: 'var(--muted)' }}>Total Balance</h3>
            <p className={`text-4xl font-mono font-light tracking-tight ${safeTotalBalance >= 0 ? 'text-mint-400' : 'text-coral-400'}`}>
              ₹{Math.abs(safeTotalBalance).toFixed(2)}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="glass-card p-5"
          >
            <h3 className="font-medium mb-2 uppercase tracking-wide text-xs" style={{ color: 'var(--muted)' }}>You Owe</h3>
            <p className="text-2xl font-mono font-light text-coral-400">₹{safeTotalYouOwe.toFixed(2)}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="glass-card p-5"
          >
            <h3 className="font-medium mb-2 uppercase tracking-wide text-xs" style={{ color: 'var(--muted)' }}>Owes You</h3>
            <p className="text-2xl font-mono font-light text-mint-400">₹{safeTotalOwesYou.toFixed(2)}</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-xl font-bold font-serif tracking-tight" style={{ color: 'var(--foreground)' }}>Your Groups</h2>
            <span className="text-blush-400 text-sm cursor-pointer hover:underline font-medium">View all</span>
          </div>

          <div className="space-y-3">
            {groups.length === 0 ? (
              <div className="text-center py-10 glass-card">
                <p className="text-stone-500 font-light">You aren't in any groups yet.</p>
              </div>
            ) : (
              groups.map(group => (
                <GroupCard key={group._id} group={group} />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
