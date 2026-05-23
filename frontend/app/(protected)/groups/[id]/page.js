"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Settings, Share2 } from 'lucide-react';
import { useAuth } from '@/components/layout/AuthProvider';
import { fetchApi } from '@/lib/api';
import ExpenseList from '@/components/expense/ExpenseList';
import ExpenseForm from '@/components/expense/ExpenseForm';
import SettleDrawer from '@/components/expense/SettleDrawer';

export default function GroupPage({ params }) {
  const unwrappedParams = use(params);
  const groupId = unwrappedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [debtToSettle, setDebtToSettle] = useState(null);

  const handleInvite = () => {
    const inviteUrl = `${window.location.origin}/invite/${groupId}`;
    navigator.clipboard.writeText(inviteUrl);
    alert('Invite link copied to clipboard!');
  };

  const fetchGroupData = async () => {
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        fetchApi(`/groups/${groupId}`),
        fetchApi(`/groups/${groupId}/expenses`),
        fetchApi(`/groups/${groupId}/balances`)
      ]);

      setGroup(groupRes);
      setExpenses(expensesRes);
      setBalances(balancesRes.transactions);
    } catch (err) {
      console.error(err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-pink"></div>
      </div>
    );
  }

  // Calculate my balance in this group
  let youOwe = 0;
  let owesYou = 0;
  balances.forEach(t => {
    if (t.from === user._id) youOwe += t.amount;
    if (t.to === user._id) owesYou += t.amount;
  });
  const netBalance = owesYou - youOwe;

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Header */}
      <header
        className="px-4 py-4 sticky top-0 z-40 backdrop-blur-md border-b"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-full border shrink-0 shadow-sm transition hover:scale-105"
              style={{ background: 'var(--card-border)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: group.color ? `${group.color}33` : 'var(--card-border)' }}
              >
                <span className="text-xl">{group.icon || '🗂️'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold font-serif truncate" style={{ color: 'var(--foreground)' }}>{group.name}</h1>
                <p className="text-xs font-medium tracking-wide uppercase truncate" style={{ color: 'var(--muted)' }}>
                  {group.members.length} members
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 shrink-0 ml-2">
            <button
              onClick={handleInvite}
              className="p-2 rounded-full border shadow-sm transition hover:scale-105 text-blush-400"
              style={{ background: 'var(--card-border)', borderColor: 'var(--card-border)' }}
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push(`/groups/${groupId}/settings`)}
              className="p-2 rounded-full border shadow-sm transition hover:scale-105"
              style={{ background: 'var(--card-border)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-6 pb-32">
        {/* Balances Section */}
        <section className="rounded-3xl border p-6 shadow-soft" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-serif" style={{ color: 'var(--foreground)' }}>Your Balance</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              netBalance > 0 ? 'bg-mint-200 text-stone-800' :
              netBalance < 0 ? 'bg-coral-200 text-stone-800' :
              'bg-stone-200 text-stone-600'
            }`}>
              {netBalance > 0 ? 'Getting back' : netBalance < 0 ? 'You owe' : 'Settled up'}
            </span>
          </div>

          <div className="text-4xl font-mono font-light text-center my-6 tracking-tight" style={{ color: 'var(--foreground)' }}>
            ₹{Math.abs(netBalance).toFixed(2)}
          </div>

          {netBalance < 0 && (
            <button className="w-full btn-elegant">
              Settle Up
            </button>
          )}
        </section>

        {/* Expenses List */}
        <section>
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-xl font-bold font-serif tracking-tight" style={{ color: 'var(--foreground)' }}>Expenses</h2>
            <button className="text-blush-400 text-sm hover:underline font-medium">Filter</button>
          </div>
          <ExpenseList expenses={expenses} currentUser={user} onExpenseDeleted={fetchGroupData} />
        </section>
      </main>

      {/* Floating Add Button */}
      <div className="fixed bottom-24 inset-x-0 flex justify-center z-40 pointer-events-none">
        <motion.button 
          onClick={() => setShowAddExpense(true)}
          className="pointer-events-auto w-16 h-16 rounded-full bg-gradient-to-br from-blush-300 to-blush-400 shadow-blush shadow-xl flex items-center justify-center text-stone-900"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      </div>

      {/* Add Expense Modal Drawer */}
      <AnimatePresence>
        {showAddExpense && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddExpense(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto"
            >
              <ExpenseForm
                groupId={groupId}
                members={group.members}
                onSuccess={() => {
                  setShowAddExpense(false);
                  fetchGroupData();
                }}
                onCancel={() => setShowAddExpense(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settle Drawer */}
      <AnimatePresence>
        {debtToSettle && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDebtToSettle(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto"
            >
              <SettleDrawer
                debt={debtToSettle}
                groupId={groupId}
                members={group.members}
                onSuccess={() => {
                  setDebtToSettle(null);
                  fetchGroupData();
                }}
                onClose={() => setDebtToSettle(null)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
