import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, markReportsHandedOff } from '../db'
import { createCsvFile, formatDisplayTimestamp } from '../report-utils'
import { isValidEmail } from '../settings'

interface DataListScreenProps {
  recipientEmail: string
  onOpenSettings: () => void
}

export function DataListScreen({ recipientEmail, onOpenSettings }: DataListScreenProps) {
  const reports = useLiveQuery(() => db.reports.orderBy('timestamp').reverse().toArray(), [])
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const unprocessed = useMemo(
    () => reports?.filter((report) => report.csv_status === '未処理') ?? [],
    [reports],
  )

  async function handleMailSend() {
    setMessage('')
    setError('')

    if (!isValidEmail(recipientEmail)) {
      setError('メール送信先を設定してください。')
      onOpenSettings()
      return
    }
    if (unprocessed.length === 0) {
      setError('メール送信対象の未処理データがありません。')
      return
    }

    const file = createCsvFile(unprocessed)
    const shareData: ShareData = {
      title: '生産数報告CSV',
      text: `送信先: ${recipientEmail}`,
      files: [file],
    }

    if (!navigator.share || (navigator.canShare && !navigator.canShare({ files: [file] }))) {
      setError('この環境ではCSV添付メールを起動できません。iPhoneのSafariでお試しください。')
      return
    }

    setSending(true)
    try {
      await navigator.share(shareData)
      const handedOffAt = new Date().toISOString()
      await markReportsHandedOff(
        unprocessed.map((report) => report.report_id),
        handedOffAt,
      )
      setMessage(`${unprocessed.length}件のCSVを共有先へ引き渡しました。`)
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') {
        setMessage('メール送信操作をキャンセルしました。データは未処理のままです。')
      } else {
        setError('CSVをメールアプリへ引き渡せませんでした。もう一度お試しください。')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="screen list-screen">
      <div className="screen-heading list-heading">
        <div>
          <span className="eyebrow">保存データ</span>
          <h1>生産報告一覧</h1>
        </div>
        <button className="settings-link" type="button" onClick={onOpenSettings}>
          送信先設定
        </button>
      </div>

      <section className="mail-panel" aria-labelledby="mail-panel-title">
        <div>
          <span className="eyebrow" id="mail-panel-title">CSVメール送信</span>
          <strong className="mail-count">未処理 {unprocessed.length}件</strong>
          <p>送信先：{recipientEmail || '未設定'}</p>
          <small>「メール送信」後、共有シートでメールアプリを選択してください。</small>
        </div>
        <button
          className="primary-button mail-button"
          type="button"
          onClick={handleMailSend}
          disabled={sending || unprocessed.length === 0}
        >
          {sending ? '処理中…' : 'メール送信'}
        </button>
      </section>

      {error && <div className="message message--error" role="alert">{error}</div>}
      {message && <div className="message message--success" role="status">{message}</div>}

      <section className="report-list" aria-label="生産報告データ">
        {reports === undefined && <div className="empty-state">データを読み込んでいます…</div>}
        {reports?.length === 0 && (
          <div className="empty-state">
            <strong>報告データはありません</strong>
            <span>生産入力画面から報告してください。</span>
          </div>
        )}
        {reports?.map((report) => (
          <article className="report-card" key={report.report_id}>
            <div className="report-card__top">
              <div>
                <span className="report-card__label">品番</span>
                <strong className="report-card__part">{report.part_number}</strong>
              </div>
              <span className={`status-pill ${report.csv_status === '未処理' ? 'status-pill--pending' : ''}`}>
                {report.csv_status}
              </span>
            </div>
            <div className="report-card__details">
              <div><span>作業者</span><strong>{report.worker_name}</strong></div>
              <div><span>生産数</span><strong>{report.production_count}個</strong></div>
              <div><span>報告日時</span><strong>{formatDisplayTimestamp(report.timestamp)}</strong></div>
              <div>
                <span>GPS</span>
                <strong>
                  {report.latitude === 'NA' ? 'NA' : `${report.latitude.toFixed(6)}, ${Number(report.longitude).toFixed(6)}`}
                </strong>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
