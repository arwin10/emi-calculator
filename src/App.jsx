import React, { useEffect, useState, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { calculateEMI } from './utils/emi'

// App (single-file improved component)
export default function App() {
  const loanPresets = {
    Home: { years: 20, rate: 8.5 },
    Car: { years: 5, rate: 9.0 },
    Personal: { years: 3, rate: 12.0 },
  };

  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('emi_dark') === '1' } catch (e) { return false }
  })
  useEffect(() => { try { localStorage.setItem('emi_dark', dark ? '1' : '0') } catch(e){} }, [dark])

  const [loanType, setLoanType] = useState('Home')
  const [principal, setPrincipal] = useState(5000000)
  const [annualRate, setAnnualRate] = useState(loanPresets['Home'].rate)
  const [tenureYears, setTenureYears] = useState(loanPresets['Home'].years)
  const [tenureMonths, setTenureMonths] = useState(tenureYears * 12)
  const [showSchedule, setShowSchedule] = useState(true)
  const [prepayment, setPrepayment] = useState(0)
  const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0,7))
  const [showFullTerm, setShowFullTerm] = useState(false)

  // Pagination for amortization schedule
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  useEffect(() => { setTenureMonths(Math.round(Number(tenureYears) * 12)) }, [tenureYears])

  function onLoanTypeChange(t){ setLoanType(t); const p = loanPresets[t] || loanPresets.Home; setAnnualRate(p.rate); setTenureYears(p.years); setTenureMonths(p.years*12) }

  const currencyFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
  function formatCurrencyInput(n){ if (n === null || n === undefined || Number.isNaN(Number(n))) return ''; return currencyFormatter.format(Number(n)) }
  function parseCurrencyInput(str){ if (str === null || str === undefined) return 0; const cleaned = String(str).replace(/[^0-9.-]+/g, ''); const num = Number(cleaned); return Number.isFinite(num) ? num : 0 }

  // Use utility
  const calc = calculateEMI({ principal, annualRate, months: tenureMonths, extra: prepayment, startMonth })

  const COLORS = ['#1E40AF', '#60A5FA']
  const BAR_CAP = 600
  const barData = calc ? (showFullTerm ? calc.schedule.slice(0, Math.min(calc.schedule.length, BAR_CAP)) : calc.schedule.slice(0, Math.min(60, calc.schedule.length))).map(r => ({ name: `M${r.monthNumber}`, principal: Math.round(r.principalPaid), interest: Math.round(r.interestPaid) })) : []

  // pie chart data (rounded integers)
  const pieData = calc ? [
    { name: 'Principal', value: Math.round(calc.totalPrincipal) },
    { name: 'Interest', value: Math.round(calc.totalInterest) },
  ] : []

  // export helpers (serialize SVG -> PNG)
  const pieRef = useRef(null)
  const barRef = useRef(null)
  function downloadSVGAs(type='png', dom){ if(!dom) return; const svg = dom instanceof SVGElement ? dom : dom.querySelector('svg'); if(!svg) return; const serializer = new XMLSerializer(); let source = serializer.serializeToString(svg); if(!source.match(/^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)) source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"'); if(!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink"/)) source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'); const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' }); const url = URL.createObjectURL(svgBlob); if(type === 'svg'){ const a = document.createElement('a'); a.href = url; a.download = `chart-${Date.now()}.svg`; a.click(); URL.revokeObjectURL(url); return } const img = new Image(); img.onload = function(){ const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height; const ctx = canvas.getContext('2d'); ctx.fillStyle = dark ? '#0f172a' : '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); canvas.toBlob((blob)=>{ const urlP = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = urlP; a.download = `chart-${Date.now()}.png`; a.click(); URL.revokeObjectURL(urlP); }); URL.revokeObjectURL(url); }; img.onerror = ()=> URL.revokeObjectURL(url); img.src = url }

  function onNumericInputChange(e, setter){ const parsed = parseCurrencyInput(e.target.value); setter(parsed) }

  const themeBg = dark ? 'bg-slate-900 text-slate-100' : 'bg-gradient-to-br from-white via-sky-50 to-sky-100 text-slate-900'
  const cardBg = dark ? 'bg-slate-800' : 'bg-white'
  const cardBorder = dark ? 'border-slate-700' : 'border-sky-200'
  const inputClass = `mt-1 block w-full rounded-md p-2 ${dark ? 'bg-slate-700 text-slate-100 placeholder-slate-300 border border-slate-600' : 'bg-white text-slate-900 placeholder-slate-500 border border-sky-200'}`
  const smallInputClass = `w-16 p-1 rounded-md ${dark ? 'bg-slate-700 text-slate-100 border border-slate-600' : 'bg-white text-slate-900 border border-sky-200'} text-center`
  const btnBase = 'px-4 py-2 rounded-lg'
  function loanBtnClass(type){
    const selected = loanType === type
    if(selected) return `${btnBase} bg-sky-600 text-white`
    return `${btnBase} ${dark ? 'bg-slate-700 text-slate-100/90' : 'bg-white text-sky-700 border border-sky-300'}`
  }

  return (
    <div className={`min-h-screen p-6 ${themeBg}`}>
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">CalculateYourEmi.in</h1>
            <p className="text-sm opacity-80">Home · Car · Personal — estimates, charts & schedule</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={dark} onChange={()=>setDark(d=>!d)} /> Dark</label>
            <div className="flex gap-2">
              <button onClick={()=>onLoanTypeChange('Home')} className={loanBtnClass('Home')}>Home</button>
              <button onClick={()=>onLoanTypeChange('Car')} className={loanBtnClass('Car')}>Car</button>
              <button onClick={()=>onLoanTypeChange('Personal')} className={loanBtnClass('Personal')}>Personal</button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${cardBg} rounded-2xl shadow-md p-6 ${cardBorder} lg:col-span-2`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Loan Type</label>
                <select value={loanType} onChange={(e)=>onLoanTypeChange(e.target.value)} className={inputClass}><option>Home</option><option>Car</option><option>Personal</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium">Start Month</label>
                <input type="month" value={startMonth} onChange={(e)=>setStartMonth(e.target.value)} className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium">Principal (₹)</label>
                <input type="text" value={formatCurrencyInput(principal)} onChange={(e)=>onNumericInputChange(e,setPrincipal)} className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium">Annual Interest Rate (%)</label>
                <input type="number" step="0.01" value={annualRate} onChange={(e)=>setAnnualRate(Number(e.target.value))} className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium">Tenure (Years)</label>
                <input type="number" value={tenureYears} onChange={(e)=>{ const y = Number(e.target.value)||0; setTenureYears(y); setTenureMonths(Math.round(y*12)) }} className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium">Tenure (Months)</label>
                <input type="number" value={tenureMonths} onChange={(e)=>{ const m = Math.max(0, Math.round(Number(e.target.value)||0)); setTenureMonths(m); setTenureYears(Math.round(m/12)) }} className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium">Extra Monthly Prepayment (₹)</label>
                <input type="text" value={formatCurrencyInput(prepayment)} onChange={(e)=>onNumericInputChange(e,setPrepayment)} className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium">Show Amortization Schedule</label>
                <select value={showSchedule? 'yes':'no'} onChange={(e)=>setShowSchedule(e.target.value==='yes')} className={inputClass}><option value="yes">Yes</option><option value="no">No</option></select>
              </div>
            </div>

            <div className="mt-4 flex gap-3 items-center">
              <button onClick={() => onLoanTypeChange(loanType)} className="px-4 py-2 rounded-xl bg-sky-600 text-white">Apply Preset</button>
              <button onClick={()=>{ if(calc) { const header = ["MonthNumber","Date","BeginningBalance","Payment","PrincipalPaid","InterestPaid","EndingBalance"]; const rows = calc.schedule.map(r=>[r.monthNumber,r.date,Math.round(r.beginningBalance),Math.round(r.payment),Math.round(r.principalPaid),Math.round(r.interestPaid),Math.round(r.endingBalance)]); const csvContent = [header,...rows].map(r=>r.join(',')).join('\n'); const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download = `${loanType}_emi_schedule.csv`; a.click(); URL.revokeObjectURL(url); } }} disabled={!calc} className="px-4 py-2 rounded-xl bg-white border text-sky-700">Export Schedule CSV</button>

              <label className="ml-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={showFullTerm} onChange={()=>setShowFullTerm(s=>!s)} /> Full-term bar chart (may be heavy)</label>

              <div className="ml-auto flex gap-2">
                <button onClick={()=>downloadSVGAs('png', pieRef.current)} disabled={!calc} className="px-3 py-2 rounded-md bg-sky-600 text-white">Export Pie PNG</button>
                <button onClick={()=>downloadSVGAs('png', barRef.current)} disabled={!calc} className="px-3 py-2 rounded-md bg-sky-600 text-white">Export Bar PNG</button>
              </div>
            </div>

            {calc && barData.length>0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Monthly Principal vs Interest (showing {barData.length} months)</h3>
                <div style={{width:'100%', height:320}} className="p-3 rounded-xl" ref={barRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{fontSize:10}} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="principal" stackId="a" name="Principal" fill="#1E40AF" />
                      <Bar dataKey="interest" stackId="a" name="Interest" fill="#60A5FA" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>

          <aside className={`${cardBg} rounded-2xl shadow-md p-6 ${cardBorder}`}>
            <h3 className="font-medium">Summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div>Loan Type: <strong>{loanType}</strong></div>
              <div>Principal: <strong>₹ {formatCurrencyInput(principal)}</strong></div>
              <div>Annual Rate: <strong>{Number(annualRate)}%</strong></div>
              <div>Tenure: <strong>{tenureMonths} months ({tenureYears} yrs)</strong></div>
              {calc ? (
                <>
                  <hr className="my-2" />
                  <div>Calculated EMI: <strong>₹ {formatCurrencyInput(Math.round(calc.EMI))}</strong></div>
                  <div>Monthly Payment: <strong>₹ {formatCurrencyInput(Math.round(calc.monthlyPayment))}</strong></div>
                  <div>Total Months (actual payoff): <strong>{calc.months}</strong></div>
                  <div>Total Interest Payable: <strong>₹ {formatCurrencyInput(Math.round(calc.totalInterest))}</strong></div>
                  <div>Total Payment: <strong>₹ {formatCurrencyInput(Math.round(calc.totalPaid))}</strong></div>

                  <div className="mt-6 flex justify-center pt-2" ref={pieRef}>
                    <PieChart width={220} height={220}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        labelLine={false}
                        // hide slice labels to avoid overlapping; legend + tooltip show values
                      >
                        <Cell fill={COLORS[0]} />
                        <Cell fill={COLORS[1]} />
                      </Pie>
                      <Tooltip formatter={(value) => `₹ ${formatCurrencyInput(value)}`} />
                      <Legend verticalAlign="bottom" align="center" />
                    </PieChart>
                  </div>
                </>
              ) : (
                <div className="text-xs text-rose-600">Enter valid principal, rate and tenure to calculate.</div>
              )}
            </div>

            <div className="mt-4 text-xs">Tip: small monthly prepayments reduce tenure & interest significantly.</div>
          </aside>
        </div>

        {showSchedule && calc && (
          <div className={`${cardBg} mt-6 rounded-2xl shadow-md p-4 ${cardBorder}`}>
            <h2 className="text-lg font-semibold mb-3">Amortization Schedule</h2>

            {/* Pagination controls */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <label>Rows per page:</label>
                <select value={rowsPerPage} onChange={(e)=>{ setRowsPerPage(Number(e.target.value)); setPage(1); }} className={smallInputClass}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

                <div className="ml-auto flex items-center gap-2 text-sm">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="px-2 py-1 rounded-md border disabled:opacity-50">Prev</button>
                <span>Page</span>
                <input type="number" value={page} onChange={(e)=>{ const v = Math.max(1, Number(e.target.value)||1); setPage(v); }} className={smallInputClass} />
                <span>of {Math.max(1, Math.ceil(calc.schedule.length / rowsPerPage))}</span>
                <button onClick={()=>setPage(p=>Math.min(Math.ceil(calc.schedule.length/rowsPerPage), p+1))} disabled={page>=Math.ceil(calc.schedule.length/rowsPerPage)} className="px-2 py-1 rounded-md border disabled:opacity-50">Next</button>
              </div>
            </div>

            <div className={`overflow-x-auto rounded-lg border ${dark ? 'border-slate-600' : ''}`}>
              <table className="min-w-full text-sm divide-y">
                <thead className={`${dark ? 'bg-slate-700 text-slate-100' : 'bg-sky-50'} sticky top-0`}>
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-right">Begin</th>
                    <th className="p-2 text-right">Payment</th>
                    <th className="p-2 text-right">Principal</th>
                    <th className="p-2 text-right">Interest</th>
                    <th className="p-2 text-right">End Bal</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const total = calc.schedule.length
                    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
                    const clampedPage = Math.min(Math.max(1, page), totalPages)
                    const start = (clampedPage - 1) * rowsPerPage
                    const end = Math.min(total, start + rowsPerPage)
                    const pageRows = calc.schedule.slice(start, end)
                    return pageRows.map(r => (
                      <tr key={r.monthNumber} className={dark ? 'odd:bg-slate-800 even:bg-slate-700' : 'odd:bg-white even:bg-sky-50'}>
                        <td className="p-2">{r.monthNumber}</td>
                        <td className="p-2">{r.date}</td>
                        <td className="p-2 text-right">₹ {formatCurrencyInput(r.beginningBalance)}</td>
                        <td className="p-2 text-right">₹ {formatCurrencyInput(r.payment)}</td>
                        <td className="p-2 text-right">₹ {formatCurrencyInput(r.principalPaid)}</td>
                        <td className="p-2 text-right">₹ {formatCurrencyInput(r.interestPaid)}</td>
                        <td className="p-2 text-right">₹ {formatCurrencyInput(r.endingBalance)}</td>
                      </tr>
                    ))
                  })()}
                </tbody>
              </table>
            </div>

            <div className={`mt-2 flex items-center justify-between text-sm ${dark ? 'text-slate-300' : 'text-gray-600'}`}>
              <div>
                Showing {Math.min(calc.schedule.length, (page-1)*rowsPerPage + 1)} - {Math.min(calc.schedule.length, page*rowsPerPage)} of {calc.schedule.length} rows.
              </div>
              <div>Export to CSV for the full schedule.</div>
            </div>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-sky-500">Built with ♥ — EMI Calculator</footer>
      </div>
    </div>
  )
}
