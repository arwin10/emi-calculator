// Utility functions for EMI calculation and amortization

export function calculateEMI({ principal, annualRate, months, extra = 0, startMonth }) {
  const P = Number(principal);
  const monthlyRate = Number(annualRate) / 12 / 100;
  const N = Number(months);
  const extraMonthly = Number(extra) || 0;

  if (!P || !N || monthlyRate < 0) return null;

  let EMI = 0;
  if (monthlyRate === 0) EMI = P / N;
  else {
    const r = monthlyRate;
    EMI = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
  }

  const monthlyPayment = EMI + extraMonthly;

  const schedule = [];
  let balance = P;
  let totalInterest = 0;
  let totalPrincipal = 0;
  let monthDate = startMonth ? new Date(startMonth + '-01') : new Date();

  for (let i = 1; i <= 10000 && balance > 0.005; i++) {
    const interest = balance * monthlyRate;
    let principalPaid = monthlyPayment - interest;
    if (principalPaid > balance) principalPaid = balance;
    const payment = interest + principalPaid;
    balance = balance - principalPaid;

    schedule.push({
      monthNumber: i,
      date: monthDate.toISOString().slice(0, 10),
      beginningBalance: Math.max(0, balance + principalPaid),
      payment,
      principalPaid,
      interestPaid: interest,
      endingBalance: Math.max(0, balance),
    });

    totalInterest += interest;
    totalPrincipal += principalPaid;

    if (i >= 1200) break;
    monthDate.setMonth(monthDate.getMonth() + 1);
  }

  return {
    EMI,
    monthlyPayment,
    schedule,
    totalInterest,
    totalPrincipal,
    totalPaid: totalInterest + totalPrincipal,
    months: schedule.length,
  };
}
