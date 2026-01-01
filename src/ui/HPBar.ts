/**
 * HPBar - HPバーUIコンポーネント
 * 
 * 敵のHPを表示するバー
 */

import Phaser from 'phaser';

/**
 * HPバーの設定
 */
export interface HPBarConfig {
  x: number;           // X座標
  y: number;           // Y座標
  width: number;       // バーの幅
  height: number;      // バーの高さ
}

/**
 * HPバークラス
 * 
 * PhaserのGraphicsオブジェクトを使用してHPバーを描画
 */
export class HPBar {
  private backgroundBar: Phaser.GameObjects.Graphics;
  private healthBar: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private currentRatio: number = 1.0;

  /**
   * コンストラクタ
   * 
   * @param scene - Phaserシーン
   * @param config - HPバーの設定
   */
  constructor(scene: Phaser.Scene, config: HPBarConfig) {
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    
    // 背景バー（黒）
    this.backgroundBar = scene.add.graphics();
    this.backgroundBar.fillStyle(0x000000, 1);
    this.backgroundBar.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    
    // HPバー（赤→緑のグラデーション）
    this.healthBar = scene.add.graphics();
    this.updateHP(1.0); // 初期状態は100%
  }

  /**
   * HPの割合を更新
   * 
   * @param ratio - HPの割合（0.0 〜 1.0）
   */
  updateHP(ratio: number): void {
    // 0.0 〜 1.0 の範囲に制限
    this.currentRatio = Math.max(0, Math.min(1, ratio));
    
    // 既存のバーをクリア
    this.healthBar.clear();
    
    // バーの幅を計算
    const barWidth = this.width * this.currentRatio;
    
    // 色を決定（HPが低いほど赤、高いほど緑）
    const color = this.getColorForRatio(this.currentRatio);
    
    // HPバーを描画
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      barWidth,
      this.height
    );
  }

  /**
   * HPの割合に応じた色を取得
   * 
   * @param ratio - HPの割合（0.0 〜 1.0）
   * @returns 色コード
   */
  private getColorForRatio(ratio: number): number {
    if (ratio > 0.5) {
      // 50%以上: 緑から黄色へのグラデーション
      const greenRatio = (ratio - 0.5) * 2; // 0.5 → 1.0 を 0.0 → 1.0 に変換
      const r = Math.floor(255 * (1 - greenRatio));
      const g = 255;
      const b = 0;
      return (r << 16) | (g << 8) | b;
    } else {
      // 50%未満: 黄色から赤へのグラデーション
      const redRatio = ratio * 2; // 0.0 → 0.5 を 0.0 → 1.0 に変換
      const r = 255;
      const g = Math.floor(255 * redRatio);
      const b = 0;
      return (r << 16) | (g << 8) | b;
    }
  }

  /**
   * HPバーの位置を更新
   * 
   * @param x - 新しいX座標
   * @param y - 新しいY座標
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    
    // バーを再描画
    this.updateHP(this.currentRatio);
  }

  /**
   * HPバーを破棄
   */
  destroy(): void {
    if (this.backgroundBar) {
      this.backgroundBar.destroy();
    }
    
    if (this.healthBar) {
      this.healthBar.destroy();
    }
  }

  /**
   * 現在のHP割合を取得
   * 
   * @returns HPの割合（0.0 〜 1.0）
   */
  getCurrentRatio(): number {
    return this.currentRatio;
  }
}

