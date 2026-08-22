import Dexie, { type EntityTable } from 'dexie'
import type { ProductionReport } from './types'

class ProductionReportDatabase extends Dexie {
  reports!: EntityTable<ProductionReport, 'report_id'>

  constructor() {
    super('production-report-pwa')
    this.version(1).stores({
      reports: 'report_id, timestamp, csv_status, worker_name, part_number',
    })
  }
}

export const db = new ProductionReportDatabase()

export async function addReport(report: ProductionReport): Promise<void> {
  await db.reports.add(report)
}

export async function markReportsHandedOff(reportIds: string[], handedOffAt: string): Promise<void> {
  await db.transaction('rw', db.reports, async () => {
    await db.reports.where('report_id').anyOf(reportIds).modify({
      csv_status: 'CSV引渡し済み',
      csv_handed_off_at: handedOffAt,
    })
  })
}
