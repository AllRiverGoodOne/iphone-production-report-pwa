import { describe, expect, it } from 'vitest'
import { formatFileTimestamp, isPositiveIntegerInput, reportsToCsv } from './report-utils'
import type { ProductionReport } from './types'

const sampleReport: ProductionReport = {
  report_id: 'report-1',
  part_number: 'PN-001',
  worker_name: '皆川, 良一',
  production_count: '123456789012345678901234567890',
  timestamp: '2026-08-22T01:00:00.000Z',
  latitude: 'NA',
  longitude: 'NA',
  csv_status: '未処理',
  csv_handed_off_at: null,
}

describe('isPositiveIntegerInput', () => {
  it.each(['1', '25', '999999999999999999999999999999'])("accepts %s", (value) => {
    expect(isPositiveIntegerInput(value)).toBe(true)
  })

  it.each(['', '0', '-1', '1.5', '01', '1a'])("rejects %s", (value) => {
    expect(isPositiveIntegerInput(value)).toBe(false)
  })
})

describe('reportsToCsv', () => {
  it('creates a UTF-8 BOM CSV and escapes commas', () => {
    const csv = reportsToCsv([sampleReport])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('"worker_name"')
    expect(csv).toContain('"皆川, 良一"')
    expect(csv).toContain('"123456789012345678901234567890"')
    expect(csv).toContain('"NA","NA"')
  })
})

describe('formatFileTimestamp', () => {
  it('formats a local timestamp for a file name', () => {
    expect(formatFileTimestamp(new Date(2026, 7, 22, 9, 5, 7))).toBe('20260822_090507')
  })
})
