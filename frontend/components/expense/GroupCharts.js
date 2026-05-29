"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CATEGORY_COLORS = {
  food: '#FF9DB7', // blush
  transport: '#93D5FF', // sky
  housing: '#8DEDB7', // mint
  entertainment: '#D8B4FE', // purple
  shopping: '#FFB990', // peach
  healthcare: '#FFA5A5', // coral
  travel: '#818CF8', // indigo
  utilities: '#FCD34D', // amber
  education: '#6EE7B7', // emerald
  other: '#A8A59D', // stone
};

const CATEGORY_LABELS = {
  food: 'Food & Dining',
  transport: 'Transportation',
  housing: 'Housing',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  healthcare: 'Healthcare',
  travel: 'Travel',
  utilities: 'Utilities',
  education: 'Education',
  other: 'Other'
};

export default function GroupCharts({ expenses, budget = 0 }) {
  const { data, grandTotal } = useMemo(() => {
    const totals = {};
    let grandTotal = 0;

    expenses.forEach(exp => {
      // Ignore settlements as they are not true expenses
      if (exp.category === 'settlement') return;
      
      const cat = exp.category || 'other';
      if (!totals[cat]) totals[cat] = 0;
      totals[cat] += exp.amount;
      grandTotal += exp.amount;
    });

    // Format for Recharts
    const formattedData = Object.entries(totals)
      .map(([key, value]) => ({
        name: CATEGORY_LABELS[key] || key,
        key: key,
        value: value,
        percentage: grandTotal > 0 ? ((value / grandTotal) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.value - a.value); // Sort by largest expense
      
    return { data: formattedData, grandTotal };
  }, [expenses]);

  if (data.length === 0) {
    return (
      <div className="py-12 text-center border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--card-border)' }}>
        <p className="text-stone-500 font-medium">No expenses yet to show insights.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-stone-200">
          <p className="font-bold text-stone-900 mb-1">{data.name}</p>
          <p className="font-mono text-stone-700">₹{data.value.toFixed(2)}</p>
          <p className="text-xs text-stone-500 font-semibold mt-1">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <ul className="flex flex-wrap justify-center gap-3 mt-4 px-2">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center text-xs font-medium" style={{ color: 'var(--muted)' }}>
            <span 
              className="w-3 h-3 rounded-full mr-2 shadow-sm" 
              style={{ backgroundColor: entry.color }}
            />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  const percentSpent = budget > 0 ? (grandTotal / budget) * 100 : 0;
  const isOverBudget = percentSpent > 100;

  return (
    <div className="bg-card p-4 rounded-3xl border shadow-soft transition-all" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <h3 className="text-lg font-bold font-serif mb-6 px-2" style={{ color: 'var(--foreground)' }}>Spending Insights</h3>
      
      {budget > 0 && (
        <div className="mb-6 px-2">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-stone-500 uppercase tracking-wide">Trip Budget</span>
            <div className="text-right">
              <span className={`font-mono font-bold text-lg ${isOverBudget ? 'text-coral-500' : 'text-stone-900'}`}>
                ₹{grandTotal.toFixed(2)}
              </span>
              <span className="text-stone-400 font-mono text-sm"> / ₹{budget.toFixed(2)}</span>
            </div>
          </div>
          <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentSpent, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${isOverBudget ? 'bg-coral-400' : 'bg-mint-300'}`}
            />
          </div>
          {isOverBudget && (
            <p className="text-xs text-coral-500 font-semibold mt-2">⚠️ You have exceeded the group budget!</p>
          )}
        </div>
      )}

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height={300} minWidth={1}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CATEGORY_COLORS[entry.key] || CATEGORY_COLORS.other} 
                  className="transition-all duration-300 hover:opacity-80"
                  style={{ outline: 'none' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-3 px-2 pb-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <span 
                className="w-2.5 h-2.5 rounded-full mr-3 shadow-sm" 
                style={{ backgroundColor: CATEGORY_COLORS[item.key] || CATEGORY_COLORS.other }}
              />
              <span className="font-medium" style={{ color: 'var(--foreground)' }}>{item.name}</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold mr-3" style={{ color: 'var(--foreground)' }}>₹{item.value.toFixed(2)}</span>
              <span className="text-xs font-semibold w-10 inline-block text-right" style={{ color: 'var(--muted)' }}>{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
