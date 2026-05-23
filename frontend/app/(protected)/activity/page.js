"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Receipt } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthProvider';

export default function ActivityPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await fetchApi('/users/activity');
        setActivities(data);
      } catch (err) {
        console.error('Failed to load activity', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-pink"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <Activity className="w-6 h-6 text-accent-pink" />
          </div>
          <h1 className="text-2xl font-bold text-white">Recent Activity</h1>
        </header>

        {activities.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10 border-dashed">
            <Receipt className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-gray-400">No recent activity.</p>
          </div>
        ) : (
          <div className="relative border-l border-white/10 ml-4 space-y-8 pb-12">
            <AnimatePresence>
              {activities.map((activity, i) => (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-6"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-2 top-1.5 w-4 h-4 rounded-full bg-background border-2 border-accent-cyan" />
                  
                  <div className="glass-card neo-shadow p-4 rounded-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="text-xl">{activity.groupId?.icon || '🗂️'}</div>
                        <div>
                          <p className="text-sm text-gray-400">{activity.groupId?.name}</p>
                          <h3 className="font-bold text-white">{activity.description}</h3>
                        </div>
                      </div>
                      <span className="font-bold text-accent-pink">₹{activity.amount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {activity.paidBy._id === user?._id ? 'You' : activity.paidBy.name} paid on {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
