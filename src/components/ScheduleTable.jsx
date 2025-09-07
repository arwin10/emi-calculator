import React from 'react'

export default function ScheduleTable({ schedule }) {
  if (!schedule) return null

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-md p-4">
      <h2 className="text-lg font-semibold text-sky-800 mb-3">Amortization Schedule (first 240 rows)</h2>
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm divide-y">
          <thead className="bg-sky-50 sticky top-0">
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
            {schedule.slice(0, 240).map((r) => (
              <tr key={r.monthNumber} className="odd:bg-white even:bg-sky-50">
                <td className="p-2">{r.monthNumber}</td>
                <td className="p-2">{r.date}</td>
                <td className="p-2 text-right">₹ {Number(r.beginningBalance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                <td className="p-2 text-right">₹ {Number(r.payment).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                <td className="p-2 text-right">₹ {Number(r.principalPaid).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                <td className="p-2 text-right">₹ {Number(r.interestPaid).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                <td className="p-2 text-right">₹ {Number(r.endingBalance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {schedule.length > 240 && (
        <div className="mt-2 text-sm text-gray-600">Showing first 240 rows. Export to CSV for the full schedule.</div>
      )}
    </div>
  )
}
