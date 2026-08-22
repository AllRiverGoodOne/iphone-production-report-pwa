import type { ProductionReport } from './types'

const CSV_COLUMNS: Array<keyof ProductionReport> = [
  'report_id',
  'part_number',
  'worker_name',
  'production_count',
  'timestamp',
  'latitude',
  'longitude',
  'csv_status',
  'csv_handed_off_at',
]

export function isPositiveIntegerInput(value: string): boolean {
  return /^[1-9]\d*$/.test(value)
}

function escapeCsvValue(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

export function reportsToCsv(reports: ProductionReport[]): string {
  const header = CSV_COLUMNS.map(escapeCsvValue).join(',')
  const rows = reports.map((report) =>
    CSV_COLUMNS.map((column) => escapeCsvValue(report[column])).join(','),
  )
  return `\uFEFF${[header, ...rows].join('\r\n')}`
}

export function createCsvFile(reports: ProductionReport[], now = new Date()): File {
  const stamp = formatFileTimestamp(now)
  return new File([reportsToCsv(reports)], `production_reports_${stamp}.csv`, {
    type: 'text/csv;charset=utf-8',
    lastModified: now.getTime(),
  })
}

export function formatFileTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '_',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('')
}

export function formatDisplayTimestamp(value: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}
