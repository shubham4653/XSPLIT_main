"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';
import { fetchApi } from '@/lib/api';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccountDetailsPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const data = await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ upiId })
      });
      setUser(data);
      setMessage('Account details updated successfully!');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Failed to update account details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative pb-24">
      <header
        className="px-4 py-4 sticky top-0 z-40 backdrop-blur-md border-b flex items-center"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full border shrink-0 shadow-sm transition hover:scale-105 mr-4"
          style={{ background: 'var(--card-border)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold font-serif" style={{ color: 'var(--foreground)' }}>Account Details</h1>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-6 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border rounded-3xl"
        >
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2 text-stone-500">UPI ID</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@upi"
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 pl-10 text-stone-900 focus:outline-none focus:ring-2 focus:ring-blush-400 focus:border-transparent transition-shadow"
                />
              </div>
              <p className="text-xs text-stone-500 mt-2 ml-1">Used to receive instant settlements via QR code.</p>
            </div>

            {message && (
              <p className={`text-sm text-center font-medium ${message.includes('successfully') ? 'text-mint-600' : 'text-coral-500'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full btn-elegant mt-2 flex items-center justify-center space-x-2"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Details</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
