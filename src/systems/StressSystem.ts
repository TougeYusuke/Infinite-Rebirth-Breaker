/**
 * StressSystem - ストレスシステム
 * 
 * れいあのストレスを管理し、感情状態を決定する
 */

import { EmotionState } from '../entities/Reia';

/**
 * ストレスシステムの設定
 */
export interface StressSystemConfig {
  maxStress: number;        // 最大ストレス値（デフォルト: 100）
  stressDecayRate: number;  // ストレス減少率（タスクを倒した時）
  stressIncreaseBase: number; // 基本ストレス増加値
}

/**
 * ストレスシステム
 */
export class StressSystem {
  private stress: number = 0;
  private maxStress: number = 100;
  private stressDecayRate: number = 10; // タスクを倒すと10減る
  private stressIncreaseBase: number = 1.0;

  constructor(config?: Partial<StressSystemConfig>) {
    this.maxStress = config?.maxStress || 100;
    this.stressDecayRate = config?.stressDecayRate || 10;
    this.stressIncreaseBase = config?.stressIncreaseBase || 1.0;
  }

  /**
   * ストレスを増加させる
   * 
   * @param distance - タスクとの距離（近いほどストレスが増える）
   * @param taskType - タスクの種類（緊急タスク > 仕様変更 > バグ）
   */
  increaseStress(distance: number, taskType: 'bug' | 'feature' | 'review' | 'urgent'): void {
    // 距離に応じた係数（近いほど大きい）
    const distanceFactor = Math.max(0.1, 1.0 / (distance / 100 + 1));
    
    // タスクの種類に応じた係数
    const taskTypeFactor = {
      bug: 0.8,
      feature: 1.2,
      review: 1.0,
      urgent: 1.5,
    }[taskType];

    // ストレス増加
    const increase = this.stressIncreaseBase * distanceFactor * taskTypeFactor;
    this.stress = Math.min(this.maxStress, this.stress + increase);
  }

  /**
   * ストレスを減少させる（タスクを倒した時）
   * 
   * @param comboCount - 現在のコンボ数（コンボが続くと減りやすい）
   */
  decreaseStress(comboCount: number = 0): void {
    // コンボが続くと減りやすい
    const comboBonus = 1 + (comboCount * 0.1); // 最大2倍
    const decrease = this.stressDecayRate * comboBonus;
    this.stress = Math.max(0, this.stress - decrease);
  }

  /**
   * ストレスを取得（0-100の値）
   */
  getStress(): number {
    return this.stress;
  }

  /**
   * ストレスレベルを取得（0-1の値）
   */
  getStressLevel(): number {
    return this.stress / this.maxStress;
  }

  /**
   * 感情状態を取得
   */
  getEmotionState(comboCount: number): EmotionState {
    // コンボ中でストレスが低い場合は「集中」
    if (comboCount >= 5 && this.stress < 30) {
      return EmotionState.FOCUSED;
    }

    // ストレスレベルに応じて感情状態を決定
    if (this.stress <= 30) {
      return EmotionState.NORMAL;
    } else if (this.stress <= 70) {
      return EmotionState.ANXIOUS;
    } else {
      return EmotionState.PANIC;
    }
  }

  /**
   * ストレスをリセット（覚醒モード発動時など）
   */
  reset(): void {
    this.stress = 0;
  }

  /**
   * ストレスを設定（デバッグ用）
   */
  setStress(stress: number): void {
    this.stress = Math.max(0, Math.min(this.maxStress, stress));
  }
}

