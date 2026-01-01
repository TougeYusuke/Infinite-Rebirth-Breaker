/**
 * Decimal テスト
 * 
 * Decimal型ラッパーの機能テスト
 */

import { describe, it, expect } from 'vitest';
import Decimal from 'break_infinity.js';
import { DecimalWrapper } from '../../src/utils/Decimal';

describe('DecimalWrapper', () => {
  describe('コンストラクタ', () => {
    it('数値から作成できる', () => {
      const wrapper = new DecimalWrapper(100);
      expect(wrapper.toNumber()).toBe(100);
    });

    it('文字列から作成できる', () => {
      const wrapper = new DecimalWrapper('1000');
      expect(wrapper.toNumber()).toBe(1000);
    });

    it('Decimal型から作成できる', () => {
      const decimal = new Decimal(500);
      const wrapper = new DecimalWrapper(decimal);
      expect(wrapper.toNumber()).toBe(500);
    });

    it('DecimalWrapperから作成できる', () => {
      const original = new DecimalWrapper(200);
      const wrapper = new DecimalWrapper(original);
      expect(wrapper.toNumber()).toBe(200);
    });
  });

  describe('算術演算', () => {
    it('加算が正しく動作する', () => {
      const a = new DecimalWrapper(10);
      const b = new DecimalWrapper(20);
      const result = a.add(b);
      expect(result.toNumber()).toBe(30);
    });

    it('減算が正しく動作する', () => {
      const a = new DecimalWrapper(30);
      const b = new DecimalWrapper(10);
      const result = a.sub(b);
      expect(result.toNumber()).toBe(20);
    });

    it('乗算が正しく動作する', () => {
      const a = new DecimalWrapper(5);
      const b = new DecimalWrapper(4);
      const result = a.mul(b);
      expect(result.toNumber()).toBe(20);
    });

    it('除算が正しく動作する', () => {
      const a = new DecimalWrapper(20);
      const b = new DecimalWrapper(4);
      const result = a.div(b);
      expect(result.toNumber()).toBe(5);
    });

    it('数値との演算が正しく動作する', () => {
      const a = new DecimalWrapper(10);
      const result = a.add(5);
      expect(result.toNumber()).toBe(15);
    });
  });

  describe('比較演算', () => {
    it('lessThanが正しく動作する', () => {
      const a = new DecimalWrapper(10);
      const b = new DecimalWrapper(20);
      expect(a.lessThan(b)).toBe(true);
      expect(b.lessThan(a)).toBe(false);
    });

    it('greaterThanが正しく動作する', () => {
      const a = new DecimalWrapper(20);
      const b = new DecimalWrapper(10);
      expect(a.greaterThan(b)).toBe(true);
      expect(b.greaterThan(a)).toBe(false);
    });

    it('equalsが正しく動作する', () => {
      const a = new DecimalWrapper(10);
      const b = new DecimalWrapper(10);
      expect(a.equals(b)).toBe(true);
    });

    it('isZeroが正しく動作する', () => {
      const zero = new DecimalWrapper(0);
      const nonZero = new DecimalWrapper(10);
      expect(zero.isZero()).toBe(true);
      expect(nonZero.isZero()).toBe(false);
    });

    it('isZeroOrLessが正しく動作する', () => {
      const zero = new DecimalWrapper(0);
      const negative = new DecimalWrapper(-10);
      const positive = new DecimalWrapper(10);
      expect(zero.isZeroOrLess()).toBe(true);
      expect(negative.isZeroOrLess()).toBe(true);
      expect(positive.isZeroOrLess()).toBe(false);
    });
  });

  describe('数学関数', () => {
    it('powが正しく動作する', () => {
      const base = new DecimalWrapper(2);
      const result = base.pow(3);
      expect(result.toNumber()).toBe(8);
    });

    it('floorが正しく動作する', () => {
      const value = new DecimalWrapper(3.7);
      const result = value.floor();
      expect(result.toNumber()).toBe(3);
    });

    it('ceilが正しく動作する', () => {
      const value = new DecimalWrapper(3.2);
      const result = value.ceil();
      expect(result.toNumber()).toBe(4);
    });

    it('roundが正しく動作する', () => {
      const value1 = new DecimalWrapper(3.4);
      const value2 = new DecimalWrapper(3.6);
      expect(value1.round().toNumber()).toBe(3);
      expect(value2.round().toNumber()).toBe(4);
    });

    it('absが正しく動作する', () => {
      const negative = new DecimalWrapper(-10);
      const result = negative.abs();
      expect(result.toNumber()).toBe(10);
    });
  });

  describe('静的ファクトリーメソッド', () => {
    it('fromNumberが正しく動作する', () => {
      const wrapper = DecimalWrapper.fromNumber(100);
      expect(wrapper.toNumber()).toBe(100);
    });

    it('fromStringが正しく動作する', () => {
      const wrapper = DecimalWrapper.fromString('1000');
      expect(wrapper.toNumber()).toBe(1000);
    });

    it('fromDecimalが正しく動作する', () => {
      const decimal = new Decimal(500);
      const wrapper = DecimalWrapper.fromDecimal(decimal);
      expect(wrapper.toNumber()).toBe(500);
    });

    it('zeroが正しく動作する', () => {
      const wrapper = DecimalWrapper.zero();
      expect(wrapper.isZero()).toBe(true);
    });

    it('oneが正しく動作する', () => {
      const wrapper = DecimalWrapper.one();
      expect(wrapper.toNumber()).toBe(1);
    });
  });

  describe('ゲーム特有の計算', () => {
    describe('calculateEnemyHP', () => {
      it('ステージ1のHPを正しく計算する', () => {
        const hp = DecimalWrapper.calculateEnemyHP(100, 1);
        expect(hp.toNumber()).toBeCloseTo(100, 1);
      });

      it('ステージ2のHPを正しく計算する', () => {
        const hp = DecimalWrapper.calculateEnemyHP(100, 2);
        // 100 * (2 ^ 1.2) ≈ 100 * 2.297 ≈ 229.7
        expect(hp.toNumber()).toBeCloseTo(229.7, 1);
      });

      it('ステージ10のHPを正しく計算する', () => {
        const hp = DecimalWrapper.calculateEnemyHP(100, 10);
        // 100 * (10 ^ 1.2) ≈ 100 * 15.85 ≈ 1585
        expect(hp.toNumber()).toBeCloseTo(1585, 0);
      });
    });

    describe('calculateDamage', () => {
      it('基本ダメージを正しく計算する', () => {
        const damage = DecimalWrapper.calculateDamage(10, 1, 1);
        expect(damage.toNumber()).toBe(10);
      });

      it('攻撃レベルを考慮して計算する', () => {
        const damage = DecimalWrapper.calculateDamage(10, 5, 1);
        expect(damage.toNumber()).toBe(50);
      });

      it('コンボ倍率を考慮して計算する', () => {
        const damage = DecimalWrapper.calculateDamage(10, 1, 2);
        expect(damage.toNumber()).toBe(20);
      });

      it('全ての要素を考慮して計算する', () => {
        const damage = DecimalWrapper.calculateDamage(10, 5, 2);
        expect(damage.toNumber()).toBe(100);
      });
    });

    describe('calculateRebirthStones', () => {
      it('ステージ1の転生石を正しく計算する', () => {
        const stones = DecimalWrapper.calculateRebirthStones(1);
        // Math.floor(1 ^ 1.5) = Math.floor(1) = 1
        expect(stones).toBe(1);
      });

      it('ステージ10の転生石を正しく計算する', () => {
        const stones = DecimalWrapper.calculateRebirthStones(10);
        // Math.floor(10 ^ 1.5) = Math.floor(31.62...) = 31
        expect(stones).toBe(31);
      });

      it('ステージ100の転生石を正しく計算する', () => {
        const stones = DecimalWrapper.calculateRebirthStones(100);
        // Math.floor(100 ^ 1.5) = Math.floor(1000) = 1000
        expect(stones).toBe(1000);
      });
    });

    describe('calculateComboMultiplier', () => {
      it('コンボ0の倍率を正しく計算する', () => {
        const multiplier = DecimalWrapper.calculateComboMultiplier(0);
        // 1 + (0 * 0.1) = 1
        expect(multiplier).toBe(1);
      });

      it('コンボ10の倍率を正しく計算する', () => {
        const multiplier = DecimalWrapper.calculateComboMultiplier(10);
        // 1 + (10 * 0.1) = 2
        expect(multiplier).toBe(2);
      });

      it('コンボ90の倍率が最大10倍に制限される', () => {
        const multiplier = DecimalWrapper.calculateComboMultiplier(90);
        // 1 + (90 * 0.1) = 10 だが、最大10倍に制限
        expect(multiplier).toBe(10);
      });

      it('コンボ100の倍率が最大10倍に制限される', () => {
        const multiplier = DecimalWrapper.calculateComboMultiplier(100);
        // 1 + (100 * 0.1) = 11 だが、最大10倍に制限
        expect(multiplier).toBe(10);
      });
    });
  });

  describe('大きな数値の処理', () => {
    it('1e308以上の数値を扱える', () => {
      const largeValue = new Decimal('1e400');
      const wrapper = new DecimalWrapper(largeValue);
      // toNumber()は変換できないが、toString()は動作する
      expect(wrapper.toString()).toContain('e');
    });

    it('大きな数値の演算が正しく動作する', () => {
      const a = new DecimalWrapper('1e100');
      const b = new DecimalWrapper('1e100');
      const result = a.add(b);
      // 2e100になる
      expect(result.toString()).toContain('e');
    });
  });
});

