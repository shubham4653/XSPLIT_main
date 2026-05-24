"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Users, CheckCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthProvider';

export default function InvitePage({ params }) {
  const unwrappedParams = use(params);
  const groupId = unwrappedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const data = await fetchApi(`/groups/${groupId}/preview`);
        setPreview(data);
      } catch (err) {
        setError('Invalid or expired invite link.');
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [groupId]);

  const handleJoin = async () => {
    if (!user) {
      router.push(`/login?callbackUrl=/invite/${groupId}`);
      return;
    }
    setJoining(true);
    try {
      await fetchApi(`/groups/${groupId}/join`, {
        method: 'POST'
      });
      // Redirect to the group dashboard on success
      router.push(`/groups/${groupId}`);
    } catch (err) {
      setError(err.message || 'Failed to join group.');
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent-pink" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blush-300/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-sky-300/30 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 rounded-3xl w-full max-w-sm text-center relative z-10"
      >
        {error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold font-serif" style={{ color: 'var(--foreground)' }}>Oops!</h1>
            <p className="text-stone-500">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full btn-elegant mt-6"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-soft text-3xl mb-2"
                style={{ backgroundColor: preview?.color ? `${preview.color}33` : 'var(--card-border)' }}
              >
                {preview?.icon || '👋'}
              </div>
              <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400">You've been invited</h2>
              <h1 className="text-3xl font-bold font-serif tracking-tight" style={{ color: 'var(--foreground)' }}>{preview?.name}</h1>
              <div className="flex items-center space-x-2 text-stone-500 font-medium bg-stone-100 px-3 py-1 rounded-full">
                <Users className="w-4 h-4" />
                <span className="text-sm">{preview?.memberCount} members</span>
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full mt-8 btn-elegant flex items-center justify-center space-x-2"
            >
              {joining ? (
                <Loader2 className="w-5 h-5 animate-spin text-stone-900" />
              ) : (
                <>
                  <span className="font-bold">Accept Invite</span>
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors uppercase tracking-wide"
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
