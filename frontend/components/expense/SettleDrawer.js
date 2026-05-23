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
    <div className="bg-background rounded-t-3xl border-t border-white/10 p-6 pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Settle Up</h2>
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-full flex items-center justify-center mx-auto mb-4 neo-shadow">
          <Handshake className="w-10 h-10 text-white" />
        </div>
        <p className="text-gray-300 text-lg">
          Are you sure you want to record a cash payment of
        </p>
        <p className="text-4xl font-bold text-accent-cyan my-2">
          ₹{debt.amount.toFixed(2)}
        </p>
        <p className="text-gray-300 text-lg">
          to <span className="font-bold text-white">{receiver?.name || 'this user'}</span>?
        </p>
      </div>

      {error && (
        <p className="text-accent-pink text-sm text-center mb-4">{error}</p>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSettle}
        disabled={loading}
        className="w-full bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-bold rounded-xl py-4 shadow-[0_0_20px_rgba(0,245,212,0.3)] disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <span>Confirm Payment</span>
        )}
      </motion.button>
    </div>
  );
}
