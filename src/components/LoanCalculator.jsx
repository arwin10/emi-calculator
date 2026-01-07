import React, { useState, useEffect, useRef } from "react";
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
import { calculateEMI } from '../utils/emi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LoanCalculator({ dark, inputClass, smallInputClass, cardBg, cardBorder, loanBtnClass, formatCurrencyInput, onNumericInputChange, downloadSVGAs, getChartDataURL }) {
  const loanPresets = {
    Home: { years: 20, rate: 8.5, principal: 5000000 },
    Car: { years: 5, rate: 9.0, principal: 1000000 },
    Personal: { years: 3, rate: 12.0, principal: 500000 },
  };

  const [loanType, setLoanType] = useState('Home');
  const [principal, setPrincipal] = useState(loanPresets['Home'].principal);
  const [annualRate, setAnnualRate] = useState(loanPresets['Home'].rate);
  const [tenureYears, setTenureYears] = useState(loanPresets['Home'].years);
  const [tenureMonths, setTenureMonths] = useState(tenureYears * 12);
  const [showSchedule, setShowSchedule] = useState(true);
  const [prepayment, setPrepayment] = useState(0);
  const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showFullTerm, setShowFullTerm] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Comparison State
  const [compareMode, setCompareMode] = useState(false);
  const [principal2, setPrincipal2] = useState(loanPresets['Home'].principal);
  const [rate2, setRate2] = useState(loanPresets['Home'].rate + 0.5);
  const [tenureYears2, setTenureYears2] = useState(loanPresets['Home'].years);
  const [tenureMonths2, setTenureMonths2] = useState(loanPresets['Home'].years * 12);


  const pieRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => { setTenureMonths(Math.round(Number(tenureYears) * 12)) }, [tenureYears]);
  useEffect(() => { setTenureMonths2(Math.round(Number(tenureYears2) * 12)) }, [tenureYears2]);


  function onLoanTypeChange(t) {
    setLoanType(t);
    const p = loanPresets[t] || loanPresets.Home;
    setAnnualRate(p.rate);
    setTenureYears(p.years);
    setTenureMonths(p.years * 12);
    if (p.principal !== undefined) setPrincipal(p.principal);

    // Reset comparison defaults too
    setRate2(p.rate + 0.5);
    setTenureYears2(p.years);
    setTenureMonths2(p.years * 12);
    if (p.principal !== undefined) setPrincipal2(p.principal);
  }

  const calc = calculateEMI({ principal: Number(principal) || 0, annualRate: Number(annualRate) || 0, months: Number(tenureMonths) || 0, extra: Number(prepayment) || 0, startMonth });

  const calc2 = compareMode ? calculateEMI({ principal: Number(principal2) || 0, annualRate: Number(rate2) || 0, months: Number(tenureMonths2) || 0, extra: 0, startMonth }) : null;


  const COLORS = ['#1E40AF', '#60A5FA'];
  const BAR_CAP = 600;
  const barData = calc ? (showFullTerm ? calc.schedule.slice(0, Math.min(calc.schedule.length, BAR_CAP)) : calc.schedule.slice(0, Math.min(60, calc.schedule.length))).map(r => ({ name: `M${r.monthNumber}`, principal: Math.round(r.principalPaid), interest: Math.round(r.interestPaid) })) : [];

  const pieData = calc ? [
    { name: 'Principal', value: Math.round(calc.totalPrincipal) },
    { name: 'Interest', value: Math.round(calc.totalInterest) },
  ] : [];

  async function generatePDF() {
    if (!calc) return;
    try {
      const PDF = jsPDF.default || jsPDF;
      const doc = new PDF();

      const formatForPDF = (val) => {
        const formatted = formatCurrencyInput(Math.round(val));
        return `Rs. ${formatted.replace(/[^\d,\.]/g, '')}`;
      };

      // Title
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text(`${loanType} Loan EMI Report`, 14, 22);

      // --- Summary Section ---
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Loan Details", 14, 32);

      doc.setFontSize(12);
      doc.setTextColor(0);

      let y = 40;
      const lineHeight = 7;

      doc.text(`Principal:`, 14, y);
      doc.text(formatForPDF(principal), 60, y);
      y += lineHeight;

      doc.text(`Interest Rate:`, 14, y);
      doc.text(`${annualRate}%`, 60, y);
      y += lineHeight;

      doc.text(`Tenure:`, 14, y);
      doc.text(`${tenureYears} Years (${tenureMonths} Months)`, 60, y);
      y += lineHeight + 4;

      doc.setFont(undefined, 'bold');
      doc.text(`EMI:`, 14, y);
      doc.text(formatForPDF(calc.EMI), 60, y);
      y += lineHeight;

      doc.text(`Total Payment:`, 14, y);
      doc.text(formatForPDF(calc.totalPaid), 60, y);
      y += lineHeight;

      doc.text(`Total Interest:`, 14, y);
      doc.text(formatForPDF(calc.totalInterest), 60, y);
      doc.setFont(undefined, 'normal');

      // --- Chart Section ---
      try {
        if (pieRef.current) {
          const imgData = await getChartDataURL(pieRef.current);
          if (imgData) {
            doc.addImage(imgData, 'PNG', 130, 25, 50, 50);

            // Manual Legend
            doc.setFillColor(30, 64, 175);
            doc.rect(135, 80, 4, 4, 'F');
            doc.setFontSize(10);
            doc.text("Principal", 142, 83);

            doc.setFillColor(96, 165, 250);
            doc.rect(135, 86, 4, 4, 'F');
            doc.text("Interest", 142, 89);
          }
        }
      } catch (e) {
        console.warn("Chart image generation failed", e);
      }

      // --- Table Section ---
      const tableColumn = ["Month", "Date", "Principal", "Interest", "Balance"];
      const tableRows = [];

      calc.schedule.forEach((r) => {
        const clean = (v) => formatCurrencyInput(Math.round(v)).replace(/[^\d,\.]/g, '');
        tableRows.push([
          r.monthNumber,
          r.date,
          clean(r.principalPaid),
          clean(r.interestPaid),
          clean(r.endingBalance)
        ]);
      });

      const autoTableFunc = doc.autoTable || autoTable;
      if (typeof autoTableFunc === 'function') {
        autoTableFunc(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 100,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [2, 132, 199] }
        });
      }

      doc.save(`${loanType}_EMI_Report.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert(`Failed to generate PDF. Error: ${error.message}`);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div id="calculator-section" className={`${cardBg} rounded-2xl shadow-md p-6 ${cardBorder} lg:col-span-2`}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div className="flex gap-2">
            <button id="preset-home" onClick={() => onLoanTypeChange('Home')} className={selectedBtnClass(loanType === 'Home', dark)}>Home</button>
            <button id="preset-car" onClick={() => onLoanTypeChange('Car')} className={selectedBtnClass(loanType === 'Car', dark)}>Car</button>
            <button id="preset-personal" onClick={() => onLoanTypeChange('Personal')} className={selectedBtnClass(loanType === 'Personal', dark)}>Personal</button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} className="accent-sky-600" />
            <span className="font-medium text-sm">Compare Loans</span>
          </label>
        </div>

        <div className={`grid ${compareMode ? 'grid-cols-1 md:grid-cols-2 gap-8' : 'grid-cols-1 sm:grid-cols-2 gap-4'}`}>
          {/* LOAN 1 INPUTS */}
          <div className={`${compareMode ? 'space-y-4' : 'contents'}`}>
            {compareMode && <h3 className="font-bold text-sky-600 mb-2 border-b pb-1">Loan A (Main)</h3>}

            {!compareMode && (
              <>
                <div>
                  <label className="block text-sm font-medium">Loan Type</label>
                  <select id="input-loan-type" value={loanType} onChange={(e) => onLoanTypeChange(e.target.value)} className={inputClass}><option>Home</option><option>Car</option><option>Personal</option></select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Start Month</label>
                  <input id="input-start-month" type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className={inputClass} />
                </div>
              </>
            )}

            <div className={!compareMode ? "sm:col-span-2 lg:col-span-1" : ""}>
              <label className="block text-sm font-medium">Principal (₹)</label>
              <input id="input-principal" type="text" value={formatCurrencyInput(principal)} onChange={(e) => onNumericInputChange(e, setPrincipal)} className={inputClass} />
              <input type="range" min="0" max="20000000" step="10000" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full mt-2 accent-sky-600" />
            </div>

            <div className={!compareMode ? "sm:col-span-2 lg:col-span-1" : ""}>
              <label className="block text-sm font-medium">Interest Rate (%)</label>
              <input id="input-annual-rate" type="number" step="0.01" value={annualRate} onChange={(e) => setAnnualRate(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} />
              <input type="range" min="0" max="25" step="0.1" value={annualRate || 0} onChange={(e) => setAnnualRate(Number(e.target.value))} className="w-full mt-2 accent-sky-600" />
            </div>

            <div className={!compareMode ? "sm:col-span-2 lg:col-span-1" : ""}>
              <label className="block text-sm font-medium">Tenure (Years)</label>
              <input id="input-tenure-years" type="number" value={tenureYears} onChange={(e) => { const y = e.target.value === '' ? '' : Number(e.target.value); setTenureYears(y); setTenureMonths(y === '' ? '' : Math.round(y * 12)) }} className={inputClass} />
              <input type="range" min="0" max="30" step="1" value={tenureYears || 0} onChange={(e) => { const y = Number(e.target.value); setTenureYears(y); setTenureMonths(y * 12); }} className="w-full mt-2 accent-sky-600" />
            </div>

            {!compareMode && (
              <>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium">Tenure (Months)</label>
                  <input id="input-tenure-months" type="number" value={tenureMonths} onChange={(e) => { const m = e.target.value === '' ? '' : Math.max(0, Math.round(Number(e.target.value))); setTenureMonths(m); setTenureYears(m === '' ? '' : Math.round(m / 12)) }} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Extra Prepayment (₹/mo)</label>
                  <input id="input-prepayment" type="text" value={formatCurrencyInput(prepayment)} onChange={(e) => onNumericInputChange(e, setPrepayment)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Show Amortization</label>
                  <select id="input-show-schedule" value={showSchedule ? 'yes' : 'no'} onChange={(e) => setShowSchedule(e.target.value === 'yes')} className={inputClass}><option value="yes">Yes</option><option value="no">No</option></select>
                </div>
              </>
            )}
          </div>

          {/* LOAN 2 INPUTS (Comparison) */}
          {compareMode && (
            <div className="space-y-4 border-l pl-8 border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-emerald-600 mb-2 border-b pb-1">Loan B (Compare)</h3>

              <div>
                <label className="block text-sm font-medium">Principal (₹)</label>
                <input type="text" value={formatCurrencyInput(principal2)} onChange={(e) => onNumericInputChange(e, setPrincipal2)} className={inputClass} />
                <input type="range" min="0" max="20000000" step="10000" value={principal2} onChange={(e) => setPrincipal2(Number(e.target.value))} className="w-full mt-2 accent-emerald-600" />
              </div>

              <div>
                <label className="block text-sm font-medium">Interest Rate (%)</label>
                <input type="number" step="0.01" value={rate2} onChange={(e) => setRate2(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} />
                <input type="range" min="0" max="25" step="0.1" value={rate2 || 0} onChange={(e) => setRate2(Number(e.target.value))} className="w-full mt-2 accent-emerald-600" />
              </div>

              <div>
                <label className="block text-sm font-medium">Tenure (Years)</label>
                <input type="number" value={tenureYears2} onChange={(e) => { const y = e.target.value === '' ? '' : Number(e.target.value); setTenureYears2(y); setTenureMonths2(y === '' ? '' : Math.round(y * 12)) }} className={inputClass} />
                <input type="range" min="0" max="30" step="1" value={tenureYears2 || 0} onChange={(e) => { const y = Number(e.target.value); setTenureYears2(y); setTenureMonths2(y * 12); }} className="w-full mt-2 accent-emerald-600" />
              </div>
            </div>
          )}
        </div>


        <div className="mt-8 flex flex-col xl:flex-row flex-wrap gap-4 justify-between items-center">
          {compareMode ? (
            <div className="text-sm text-slate-500 italic w-full text-center">Adjust sliders to compare scenarios. Disable comparison to view detailed schedule/charts.</div>
          ) : (
            <>
              {/* Left Group: Main Actions */}
              <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-start">
                <button id="btn-apply-preset" onClick={() => onLoanTypeChange(loanType)} className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-colors text-sm font-medium">Reset / Apply Preset</button>
                <div className="h-8 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block mx-1"></div>
                <button id="btn-export-pdf" onClick={generatePDF} disabled={!calc} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">Export PDF Report</button>
                <button id="btn-export-schedule" onClick={() => { if (calc) { const header = ["MonthNumber", "Date", "BeginningBalance", "Payment", "PrincipalPaid", "InterestPaid", "EndingBalance"]; const rows = calc.schedule.map(r => [r.monthNumber, r.date, Math.round(r.beginningBalance), Math.round(r.payment), Math.round(r.principalPaid), Math.round(r.interestPaid), Math.round(r.endingBalance)]); const csvContent = [header, ...rows].map(r => r.join(',')).join('\n'); const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${loanType}_emi_schedule.csv`; a.click(); URL.revokeObjectURL(url); } }} disabled={!calc} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">Export CSV</button>
              </div>

              {/* Right Group: Chart Options */}
              <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto justify-center xl:justify-end border-t xl:border-t-0 border-slate-200 dark:border-slate-700 pt-4 xl:pt-0">
                <label id="label-fullterm-chart" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:text-sky-600 transition-colors">
                  <input id="toggle-fullterm-chart" type="checkbox" checked={showFullTerm} onChange={() => setShowFullTerm(s => !s)} className="accent-sky-600 w-4 h-4" />
                  <span>Full-term Chart</span>
                </label>

                <div className="flex gap-2">
                  <button id="btn-export-pie" onClick={() => downloadSVGAs('png', pieRef.current)} disabled={!calc} className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-medium transition-colors disabled:opacity-50">Save Pie</button>
                  <button id="btn-export-bar" onClick={() => downloadSVGAs('png', barRef.current)} disabled={!calc} className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-medium transition-colors disabled:opacity-50">Save Bar</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CHARTS (Only show in non-compare mode) */}
        {!compareMode && calc && barData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Monthly Principal vs Interest (showing {barData.length} months)</h3>
            <div style={{ width: '100%', height: 320 }} className="p-3 rounded-xl" ref={barRef}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
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

      <aside id="summary-panel" className={`${cardBg} rounded-2xl shadow-md p-6 ${cardBorder}`}>
        <h3 className="font-medium">Summary</h3>

        {compareMode ? (
          <div className="mt-3 space-y-4 text-sm">
            <div>
              <h4 className="font-bold text-sky-600">Loan A</h4>
              <div className="pl-2 border-l-2 border-sky-300">
                <div>EMI: <strong>₹ {calc ? formatCurrencyInput(Math.round(calc.EMI)) : 0}</strong></div>
                <div>Total Interest: <strong>₹ {calc ? formatCurrencyInput(Math.round(calc.totalInterest)) : 0}</strong></div>
                <div>Total Payment: <strong>₹ {calc ? formatCurrencyInput(Math.round(calc.totalPaid)) : 0}</strong></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-emerald-600">Loan B</h4>
              <div className="pl-2 border-l-2 border-emerald-300">
                <div>EMI: <strong>₹ {calc2 ? formatCurrencyInput(Math.round(calc2.EMI)) : 0}</strong></div>
                <div>Total Interest: <strong>₹ {calc2 ? formatCurrencyInput(Math.round(calc2.totalInterest)) : 0}</strong></div>
                <div>Total Payment: <strong>₹ {calc2 ? formatCurrencyInput(Math.round(calc2.totalPaid)) : 0}</strong></div>
              </div>
            </div>

            {calc && calc2 && (
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <strong className="block text-center text-xs uppercase text-slate-500 mb-1">Difference (A - B)</strong>
                <div className="flex justify-between items-center text-xs">
                  <span>EMI Diff:</span>
                  <span className={calc.EMI > calc2.EMI ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
                    {calc.EMI > calc2.EMI ? "+" : ""}₹ {formatCurrencyInput(Math.round(calc.EMI - calc2.EMI))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span>Interest Diff:</span>
                  <span className={calc.totalInterest > calc2.totalInterest ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
                    {calc.totalInterest > calc2.totalInterest ? "+" : ""}₹ {formatCurrencyInput(Math.round(calc.totalInterest - calc2.totalInterest))}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-2 text-sm">
            <>
              <div>Loan Type: <strong>{loanType}</strong></div>
              <div>Principal: <strong>₹ {formatCurrencyInput(principal)}</strong></div>
              <div>Annual Rate: <strong>{annualRate === '' ? '0' : Number(annualRate)}%</strong></div>
              <div>Tenure: <strong>{tenureMonths === '' ? '0' : tenureMonths} months ({tenureYears === '' ? '0' : tenureYears} yrs)</strong></div>
              {calc ? (
                <>
                  <hr className="my-2" />
                  <div>Calculated EMI: <strong>₹ {formatCurrencyInput(Math.round(calc.EMI))}</strong></div>
                  <div>Monthly Payment: <strong>₹ {formatCurrencyInput(Math.round(calc.monthlyPayment))}</strong></div>
                  <div>Total Months (actual payoff): <strong>{calc.months}</strong></div>
                  <div>Total Interest Payable: <strong>₹ {formatCurrencyInput(Math.round(calc.totalInterest))}</strong></div>
                  <div>Total Payment: <strong>₹ {formatCurrencyInput(Math.round(calc.totalPaid))}</strong></div>

                  <div id="chart-pie-container" className="mt-6 flex justify-center pt-2" ref={pieRef}>
                    <PieChart width={220} height={220}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        labelLine={false}
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
            </>
          </div>
        )}

        <div className="mt-4 text-xs">Tip: small monthly prepayments reduce tenure & interest significantly.</div>
      </aside>

      {/* SCHEDULE (Only show in non-compare mode) */}
      {!compareMode && showSchedule && calc && (
        <div id="schedule-section" className={`${cardBg} mt-6 rounded-2xl shadow-md p-4 ${cardBorder} lg:col-span-3`}>
          <h2 className="text-lg font-semibold mb-3">Amortization Schedule</h2>

          {/* Pagination controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <label>Rows per page:</label>
              <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }} className={smallInputClass}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="sm:ml-auto flex items-center gap-2 text-sm flex-wrap">
              <button id="pagination-prev" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-2 py-1 rounded-md border disabled:opacity-50 w-full sm:w-auto">Prev</button>
              <span>Page</span>
              <input id="pagination-page" type="number" value={page} onChange={(e) => { const v = Math.max(1, Number(e.target.value) || 1); setPage(v); }} className={smallInputClass} />
              <span>of {Math.max(1, Math.ceil(calc.schedule.length / rowsPerPage))}</span>
              <button id="pagination-next" onClick={() => setPage(p => Math.min(Math.ceil(calc.schedule.length / rowsPerPage), p + 1))} disabled={page >= Math.ceil(calc.schedule.length / rowsPerPage)} className="px-2 py-1 rounded-md border disabled:opacity-50 w-full sm:w-auto">Next</button>
            </div>
          </div>

          <div className={`overflow-x-auto rounded-lg border ${dark ? 'border-slate-600' : ''}`}>
            <table id="amortization-table" className="min-w-full text-sm divide-y">
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
              Showing {Math.min(calc.schedule.length, (page - 1) * rowsPerPage + 1)} - {Math.min(calc.schedule.length, page * rowsPerPage)} of {calc.schedule.length} rows.
            </div>
            <div>Export to CSV for the full schedule.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function selectedBtnClass(selected, dark) {
  const btnBase = 'px-4 py-2 rounded-lg';
  if (selected) return `${btnBase} bg-sky-600 text-white`;
  return `${btnBase} ${dark ? 'bg-slate-700 text-slate-100/90' : 'bg-white text-sky-700 border border-sky-300'}`;
}
