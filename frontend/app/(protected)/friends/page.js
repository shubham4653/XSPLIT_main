"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Handshake, Loader2, User, ChevronRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthProvider';
import SettleDrawer from '@/components/expense/SettleDrawer';

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState(null); // { friend, amount, type: 'owe' | 'owed' }

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const data = await fetchApi('/users/friends');
      setFriends(data);
    } catch (err) {
      console.error('Failed to load friends', err);
    } finally {
      setLoading(false);
    }
  };

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
            className="p-3 rounded-2xl border shadow-sm"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <Handshake className="w-6 h-6 text-blush-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif" style={{ color: 'var(--foreground)' }}>
              Friends
            </h1>
            <p className="text-sm font-light" style={{ color: 'var(--muted)' }}>Balances across all groups</p>
          </div>
        </header>

        {friends.length === 0 ? (
          <div
            className="text-center py-12 rounded-3xl border border-dashed"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <User className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--muted)', opacity: 0.4 }} />
            <p style={{ color: 'var(--muted)' }}>You don't have any shared expenses yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {friends.map((friend, i) => (
                <motion.div
                  key={friend._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-3xl border shadow-soft flex items-center justify-between"
                  style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center border shadow-inner">
                      <span className="text-lg font-serif font-bold text-stone-700">
                        {friend.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: 'var(--foreground)' }}>{friend.name}</h3>
                      {friend.balance === 0 ? (
                        <p className="text-sm text-stone-500 font-medium">Settled up</p>
                      ) : friend.balance > 0 ? (
                        <p className="text-sm text-mint-500 font-semibold tracking-wide">
                          Owes you ₹{friend.balance.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-sm text-coral-500 font-semibold tracking-wide">
                          You owe ₹{Math.abs(friend.balance).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {friend.balance < 0 && (
                    <button
                      onClick={() => setSelectedDebt({
                        friend,
                        amount: Math.abs(friend.balance),
                        type: 'owe'
                      })}
                      className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors shadow-md"
                    >
                      Settle
                    </button>
                  )}
                  {friend.balance > 0 && (
                    <button
                      className="px-4 py-2 bg-stone-100 text-stone-400 rounded-xl text-xs font-bold uppercase tracking-wider cursor-default border"
                    >
                      Remind
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Settle Drawer Overlay */}
      <AnimatePresence>
        {selectedDebt && (
          <div className="fixed inset-0 z-[110] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setSelectedDebt(null)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md mx-auto"
            >
              <SettleDrawer
                debt={{
                  to: selectedDebt.friend._id,
                  amount: selectedDebt.amount
                }}
                friendId={selectedDebt.friend._id}
                members={[selectedDebt.friend]}
                onSuccess={() => {
                  setSelectedDebt(null);
                  fetchFriends();
                }}
                onClose={() => setSelectedDebt(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
