/**
 * Combo テスト
 * 
 * コンボシステムの機能テスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Combo } from '../../src/systems/Combo';

describe('Combo', () => {
  let combo: Combo;

  beforeEach(() => {
    combo = new Combo();
  });

  describe('コンストラクタ', () => {
    it('コンボシステムを作成できる', () => {
      expect(combo.getComboCount()).toBe(0);
      expect(combo.getComboMultiplier()).toBe(1.0);
    });

    it('初期コンボ数を指定できる', () => {
      const comboWithInitial = new Combo(10);
      expect(comboWithInitial.getComboCount()).toBe(10);
    });
  });

  describe('コンボの追加', () => {
    it('コンボを追加できる', () => {
      combo.addCombo(1);
      expect(combo.getComboCount()).toBe(1);
    });

    it('複数のコンボを追加できる', () => {
      combo.addCombo(5);
      expect(combo.getComboCount()).toBe(5);
    });

    it('最大コンボ数を超えない', () => {
      combo.addCombo(100);
      expect(combo.getComboCount()).toBe(90); // 最大90
    });
  });

  describe('コンボのリセット', () => {
    it('コンボをリセットできる', () => {
      combo.addCombo(10);
      combo.resetCombo();
      expect(combo.getComboCount()).toBe(0);
    });
  });

  describe('コンボ倍率', () => {
    it('コンボ0の倍率は1.0', () => {
      expect(combo.getComboMultiplier()).toBeCloseTo(1.0, 0.01);
    });

    it('コンボ10の倍率は2.0', () => {
      combo.addCombo(10);
      expect(combo.getComboMultiplier()).toBeCloseTo(2.0, 0.01);
    });

    it('コンボ90の倍率は10.0（最大）', () => {
      combo.addCombo(90);
      expect(combo.getComboMultiplier()).toBeCloseTo(10.0, 0.01);
    });

    it('最大コンボ数を超えても倍率は10.0', () => {
      combo.addCombo(100);
      expect(combo.getComboMultiplier()).toBeCloseTo(10.0, 0.01);
    });
  });

  describe('最大コンボ数', () => {
    it('最大コンボ数に達しているか判定できる', () => {
      expect(combo.isMaxCombo()).toBe(false);
      
      combo.addCombo(90);
      expect(combo.isMaxCombo()).toBe(true);
    });

    it('最大コンボ数を設定できる', () => {
      combo.setMaxCombo(50);
      expect(combo.getMaxCombo()).toBe(50);
      
      combo.addCombo(60);
      expect(combo.getComboCount()).toBe(50); // 最大を超えない
    });
  });

  describe('コンボの割合', () => {
    it('コンボ0の割合は0.0', () => {
      expect(combo.getComboRatio()).toBe(0);
    });

    it('コンボ45の割合は0.5', () => {
      combo.addCombo(45);
      expect(combo.getComboRatio()).toBeCloseTo(0.5, 0.01);
    });

    it('コンボ90の割合は1.0', () => {
      combo.addCombo(90);
      expect(combo.getComboRatio()).toBeCloseTo(1.0, 0.01);
    });
  });
});

