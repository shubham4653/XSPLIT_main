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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blush-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">

        {/* Header */}
        <header className="flex items-center space-x-3 mb-6">
          <div
            className="p-3 rounded-2xl border"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <Activity className="w-6 h-6 text-blush-400" />
          </div>
          <h1 className="text-2xl font-bold font-serif" style={{ color: 'var(--foreground)' }}>
            Recent Activity
          </h1>
        </header>

        {activities.length === 0 ? (
          <div
            className="text-center py-12 rounded-3xl border border-dashed"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <Receipt className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--muted)', opacity: 0.4 }} />
            <p style={{ color: 'var(--muted)' }}>No recent activity.</p>
          </div>
        ) : (
          <div
            className="relative ml-4 space-y-8 pb-12 border-l-2"
            style={{ borderColor: 'var(--card-border)' }}
          >
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
                  <div
                    className="absolute -left-2 top-1.5 w-4 h-4 rounded-full border-2 border-blush-400"
                    style={{ background: 'var(--background)' }}
                  />

                  <div
                    className="p-4 rounded-2xl border shadow-soft"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="text-xl">{activity.groupId?.icon || '🗂️'}</div>
                        <div>
                          <p className="text-sm" style={{ color: 'var(--muted)' }}>{activity.groupId?.name}</p>
                          <h3 className="font-bold" style={{ color: 'var(--foreground)' }}>{activity.description}</h3>
                        </div>
                      </div>
                      <span className="font-bold text-blush-400">₹{activity.amount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {activity.paidBy._id === user?._id ? 'You' : activity.paidBy.name} paid on{' '}
                      {new Date(activity.date).toLocaleDateString()}
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
