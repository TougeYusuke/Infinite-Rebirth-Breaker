# 開発知見メモ (Development Troubleshooting Notes)

このドキュメントは、プロジェクト開発中に遭遇したトラブル、その原因、および解決策をまとめたものです。
今後のブログ記事（技術解説、トラブルシューティング系）のネタ帳として活用してください。

## 1. GitHub Pages デプロイ時の 404 / MIME Type エラー

### 現象
GitHub Pages に Vite + TypeScript プロジェクトをデプロイした際、以下のエラーが発生して画面が真っ暗になる。
1. `GET https://[user].github.io/src/main.ts net::ERR_ABORTED 404 (Not Found)`
2. `Failed to load module script: ... responded with a MIME type of "video/mp2t".`

### 原因
1. **パスの問題:** `index.html` で `/src/main.ts` のようにルート絶対パスを指定していると、GitHub Pages のサブディレクトリ（リポジトリ名）以下にデプロイされた際にパスが合わなくなる。
2. **MIME Typeの誤認:** ブラウザが `.ts` ファイルを TypeScript ではなく MPEG-2 TS 動画ファイルとして認識してしまう（GitHub Pages の仕様）。
3. **ビルド設定の不一致:** 手動で `./src/main.ts` に書き換えても、Vite のビルドプロセスが期待するエントリポイントと一致せず、正しくバンドルされた JS ファイルへの参照に置換されない場合がある。

### 解決策
- **Vite Config:** `vite.config.ts` に `base: '/[repository-name]/'` を設定する。
- **index.html:** パスは `/src/main.ts` （Vite標準）のままにする。Vite がビルド時に `base` 設定に基づいて適切なパス（例: `/repo/assets/index.js`）に自動置換してくれる。
- **.nojekyll:** GitHub Pages の Jekyll 処理（`_`で始まるファイルの無視など）を回避するため、デプロイディレクトリ（`dist`）に `.nojekyll` ファイルを含める。
- **GitHub Pages設定:** リポジトリの「Settings」→「Pages」で、Branch を `gh-pages` / `/(root)` に設定する。`/(root)` を選択しないと、正しいパスでファイルが配信されない場合がある。

---

## 2. GitHub Actions からの Push 権限エラー

### 現象
GitHub Actions や外部ツール（Cursorなど）から `git push` しようとすると、以下のエラーで拒否される。
`! [remote rejected] main -> main (refusing to allow an OAuth App to create or update workflow .github/workflows/test.yml without workflow scope)`

### 原因
使用しているトークン（OAuth App Token）に `workflow` スコープ（GitHub Actions の設定ファイルを変更する権限）が付与されていないため。

### 解決策
- **Personal Access Token (PAT) の使用:** `workflow` 権限を持つ PAT を発行し、それを使用して認証する。
- **除外設定:** Workflow ファイル自体を変更する必要がない場合は、コミットから除外する。

---

## 3. Git Commit メッセージの文字化け

### 現象
Windows 環境（PowerShell等）から日本語のコミットメッセージを入力すると、Git ログ上で文字化けする。

### 原因
ターミナルの文字コード設定と Git の期待するエンコーディング（UTF-8）の不一致。

### 解決策
- **ファイル経由のコミット:** メッセージをテキストファイル（UTF-8）に保存し、`git commit -F message.txt` でコミットする。これによりエンコーディング問題を回避できる。
- **Git設定:** `i18n.commitEncoding` を `utf-8` に明示的に設定する（ただし環境依存が強い）。

---

## 4. Phaser 3 + break_infinity.js でのダメージ計算

### 現象
攻撃レベル（Attack Level）が 0 の状態でゲームを開始すると、ダメージ計算結果が 0 になり、画面をタップしても反応がないように見える。

### 原因
計算式が `base * level` の単純な乗算だったため、レベル0の初期状態でダメージが0になっていた。

### 解決策
- **ロジック修正:** 計算式内で `Math.max(1, attackLevel)` を使用し、レベルが 0 でも最低 1 として扱うように修正。
- **データ初期化:** セーブデータのロード時や新規作成時に、攻撃レベルの最小値を 1 に保証する。

---

## 5. Phaser 3 の UI レイアウト調整（モバイル対応）

### 現象
PC 画面では問題ないが、モバイル（スマホ）で見ると上部の UI（ステージ数、タイマーなど）が画面端に寄りすぎて見えにくい、またはノッチ（カメラ部分）に被る。

### 原因
`y: 0` や `x: 0` など、画面の絶対端を基準に配置していたため。

### 解決策
- **セーフエリアの考慮:** 上部に余白（パディング）を持たせる。
- **背景の追加:** 文字が見えやすいように半透明の黒背景（ヘッダーバー）を配置する。
- **レスポンシブ配置:** 画面幅 `this.cameras.main.width` を基準に計算して配置する（例: `width - 20`）。

