// Utilities for Fixed Deposit (FD) and Recurring Deposit (RD) calculations

function round2(n){ return Math.round(n*100)/100 }

/**
 * Calculate Fixed Deposit maturity and monthly schedule.
 * compoundingPerYear should be one of [1,2,4,12]. We'll simulate month-by-month
 * and apply interest at the compounding periods.
 */
export function calculateFD({ principal, annualRate, years, compoundingPerYear = 1 }){
  const P = Number(principal) || 0
  const r = Number(annualRate) / 100
  const n = Number(compoundingPerYear) || 1
  const t = Number(years) || 0
  if (P <= 0 || t <= 0 || r < 0) return null

  const months = Math.round(t * 12)
  const monthsPerCompound = Math.round(12 / n) || 1
  let balance = P
  let totalInterest = 0
  const schedule = []

  for (let m = 1; m <= months; m++){
    // accumulate interest monthly but only apply to balance at compounding boundaries
    const monthlyRate = r / 12
    const interestThisMonth = balance * monthlyRate
    // accumulate but only add to balance when compounding period completes
    totalInterest += interestThisMonth
    // if this month completes a compounding period, add accumulated interest
    if (m % monthsPerCompound === 0){
      balance += interestThisMonth // add this month's interest (approx)
      // note: distributing monthly interest approximates discrete compounding
    }
    schedule.push({ month: m, balance: balance + 0, interestAccrued: totalInterest })
  }

  // final maturity using exact formula for compounding per year
  const maturity = P * Math.pow(1 + r / n, n * t)
  const totalInterestExact = maturity - P

  return {
    principal: P,
    maturity,
    totalInterest: totalInterestExact,
    years: t,
    compoundingPerYear: n,
    months,
    schedule
  }
}

/**
 * Calculate Recurring Deposit maturity and monthly ledger by simulating monthly deposits
 */
export function calculateRD({ monthlyDeposit, annualRate, years }){
  const m = Number(monthlyDeposit) || 0
  const r = Number(annualRate) / 100
  const months = Math.max(0, Math.round(Number(years) * 12))
  if (m <= 0 || months <= 0 || r < 0) return null

  const monthlyRate = r / 12
  let balance = 0
  const schedule = []
  let totalInterest = 0
  for (let k = 1; k <= months; k++){
    // interest on existing balance
    const interest = balance * monthlyRate
    totalInterest += interest
    balance = balance + interest + m // deposit at end of month after interest
    schedule.push({ month: k, deposit: m, interest, balance })
  }

  const principal = m * months
  const interestTotal = balance - principal
  return {
    monthlyDeposit: m,
    months,
    years: months / 12,
    maturity: balance,
    totalPrincipal: principal,
    totalInterest: interestTotal,
    schedule
  }
}

export default { calculateFD, calculateRD }
