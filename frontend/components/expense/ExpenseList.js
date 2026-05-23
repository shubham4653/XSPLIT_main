"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ReceiptText } from 'lucide-react';
import { fetchApi } from '@/lib/api';

const CATEGORY_ICONS = {
  food: '🍔',
  transport: '🚗',
  housing: '🏠',
  entertainment: '🎬',
  shopping: '🛍️',
  healthcare: '⚕️',
  travel: '✈️',
  utilities: '⚡',
  education: '📚',
  settlement: '💸',
  other: '🏷️'
};

export default function ExpenseList({ expenses, currentUser, onExpenseDeleted }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await fetchApi(`/expenses/${id}`, { method: 'DELETE' });
      onExpenseDeleted(id);
    } catch (err) {
      console.error(err);
      alert('Failed to delete expense');
      setDeletingId(null);
    }
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-3xl border"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <ReceiptText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--muted)', opacity: 0.4 }} />
        <p className="font-light" style={{ color: 'var(--muted)' }}>No expenses yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {expenses.map((expense) => {
          const canDelete = expense.paidBy._id === currentUser._id;

          return (
            <motion.div
              key={expense._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative rounded-2xl overflow-hidden mb-3 shadow-sm"
            >
              {/* Delete revealed on swipe */}
              {canDelete && (
                <div className="absolute inset-y-0 right-0 bg-coral-400 w-24 flex items-center justify-end px-5 rounded-2xl z-0">
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="hover:scale-110 transition-transform"
                    disabled={deletingId === expense._id}
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              )}

              <motion.div
                drag={canDelete ? "x" : false}
                dragConstraints={{ left: -80, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset }) => {
                  if (offset.x < -70 && canDelete) {
                    handleDelete(expense._id);
                  }
                }}
                className="p-5 rounded-2xl relative z-10 flex justify-between items-center border backdrop-blur-md"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border"
                    style={{ background: 'var(--card-border)', borderColor: 'var(--card-border)' }}
                  >
                    {CATEGORY_ICONS[expense.category] || expense.category?.charAt(0).toUpperCase() || '🏷️'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold font-serif tracking-tight text-lg" style={{ color: 'var(--foreground)' }}>
                        {expense.description}
                      </h4>
                      {expense.paidBy._id === currentUser?._id && (
                        <span className="text-[10px] bg-mint-100 text-mint-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-0.5 shrink-0">You Paid</span>
                      )}
                    </div>
                    <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--muted)' }}>
                      Paid by {expense.paidBy.name === currentUser?.name ? 'You' : expense.paidBy.name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono font-light text-xl" style={{ color: 'var(--foreground)' }}>
                    ₹{expense.amount.toFixed(2)}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
