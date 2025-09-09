import { describe, it, expect } from 'vitest'
import { calculateEMI } from '../src/utils/emi'

describe('calculateEMI', () => {
  it('returns null for invalid inputs', () => {
    expect(calculateEMI({ principal: 0, annualRate: 10, months: 12 })).toBeNull()
    expect(calculateEMI({ principal: 100000, annualRate: -1, months: 12 })).toBeNull()
  })

  it('calculates EMI correctly for zero interest', () => {
    const r = calculateEMI({ principal: 120000, annualRate: 0, months: 12 })
    expect(r).not.toBeNull()
    if (r) {
      expect(Number(r.EMI.toFixed(2))).toBeCloseTo(10000, 2)
      expect(r.schedule.length).toBeGreaterThan(0)
    }
  })
})
