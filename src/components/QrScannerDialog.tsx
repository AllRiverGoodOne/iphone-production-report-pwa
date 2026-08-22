import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'
import { useEffect, useRef, useState } from 'react'
import type { QrTarget } from '../types'

interface QrScannerDialogProps {
  target: QrTarget | null
  onRead: (value: string) => void
  onClose: () => void
}

export function QrScannerDialog({ target, onRead, onClose }: QrScannerDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const completedRef = useRef(false)
  const [message, setMessage] = useState('カメラを起動しています…')

  useEffect(() => {
    if (!target || !videoRef.current) return

    let disposed = false
    completedRef.current = false
    const reader = new BrowserQRCodeReader()

    if (!window.isSecureContext) {
      setMessage('カメラを使用するにはHTTPSで開いてください。')
      return
    }

    void reader
      .decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
          },
        },
        videoRef.current,
        (result, error, controls) => {
          if (disposed) return
          controlsRef.current = controls
          setMessage('QRコードを枠内に入れてください')

          if (result && !completedRef.current) {
            completedRef.current = true
            controls.stop()
            onRead(result.getText().trim())
          } else if (error && error.name !== 'NotFoundException') {
            setMessage('QRコードを読み取れません。カメラをQRへ向けてください。')
          }
        },
      )
      .then((controls) => {
        if (disposed) {
          controls.stop()
          return
        }
        controlsRef.current = controls
      })
      .catch(() => {
        if (!disposed) setMessage('カメラを起動できません。Safariのカメラ許可を確認してください。')
      })

    return () => {
      disposed = true
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [onRead, target])

  if (!target) return null

  const label = target === 'worker' ? '作業者QR' : '品番QR'

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="scanner-dialog" role="dialog" aria-modal="true" aria-label={`${label}読取`}>
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">QRコード読取</span>
            <h2>{label}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="QR読取を閉じる">
            ×
          </button>
        </div>
        <div className="camera-frame">
          <video ref={videoRef} muted playsInline />
          <div className="scan-guide" aria-hidden="true" />
        </div>
        <p className="scanner-message" aria-live="polite">{message}</p>
        <button className="secondary-button full-width" type="button" onClick={onClose}>
          キャンセル
        </button>
      </section>
    </div>
  )
}
