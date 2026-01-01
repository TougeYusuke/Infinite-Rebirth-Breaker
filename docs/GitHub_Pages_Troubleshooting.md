# GitHub Pages Deployment Troubleshooting Guide

## 問題の症状
- 初回アクセス時: `main.ts:1 Failed to load resource: the server responded with a status of 404 ()`
- リロード時: `GET https://tougeyusuke.github.io/src/main.ts net::ERR_ABORTED 404 (Not Found)`

## 確認手順

### 1. GitHub Pagesで実際に配信されているindex.htmlを確認

ブラウザの開発者ツール（F12）で以下を実行してください：

```javascript
// コンソールで実行
fetch('https://tougeyusuke.github.io/Infinite-Rebirth-Breaker/index.html')
  .then(r => r.text())
  .then(html => {
    console.log('=== GitHub Pagesで配信されているindex.html ===');
    console.log(html);
    // scriptタグを抽出
    const scriptMatch = html.match(/<script[^>]*src="([^"]+)"/);
    if (scriptMatch) {
      console.log('スクリプトパス:', scriptMatch[1]);
    } else {
      console.log('スクリプトタグが見つかりません');
    }
  });
```

**期待される結果:**
- スクリプトパスが `/Infinite-Rebirth-Breaker/assets/index-*.js` の形式であること

**もし `/src/main.ts` が表示される場合:**
- GitHub Pages上で古い `index.html` が配信されている
- デプロイが正しく完了していない可能性

### 2. GitHub Actionsのログを確認

1. GitHubリポジトリの「Actions」タブを開く
2. 最新の「Deploy to GitHub Pages」ワークフローを開く
3. 「Build」ステップのログを確認
   - `dist/index.html` の内容が正しく生成されているか
   - スクリプトパスが `/Infinite-Rebirth-Breaker/assets/index-*.js` になっているか
4. 「Deploy to GitHub Pages」ステップのログを確認
   - デプロイが正常に完了しているか
   - エラーがないか

### 3. gh-pagesブランチの内容を確認

GitHubリポジトリで以下を確認：
1. ブランチを `gh-pages` に切り替え
2. `index.html` を開いて内容を確認
   - スクリプトパスが `/Infinite-Rebirth-Breaker/assets/index-*.js` になっているか

### 4. GitHub Pagesの設定を確認（重要）

1. リポジトリの「Settings」→「Pages」を開く
2. 以下を確認：
   - **Source:** 「Deploy from a branch」が選択されている
   - **Branch:** `gh-pages` / `/(root)` が選択されている（**重要:** `/` の後に `(root)` が表示されていることを確認）
   - **Custom domain:** 設定されていない（または正しく設定されている）

**解決方法:**
- 「Branch」のドロップダウンで `gh-pages` を選択した後、その右側のドロップダウンで `/(root)` を選択する必要があります。
- これにより、`gh-pages` ブランチのルートディレクトリからファイルが配信されるようになります。
- この設定が正しくないと、`/src/main.ts` のような古いパスが参照され、404エラーが発生します。

### 5. キャッシュのクリア

GitHub PagesのCDNキャッシュをクリアする方法：
1. リポジトリの「Settings」→「Pages」を開く
2. 「Source」を一時的に変更（例: 「None」に変更）
3. 「Save」をクリック
4. 再度「Deploy from a branch」→「gh-pages」に戻す
5. 「Save」をクリック

これにより、GitHub Pagesのキャッシュがクリアされ、最新の内容が配信されるようになります。

## トラブルシューティング

### 問題: デプロイが完了しない

**確認事項:**
- GitHub Actionsのワークフローが実行されているか
- ワークフローにエラーがないか
- `gh-pages` ブランチが更新されているか

**解決策:**
- ワークフローを手動で再実行（「Actions」タブから「Re-run jobs」）

### 問題: gh-pagesブランチの内容が古い

**解決策:**
- `force_orphan: true` オプションがデプロイワークフローに追加されているか確認
- 必要に応じて、`gh-pages` ブランチを手動で削除して再デプロイ

### 問題: ビルド後のindex.htmlが正しくない

**確認事項:**
- `vite.config.ts` の `base` 設定が `/Infinite-Rebirth-Breaker/` になっているか
- ローカルで `npm run build` を実行し、`dist/index.html` の内容を確認

**解決策:**
- `vite.config.ts` の `base` 設定を確認・修正
- 再度ビルドしてデプロイ

