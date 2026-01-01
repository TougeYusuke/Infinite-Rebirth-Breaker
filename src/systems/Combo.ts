/**
 * Combo - コンボシステム
 * 
 * コンボゲージとコンボ倍率を管理
 */

import { DecimalWrapper } from '../utils/Decimal';

/**
 * コンボシステム
 * 
 * 敵を倒すごとにコンボゲージが上昇し、倍率がかかる
 * 倍率: 1 + (combo * 0.1)（最大10倍）
 */
export class Combo {
  private comboCount: number = 0;
  private maxCombo: number = 90; // 最大90コンボ（10倍に到達）

  /**
   * コンストラクタ
   * 
   * @param initialCombo - 初期コンボ数（デフォルト: 0）
   */
  constructor(initialCombo: number = 0) {
    this.comboCount = Math.max(0, initialCombo);
  }

  /**
   * コンボを追加
   * 
   * @param amount - 追加するコンボ数（デフォルト: 1）
   */
  addCombo(amount: number = 1): void {
    this.comboCount = Math.min(this.maxCombo, this.comboCount + amount);
  }

  /**
   * コンボをリセット
   */
  resetCombo(): void {
    this.comboCount = 0;
  }

  /**
   * 現在のコンボ数を取得
   * 
   * @returns 現在のコンボ数
   */
  getComboCount(): number {
    return this.comboCount;
  }

  /**
   * コンボ倍率を取得
   * 
   * 計算式: 1 + (combo * 0.1)（最大10倍）
   * 
   * @returns コンボ倍率（1.0 〜 10.0）
   */
  getComboMultiplier(): number {
    return DecimalWrapper.calculateComboMultiplier(this.comboCount);
  }

  /**
   * 最大コンボ数に達しているか
   * 
   * @returns true の場合、最大コンボ数に達している
   */
  isMaxCombo(): boolean {
    return this.comboCount >= this.maxCombo;
  }

  /**
   * コンボの割合を取得（0.0 〜 1.0）
   * 
   * @returns コンボの割合
   */
  getComboRatio(): number {
    if (this.maxCombo <= 0) {
      return 0;
    }
    
    return Math.min(1, this.comboCount / this.maxCombo);
  }

  /**
   * 最大コンボ数を設定
   * 
   * @param maxCombo - 最大コンボ数
   */
  setMaxCombo(maxCombo: number): void {
    this.maxCombo = Math.max(1, maxCombo);
    
    // 現在のコンボ数が最大を超えている場合は調整
    if (this.comboCount > this.maxCombo) {
      this.comboCount = this.maxCombo;
    }
  }

  /**
   * 最大コンボ数を取得
   * 
   * @returns 最大コンボ数
   */
  getMaxCombo(): number {
    return this.maxCombo;
  }
}

