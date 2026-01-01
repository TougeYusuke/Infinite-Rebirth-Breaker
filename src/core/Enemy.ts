/**
 * Enemy - 敵クラス
 * 
 * バトルで戦う敵を管理するクラス
 */

import { DecimalWrapper } from '../utils/Decimal';

/**
 * 敵の設定
 */
export interface EnemyConfig {
  baseHP: number;      // 基本HP
  stage: number;       // ステージ番号
}

/**
 * 敵クラス
 * 
 * HP計算式: baseHP * (stage ^ 1.2)
 */
export class Enemy {
  private baseHP: number;
  private stage: number;
  private currentHP: DecimalWrapper;
  private maxHP: DecimalWrapper;

  /**
   * コンストラクタ
   * 
   * @param config - 敵の設定
   */
  constructor(config: EnemyConfig) {
    this.baseHP = config.baseHP;
    this.stage = config.stage;

    // HP計算: baseHP * (stage ^ 1.2)
    this.maxHP = DecimalWrapper.calculateEnemyHP(this.baseHP, this.stage);
    this.currentHP = new DecimalWrapper(this.maxHP.getValue());
  }

  /**
   * 現在のHPを取得
   * 
   * @returns 現在のHP
   */
  getCurrentHP(): DecimalWrapper {
    return this.currentHP;
  }

  /**
   * 最大HPを取得
   * 
   * @returns 最大HP
   */
  getMaxHP(): DecimalWrapper {
    return this.maxHP;
  }

  /**
   * HPの割合を取得（0.0 〜 1.0）
   * 
   * @returns HPの割合
   */
  getHPRatio(): number {
    if (this.maxHP.isZero()) {
      return 0;
    }

    const ratio = this.currentHP.div(this.maxHP);
    return Math.max(0, Math.min(1, ratio.toNumber()));
  }

  /**
   * ダメージを受ける
   * 
   * @param damage - 受けるダメージ
   * @returns 実際に受けたダメージ
   */
  takeDamage(damage: DecimalWrapper | number): DecimalWrapper {
    const damageDecimal = damage instanceof DecimalWrapper
      ? damage
      : new DecimalWrapper(damage);

    const oldHP = new DecimalWrapper(this.currentHP.getValue());

    // ダメージを適用
    this.currentHP = this.currentHP.sub(damageDecimal);

    // HPが0未満にならないようにする
    if (this.currentHP.isZeroOrLess()) {
      this.currentHP = DecimalWrapper.zero();
    }

    // 実際に受けたダメージを計算
    const actualDamage = oldHP.sub(this.currentHP);

    return actualDamage;
  }

  /**
   * 敵が倒されたかどうか
   * 
   * @returns true の場合、敵は倒されている
   */
  isDefeated(): boolean {
    return this.currentHP.isZero();
  }

  /**
   * ステージ番号を取得
   * 
   * @returns ステージ番号
   */
  getStage(): number {
    return this.stage;
  }

  /**
   * 敵を完全に回復する（デバッグ用）
   */
  healFull(): void {
    this.currentHP = new DecimalWrapper(this.maxHP.getValue());
  }

  /**
   * 敵の情報を文字列で取得（デバッグ用）
   * 
   * @returns 敵の情報
   */
  toString(): string {
    return `Enemy(Stage: ${this.stage}, HP: ${this.currentHP.toString()}/${this.maxHP.toString()})`;
  }
}

