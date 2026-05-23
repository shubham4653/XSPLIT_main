"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplitCalculator({ members, totalAmount, onChange }) {
  const [splitEqually, setSplitEqually] = useState(true);
  const [splits, setSplits] = useState({});

  useEffect(() => {
    if (splitEqually && totalAmount > 0) {
      const perPerson = Number((totalAmount / members.length).toFixed(2));
      const newSplits = {};
      let sum = 0;

      members.forEach((m, idx) => {
        // Handle cents remainder on the first person
        if (idx === members.length - 1) {
          newSplits[m._id] = Number((totalAmount - sum).toFixed(2));
        } else {
          newSplits[m._id] = perPerson;
          sum += perPerson;
        }
      });
      setSplits(newSplits);
      onChange(formatOutput(newSplits));
    }
  }, [totalAmount, splitEqually, members]);

  const handleManualChange = (memberId, value) => {
    const val = parseFloat(value) || 0;
    const newSplits = { ...splits, [memberId]: val };
    setSplits(newSplits);
    onChange(formatOutput(newSplits));
  };

  const formatOutput = (splitsObj) => {
    return Object.entries(splitsObj).map(([user, amountOwed]) => ({
      user,
      amountOwed
    })).filter(s => s.amountOwed > 0);
  };

  const totalAllocated = Object.values(splits).reduce((a, b) => a + b, 0);
  const isBalanced = Math.abs(totalAllocated - (totalAmount || 0)) < 0.05;

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex bg-stone-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setSplitEqually(true)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            splitEqually 
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Equally
        </button>
        <button
          type="button"
          onClick={() => setSplitEqually(false)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            !splitEqually 
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Exact Amounts
        </button>
      </div>

      {!splitEqually && !isBalanced && totalAmount > 0 && (
        <div className="text-sm text-coral-400 px-2 font-medium bg-coral-50 p-2 rounded-lg border border-coral-200">
          Total allocated: ₹{totalAllocated.toFixed(2)} of ₹{Number(totalAmount).toFixed(2)}
        </div>
      )}

      {/* Split Details */}
      <div className="space-y-3">
        {members.map(member => (
          <div key={member._id} className="flex items-center justify-between">
            <span className="text-stone-700 font-medium">{member.name}</span>
            
            {splitEqually ? (
              <span className="font-mono text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                ₹{(splits[member._id] || 0).toFixed(2)}
              </span>
            ) : (
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={splits[member._id] || ''}
                  onChange={(e) => handleManualChange(member._id, e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-mint-300 focus:ring-2 focus:ring-mint-200/50 text-right font-mono text-stone-900"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
