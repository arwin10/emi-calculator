import React from 'react'

export default function EMIForm({ loanType, setLoanType, principal, setPrincipal, annualRate, setAnnualRate, tenureYears, setTenureYears, tenureMonths, setTenureMonths, prepayment, setPrepayment, startMonth, setStartMonth, showSchedule, setShowSchedule, onApplyPreset }) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-sky-700">Loan Type</label>
          <select value={loanType} onChange={(e) => setLoanType(e.target.value)} className="mt-1 block w-full rounded-md border border-sky-200 p-2">
            <option>Home</option>
            <option>Car</option>
            <option>Personal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-700">Start Month</label>
          <input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="mt-1 block w-full rounded-md border border-sky-200 p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-700">Principal (₹)</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="mt-1 block w-full rounded-md border border-sky-200 p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-700">Annual Interest Rate (%)</label>
          <input type="number" step="0.01" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} className="mt-1 block w-full rounded-md border border-sky-200 p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-700">Tenure (Years)</label>
          <input type="number" value={tenureYears} onChange={(e) => { setTenureYears(Number(e.target.value)); setTenureMonths(Number(e.target.value) * 12); }} className="mt-1 block w-full rounded-md border border-sky-200 p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-700">Tenure (Months)</label>
          <input type="number" value={tenureMonths} onChange={(e) => { setTenureMonths(Number(e.target.value)); setTenureYears((Number(e.target.value) / 12).toFixed(2)); }} className="mt-1 block w-full rounded-md border border-sky-200 p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-700">Extra Monthly Prepayment (₹)</label>
          <input type="number" value={prepayment} onChange={(e) => setPrepayment(e.target.value)} className="mt-1 block w-full rounded-md border border-sky-200 p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-700">Show Amortization Schedule</label>
          <select value={showSchedule ? "yes" : "no"} onChange={(e) => setShowSchedule(e.target.value === "yes")} className="mt-1 block w-full rounded-md border border-sky-200 p-2">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={onApplyPreset} className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700">Apply Preset</button>
      </div>
    </div>
  )
}
