# Infinite Rebirth Breaker

無限にインフレする数値を楽しみながら、周回プレイ（転生）を繰り返して強くなるブラウザRPG（クリッカー/放置系）。

## 🎮 プロジェクト概要

プレイヤーは「圧倒的な力で序盤を蹂躙する爽快感」と「どこから再開するか（効率か報酬か）の戦略性」を楽しむゲームです。

## 🛠️ 技術スタック

- **言語:** TypeScript
- **ビルドツール:** Vite
- **ゲームエンジン:** Phaser 3
- **数値計算:** break_infinity.js (Decimal型)
- **テストフレームワーク:** Vitest

## 📦 セットアップ

### 必要な環境

- Node.js 18以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install
```

### 開発サーバーの起動

```bash
# 開発サーバーを起動（http://localhost:3000）
npm run dev
```

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## 🧪 テスト

```bash
# テストの実行
npm test

# ウォッチモードでテスト実行
npm run test:watch

# テストUIを開く
npm run test:ui

# カバレッジレポートを生成
npm run test:coverage
```

## 📁 プロジェクト構造

```
Infinite Rebirth Breaker/
├── src/
│   ├── core/              # コアゲームロジック
│   ├── systems/           # ゲームシステム
│   ├── utils/             # ユーティリティ
│   ├── scenes/            # Phaserシーン
│   ├── ui/                # UIコンポーネント
│   ├── types/             # 型定義
│   └── main.ts            # エントリーポイント
├── tests/                 # テストファイル
├── public/                # 静的ファイル
└── docs/                  # ドキュメント
```

詳細は `実装ベース仕様書.md` を参照してください。

## 🎯 開発フェーズ

現在: **Phase 2: コアシステム実装** ✅ 完了

**全体進捗:** 29% (2/7フェーズ完了)

詳細な進捗状況は [進捗状況ダッシュボード](./docs/進捗状況.md) を参照してください。

## 📊 進捗状況

- [進捗状況ダッシュボード](./docs/進捗状況.md) - クイックビュー
- [タスクリスト](./docs/タスクリスト.md) - 詳細なタスク一覧
- [実装ベース仕様書](../../my_mind/50_Projects/Infinite Rebirth Breaker/実装ベース仕様書.md) - 詳細な仕様（Obsidian側）

## 📝 ライセンス

ISC

## 🔗 参考資料

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [break_infinity.js Documentation](https://github.com/Patashu/break_infinity.js)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

