const { z } = require('zod');

const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100, 'Description cannot exceed 100 characters'),
  amount: z.number().positive('Amount must be positive').max(1000000, 'Amount is too large'),
  category: z.enum([
    'food', 'transport', 'housing', 'entertainment', 
    'shopping', 'healthcare', 'travel', 'utilities', 
    'education', 'settlement', 'other'
  ]).default('other'),
  splits: z.array(z.object({
    user: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'), // MongoDB ObjectId regex
    amountOwed: z.number().nonnegative('Amount owed cannot be negative')
  })).min(1, 'At least one split is required'),
  receipt: z.string().optional(),
  date: z.string().datetime().optional(),
  isRecurring: z.boolean().default(false),
  recurringConfig: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']),
    interval: z.number().positive().optional(),
    endDate: z.string().datetime().optional(),
    occurrences: z.number().positive().optional()
  }).optional()
});

module.exports = {
  expenseSchema
};
