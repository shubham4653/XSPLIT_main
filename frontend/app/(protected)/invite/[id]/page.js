"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Users, CheckCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function InvitePage({ params }) {
  const unwrappedParams = use(params);
  const groupId = unwrappedParams.id;
  const router = useRouter();

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
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-pink/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-cyan/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card neo-shadow p-8 rounded-3xl w-full max-w-sm text-center relative z-10 border border-white/10"
      >
        {error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-white">Oops!</h1>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,107,157,0.3)] text-3xl mb-2"
                style={{ backgroundColor: preview?.color || '#FF6B9D' }}
              >
                {preview?.icon || '👋'}
              </div>
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">You've been invited</h2>
              <h1 className="text-3xl font-bold text-white">{preview?.name}</h1>
              <div className="flex items-center space-x-2 text-gray-300">
                <Users className="w-4 h-4" />
                <span className="text-sm">{preview?.memberCount} members</span>
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full mt-8 bg-gradient-to-r from-accent-pink to-accent-purple text-white font-bold rounded-xl py-4 px-4 flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(255,107,157,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {joining ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Accept Invite</span>
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
