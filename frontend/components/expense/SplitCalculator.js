"use client";

import { useState, useEffect } from 'react';

export default function SplitCalculator({ members, totalAmount, onChange }) {
  const [splitMode, setSplitMode] = useState('equally'); // 'equally' | 'exact' | 'percentages' | 'shares'
  const [inputs, setInputs] = useState({}); // Stores the raw input for exact, percentages, or shares
  const [splits, setSplits] = useState({}); // Stores the computed monetary amounts

  useEffect(() => {
    if (!totalAmount || totalAmount <= 0) {
      setSplits({});
      onChange([]);
      return;
    }

    const newSplits = {};
    const currentInputs = { ...inputs };
    let sum = 0;

    if (splitMode === 'equally') {
      const perPerson = Number((totalAmount / members.length).toFixed(2));
      members.forEach((m, idx) => {
        if (idx === members.length - 1) {
          newSplits[m._id] = Number((totalAmount - sum).toFixed(2));
        } else {
          newSplits[m._id] = perPerson;
          sum += perPerson;
        }
      });
    } else if (splitMode === 'exact') {
      members.forEach(m => {
        newSplits[m._id] = parseFloat(currentInputs[m._id]) || 0;
      });
    } else if (splitMode === 'percentages') {
      let percentSum = 0;
      members.forEach((m, idx) => {
        const p = parseFloat(currentInputs[m._id]) || 0;
        percentSum += p;
        if (idx === members.length - 1 && Math.abs(percentSum - 100) < 0.01) {
          newSplits[m._id] = Number((totalAmount - sum).toFixed(2));
        } else {
          const amt = Number(((p / 100) * totalAmount).toFixed(2));
          newSplits[m._id] = amt;
          sum += amt;
        }
      });
    } else if (splitMode === 'shares') {
      const totalShares = members.reduce((acc, m) => acc + (parseFloat(currentInputs[m._id]) || 0), 0);
      if (totalShares > 0) {
        members.forEach((m, idx) => {
          const s = parseFloat(currentInputs[m._id]) || 0;
          if (idx === members.length - 1) {
            newSplits[m._id] = Number((totalAmount - sum).toFixed(2));
          } else {
            const amt = Number(((s / totalShares) * totalAmount).toFixed(2));
            newSplits[m._id] = amt;
            sum += amt;
          }
        });
      } else {
        members.forEach(m => { newSplits[m._id] = 0; });
      }
    }

    setSplits(newSplits);
    onChange(formatOutput(newSplits));
  }, [totalAmount, splitMode, inputs, members]);

  const handleInputChange = (memberId, value) => {
    setInputs(prev => ({ ...prev, [memberId]: value }));
  };

  // Pre-fill inputs with sensible defaults when switching modes
  const handleModeSwitch = (mode) => {
    setSplitMode(mode);
    const newInputs = {};
    if (mode === 'shares') {
      members.forEach(m => { newInputs[m._id] = 1; }); // default 1 share each
    } else if (mode === 'percentages') {
      const p = Number((100 / members.length).toFixed(2));
      members.forEach((m, idx) => {
        if (idx === members.length - 1) {
          newInputs[m._id] = Number((100 - (p * (members.length - 1))).toFixed(2));
        } else {
          newInputs[m._id] = p;
        }
      });
    } else if (mode === 'exact') {
      members.forEach(m => { newInputs[m._id] = splits[m._id] || 0; });
    }
    setInputs(newInputs);
  };

  const formatOutput = (splitsObj) => {
    return Object.entries(splitsObj).map(([user, amountOwed]) => ({
      user,
      amountOwed: parseFloat(amountOwed) || 0
    })).filter(s => s.amountOwed > 0);
  };

  const totalAllocated = Object.values(splits).reduce((a, b) => a + b, 0);
  const isBalanced = Math.abs(totalAllocated - (totalAmount || 0)) < 0.05;

  let warningMessage = null;
  if (!isBalanced && totalAmount > 0 && splitMode === 'exact') {
    warningMessage = `Total allocated: ₹${totalAllocated.toFixed(2)} of ₹${Number(totalAmount).toFixed(2)}`;
  } else if (splitMode === 'percentages') {
    const totalP = Object.values(inputs).reduce((a, b) => a + (parseFloat(b) || 0), 0);
    if (Math.abs(totalP - 100) > 0.01) {
      warningMessage = `Percentages add up to ${totalP.toFixed(1)}%, not 100%`;
    }
  }

  const modes = [
    { id: 'equally', label: '=' },
    { id: 'exact', label: '1.23' },
    { id: 'percentages', label: '%' },
    { id: 'shares', label: 'Shares' }
  ];

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
        {modes.map(mode => (
          <button
            key={mode.id}
            type="button"
            onClick={() => handleModeSwitch(mode.id)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              splitMode === mode.id
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {warningMessage && (
        <div className="text-sm text-coral-500 px-3 py-2 font-medium bg-coral-50 rounded-lg border border-coral-200 text-center">
          {warningMessage}
        </div>
      )}

      {/* Split Details */}
      <div className="space-y-3">
        {members.map(member => (
          <div key={member._id} className="flex items-center justify-between">
            <span className="text-stone-700 font-medium truncate pr-2 max-w-[45%]">{member.name}</span>
            
            <div className="flex items-center space-x-2">
              {splitMode === 'equally' ? (
                <span className="font-mono text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 w-24 text-right">
                  ₹{(splits[member._id] || 0).toFixed(2)}
                </span>
              ) : splitMode === 'exact' ? (
                <div className="relative w-28">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={inputs[member._id] === undefined ? '' : inputs[member._id]}
                    onChange={(e) => handleInputChange(member._id, e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-200 text-right font-mono text-stone-900"
                    placeholder="0.00"
                  />
                </div>
              ) : splitMode === 'percentages' ? (
                <div className="flex items-center space-x-2">
                  <div className="relative w-20">
                    <input
                      type="number"
                      step="0.1"
                      value={inputs[member._id] === undefined ? '' : inputs[member._id]}
                      onChange={(e) => handleInputChange(member._id, e.target.value)}
                      className="w-full pl-2 pr-6 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-200 text-right font-mono text-stone-900"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 font-mono">%</span>
                  </div>
                  <span className="font-mono text-stone-400 w-16 text-right text-xs">
                    ₹{(splits[member._id] || 0).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    value={inputs[member._id] === undefined ? '' : inputs[member._id]}
                    onChange={(e) => handleInputChange(member._id, e.target.value)}
                    className="w-16 px-2 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-200 text-center font-mono text-stone-900"
                    placeholder="1"
                  />
                  <span className="font-mono text-stone-400 w-16 text-right text-xs">
                    ₹{(splits[member._id] || 0).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
