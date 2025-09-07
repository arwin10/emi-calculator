import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function Charts({ barData }) {
  if (!barData || barData.length === 0) return null

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-sky-800 mb-2">Monthly Principal vs Interest (first {barData.length} months)</h3>
      <div style={{ width: '100%', height: 300 }} className="bg-sky-50 p-3 rounded-xl">
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
  )
}
