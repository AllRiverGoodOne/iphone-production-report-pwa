import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { DataListScreen } from './components/DataListScreen'
import { ReportScreen } from './components/ReportScreen'
import { SettingsScreen } from './components/SettingsScreen'
import { db } from './db'
import { loadRecipientEmail, saveRecipientEmail } from './settings'
import type { Screen } from './types'

export default function App() {
  const [screen, setScreen] = useState<Screen>('report')
  const [previousScreen, setPreviousScreen] = useState<Exclude<Screen, 'settings'>>('list')
  const [workerName, setWorkerName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState(loadRecipientEmail)
  const unprocessedCount = useLiveQuery(() => db.reports.where('csv_status').equals('未処理').count(), []) ?? 0

  function navigate(nextScreen: Screen) {
    if (nextScreen === 'settings' && screen !== 'settings') {
      setPreviousScreen(screen)
    }
    setScreen(nextScreen)
  }

  function handleSaveEmail(email: string) {
    saveRecipientEmail(email)
    setRecipientEmail(email)
    setScreen(previousScreen)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">生</div>
        <div>
          <strong>生産数報告</strong>
          <span>iPhone PWA</span>
        </div>
      </header>

      {screen === 'report' && (
        <ReportScreen
          workerName={workerName}
          onWorkerChange={setWorkerName}
          unprocessedCount={unprocessedCount}
        />
      )}
      {screen === 'list' && (
        <DataListScreen
          recipientEmail={recipientEmail}
          onOpenSettings={() => navigate('settings')}
        />
      )}
      {screen === 'settings' && (
        <SettingsScreen
          recipientEmail={recipientEmail}
          onSave={handleSaveEmail}
          onCancel={() => setScreen(previousScreen)}
        />
      )}

      <nav className="bottom-nav" aria-label="メインメニュー">
        <button
          type="button"
          className={screen === 'report' ? 'is-active' : ''}
          onClick={() => navigate('report')}
          aria-current={screen === 'report' ? 'page' : undefined}
        >
          <span aria-hidden="true">＋</span>
          生産入力
        </button>
        <button
          type="button"
          className={screen === 'list' ? 'is-active' : ''}
          onClick={() => navigate('list')}
          aria-current={screen === 'list' ? 'page' : undefined}
        >
          <span aria-hidden="true">≡</span>
          データ一覧
          {unprocessedCount > 0 && <em>{unprocessedCount}</em>}
        </button>
        <button
          type="button"
          className={screen === 'settings' ? 'is-active' : ''}
          onClick={() => navigate('settings')}
          aria-current={screen === 'settings' ? 'page' : undefined}
        >
          <span aria-hidden="true">⚙</span>
          設定
        </button>
      </nav>
    </div>
  )
}
