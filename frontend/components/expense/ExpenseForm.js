"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Camera, X, Loader2 } from 'lucide-react';
import SplitCalculator from './SplitCalculator';
import { fetchApi } from '@/lib/api';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Housing', 'Utilities', 'Other'];

export default function ExpenseForm({ groupId, members, onSuccess, onCancel }) {
  const [receiptBase64, setReceiptBase64] = useState(null);
  const [splits, setSplits] = useState([]);
  const [apiError, setApiError] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      description: '',
      amount: '',
      category: 'Food'
    }
  });

  const amount = watch('amount');

  // Compress image to < 500KB WebP
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Quality 0.7 usually keeps it under 500kb
        const dataUrl = canvas.toDataURL('image/webp', 0.7);
        setReceiptBase64(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    setApiError('');

    const totalSplit = splits.reduce((sum, split) => sum + Number(split.amountOwed), 0);
    if (Math.abs(totalSplit - Number(data.amount)) > 0.05) {
      setApiError('Split amounts must equal the total. Please check the split section below.');
      return;
    }

    try {
      const payload = {
        groupId,
        description: data.description,
        amount: Number(data.amount),
        category: data.category.toLowerCase(),
        splits,
        receipt: receiptBase64,
        isRecurring: isRecurring,
        ...(isRecurring && { recurringConfig: { frequency: 'monthly' } })
      };

      if (!navigator.onLine) {
        const offlineExpenses = JSON.parse(localStorage.getItem('offline_expenses') || '[]');
        offlineExpenses.push({ ...payload, _id: Date.now().toString() }); // temporary ID
        localStorage.setItem('offline_expenses', JSON.stringify(offlineExpenses));
        alert('You are offline. Expense saved locally and will sync when you reconnect.');
        onSuccess();
        return;
      }

      await fetchApi('/expenses', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      onSuccess();
    } catch (err) {
      console.error('Expense creation failed:', err);
      setApiError(err.message || 'Failed to add expense. Please try again.');
    }
  };

  return (
    <div
      className="bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-stone-200 flex flex-col max-h-[90vh]"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      <div className="p-4 flex justify-between items-center border-b shrink-0" style={{ borderColor: 'var(--card-border)' }}>
        <h2 className="text-xl font-bold font-serif tracking-tight" style={{ color: 'var(--foreground)' }}>Add Expense</h2>
        <button 
          onClick={onCancel}
          className="p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error banner — always visible at top */}
      {apiError && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium shrink-0">
          ⚠️ {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-y-auto flex-1 pb-20 px-4 pt-6">
        
        {/* Description Field */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 focus-within:border-blush-300 focus-within:ring-2 focus-within:ring-blush-200/50 transition-all">
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Description</label>
          <input
            {...register('description', { required: true })}
            placeholder="What was this for?"
            className="w-full bg-transparent text-foreground placeholder:text-stone-400 focus:outline-none font-medium text-lg"
          />
          {errors.description && <p className="text-red-400 text-sm mt-1">Description is required</p>}
        </div>

        {/* Amount Field (Large) */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 focus-within:border-mint-300 focus-within:ring-2 focus-within:ring-mint-200/50 transition-all flex items-center justify-between">
          <div>
            <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Amount</label>
            <div className="flex items-center text-3xl font-mono text-foreground">
              <span className="text-stone-400 mr-1">₹</span>
              <input
                {...register('amount', { required: true, valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-transparent focus:outline-none"
              />
            </div>
          </div>
          {errors.amount && <p className="text-red-400 text-sm mt-1">Required</p>}
        </div>

        {/* Category Picker */}
        <div>
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3 block">Category</label>
          <div className="flex overflow-x-auto space-x-2 pb-2 hide-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setValue('category', cat)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  watch('category') === cat 
                    ? 'bg-sky-100 border-sky-200 text-sky-700 font-semibold' 
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Repeat Monthly Checkbox */}
        <label className="flex items-center space-x-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
          <div className="relative flex items-center">
            <input 
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-stone-300 rounded peer-checked:bg-blush-400 peer-checked:border-blush-400 transition-all flex items-center justify-center">
              {isRecurring && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
          </div>
          <div>
            <span className="text-foreground font-medium text-sm block">Repeat Monthly</span>
            <span className="text-stone-500 text-xs block">Automatically add this expense every month</span>
          </div>
        </label>

        {/* Receipt Upload */}
        <div>
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2 block">Receipt (Optional)</label>
          {receiptBase64 ? (
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-stone-200">
              <img src={receiptBase64} alt="Receipt" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setReceiptBase64(null)}
                className="absolute top-1 right-1 bg-stone-900/50 p-1 rounded-full text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center w-full h-20 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-100 transition-colors">
              <Camera className="w-6 h-6 text-stone-400" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Split Calculator */}
        <div>
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2 block">Split Details</label>
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
            <SplitCalculator 
              members={members} 
              totalAmount={Number(amount) || 0} 
              onChange={setSplits} 
            />
          </div>
        </div>



        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-foreground text-background rounded-2xl py-4 font-sans font-medium uppercase tracking-wide hover:opacity-90 transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            'Save Expense'
          )}
        </button>
      </form>
    </div>
  );
}
