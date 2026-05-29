"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Loader2, Palette } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

const groupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  color: z.string().optional(),
  budget: z.string().optional()
});

const PREDEFINED_COLORS = ['#FF6B9D', '#9D4EDD', '#00F5D4', '#00BBF9', '#FEE440', '#FF9F1C'];

export default function CreateGroupPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState('');
  const [selectedColor, setSelectedColor] = useState(PREDEFINED_COLORS[0]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      budget: ''
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const payload = {
        name: data.name,
        color: selectedColor,
        icon: '🏠', // Default icon for MVP
        budget: Number(data.budget) || 0
      };

      const newGroup = await fetchApi('/groups', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      router.push(`/groups/${newGroup._id}`);
      
    } catch (err) {
      setApiError(err.message || 'Failed to create group');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6 pb-24">
        
        {/* Header */}
        <header className="flex items-center space-x-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-stone-200 shadow-sm">
          <Link href="/groups" className="p-2 bg-stone-100 rounded-full border border-stone-200 text-stone-600 shrink-0 shadow-sm transition hover:scale-105">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold font-serif text-stone-900 tracking-tight">Create New Group</h1>
            <p className="text-stone-500 text-sm font-light">Start splitting expenses</p>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 tracking-wide uppercase">Group Name</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  {...register('name')}
                  placeholder="e.g. Miami Trip, Apartment..."
                  className="input-elegant pl-12"
                />
              </div>
              {errors.name && <p className="text-coral-400 text-sm mt-1 ml-1 flex items-center gap-1"><AlertCircle size={14}/> {errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 tracking-wide uppercase">Total Trip/Group Budget (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
                <input
                  {...register('budget')}
                  type="number"
                  placeholder="e.g. 50000"
                  className="input-elegant pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2 tracking-wide uppercase">
                <Palette className="w-4 h-4" /> Group Color
              </label>
              <div className="flex gap-3 mt-2">
                {PREDEFINED_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full flex-shrink-0 transition-all ${selectedColor === color ? 'ring-[3px] ring-blush-400 ring-offset-2 ring-offset-cream-50 scale-110 shadow-md' : 'opacity-70 hover:opacity-100 shadow-sm hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {apiError && (
              <p className="text-coral-400 text-center text-sm">{apiError}</p>
            )}

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full btn-elegant mt-4 text-stone-900"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin text-stone-900" />
              ) : (
                <span className="font-sans tracking-wide uppercase text-sm font-medium">Create Group</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
