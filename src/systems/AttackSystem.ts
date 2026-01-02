/**
 * AttackSystem - 攻撃システム
 * 
 * ダメージ計算と攻撃の管理
 */

import { DecimalWrapper } from '../utils/Decimal';
import { Reia } from '../entities/Reia';
import { Combo } from '../systems/Combo';
import { Upgrade } from '../systems/Upgrade';

/**
 * 攻撃システムの設定
 */
export interface AttackSystemConfig {
  baseDamage: number;     // 基本ダメージ
  autoAttackInterval: number; // オート攻撃の間隔（ミリ秒）
  autoAttackDamageRatio: number; // オート攻撃のダメージ倍率（タップ攻撃に対する）
}

/**
 * 攻撃システム
 */
export class AttackSystem {
  private baseDamage: number;
  private autoAttackInterval: number;
  private autoAttackDamageRatio: number;

  constructor(config: AttackSystemConfig) {
    this.baseDamage = config.baseDamage;
    this.autoAttackInterval = config.autoAttackInterval;
    this.autoAttackDamageRatio = config.autoAttackDamageRatio;
  }

  /**
   * ダメージを計算
   * 
   * @param reia - れいあキャラクター
   * @param combo - コンボシステム
   * @param isAutoAttack - オート攻撃かどうか
   * @returns ダメージ値
   */
  calculateDamage(reia: Reia, combo: Combo, isAutoAttack: boolean = false): DecimalWrapper {
    // 基本ダメージ
    let damage = this.baseDamage;
    
    // 攻撃レベル倍率
    const attackLevel = Math.max(1, Upgrade.getAttackLevel());
    damage *= attackLevel;
    
    // コンボ倍率
    const comboMultiplier = combo.getComboMultiplier();
    damage *= comboMultiplier;
    
    // 感情状態倍率
    const statusMultiplier = reia.getStatusMultiplier();
    damage *= statusMultiplier.attack;
    
    // オート攻撃の場合はダメージを減らす
    if (isAutoAttack) {
      damage *= this.autoAttackDamageRatio;
    }
    
    return new DecimalWrapper(damage);
  }

  /**
   * オート攻撃の間隔を取得
   */
  getAutoAttackInterval(): number {
    return this.autoAttackInterval;
  }
}

