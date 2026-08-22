import { lazy, Suspense, useCallback, useState, type FormEvent } from 'react'
import { acquirePosition } from '../geolocation'
import { addReport } from '../db'
import { isPositiveIntegerInput } from '../report-utils'
import type { QrTarget } from '../types'
import { StatusCard } from './StatusCard'

const QrScannerDialog = lazy(() =>
  import('./QrScannerDialog').then((module) => ({ default: module.QrScannerDialog })),
)

interface ReportScreenProps {
  workerName: string
  onWorkerChange: (worker: string) => void
  unprocessedCount: number
}

type GpsState = '報告時に取得' | '取得中' | '取得済み' | '取得失敗（NA）'

export function ReportScreen({ workerName, onWorkerChange, unprocessedCount }: ReportScreenProps) {
  const [partNumber, setPartNumber] = useState('')
  const [productionCount, setProductionCount] = useState('')
  const [scannerTarget, setScannerTarget] = useState<QrTarget | null>(null)
  const [gpsState, setGpsState] = useState<GpsState>('報告時に取得')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const handleQrRead = useCallback(
    (value: string) => {
      if (scannerTarget === 'worker') onWorkerChange(value)
      if (scannerTarget === 'part') setPartNumber(value)
      setScannerTarget(null)
      setNotice(`${scannerTarget === 'worker' ? '作業者名' : '品番'}を読み取りました。`)
      setError('')
    },
    [onWorkerChange, scannerTarget],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!workerName) {
      setError('作業者QRを読み取ってください。')
      return
    }
    if (!partNumber) {
      setError('品番QRを読み取ってください。')
      return
    }
    if (!isPositiveIntegerInput(productionCount)) {
      setError('生産数は1以上の整数で入力してください。')
      return
    }

    const reportTimestamp = new Date().toISOString()
    setSaving(true)
    setGpsState('取得中')

    try {
      const position = await acquirePosition()
      setGpsState(position.acquired ? '取得済み' : '取得失敗（NA）')
      await addReport({
        report_id: crypto.randomUUID(),
        part_number: partNumber,
        worker_name: workerName,
        production_count: productionCount,
        timestamp: reportTimestamp,
        latitude: position.latitude,
        longitude: position.longitude,
        csv_status: '未処理',
        csv_handed_off_at: null,
      })
      setPartNumber('')
      setProductionCount('')
      setNotice(position.acquired ? '報告を保存しました。' : 'GPSをNAとして報告を保存しました。')
    } catch {
      setError('報告を保存できませんでした。もう一度お試しください。')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setPartNumber('')
    setProductionCount('')
    setGpsState('報告時に取得')
    setError('')
    setNotice('入力をクリアしました。作業者名は保持しています。')
  }

  return (
    <>
      <main className="screen report-screen">
        <div className="screen-heading">
          <div>
            <span className="eyebrow">生産入力</span>
            <h1>生産数を報告</h1>
          </div>
          <div className="count-badge" aria-label={`未処理 ${unprocessedCount}件`}>
            <span>未処理</span>
            <strong>{unprocessedCount}</strong>
          </div>
        </div>

        <div className="status-grid" aria-label="現在の状態">
          <StatusCard label="作業者" value={workerName || '未読取'} tone={workerName ? 'good' : 'warn'} />
          <StatusCard
            label="GPS"
            value={gpsState}
            tone={gpsState === '取得済み' ? 'good' : gpsState === '取得失敗（NA）' ? 'warn' : 'neutral'}
          />
        </div>

        <form className="entry-card" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label>作業者名</label>
            <button
              className={`scan-field ${workerName ? 'scan-field--filled' : ''}`}
              type="button"
              onClick={() => setScannerTarget('worker')}
            >
              <span className="scan-field__value">{workerName || '作業者QRを読み取る'}</span>
              <span className="qr-mark" aria-hidden="true">QR</span>
            </button>
            {workerName && <span className="field-help">タップすると作業者を変更できます</span>}
          </div>

          <div className="field-group">
            <label>品番</label>
            <button
              className={`scan-field ${partNumber ? 'scan-field--filled' : ''}`}
              type="button"
              onClick={() => setScannerTarget('part')}
            >
              <span className="scan-field__value">{partNumber || '品番QRを読み取る'}</span>
              <span className="qr-mark" aria-hidden="true">QR</span>
            </button>
          </div>

          <div className="field-group">
            <label htmlFor="production-count">生産数</label>
            <div className="number-input-wrap">
              <input
                id="production-count"
                type="text"
                inputMode="numeric"
                pattern="[1-9][0-9]*"
                autoComplete="off"
                placeholder="1"
                value={productionCount}
                onChange={(event) => {
                  const nextValue = event.target.value.replace(/[^0-9]/g, '')
                  setProductionCount(nextValue)
                }}
                aria-describedby="production-count-help"
              />
              <span>個</span>
            </div>
            <span id="production-count-help" className="field-help">1以上の整数（上限なし）</span>
          </div>

          {error && <div className="message message--error" role="alert">{error}</div>}
          {notice && <div className="message message--success" role="status">{notice}</div>}

          <div className="button-row">
            <button className="secondary-button" type="button" onClick={handleCancel} disabled={saving}>
              キャンセル
            </button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? '保存中…' : '報告する'}
            </button>
          </div>
        </form>
      </main>

      <Suspense fallback={null}>
        <QrScannerDialog
          target={scannerTarget}
          onRead={handleQrRead}
          onClose={() => setScannerTarget(null)}
        />
      </Suspense>
    </>
  )
}
