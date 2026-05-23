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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex justify-between items-center glass-card p-4 relative z-20">
          <div>
            <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">Dashboard</h1>
            <p className="text-stone-500 text-sm font-light">Welcome back, {user?.name?.split(' ')[0]}!</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-stone-100/50 hover:bg-stone-200 border border-stone-200 text-stone-600 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blush-400 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white shadow-xl rounded-3xl z-50 p-3 border border-stone-200"
                  >
                    <h3 className="font-bold font-serif text-stone-900 p-2 border-b border-stone-100 mb-2">Notifications</h3>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-stone-400 p-2 text-center font-light">No new notifications</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => !notif.read && markAsRead(notif._id)}
                          className={`p-3 rounded-2xl mb-1 cursor-pointer transition-colors ${notif.read ? 'opacity-50 hover:bg-stone-50' : 'bg-lavender-50 hover:bg-stone-100'}`}
                        >
                          <p className="text-sm font-medium text-stone-900">{notif.title}</p>
                          <p className="text-xs text-stone-500 mt-1">{notif.message}</p>
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
            <h3 className="text-stone-500 font-medium mb-2 uppercase tracking-wide text-xs">Total Balance</h3>
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
            <h3 className="text-stone-500 font-medium mb-2 uppercase tracking-wide text-xs">You Owe</h3>
            <p className="text-2xl font-mono font-light text-coral-400">₹{safeTotalYouOwe.toFixed(2)}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="glass-card p-5"
          >
            <h3 className="text-stone-500 font-medium mb-2 uppercase tracking-wide text-xs">Owes You</h3>
            <p className="text-2xl font-mono font-light text-mint-400">₹{safeTotalOwesYou.toFixed(2)}</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-xl font-bold font-serif text-stone-900 tracking-tight">Your Groups</h2>
            <span className="text-sky-400 text-sm cursor-pointer hover:underline font-medium">View all</span>
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
