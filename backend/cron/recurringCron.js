const cron = require('node-cron');
const Expense = require('../models/Expense');
const Group = require('../models/Group');

// Run every day at 00:00 (midnight)
const startRecurringExpensesCron = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running recurring expenses cron job...');
    try {
      // Find expenses that are recurring and monthly
      const recurringExpenses = await Expense.find({
        isRecurring: true,
        'recurringConfig.frequency': 'monthly'
      });

      const now = new Date();
      let createdCount = 0;

      for (const expense of recurringExpenses) {
        // If an endDate is set and we've passed it, skip
        if (expense.recurringConfig?.endDate && now > expense.recurringConfig.endDate) {
          continue;
        }

        // Check the date of the last occurrence
        const lastDate = new Date(expense.date);
        
        // Calculate the difference in months
        const monthDiff = (now.getFullYear() - lastDate.getFullYear()) * 12 + (now.getMonth() - lastDate.getMonth());
        
        // If exactly 1 month has passed (or more, if it missed a day), duplicate it
        // To prevent running every day for the same month, we only duplicate if day of month matches or we missed it
        if (monthDiff >= 1) {
          const nextDate = new Date(lastDate);
          nextDate.setMonth(nextDate.getMonth() + 1);

          // If today is past or equal to the next expected date
          if (now >= nextDate) {
            // Create the new expense
            const newExpense = new Expense({
              groupId: expense.groupId,
              description: expense.description + ' (Auto-Recurring)',
              amount: expense.amount,
              currency: expense.currency,
              category: expense.category,
              paidBy: expense.paidBy,
              splits: expense.splits,
              isRecurring: true,
              recurringConfig: expense.recurringConfig,
              date: nextDate, // Set date to exactly one month later
              createdBy: expense.createdBy
            });

            await newExpense.save();
            
            // Mark the old expense as NOT recurring so it doesn't get duplicated again next month
            // We transfer the recurrence to the newly created expense
            expense.isRecurring = false;
            await expense.save();
            
            createdCount++;
          }
        }
      }
      
      console.log(`Cron completed: Created ${createdCount} recurring expenses.`);
    } catch (error) {
      console.error('Error in recurring expenses cron job:', error);
    }
  });
};

module.exports = startRecurringExpensesCron;
