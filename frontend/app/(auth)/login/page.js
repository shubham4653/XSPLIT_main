"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthProvider';
import { useRouter } from 'next/navigation';

// Local copy of schemas to ensure browser compatibility if shared schema uses CJS
const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  upiId: z.string().optional()
});

export default function LoginPage() {
  const [needsName, setNeedsName] = useState(false);
  const [apiError, setApiError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  
  const currentSchema = needsName ? signupSchema : loginSchema;
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      upiId: ''
    }
  });

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF6B9D', '#9D4EDD', '#00F5D4', '#00BBF9']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF6B9D', '#9D4EDD', '#00F5D4', '#00BBF9']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const payload = {
        email: data.email,
        password: data.password,
        ...(needsName && { 
          name: data.name,
          upiId: data.upiId
        })
      };

      const user = await fetchApi('/auth', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      triggerConfetti();
      login(user);
      
      // Delay redirect slightly for confetti
      setTimeout(() => {
        const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl') || '/dashboard';
        router.push(callbackUrl);
      }, 1000);

    } catch (err) {
      if (err.code === 'REQUIRES_NAME' || (err.message && err.message.includes('REQUIRES_NAME'))) {
        setNeedsName(true);
      } else {
        setApiError(err.message || 'Authentication failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans bg-stone-50">
      
      {/* CSS-based Geometric & Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-white to-stone-100" />
        
        {/* Large glowing orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-mint-200/40 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[400px] bg-blush-200/25 rounded-full blur-[100px]" />
        
        {/* Crisp geometric shapes */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-1/4 w-32 h-32 rounded-3xl bg-gradient-to-br from-peach-200 to-peach-300 opacity-60 backdrop-blur-md border border-white shadow-xl transform rotate-12"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 left-1/4 w-24 h-24 rounded-full bg-gradient-to-tr from-mint-300 to-sky-200 opacity-50 backdrop-blur-md border border-white shadow-lg"
        />
        <motion.div 
          animate={{ x: [0, 20, 0], rotate: [45, 60, 45] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 left-16 w-16 h-16 rounded-xl bg-gradient-to-br from-blush-300 to-blush-400 opacity-40 backdrop-blur-sm border border-white shadow-md transform rotate-45"
        />
        
        {/* Delicate grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, 
            backgroundSize: '24px 24px' 
          }} 
        />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card p-8 w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-6xl font-black font-sans text-stone-900 mb-3 tracking-tighter uppercase drop-shadow-sm">
            XSPLIT
          </h1>
          <p className="text-stone-500 font-medium tracking-wide">
            {needsName ? "Welcome! Let's get to know you." : "Enter your email to continue."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AnimatePresence>
            {needsName && (
              <motion.div
                initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    {...register('name')}
                    placeholder="Full Name"
                    className="input-elegant pl-12"
                  />
                </div>
                {errors.name && <p className="text-coral-400 text-sm mt-1 ml-1 flex items-center gap-1"><AlertCircle size={14}/> {errors.name.message}</p>}

                <div className="relative mt-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
                  <input
                    {...register('upiId')}
                    placeholder="UPI ID (Optional, for instant payments)"
                    className="input-elegant pl-10"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                {...register('email')}
                type="email"
                placeholder="Email address"
                className="input-elegant pl-12"
              />
            </div>
            {errors.email && <p className="text-coral-400 text-sm mt-1 ml-1 flex items-center gap-1"><AlertCircle size={14}/> {errors.email.message}</p>}
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                {...register('password')}
                type="password"
                placeholder="Password"
                className="input-elegant pl-12"
              />
            </div>
            {errors.password && <p className="text-coral-400 text-sm mt-1 ml-1 flex items-center gap-1"><AlertCircle size={14}/> {errors.password.message}</p>}
          </div>

          {apiError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-coral-400 text-center text-sm"
            >
              {apiError}
            </motion.p>
          )}

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full btn-elegant mt-4"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin text-stone-900" />
            ) : (
              <>
                <span className="font-sans font-medium tracking-wide uppercase text-sm">{needsName ? 'Create Account' : 'Continue'}</span>
                <ArrowRight className="w-5 h-5 text-stone-900 ml-2" />
              </>
            )}
          </button>

          {!needsName && (
            <div className="mt-6 text-center border-t border-stone-200/50 pt-5">
              <p className="text-stone-400 text-xs font-medium leading-relaxed">
                New here? Just enter your email and a secure password.<br/>
                We will automatically create an account for you!
              </p>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
