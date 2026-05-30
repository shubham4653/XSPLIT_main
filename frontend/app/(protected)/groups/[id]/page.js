"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Settings, UserPlus, X } from 'lucide-react';
import { useAuth } from '@/components/layout/AuthProvider';
import { fetchApi } from '@/lib/api';
import ExpenseList from '@/components/expense/ExpenseList';
import ExpenseForm from '@/components/expense/ExpenseForm';
import SettleDrawer from '@/components/expense/SettleDrawer';
import GroupCharts from '@/components/expense/GroupCharts';

export default function GroupPage({ params }) {
  const unwrappedParams = use(params);
  const groupId = unwrappedParams.id;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [debtToSettle, setDebtToSettle] = useState(null);
  const [showBalanceBreakdown, setShowBalanceBreakdown] = useState(false);
  const [showInviteTooltip, setShowInviteTooltip] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');

  const handleInvite = () => {
    const inviteUrl = `${window.location.origin}/invite/${groupId}`;
    navigator.clipboard.writeText(inviteUrl);
    setShowInviteTooltip(true);
    setTimeout(() => setShowInviteTooltip(false), 3000);
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

  if (loading || authLoading || !user || !group) {
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

          <div className="flex space-x-2 shrink-0 ml-2 relative">
            <button
              onClick={handleInvite}
              className="p-2 rounded-full border shadow-sm transition hover:scale-105 text-blush-400 relative"
              style={{ background: 'var(--card-border)', borderColor: 'var(--card-border)' }}
            >
              <UserPlus className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showInviteTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute right-12 top-10 bg-stone-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 font-medium"
                >
                  Link copied! Invite your friend
                </motion.div>
              )}
            </AnimatePresence>
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
        <section 
          onClick={() => setShowBalanceBreakdown(true)}
          className="rounded-3xl border p-6 shadow-soft cursor-pointer hover:shadow-md transition-shadow" 
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
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
            <button 
              className="w-full btn-elegant mt-2"
              onClick={(e) => {
                e.stopPropagation();
                const oweTrans = balances.find(t => t.from === user._id);
                if (oweTrans) setDebtToSettle(oweTrans);
              }}
            >
              Settle Up
            </button>
          )}
        </section>

        {/* Tabs: Expenses / Charts */}
        <section>
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-xl font-bold font-serif tracking-tight" style={{ color: 'var(--foreground)' }}>History</h2>
            
            <div className="flex bg-stone-100/80 p-1 rounded-xl shadow-inner border border-stone-200/50" style={{ background: 'var(--card-border)' }}>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'expenses'
                    ? 'bg-white shadow-sm text-stone-900'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
                style={activeTab === 'expenses' ? { background: 'var(--card-bg)', color: 'var(--foreground)' } : { color: 'var(--muted)' }}
              >
                Expenses
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'charts'
                    ? 'bg-white shadow-sm text-stone-900'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
                style={activeTab === 'charts' ? { background: 'var(--card-bg)', color: 'var(--foreground)' } : { color: 'var(--muted)' }}
              >
                Insights
              </button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'expenses' ? (
                <ExpenseList expenses={expenses} currentUser={user} onExpenseDeleted={fetchGroupData} />
              ) : (
                <GroupCharts expenses={expenses} budget={group.budget} />
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Floating Add Button */}
      <div className="fixed bottom-24 right-4 sm:right-6 z-40 pb-[env(safe-area-inset-bottom)]">
        <motion.button 
          onClick={() => setShowAddExpense(true)}
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-stone-900 text-white shadow-xl shadow-stone-900/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold text-sm tracking-wide">Add Expense</span>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[60] max-w-md mx-auto"
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

      {/* Balance Breakdown Drawer */}
      <AnimatePresence>
        {showBalanceBreakdown && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBalanceBreakdown(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[60] max-w-md mx-auto bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-stone-200 flex flex-col max-h-[80vh]"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <div className="p-4 flex justify-between items-center border-b shrink-0" style={{ borderColor: 'var(--card-border)' }}>
                <h2 className="text-xl font-bold font-serif tracking-tight" style={{ color: 'var(--foreground)' }}>Member Balances</h2>
                <button 
                  onClick={() => setShowBalanceBreakdown(false)}
                  className="p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-4 pb-12">
                {balances.filter(t => t.from === user._id || t.to === user._id).length === 0 ? (
                  <p className="text-center text-stone-500 py-8">You are completely settled up!</p>
                ) : (
                  balances.filter(t => t.from === user._id || t.to === user._id).map((t, idx) => {
                    const isYouOwe = t.from === user._id;
                    const otherUserId = isYouOwe ? t.to : t.from;
                    const otherUser = group.members.find(m => m._id === otherUserId) || { name: 'Unknown Member' };
                    
                    return (
                      <div key={idx} className="flex justify-between items-center p-4 rounded-2xl border bg-stone-50" style={{ borderColor: 'var(--card-border)' }}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600 uppercase">
                            {otherUser.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{otherUser.name}</p>
                            <p className={`text-xs font-medium uppercase tracking-wide ${isYouOwe ? 'text-coral-500' : 'text-mint-600'}`}>
                              {isYouOwe ? 'You owe them' : 'They owe you'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-lg text-stone-900">₹{t.amount.toFixed(2)}</p>
                          {isYouOwe && (
                            <button 
                              onClick={() => {
                                setShowBalanceBreakdown(false);
                                setDebtToSettle(t);
                              }}
                              className="text-xs bg-stone-900 text-white px-3 py-1 rounded-full mt-1 hover:bg-stone-800"
                            >
                              Settle
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[60] max-w-md mx-auto"
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
