import React, { useState } from 'react'
import EMIForm from './components/EMIForm'
import SummaryCard from './components/SummaryCard'
import Charts from './components/Charts'
import ScheduleTable from './components/ScheduleTable'
import { calculateEMI } from './utils/emi'

export default function App() {
  const loanPresets = {
    Home: { years: 20, rate: 8.5 },
    Car: { years: 5, rate: 9.0 },
    Personal: { years: 3, rate: 12.0 },
  }

  const [loanType, setLoanType] = useState('Home')
  const [principal, setPrincipal] = useState(5000000)
  const [annualRate, setAnnualRate] = useState(loanPresets['Home'].rate)
  const [tenureYears, setTenureYears] = useState(loanPresets['Home'].years)
  const [tenureMonths, setTenureMonths] = useState(tenureYears * 12)
  const [showSchedule, setShowSchedule] = useState(true)
  const [prepayment, setPrepayment] = useState(0)
  const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0,7))

  const result = calculateEMI({ principal, annualRate, months: tenureMonths, extra: prepayment, startMonth })

  function fmtINR(x){
    if (isNaN(x) || x === null) return '-'
    return Number(x).toLocaleString('en-IN', { maximumFractionDigits: 2 })
  }

  const COLORS = ['#1E40AF', '#60A5FA']

  const barData = result ? result.schedule.slice(0, Math.min(60, result.schedule.length)).map((r) => ({
    name: `M${r.monthNumber}`,
    principal: Number(r.principalPaid.toFixed(2)),
    interest: Number(r.interestPaid.toFixed(2))
  })) : []

  function onApplyPreset(){
    const preset = loanPresets[loanType]
    setAnnualRate(preset.rate)
    setTenureYears(preset.years)
    setTenureMonths(preset.years * 12)
  }

  function downloadCSV(){
    if (!result) return
    const header = ["MonthNumber","Date","BeginningBalance","Payment","PrincipalPaid","InterestPaid","EndingBalance"]
    const rows = result.schedule.map((r) => [r.monthNumber,r.date,r.beginningBalance.toFixed(2),r.payment.toFixed(2),r.principalPaid.toFixed(2),r.interestPaid.toFixed(2),r.endingBalance.toFixed(2)])
    const csvContent = [header, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${loanType}_emi_schedule.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-sky-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-sky-800">EMI Calculator</h1>
            <p className="text-sm text-sky-600">Home · Car · Personal — quick estimates & amortization</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setLoanType('Home'); onApplyPreset() }} className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700">Home</button>
            <button onClick={() => { setLoanType('Car'); onApplyPreset() }} className="px-4 py-2 rounded-lg bg-white border border-sky-300 text-sky-700 hover:bg-sky-50">Car</button>
            <button onClick={() => { setLoanType('Personal'); onApplyPreset() }} className="px-4 py-2 rounded-lg bg-white border border-sky-300 text-sky-700 hover:bg-sky-50">Personal</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
            <EMIForm loanType={loanType} setLoanType={setLoanType} principal={principal} setPrincipal={setPrincipal} annualRate={annualRate} setAnnualRate={setAnnualRate} tenureYears={tenureYears} setTenureYears={setTenureYears} tenureMonths={tenureMonths} setTenureMonths={setTenureMonths} prepayment={prepayment} setPrepayment={setPrepayment} startMonth={startMonth} setStartMonth={setStartMonth} showSchedule={showSchedule} setShowSchedule={setShowSchedule} onApplyPreset={onApplyPreset} />

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={onApplyPreset} className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700">Apply Preset</button>
              <button onClick={downloadCSV} disabled={!result} className="px-4 py-2 rounded-xl bg-white border border-sky-300 text-sky-700 hover:bg-sky-50 disabled:opacity-50">Export Schedule CSV</button>
            </div>

            <Charts barData={barData} />

          </div>

          <SummaryCard loanType={loanType} principal={principal} annualRate={annualRate} tenureMonths={tenureMonths} tenureYears={tenureYears} result={result} COLORS={COLORS} fmtINR={fmtINR} />
        </div>

        <ScheduleTable schedule={result ? result.schedule : []} />

        <footer className="mt-8 text-center text-xs text-sky-500">Built with ♥ — EMI Calculator</footer>
      </div>
    </div>
  )
}
