/**
 * Simplifies a list of net balances into the minimal number of transactions.
 * Uses a greedy algorithm matching the largest creditor with the largest debtor.
 * 
 * @param {Array<{userId: string, balance: number}>} balances 
 * @returns {Array<{from: string, to: string, amount: number}>}
 */
const simplifyDebts = (balances) => {
  // Separate and sort
  // Creditors sorted descending (largest positive first)
  let creditors = balances.filter(b => b.balance > 0.001).sort((a, b) => b.balance - a.balance);
  
  // Debtors sorted ascending (largest negative first)
  let debtors = balances.filter(b => b.balance < -0.001).sort((a, b) => a.balance - b.balance);

  let transactions = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    let creditor = creditors[i];
    let debtor = debtors[j];

    let amount = Math.min(creditor.balance, Math.abs(debtor.balance));
    amount = Math.round(amount * 100) / 100; // Round to 2 decimals

    if (amount > 0) {
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: amount
      });
    }

    creditor.balance -= amount;
    debtor.balance += amount;

    // Use epsilon for float comparison
    const EPSILON = 0.001;

    if (creditor.balance < EPSILON) {
      i++;
    }
    if (Math.abs(debtor.balance) < EPSILON) {
      j++;
    }
  }

  return transactions;
};

module.exports = { simplifyDebts };
