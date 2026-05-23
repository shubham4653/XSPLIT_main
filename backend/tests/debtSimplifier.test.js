const { simplifyDebts } = require('../utils/debtSimplifier');

describe('Smart Debt Simplification Algorithm', () => {
  it('should simplify a basic two-person debt', () => {
    const balances = [
      { userId: 'A', balance: 50 },
      { userId: 'B', balance: -50 }
    ];

    const transactions = simplifyDebts(balances);

    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toEqual({
      from: 'B',
      to: 'A',
      amount: 50
    });
  });

  it('should simplify circular debt (A owes B, B owes C, C owes A)', () => {
    // If A owes B 10, B owes C 10, C owes A 10, net balances are all 0
    const balances = [
      { userId: 'A', balance: 0 },
      { userId: 'B', balance: 0 },
      { userId: 'C', balance: 0 }
    ];

    const transactions = simplifyDebts(balances);
    expect(transactions).toHaveLength(0);
  });

  it('should simplify chain debt (A owes B 10, B owes C 10)', () => {
    // Net: A = -10, B = 0, C = +10
    const balances = [
      { userId: 'A', balance: -10 },
      { userId: 'B', balance: 0 },
      { userId: 'C', balance: 10 }
    ];

    const transactions = simplifyDebts(balances);
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toEqual({
      from: 'A',
      to: 'C',
      amount: 10
    });
  });

  it('should handle multiple debtors and creditors', () => {
    // Net: A: +100, B: +50, C: -80, D: -70
    const balances = [
      { userId: 'A', balance: 100 },
      { userId: 'B', balance: 50 },
      { userId: 'C', balance: -80 },
      { userId: 'D', balance: -70 }
    ];

    const transactions = simplifyDebts(balances);
    // C owes 80, D owes 70. A is owed 100, B is owed 50.
    // D (-70) is smallest (Wait, sorted ascending means C is first because -80 < -70).
    // So C (-80) pays A (+100). A is left with +20. C is 0.
    // D (-70) pays A (+20). A is left with 0. D is left with -50.
    // D (-50) pays B (+50). B is left with 0. D is 0.
    // Let's verify the transactions sum up properly and nobody pays more than they owe.

    // Calculate total settled
    let totalMoved = 0;
    let netCheck = { A: 100, B: 50, C: -80, D: -70 };

    transactions.forEach(t => {
      netCheck[t.from] += t.amount;
      netCheck[t.to] -= t.amount;
      totalMoved += t.amount;
    });

    // All should be close to 0
    expect(Math.abs(netCheck['A'])).toBeLessThan(0.01);
    expect(Math.abs(netCheck['B'])).toBeLessThan(0.01);
    expect(Math.abs(netCheck['C'])).toBeLessThan(0.01);
    expect(Math.abs(netCheck['D'])).toBeLessThan(0.01);
    
    // Minimal transactions should be 3 in this case
    expect(transactions.length).toBeLessThanOrEqual(3);
  });

  it('should handle floating point inaccuracies', () => {
    // 100 divided by 3 is 33.3333333...
    const balances = [
      { userId: 'A', balance: 66.67 }, // Paid 100, owes 33.33
      { userId: 'B', balance: -33.33 },
      { userId: 'C', balance: -33.34 }
    ];

    const transactions = simplifyDebts(balances);
    
    expect(transactions).toHaveLength(2);
    // B pays A 33.33
    // C pays A 33.34
    
    let totalA = transactions.filter(t => t.to === 'A').reduce((sum, t) => sum + t.amount, 0);
    expect(totalA).toBeCloseTo(66.67, 2);
  });
});
