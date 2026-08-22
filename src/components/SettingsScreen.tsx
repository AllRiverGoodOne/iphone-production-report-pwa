import { useEffect, useState, type FormEvent } from 'react'
import { isValidEmail } from '../settings'

interface SettingsScreenProps {
  recipientEmail: string
  onSave: (email: string) => void
  onCancel: () => void
}

export function SettingsScreen({ recipientEmail, onSave, onCancel }: SettingsScreenProps) {
  const [email, setEmail] = useState(recipientEmail)
  const [error, setError] = useState('')

  useEffect(() => setEmail(recipientEmail), [recipientEmail])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = email.trim()
    if (!isValidEmail(normalized)) {
      setError('正しいメールアドレスを入力してください。')
      return
    }
    setError('')
    onSave(normalized)
  }

  return (
    <main className="screen settings-screen">
      <div className="screen-heading">
        <div>
          <span className="eyebrow">端末内設定</span>
          <h1>メール送信先</h1>
        </div>
      </div>

      <form className="settings-card" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="recipient-email">送信先メールアドレス</label>
          <input
            id="recipient-email"
            className="text-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@company.jp"
          />
          <span className="field-help">このiPhone内に保存します。</span>
        </div>

        <div className="info-note">
          <strong>メール送信時の確認</strong>
          <p>共有シートでメールアプリを選択し、この送信先を確認してから送信してください。</p>
        </div>

        {error && <div className="message message--error" role="alert">{error}</div>}

        <div className="button-row">
          <button className="secondary-button" type="button" onClick={onCancel}>キャンセル</button>
          <button className="primary-button" type="submit">保存する</button>
        </div>
      </form>
    </main>
  )
}
