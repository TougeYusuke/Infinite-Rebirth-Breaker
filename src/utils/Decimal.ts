/**
 * Decimal - Decimal型ラッパーユーティリティ
 * 
 * break_infinity.jsのDecimal型をラップして、ゲーム内で使いやすくする
 * 便利メソッドを提供するクラス
 */

import Decimal from 'break_infinity.js';

/**
 * Decimal型のラッパークラス
 * 
 * ゲーム内でよく使う計算を簡潔に行えるメソッドを提供
 */
export class DecimalWrapper {
  private value: Decimal;

  /**
   * コンストラクタ
   * 
   * @param value - 初期値（数値、文字列、またはDecimal型）
   */
  constructor(value: number | string | Decimal | DecimalWrapper) {
    if (value instanceof DecimalWrapper) {
      this.value = value.getValue();
    } else if (value instanceof Decimal) {
      this.value = value;
    } else if (typeof value === 'number') {
      this.value = new Decimal(value);
    } else {
      this.value = new Decimal(value);
    }
  }

  /**
   * 内部のDecimal値を取得
   * 
   * @returns Decimal型の値
   */
  getValue(): Decimal {
    return this.value;
  }

  /**
   * 数値に変換（1e308未満の場合のみ有効）
   * 
   * @returns 数値（変換できない場合はNaN）
   */
  toNumber(): number {
    return this.value.toNumber();
  }

  /**
   * 文字列に変換
   * 
   * @returns 文字列表現
   */
  toString(): string {
    return this.value.toString();
  }

  /**
   * 固定小数点表記に変換
   * 
   * @param decimalPlaces - 小数点以下の桁数
   * @returns 固定小数点表記の文字列
   */
  toFixed(decimalPlaces: number): string {
    return this.value.toFixed(decimalPlaces);
  }

  // ========== 算術演算 ==========

  /**
   * 加算
   * 
   * @param other - 加算する値
   * @returns 新しいDecimalWrapperインスタンス
   */
  add(other: number | string | Decimal | DecimalWrapper): DecimalWrapper {
    const otherDecimal = this.toDecimal(other);
    return new DecimalWrapper(this.value.add(otherDecimal));
  }

  /**
   * 減算
   * 
   * @param other - 減算する値
   * @returns 新しいDecimalWrapperインスタンス
   */
  sub(other: number | string | Decimal | DecimalWrapper): DecimalWrapper {
    const otherDecimal = this.toDecimal(other);
    return new DecimalWrapper(this.value.sub(otherDecimal));
  }

  /**
   * 乗算
   * 
   * @param other - 乗算する値
   * @returns 新しいDecimalWrapperインスタンス
   */
  mul(other: number | string | Decimal | DecimalWrapper): DecimalWrapper {
    const otherDecimal = this.toDecimal(other);
    return new DecimalWrapper(this.value.mul(otherDecimal));
  }

  /**
   * 除算
   * 
   * @param other - 除算する値
   * @returns 新しいDecimalWrapperインスタンス
   */
  div(other: number | string | Decimal | DecimalWrapper): DecimalWrapper {
    const otherDecimal = this.toDecimal(other);
    return new DecimalWrapper(this.value.div(otherDecimal));
  }

  // ========== 比較演算 ==========

  /**
   * より小さいか
   * 
   * @param other - 比較する値
   * @returns true の場合、この値は other より小さい
   */
  lessThan(other: number | string | Decimal | DecimalWrapper): boolean {
    const otherDecimal = this.toDecimal(other);
    return this.value.lessThan(otherDecimal);
  }

  /**
   * 以下か
   * 
   * @param other - 比較する値
   * @returns true の場合、この値は other 以下
   */
  lessThanOrEqualTo(other: number | string | Decimal | DecimalWrapper): boolean {
    const otherDecimal = this.toDecimal(other);
    return this.value.lessThanOrEqualTo(otherDecimal);
  }

  /**
   * より大きいか
   * 
   * @param other - 比較する値
   * @returns true の場合、この値は other より大きい
   */
  greaterThan(other: number | string | Decimal | DecimalWrapper): boolean {
    const otherDecimal = this.toDecimal(other);
    return this.value.greaterThan(otherDecimal);
  }

  /**
   * 以上か
   * 
   * @param other - 比較する値
   * @returns true の場合、この値は other 以上
   */
  greaterThanOrEqualTo(other: number | string | Decimal | DecimalWrapper): boolean {
    const otherDecimal = this.toDecimal(other);
    return this.value.greaterThanOrEqualTo(otherDecimal);
  }

  /**
   * 等しいか
   * 
   * @param other - 比較する値
   * @returns true の場合、この値は other と等しい
   */
  equals(other: number | string | Decimal | DecimalWrapper): boolean {
    const otherDecimal = this.toDecimal(other);
    return this.value.equals(otherDecimal);
  }

  /**
   * ゼロ以下か
   * 
   * @returns true の場合、この値はゼロ以下
   */
  isZeroOrLess(): boolean {
    return this.value.lessThanOrEqualTo(0);
  }

  /**
   * ゼロか
   * 
   * @returns true の場合、この値はゼロ
   */
  isZero(): boolean {
    return this.value.equals(0);
  }

  // ========== 数学関数 ==========

  /**
   * べき乗
   * 
   * @param exponent - 指数
   * @returns 新しいDecimalWrapperインスタンス
   */
  pow(exponent: number | string | Decimal | DecimalWrapper): DecimalWrapper {
    const expDecimal = this.toDecimal(exponent);
    return new DecimalWrapper(this.value.pow(expDecimal));
  }

  /**
   * 常用対数（底10）
   * 
   * @returns 新しいDecimalWrapperインスタンス
   */
  log10(): DecimalWrapper {
    return new DecimalWrapper(this.value.log10());
  }

