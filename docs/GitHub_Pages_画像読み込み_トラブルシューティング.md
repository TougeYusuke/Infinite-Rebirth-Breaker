# GitHub Pages 画像読み込み トラブルシューティング

## 問題
GitHub Pagesでデプロイした際に、画像が読み込まれない。

## 原因
1. **画像ファイルがGitにコミットされていない**
   - 解決: `git add public/assets/images/tasks/*.png` で追加
   
2. **パスの問題**
   - Viteの`base: '/Infinite-Rebirth-Breaker/'`設定により、GitHub Pagesではサブパスで配信される
   - Phaserの`load.image`で相対パスを指定している場合、正しく解決されない可能性がある

## 解決策

### 方法1: 絶対パスを使用（推奨）
`BootScene.ts`で画像パスを絶対パスに変更：

```typescript
// 変更前（相対パス）
this.load.image('task_bug', 'assets/images/tasks/task_bug.png');

// 変更後（絶対パス）
this.load.image('task_bug', '/Infinite-Rebirth-Breaker/assets/images/tasks/task_bug.png');
```

### 方法2: Viteの環境変数を使用
`import.meta.env.BASE_URL`を使用して動的にパスを解決：

```typescript
const baseUrl = import.meta.env.BASE_URL; // '/Infinite-Rebirth-Breaker/'
this.load.image('task_bug', `${baseUrl}assets/images/tasks/task_bug.png`);
```

### 方法3: 画像を`src/assets`に配置してimport
Viteのアセット処理を使用（ただし、Phaserの`load.image`では直接使用できないため、事前に読み込む必要がある）

## 確認方法

1. **GitHub Actionsのビルドログを確認**
   - `dist/assets/images/tasks/`に画像がコピーされているか確認

2. **GitHub PagesのURLを直接確認**
   - `https://tougeyusuke.github.io/Infinite-Rebirth-Breaker/assets/images/tasks/task_bug.png`
   - このURLで画像が表示されるか確認

3. **ブラウザの開発者ツールで確認**
   - Networkタブで画像のリクエストを確認
   - 404エラーが出ていないか確認

## 現在の実装
- 画像ファイルは`public/assets/images/tasks/`に配置
- Viteのビルド時に`dist/assets/images/tasks/`にコピーされる
- Phaserの`load.image`で相対パス`assets/images/tasks/task_bug.png`を指定

## 推奨対応
絶対パス（`/Infinite-Rebirth-Breaker/assets/images/tasks/task_bug.png`）に変更することを推奨します。

