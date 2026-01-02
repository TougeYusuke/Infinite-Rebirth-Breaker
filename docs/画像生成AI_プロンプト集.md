# 画像生成AI プロンプト集

## 概要
「Infinite Rebirth Breaker」のキャラクター・UI要素を生成AIで作成するためのプロンプト集

---

## 1. れいあキャラクター（メインキャラ）

### 基本プロンプト
```
A cute female software engineer character named "Reia" (れいあ), 
anime style, chibi/cute design, 
wearing casual office clothes (hoodie or cardigan), 
sitting at a computer desk, 
surrounded by code and bugs floating around, 
bright and cheerful expression, 
pink/purple color scheme, 
high quality, detailed, 
white background or transparent background
```

### 表情バリエーション
- **平常心（Normal）**: `calm, relaxed expression, slight smile`
- **焦り（Anxious）**: `worried expression, sweat drop, slightly panicked`
- **パニック（Panic）**: `panicked expression, wide eyes, flustered`
- **集中（Focused）**: `determined expression, focused eyes, confident smile`

### アニメーション用（複数フレーム）
- **待機**: `sitting at desk, typing on keyboard, idle animation frame`
- **タップ時**: `jumping slightly, excited expression, hands raised`
- **覚醒モード**: `glowing aura, determined expression, power-up effect`

---

## 2. タスク（敵キャラクター）

### バグタスク
```
A cute bug character, 
chibi style, 
red color scheme, 
glitch effect around it, 
error symbols (X marks), 
floating in the air, 
white background or transparent background
```

### 仕様変更タスク
```
A cute document character with question marks, 
chibi style, 
blue color scheme, 
paper/document design, 
confused expression, 
floating in the air, 
white background or transparent background
```

### レビュータスク
```
A cute clipboard character, 
chibi style, 
green color scheme, 
checkmark symbols, 
professional look, 
floating in the air, 
white background or transparent background
```

### 緊急タスク
```
A cute urgent task character, 
chibi style, 
orange/red color scheme, 
exclamation marks, 
alarm clock or warning symbols, 
floating in the air, 
white background or transparent background
```

---

## 3. コード弾丸（攻撃エフェクト）

### 基本プロンプト
```
A code bullet, 
programming code symbols (brackets, semicolons, etc.), 
glowing blue/cyan color, 
trail effect, 
transparent background, 
simple design, 
game sprite style
```

### バリエーション
- **通常弾**: `simple code symbols, blue glow`
- **集中覚醒弾**: `brighter blue, more intense glow, code symbols more complex`
- **創造覚醒弾**: `multicolored, rainbow effect, creative code patterns`

---

## 4. UI要素

### ストレスバー
```
A horizontal progress bar, 
dark gray background, 
green to orange to red gradient fill, 
rounded corners, 
modern UI design, 
transparent background, 
simple and clean
```

### テンションゲージ
```
A horizontal progress bar, 
dark gray background, 
golden yellow fill with shine effect, 
rounded corners, 
modern UI design, 
transparent background, 
premium look
```

### ボタン
```
A game button, 
rounded rectangle, 
dark background, 
blue accent color, 
hover effect, 
modern UI design, 
transparent background
```

---

## 5. エフェクト

### 覚醒エフェクト
- **集中覚醒**: `cyan/blue glow effect, code particles, screen overlay, transparent background`
- **爆発覚醒**: `red/orange explosion effect, fire particles, screen flash, transparent background`
- **創造覚醒**: `yellow/golden sparkle effect, light particles, creative symbols, transparent background`

### ダメージポップアップ
```
A damage number popup, 
large bold numbers, 
white text with black outline, 
fade out effect, 
transparent background, 
game UI style
```

---

## 使用するAIツール推奨（無料）

### 完全無料ツール

1. **Bing Image Creator**（Microsoft）
   - URL: https://www.bing.com/images/create
   - DALL-E 3ベース、高品質
   - 無料、登録不要（Microsoftアカウント推奨）
   - 1日あたりの生成数に制限あり（通常15-100枚程度）
   - **推奨度: ⭐⭐⭐⭐⭐**

2. **Stable Diffusion（Hugging Face Spaces）**
   - URL: https://huggingface.co/spaces
   - 完全無料、オープンソース
   - ローカル実行も可能（GPU必要）
   - カスタマイズ可能
   - **推奨度: ⭐⭐⭐⭐**

3. **Craiyon**（旧DALL-E mini）
   - URL: https://www.craiyon.com/
   - 完全無料、登録不要
   - 品質は中程度だが、手軽に使える
   - **推奨度: ⭐⭐⭐**

### 無料プランあり

4. **Leonardo.ai**
   - URL: https://leonardo.ai/
   - 無料プラン: 1日150枚程度
   - ゲームアセット生成に特化
   - 高品質
   - **推奨度: ⭐⭐⭐⭐⭐**

5. **Playground AI**
   - URL: https://playgroundai.com/
   - 無料プラン: 1日500枚程度
   - Stable Diffusionベース
   - **推奨度: ⭐⭐⭐⭐**

### 推奨ワークフロー

1. **キャラクターデザイン**: Bing Image Creator または Leonardo.ai（無料プラン）
2. **UI要素・エフェクト**: Stable Diffusion（Hugging Face Spaces）
3. **バリエーション生成**: Playground AI（無料プラン）

---

## 画像サイズ・形式

- **キャラクター**: 512x512px または 1024x1024px, PNG（透明背景）
- **UI要素**: 256x256px または 512x512px, PNG（透明背景）
- **エフェクト**: 256x256px, PNG（透明背景）
- **BGM/SE**: MP3/OGG形式

---

## 注意事項

1. **ライセンス**: 生成AIの利用規約を確認（商用利用可能か）
2. **一貫性**: 同じスタイルで統一する（プロンプトに「same style as previous image」を追加）
3. **背景**: 透明背景（PNG）を指定
4. **色調**: ゲームのカラースキーム（ピンク/紫/青）に合わせる

