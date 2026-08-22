# iPhone向け 生産数報告PWA

QRコードで作業者名と品番を読み取り、生産数・GPS・タイムスタンプを端末内へ保存するモックアップです。未処理データ全件からCSVを生成し、iPhoneの共有シートを経由してメールアプリへ添付します。

## 開発環境

- React + TypeScript + Vite
- Dexie.js / IndexedDB
- ZXing Browser
- vite-plugin-pwa

## ローカル実行

```powershell
npm install
npm run dev
```

## 検証

```powershell
npm test
npm run build
```

## iPhone実機確認

カメラ、GPS、Service Worker、Web Share APIを使用するため、iPhoneではHTTPSで公開したURLをSafariから開きます。ホーム画面へ追加後も、作業者名はPWAの再起動時にリセットされます。報告データとメール送信先設定は端末内へ保存されます。

CSVを共有先へ正常に引き渡した時点で対象データを「CSV引渡し済み」にします。実際のメール送信完了はPWAから確認しません。
