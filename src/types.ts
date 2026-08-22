export type CsvStatus = '未処理' | 'CSV引渡し済み'

export interface ProductionReport {
  report_id: string
  part_number: string
  worker_name: string
  production_count: string
  timestamp: string
  latitude: number | 'NA'
  longitude: number | 'NA'
  csv_status: CsvStatus
  csv_handed_off_at: string | null
}

export type Screen = 'report' | 'list' | 'settings'
export type QrTarget = 'worker' | 'part'
