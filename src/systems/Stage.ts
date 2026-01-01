/**
 * Stage - ステージ進行システム
 * 
 * ステージの進行と敵の生成を管理
 */

import { Enemy, EnemyConfig } from '../core/Enemy';

/**
 * ステージ設定
 */
export interface StageConfig {
  baseHP: number;     // 基本HP
  startStage?: number; // 開始ステージ（デフォルト: 1）
}

/**
 * ステージ進行システム
 * 
 * ステージの進行、敵の生成、ステージ情報の管理を行う
 */
export class Stage {
  private currentStage: number;
  private baseHP: number;
  private enemy: Enemy | null = null;

  /**
   * コンストラクタ
   * 
   * @param config - ステージ設定
   */
  constructor(config: StageConfig) {
    this.baseHP = config.baseHP;
    this.currentStage = config.startStage || 1;
  }

  /**
   * 現在のステージ番号を取得
   * 
   * @returns 現在のステージ番号
   */
  getCurrentStage(): number {
    return this.currentStage;
  }

  /**
   * 次のステージに進む
   * 
   * @returns 新しいステージ番号
   */
  nextStage(): number {
    this.currentStage++;
    this.enemy = null; // 現在の敵をクリア
    return this.currentStage;
  }

  /**
   * ステージを設定
   * 
   * @param stage - 設定するステージ番号
   */
  setStage(stage: number): void {
    if (stage < 1) {
      stage = 1;
    }
    this.currentStage = stage;
    this.enemy = null; // 現在の敵をクリア
  }

  /**
   * 現在のステージの敵を生成
   * 
   * @returns 生成された敵
   */
  spawnEnemy(): Enemy {
    const enemyConfig: EnemyConfig = {
      baseHP: this.baseHP,
      stage: this.currentStage,
    };
    
    this.enemy = new Enemy(enemyConfig);
    return this.enemy;
  }

  /**
   * 現在の敵を取得
   * 
   * @returns 現在の敵（生成されていない場合はnull）
   */
  getEnemy(): Enemy | null {
    return this.enemy;
  }

  /**
   * 敵が倒されたかどうか
   * 
   * @returns true の場合、敵は倒されている
   */
  isEnemyDefeated(): boolean {
    return this.enemy !== null && this.enemy.isDefeated();
  }

  /**
   * ステージをリセット
   */
  reset(): void {
    this.currentStage = 1;
    this.enemy = null;
  }

  /**
   * ステージ情報を文字列で取得（デバッグ用）
   * 
   * @returns ステージ情報
   */
  toString(): string {
    return `Stage ${this.currentStage}`;
  }
}

