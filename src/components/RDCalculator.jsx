import React, { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { calculateRD } from '../utils/savings';

export default function RDCalculator({ dark, inputClass, cardBg, cardBorder, formatCurrencyInput }) {
    const [rdMonthly, setRdMonthly] = useState(2000);
    const [rdRate, setRdRate] = useState(6.5);
    const [rdYears, setRdYears] = useState(5);

    const rdCalc = calculateRD({ monthlyDeposit: Number(rdMonthly) || 0, annualRate: Number(rdRate) || 0, years: Number(rdYears) || 0 });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${cardBg} rounded-2xl shadow-md p-6 ${cardBorder} lg:col-span-2`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Monthly Deposit (₹)</label>
                        <input type="number" value={rdMonthly} onChange={(e) => setRdMonthly(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} />
                        <input type="range" min="500" max="500000" step="500" value={rdMonthly || 0} onChange={(e) => setRdMonthly(Number(e.target.value))} className="w-full mt-2 accent-sky-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Rate (% p.a.)</label>
                        <input type="number" step="0.01" value={rdRate} onChange={(e) => setRdRate(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} />
                        <input type="range" min="0" max="15" step="0.1" value={rdRate || 0} onChange={(e) => setRdRate(Number(e.target.value))} className="w-full mt-2 accent-sky-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tenure (Years)</label>
                        <input type="number" value={rdYears} onChange={(e) => setRdYears(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} />
                        <input type="range" min="0" max="15" step="1" value={rdYears || 0} onChange={(e) => setRdYears(Number(e.target.value))} className="w-full mt-2 accent-sky-600" />
                    </div>
                </div>
                <div className="mt-4 flex gap-3 items-center flex-wrap">
                    <button onClick={() => { /* no-op; summary updates live */ }} className="px-4 py-2 rounded-xl bg-sky-600 text-white w-full sm:w-auto">Calculate RD</button>
                    {rdCalc && (
                        <button onClick={() => {
                            const header = ["Month", "Deposit", "Interest", "Balance"]
                            const rows = rdCalc.schedule.map(s => [s.month, Math.round(s.deposit), Math.round(s.interest), Math.round(s.balance)])
                            const csvContent = [header, ...rows].map(r => r.join(',')).join('\n')
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a'); a.href = url; a.download = `rd_ledger_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
                        }} className="px-4 py-2 rounded-xl bg-white border text-sky-700 w-full sm:w-auto">Export RD CSV</button>
                    )}
                </div>
                {rdCalc && (
                    <div className="mt-6">
                        <h4 className="font-medium mb-2">RD growth</h4>
                        <div style={{ width: '100%', height: 200 }} className="p-2 rounded">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={rdCalc.schedule.map(s => ({ month: s.month, balance: Math.round(s.balance) }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="balance" stroke="#1E40AF" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            <aside className={`${cardBg} rounded-2xl shadow-md p-6 ${cardBorder}`}>
                <h3 className="font-medium">Summary</h3>
                <div className="mt-3 space-y-2 text-sm">
                    <>
                        <div>Monthly Deposit: <strong>₹ {formatCurrencyInput(rdMonthly === '' ? 0 : rdMonthly)}</strong></div>
                        <div>Rate: <strong>{rdRate === '' ? '0' : rdRate}% p.a.</strong></div>
                        <div>Tenure: <strong>{rdYears === '' ? '0' : rdYears} years</strong></div>
                        {rdCalc ? (
                            <>
                                <hr className="my-2" />
                                <div>Maturity Amount: <strong>₹ {formatCurrencyInput(Math.round(rdCalc.maturity))}</strong></div>
                                <div>Total Principal: <strong>₹ {formatCurrencyInput(Math.round(rdCalc.totalPrincipal))}</strong></div>
                                <div>Total Interest: <strong>₹ {formatCurrencyInput(Math.round(rdCalc.totalInterest))}</strong></div>
                            </>
                        ) : (
                            <div className="text-xs text-rose-600">Enter valid RD values to calculate.</div>
                        )}
                    </>
                </div>
            </aside>
        </div>
    );
}
