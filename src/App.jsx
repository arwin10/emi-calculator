import React, { useEffect, useState, useRef } from "react";
import LoanCalculator from './components/LoanCalculator';
import FDCalculator from './components/FDCalculator';
import RDCalculator from './components/RDCalculator';

// App (Refactored shell)
export default function App() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('emi_dark') === '1' } catch (e) { return false }
  })
  useEffect(() => { try { localStorage.setItem('emi_dark', dark ? '1' : '0') } catch (e) { } }, [dark])

  const [mode, setMode] = useState('loan') // 'loan' | 'fd' | 'rd'

  const currencyFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
  function formatCurrencyInput(n) { if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) return ''; return currencyFormatter.format(Number(n)) }
  function parseCurrencyInput(str) { if (str === null || str === undefined) return ''; const cleaned = String(str).replace(/[^0-9.-]+/g, ''); if (cleaned === '' || cleaned === '-') return ''; const num = Number(cleaned); return Number.isFinite(num) ? num : '' }
  function onNumericInputChange(e, setter) { const parsed = parseCurrencyInput(e.target.value); setter(parsed) }

  // export helpers (serialize SVG -> PNG)
  function downloadSVGAs(type = 'png', dom) { if (!dom) return; const svg = dom instanceof SVGElement ? dom : dom.querySelector('svg'); if (!svg) return; const serializer = new XMLSerializer(); let source = serializer.serializeToString(svg); if (!source.match(/^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)) source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"'); if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink"/)) source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'); const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' }); const url = URL.createObjectURL(svgBlob); if (type === 'svg') { const a = document.createElement('a'); a.href = url; a.download = `chart-${Date.now()}.svg`; a.click(); URL.revokeObjectURL(url); return } const img = new Image(); img.onload = function () { const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height; const ctx = canvas.getContext('2d'); ctx.fillStyle = dark ? '#0f172a' : '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); canvas.toBlob((blob) => { const urlP = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = urlP; a.download = `chart-${Date.now()}.png`; a.click(); URL.revokeObjectURL(urlP); }); URL.revokeObjectURL(url); }; img.onerror = () => URL.revokeObjectURL(url); img.src = url }

  function getChartDataURL(dom) {
    return new Promise((resolve, reject) => {
      if (!dom) return reject('No DOM element');
      const svg = dom instanceof SVGElement ? dom : dom.querySelector('svg');
      if (!svg) return reject('No SVG found');
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svg);
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)) source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink"/)) source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = dark ? '#0f172a' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataURL);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
  }

  // Shared Styles
  const themeBg = dark ? 'bg-slate-900 text-slate-100' : 'bg-gradient-to-br from-white via-sky-50 to-sky-100 text-slate-900'
  const cardBg = dark ? 'bg-slate-800' : 'bg-white'
  const cardBorder = dark ? 'border-slate-700' : 'border-sky-200'
  const inputClass = `mt-1 block w-full rounded-md p-2 ${dark ? 'bg-slate-700 text-slate-100 placeholder-slate-300 border border-slate-600' : 'bg-white text-slate-900 placeholder-slate-500 border border-sky-200'}`
  const smallInputClass = `w-16 p-1 rounded-md ${dark ? 'bg-slate-700 text-slate-100 border border-slate-600' : 'bg-white text-slate-900 border border-sky-200'} text-center`
  const btnBase = 'px-4 py-2 rounded-lg'
  function loanBtnClass(type, currentType) {
    const selected = currentType === type
    if (selected) return `${btnBase} bg-sky-600 text-white`
    return `${btnBase} ${dark ? 'bg-slate-700 text-slate-100/90' : 'bg-white text-sky-700 border border-sky-300'}`
  }

  const commonProps = {
    dark,
    inputClass,
    smallInputClass,
    cardBg,
    cardBorder,
    loanBtnClass,
    formatCurrencyInput,
    onNumericInputChange,
    downloadSVGAs,
    getChartDataURL
  }

  return (
    <div id="app-root" className={`min-h-screen p-6 ${themeBg}`}>
      <div className="max-w-6xl mx-auto">
        <header id="site-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <div>
            <h1 id="page-title" className="text-3xl font-bold">EMI Calculator - Calculate Your Loan EMI Online</h1>
            <p id="page-subtitle" className="text-sm opacity-80">Home Loan · Car Loan · Personal Loan — Free EMI Calculator with Amortization Schedule</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label id="toggle-theme-label" className="flex items-center gap-2 text-sm"><input id="toggle-theme" type="checkbox" checked={dark} onChange={() => setDark(d => !d)} /> Dark</label>
            <div className="flex items-center gap-2">
              <button id="mode-loan" onClick={() => setMode('loan')} className={`${mode === 'loan' ? 'bg-sky-600 text-white' : (dark ? 'bg-slate-700 text-slate-100' : 'bg-white text-sky-700 border border-sky-300')} px-3 py-1 rounded`}>Loan</button>
              <button id="mode-fd" onClick={() => setMode('fd')} className={`${mode === 'fd' ? 'bg-sky-600 text-white' : (dark ? 'bg-slate-700 text-slate-100' : 'bg-white text-sky-700 border border-sky-300')} px-3 py-1 rounded`}>FD</button>
              <button id="mode-rd" onClick={() => setMode('rd')} className={`${mode === 'rd' ? 'bg-sky-600 text-white' : (dark ? 'bg-slate-700 text-slate-100' : 'bg-white text-sky-700 border border-sky-300')} px-3 py-1 rounded`}>RD</button>
            </div>
          </div>
        </header>

        {mode === 'loan' && <LoanCalculator {...commonProps} />}
        {mode === 'fd' && <FDCalculator {...commonProps} />}
        {mode === 'rd' && <RDCalculator {...commonProps} />}

        <footer id="site-footer" className={`mt-12 ${cardBg} rounded-2xl shadow-md p-6 ${cardBorder}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-bold text-lg mb-3">About EMI Calculator</h3>
              <p className="mb-2">CalculateYourEMI.in is a free online tool to calculate EMI (Equated Monthly Installment) for various types of loans including home loans, car loans, and personal loans in India.</p>
              <p>Get instant EMI calculations with detailed amortization schedules, interest breakup, and loan comparison features.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Popular Calculators</h3>
              <ul className="space-y-2">
                <li>• Home Loan EMI Calculator</li>
                <li>• Car Loan EMI Calculator</li>
                <li>• Personal Loan EMI Calculator</li>
                <li>• Fixed Deposit (FD) Calculator</li>
                <li>• Recurring Deposit (RD) Calculator</li>
                <li>• Loan Prepayment Calculator</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">EMI Formula</h3>
              <p className="mb-2">EMI = [P × R × (1+R)^N] / [(1+R)^N-1]</p>
              <p className="text-xs opacity-80">Where:</p>
              <ul className="text-xs opacity-80 space-y-1">
                <li>P = Loan amount (Principal)</li>
                <li>R = Monthly interest rate</li>
                <li>N = Loan tenure in months</li>
              </ul>
              <p className="mt-3 text-xs">Our calculator uses this standard formula to provide accurate EMI calculations instantly.</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t text-center text-xs opacity-70">
            <p>© 2025 CalculateYourEMI.in - Free EMI Calculator for Home, Car & Personal Loans | All Rights Reserved</p>
            <p className="mt-2">Keywords: EMI calculator, Calculate your emi, emi calculator,loan calculator, home loan EMI, car loan calculator, personal loan EMI, amortization schedule, interest rate calculator, loan comparison India</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
