import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

export default function SummaryCard({ loanType, principal, annualRate, tenureMonths, tenureYears, result, COLORS, fmtINR }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">
      <h3 className="font-medium text-sky-800">Summary</h3>
      <div className="mt-3 space-y-2 text-sm text-sky-700">
        <div>Loan Type: <strong className="text-sky-900">{loanType}</strong></div>
        <div>Principal: <strong>₹ {fmtINR(Number(principal))}</strong></div>
        <div>Annual Rate: <strong>{Number(annualRate)}%</strong></div>
        <div>Tenure: <strong>{tenureMonths} months ({tenureYears} yrs)</strong></div>
        {result ? (
          <>
            <hr className="my-2" />
            <div>Calculated EMI: <strong>₹ {fmtINR(result.EMI)}</strong></div>
            <div>Monthly Payment: <strong>₹ {fmtINR(result.monthlyPayment)}</strong></div>
            <div>Total Months: <strong>{result.months}</strong></div>
            <div>Total Interest: <strong>₹ {fmtINR(result.totalInterest)}</strong></div>
            <div>Total Payment: <strong>₹ {fmtINR(result.totalPaid)}</strong></div>

            <div className="mt-4 flex justify-center">
              <PieChart width={220} height={220}>
                <Pie data={[{ name: 'Principal', value: result.totalPrincipal }, { name: 'Interest', value: result.totalInterest }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                  <Cell fill={COLORS[0]} />
                  <Cell fill={COLORS[1]} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </>
        ) : (
          <div className="text-xs text-rose-600">Enter valid principal, rate and tenure to calculate.</div>
        )}
      </div>
      <div className="mt-4 text-xs text-sky-600">Tip: Prepayments can cut tenure and interest heavily.</div>
    </div>
  )
}
