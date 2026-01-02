/**
 * AwakeningSystem - 覚醒モードシステム
 * 
 * 3種類の覚醒モードを管理する
 */

import { TaskType } from '../entities/Task';

/**
 * 覚醒モードの種類
 */
export enum AwakeningType {
  FOCUS = 'focus',       // 集中覚醒（コンボ型）
  BURST = 'burst',       // 爆発覚醒（ストレス型）
  CREATIVE = 'creative', // 創造覚醒（戦略型）
}

/**
 * 覚醒モードの状態
 */
export interface AwakeningState {
  type: AwakeningType | null;
  remainingTime: number; // 残り時間（ミリ秒）
  isActive: boolean;
}

/**
 * テンションゲージの設定
 */
export interface TensionGaugeConfig {
  maxTension: number;    // 最大テンション値（デフォルト: 100）
  baseGain: number;      // 基本獲得量（タスクを倒した時）
  lowStressBonus: number; // ストレスが低い時のボーナス倍率
  comboBonusRate: number; // コンボによる加速率
}

/**
 * 覚醒モードシステム
 */
export class AwakeningSystem {
  private tensionGauge: number = 0;
  private maxTension: number = 100;
  private baseGain: number = 5;
  private lowStressBonus: number = 1.5;
  private comboBonusRate: number = 0.1;
  
  private currentAwakening: AwakeningState = {
    type: null,
    remainingTime: 0,
    isActive: false,
  };
  
  // 創造覚醒用: 連続で倒したタスクの種類を記録
  private consecutiveTaskTypes: TaskType[] = [];
  private requiredConsecutiveCount = 5; // 5連続で倒すと発動

  constructor(config?: Partial<TensionGaugeConfig>) {
    this.maxTension = config?.maxTension || 100;
    this.baseGain = config?.baseGain || 5;
    this.lowStressBonus = config?.lowStressBonus || 1.5;
    this.comboBonusRate = config?.comboBonusRate || 0.1;
  }

  /**
   * タスクを倒した時のテンションゲージ増加
   */
  onTaskDefeated(stressLevel: number, comboCount: number): void {
    // 基本獲得量
    let gain = this.baseGain;
    
    // ストレスが低い時のボーナス（ストレス30%以下）
    if (stressLevel <= 0.3) {
      gain *= this.lowStressBonus;
    }
    
    // コンボによる加速（コンボ数に応じて増加）
    const comboBonus = 1 + (comboCount * this.comboBonusRate);
    gain *= comboBonus;
    
    // テンションゲージを増加
    this.tensionGauge = Math.min(this.maxTension, this.tensionGauge + gain);
  }

  /**
   * 集中覚醒をチェック（コンボ型）
   */
  checkFocusAwakening(comboCount: number): boolean {
    if (this.currentAwakening.isActive) {
      return false; // 既に覚醒中
    }
    
    // コンボが10以上で発動
    if (comboCount >= 10) {
      this.activateAwakening(AwakeningType.FOCUS, 10000); // 10秒
      return true;
    }
    
    return false;
  }

  /**
   * 爆発覚醒をチェック（ストレス型）
   */
  checkBurstAwakening(stressLevel: number): boolean {
    if (this.currentAwakening.isActive) {
      return false; // 既に覚醒中
    }
    
    // ストレスがMAX（100%）で発動
    if (stressLevel >= 1.0) {
      this.activateAwakening(AwakeningType.BURST, 0); // 1回のみ（持続時間なし）
      return true;
    }
    
    return false;
  }

  /**
   * 創造覚醒をチェック（戦略型）
   */
  checkCreativeAwakening(taskType: TaskType): boolean {
    if (this.currentAwakening.isActive) {
      return false; // 既に覚醒中
    }
    
    // 連続記録を更新
    this.consecutiveTaskTypes.push(taskType);
    
    // 最後のN個が同じ種類かチェック
    if (this.consecutiveTaskTypes.length >= this.requiredConsecutiveCount) {
      const lastN = this.consecutiveTaskTypes.slice(-this.requiredConsecutiveCount);
      const allSame = lastN.every(t => t === taskType);
      
      if (allSame) {
        this.activateAwakening(AwakeningType.CREATIVE, 15000); // 15秒
        this.consecutiveTaskTypes = []; // リセット
        return true;
      }
    }
    
    return false;
  }

  /**
   * 覚醒モードを発動
   */
  private activateAwakening(type: AwakeningType, duration: number): void {
    this.currentAwakening = {
      type: type,
      remainingTime: duration,
      isActive: true,
    };
  }

  /**
   * 更新処理（毎フレーム呼び出す）
   */
  update(deltaTime: number): void {
    if (this.currentAwakening.isActive) {
      // 爆発覚醒は持続時間なし（1回のみ）
      if (this.currentAwakening.type === AwakeningType.BURST) {
        // 次のフレームで自動的に終了
        this.currentAwakening.isActive = false;
        this.currentAwakening.type = null;
        return;
      }
      
      // 残り時間を減らす
      this.currentAwakening.remainingTime -= deltaTime;
      
      if (this.currentAwakening.remainingTime <= 0) {
        // 覚醒モードが終了
        this.currentAwakening.isActive = false;
        this.currentAwakening.type = null;
        this.currentAwakening.remainingTime = 0;
      }
    }
  }

  /**
   * テンションゲージを取得（0-1の値）
   */
  getTensionLevel(): number {
    return this.tensionGauge / this.maxTension;
  }

  /**
   * テンションゲージを取得（0-100の値）
   */
  getTension(): number {
    return this.tensionGauge;
  }

  /**
   * 現在の覚醒モードを取得
   */
  getCurrentAwakening(): AwakeningState {
    return { ...this.currentAwakening };
  }

  /**
   * 覚醒モードがアクティブかどうか
   */
  isAwakeningActive(): boolean {
    return this.currentAwakening.isActive;
  }

  /**
   * 覚醒モードの種類を取得
   */
  getAwakeningType(): AwakeningType | null {
    return this.currentAwakening.type;
  }

  /**
   * 覚醒モードを終了（手動で終了する場合）
   */
  deactivateAwakening(): void {
    this.currentAwakening.isActive = false;
    this.currentAwakening.type = null;
    this.currentAwakening.remainingTime = 0;
  }

  /**
   * リセット（ゲームオーバー時など）
   */
  reset(): void {
    this.tensionGauge = 0;
    this.currentAwakening = {
      type: null,
      remainingTime: 0,
      isActive: false,
    };
    this.consecutiveTaskTypes = [];
  }
}