  /**
   * 自然対数
   * 
   * @returns 新しいDecimalWrapperインスタンス
   */
  log(): DecimalWrapper {
    return new DecimalWrapper(this.value.log());
  }

  /**
   * 指数関数
   * 
   * @returns 新しいDecimalWrapperインスタンス
   */
  exp(): DecimalWrapper {
    return new DecimalWrapper(this.value.exp());
  }

  /**
   * 切り捨て
   * 
   * @returns 新しいDecimalWrapperインスタンス
   */
  floor(): DecimalWrapper {
    return new DecimalWrapper(this.value.floor());
  }

  /**
   * 切り上げ
   * 
   * @returns 新しいDecimalWrapperインスタンス
   */
  ceil(): DecimalWrapper {
    return new DecimalWrapper(this.value.ceil());
  }

  /**
   * 四捨五入
   * 
   * @returns 新しいDecimalWrapperインスタンス
   */
  round(): DecimalWrapper {
    return new DecimalWrapper(this.value.round());
  }

  /**
   * 絶対値
   * 
   * @returns 新しいDecimalWrapperインスタンス
   */
  abs(): DecimalWrapper {
    return new DecimalWrapper(this.value.abs());
  }

  // ========== ゲーム特有の計算 ==========

  /**
   * 敵のHPを計算
   * 
   * 計算式: baseHP * (stage ^ 1.2)
   * 
   * @param baseHP - 基本HP
   * @param stage - ステージ番号
   * @returns 計算されたHP
   */
  static calculateEnemyHP(baseHP: number | Decimal | DecimalWrapper, stage: number): DecimalWrapper {
    const base = baseHP instanceof DecimalWrapper ? baseHP.getValue() : new Decimal(baseHP);
    const stageDecimal = new Decimal(stage);
    const exponent = new Decimal(1.2);
    
    return new DecimalWrapper(base.mul(stageDecimal.pow(exponent)));
  }

  /**
   * ダメージを計算
   * 
   * 計算式: baseDamage * attackLevel * comboMultiplier
   * 
   * @param baseDamage - 基本ダメージ
   * @param attackLevel - 攻撃力レベル
   * @param comboMultiplier - コンボ倍率
   * @returns 計算されたダメージ
   */
  static calculateDamage(
    baseDamage: number | Decimal | DecimalWrapper,
    attackLevel: number,
    comboMultiplier: number = 1
  ): DecimalWrapper {
    const base = baseDamage instanceof DecimalWrapper ? baseDamage.getValue() : new Decimal(baseDamage);
    // attackLevelが0以下の場合は1として扱う（最低限のダメージを保証）
    const effectiveLevel = Math.max(1, attackLevel);
    const levelMultiplier = new Decimal(effectiveLevel);
    const comboMultiplierDecimal = new Decimal(comboMultiplier);
    
    return new DecimalWrapper(base.mul(levelMultiplier).mul(comboMultiplierDecimal));
  }

  /**
   * 転生石を計算
   * 
   * 計算式: Math.floor(stage ^ 1.5)
   * 
   * @param stage - 到達ステージ
   * @returns 獲得転生石（整数）
   */
  static calculateRebirthStones(stage: number): number {
    const stageDecimal = new Decimal(stage);
    const exponent = new Decimal(1.5);
    const result = stageDecimal.pow(exponent);
    
    return result.floor().toNumber();
  }

  /**
   * コンボ倍率を計算
   * 
   * 計算式: 1 + (combo * 0.1)（最大10倍）
   * 
   * @param comboCount - コンボ数
   * @returns コンボ倍率（1.0 〜 10.0）
   */
  static calculateComboMultiplier(comboCount: number): number {
    const multiplier = 1 + (comboCount * 0.1);
    return Math.min(multiplier, 10.0); // 最大10倍
  }

  // ========== 静的ファクトリーメソッド ==========

  /**
   * 数値からDecimalWrapperを作成
   * 
   * @param value - 数値
   * @returns DecimalWrapperインスタンス
   */
  static fromNumber(value: number): DecimalWrapper {
    return new DecimalWrapper(value);
  }

  /**
   * 文字列からDecimalWrapperを作成
   * 
   * @param value - 文字列
   * @returns DecimalWrapperインスタンス
   */
  static fromString(value: string): DecimalWrapper {
    return new DecimalWrapper(value);
  }

  /**
   * Decimal型からDecimalWrapperを作成
   * 
   * @param value - Decimal型の値
   * @returns DecimalWrapperインスタンス
   */
  static fromDecimal(value: Decimal): DecimalWrapper {
    return new DecimalWrapper(value);
  }

  /**
   * ゼロのDecimalWrapperを作成
   * 
   * @returns ゼロのDecimalWrapperインスタンス
   */
  static zero(): DecimalWrapper {
    return new DecimalWrapper(0);
  }

  /**
   * 1のDecimalWrapperを作成
   * 
   * @returns 1のDecimalWrapperインスタンス
   */
  static one(): DecimalWrapper {
    return new DecimalWrapper(1);
  }

  // ========== プライベートメソッド ==========

  /**
   * 様々な型をDecimal型に変換
   * 
   * @param value - 変換する値
   * @returns Decimal型の値
   */
  private toDecimal(value: number | string | Decimal | DecimalWrapper): Decimal {
    if (value instanceof DecimalWrapper) {
      return value.getValue();
    } else if (value instanceof Decimal) {
      return value;
    } else if (typeof value === 'number') {
      return new Decimal(value);
    } else {
      return new Decimal(value);
    }
  }
}

/**
 * 便利なエクスポート
 * DecimalWrapperを直接使えるようにする
 */
export default DecimalWrapper;

