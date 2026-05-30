"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: "Welcome to XSPLIT! 🎉",
    description: "The easiest way to track and settle group expenses. Let's take a quick tour to get you started.",
    image: "👋"
  },
  {
    title: "1. Create a Group",
    description: "Tap the big plus button (+) at the bottom to create a group with your friends or flatmates.",
    image: "👥"
  },
  {
    title: "2. Add Expenses",
    description: "Inside your group, you can add expenses and split them equally or customize who owes what.",
    image: "💸"
  },
  {
    title: "3. Settle Up",
    description: "Check your Dashboard or Friends tab to see your total balance. Tap 'Settle' to pay off debts easily via Cash or UPI.",
    image: "🤝"
  }
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has already seen the tour
    const hasSeenTour = localStorage.getItem('xsplit_tour_completed');
    if (!hasSeenTour) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('xsplit_tour_completed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={handleComplete}
      />

      {/* Modal */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', border: '1px solid' }}
      >
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 text-center pt-12">
          <div className="text-6xl mb-6">{step.image}</div>
          <h2 className="text-2xl font-bold font-serif mb-3 tracking-tight" style={{ color: 'var(--foreground)' }}>
            {step.title}
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-8">
            {step.description}
          </p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-6 bg-blush-400' : 'w-1.5 bg-stone-200'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center space-x-2 shadow-md hover:bg-stone-800 transition-colors"
            >
              <span>{currentStep === TOUR_STEPS.length - 1 ? "Get Started" : "Next"}</span>
              {currentStep === TOUR_STEPS.length - 1 ? (
                <Check className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
