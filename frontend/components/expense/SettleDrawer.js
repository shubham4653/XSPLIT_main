"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { X, Loader2, Handshake } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function SettleDrawer({ debt, groupId, members, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // debt object has { from, to, amount }
  const receiver = members.find(m => m._id === debt.to);

  const handleSettle = async () => {
    setLoading(true);
    setError('');
    try {
      await fetchApi(`/groups/${groupId}/settle`, {
        method: 'POST',
        body: JSON.stringify({
          toUserId: debt.to,
          amount: debt.amount
        })
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to settle debt');
      setLoading(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-stone-200 flex flex-col max-h-[90vh]"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      <div className="p-4 flex justify-between items-center border-b shrink-0" style={{ borderColor: 'var(--card-border)' }}>
        <h2 className="text-xl font-bold font-serif tracking-tight" style={{ color: 'var(--foreground)' }}>Settle Up</h2>
        <button 
          onClick={onClose} 
          className="p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto p-6 pb-12 flex-1">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-200 shadow-sm">
            <Handshake className="w-10 h-10 text-stone-600" />
          </div>
          <p className="text-stone-500 text-sm uppercase tracking-wide font-medium">
            Are you sure you want to record a cash payment of
          </p>
          <p className="text-4xl font-mono font-light text-stone-900 my-4">
            ₹{debt.amount.toFixed(2)}
          </p>
          <p className="text-stone-500 text-sm uppercase tracking-wide font-medium">
            to <span className="font-bold text-stone-900">{receiver?.name || 'this user'}</span>?
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center">
            ⚠️ {error}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSettle}
          disabled={loading}
          className="w-full bg-stone-900 text-white font-sans font-medium uppercase tracking-wide rounded-2xl py-4 hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <span>Confirm Payment</span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
