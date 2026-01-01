/**
 * Battle - バトルシステム
 * 
 * 攻撃システム（Auto/Tap）を管理するクラス
 */

import { Enemy } from './Enemy';
import { DecimalWrapper } from '../utils/Decimal';

/**
 * バトル設定
 */
export interface BattleConfig {
  baseDamage: number;        // 基本ダメージ
  attackLevel: number;       // 攻撃力レベル
  comboMultiplier: number;   // コンボ倍率（デフォルト: 1.0）
}

/**
 * バトルシステム
 * 
 * Auto Attack: 1秒ごとに自動でダメージを与える
 * Tap Attack: 画面タップで即座にダメージを与える（2倍）
 */
export class Battle {
  private enemy: Enemy | null = null;
  private baseDamage: number;
  private attackLevel: number;
  private comboMultiplier: number;
  
  // Auto Attack用のタイマー
  private autoAttackTimer: number = 0;
  private autoAttackInterval: number = 1000; // 1秒（ミリ秒）

  /**
   * コンストラクタ
   * 
   * @param config - バトル設定
   */
  constructor(config: BattleConfig) {
    this.baseDamage = config.baseDamage;
    this.attackLevel = config.attackLevel;
    this.comboMultiplier = config.comboMultiplier;
  }

  /**
   * 敵を設定
   * 
   * @param enemy - 戦う敵
   */
  setEnemy(enemy: Enemy): void {
    this.enemy = enemy;
    this.autoAttackTimer = 0; // タイマーをリセット
  }

  /**
   * 現在の敵を取得
   * 
   * @returns 現在の敵（設定されていない場合はnull）
   */
  getEnemy(): Enemy | null {
    return this.enemy;
  }

  /**
   * 基本ダメージを設定
   * 
   * @param baseDamage - 基本ダメージ
   */
  setBaseDamage(baseDamage: number): void {
    this.baseDamage = baseDamage;
  }

  /**
   * 攻撃力レベルを設定
   * 
   * @param attackLevel - 攻撃力レベル
   */
  setAttackLevel(attackLevel: number): void {
    this.attackLevel = attackLevel;
  }

  /**
   * コンボ倍率を設定
   * 
   * @param comboMultiplier - コンボ倍率
   */
  setComboMultiplier(comboMultiplier: number): void {
    this.comboMultiplier = comboMultiplier;
  }

  /**
   * ダメージを計算
   * 
   * 計算式: baseDamage * attackLevel * comboMultiplier
   * 
   * @param isTapAttack - Tap Attackかどうか（trueの場合2倍）
   * @returns 計算されたダメージ
   */
  calculateDamage(isTapAttack: boolean = false): DecimalWrapper {
    let damage = DecimalWrapper.calculateDamage(
      this.baseDamage,
      this.attackLevel,
      this.comboMultiplier
    );
    
    // Tap Attackの場合は2倍
    if (isTapAttack) {
      damage = damage.mul(2);
    }
    
    return damage;
  }

  /**
   * Tap Attack（画面タップで即座にダメージを与える）
   * 
   * @returns 与えたダメージ（敵がいない場合はnull）
   */
  tapAttack(): DecimalWrapper | null {
    if (!this.enemy || this.enemy.isDefeated()) {
      return null;
    }
    
    const damage = this.calculateDamage(true); // Tap Attackは2倍
    const actualDamage = this.enemy.takeDamage(damage);
    
    return actualDamage;
  }

  /**
   * Auto Attack（1秒ごとに自動でダメージを与える）
   * 
   * このメソッドは毎フレーム呼び出されることを想定
   * 
   * @param deltaTime - 前フレームからの経過時間（ミリ秒）
   * @returns 与えたダメージ（攻撃しなかった場合はnull）
   */
  autoAttack(deltaTime: number): DecimalWrapper | null {
    if (!this.enemy || this.enemy.isDefeated()) {
      return null;
    }
    
    // タイマーを更新
    this.autoAttackTimer += deltaTime;
    
    // 1秒経過したら攻撃
    if (this.autoAttackTimer >= this.autoAttackInterval) {
      this.autoAttackTimer = 0; // タイマーをリセット
      
      const damage = this.calculateDamage(false); // Auto Attackは通常ダメージ
      const actualDamage = this.enemy.takeDamage(damage);
      
      return actualDamage;
    }
    
    return null;
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
   * バトルをリセット
   */
  reset(): void {
    this.enemy = null;
    this.autoAttackTimer = 0;
  }
}

