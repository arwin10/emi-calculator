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
import { calculateFD } from '../utils/savings';

export default function FDCalculator({ dark, inputClass, cardBg, cardBorder, formatCurrencyInput }) {
    const [fdPrincipal, setFdPrincipal] = useState(100000);
    const [fdRate, setFdRate] = useState(6.5);
    const [fdYears, setFdYears] = useState(5);
    const [fdCompounding, setFdCompounding] = useState(1);

    const fdCalc = calculateFD({ principal: Number(fdPrincipal) || 0, annualRate: Number(fdRate) || 0, years: Number(fdYears) || 0, compoundingPerYear: fdCompounding });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${cardBg} rounded-2xl shadow-md p-6 ${cardBorder} lg:col-span-2`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">FD Principal (₹)</label>
                        <input type="number" value={fdPrincipal} onChange={(e) => setFdPrincipal(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} />
                        <input type="range" min="1000" max="10000000" step="5000" value={fdPrincipal || 0} onChange={(e) => setFdPrincipal(Number(e.target.value))} className="w-full mt-2 accent-sky-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Rate (% p.a.)</label>
                        <input type="number" step="0.01" value={fdRate} onChange={(e) => setFdRate(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} />
                        <input type="range" min="0" max="15" step="0.1" value={fdRate || 0} onChange={(e) => setFdRate(Number(e.target.value))} className="w-full mt-2 accent-sky-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tenure (Years)</label>
                        <input type="number" value={fdYears} onChange={(e) => setFdYears(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} />
                        <input type="range" min="0" max="25" step="1" value={fdYears || 0} onChange={(e) => setFdYears(Number(e.target.value))} className="w-full mt-2 accent-sky-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Compounding / year</label>
                        <select value={fdCompounding} onChange={(e) => setFdCompounding(Number(e.target.value) || 1)} className={inputClass}>
                            <option value={1}>Annually</option>
                            <option value={2}>Semi-annually</option>
                            <option value={4}>Quarterly</option>
                            <option value={12}>Monthly</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex gap-3 items-center">
                    <button onClick={() => { /* no-op; summary updates live */ }} className="px-4 py-2 rounded-xl bg-sky-600 text-white w-full sm:w-auto">Calculate FD</button>
                </div>
                {fdCalc && (
                    <div className="mt-6">
                        <h4 className="font-medium mb-2">FD growth</h4>
                        <div style={{ width: '100%', height: 200 }} className="p-2 rounded">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={fdCalc.schedule.map(s => ({ month: s.month, balance: Math.round(s.balance) }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="balance" stroke="#60A5FA" strokeWidth={2} dot={false} />
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
                        <div>FD Principal: <strong>₹ {formatCurrencyInput(fdPrincipal === '' ? 0 : fdPrincipal)}</strong></div>
                        <div>Rate: <strong>{fdRate === '' ? '0' : fdRate}% p.a.</strong></div>
                        <div>Tenure: <strong>{fdYears === '' ? '0' : fdYears} years</strong></div>
                        {fdCalc ? (
                            <>
                                <hr className="my-2" />
                                <div>Maturity Amount: <strong>₹ {formatCurrencyInput(Math.round(fdCalc.maturity))}</strong></div>
                                <div>Total Interest: <strong>₹ {formatCurrencyInput(Math.round(fdCalc.totalInterest))}</strong></div>
                            </>
                        ) : (
                            <div className="text-xs text-rose-600">Enter valid FD values to calculate.</div>
                        )}
                    </>
                </div>
            </aside>
        </div>
    );
}
