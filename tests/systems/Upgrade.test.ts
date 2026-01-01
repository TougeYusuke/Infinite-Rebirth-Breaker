/**
 * Upgrade テスト
 * 
 * 強化システムの機能テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Upgrade, UpgradeType } from '../../src/systems/Upgrade';
import { Rebirth } from '../../src/systems/Rebirth';
import { resetSaveData, loadSaveData } from '../../src/utils/Storage';

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Upgrade', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('calculateAttackLevelCost', () => {
    it('レベル0のコストを正しく計算する', () => {
      const cost = Upgrade.calculateAttackLevelCost(0);
      // 10 * (0 + 1) = 10
      expect(cost).toBe(10);
    });

    it('レベル5のコストを正しく計算する', () => {
      const cost = Upgrade.calculateAttackLevelCost(5);
      // 10 * (5 + 1) = 60
      expect(cost).toBe(60);
    });
  });

  describe('calculateAttackLevelEffect', () => {
    it('レベル1の効果を正しく計算する', () => {
      const effect = Upgrade.calculateAttackLevelEffect(1);
      // 1.1 * 1 = 1.1
      expect(effect).toBeCloseTo(1.1, 0.01);
    });

    it('レベル10の効果を正しく計算する', () => {
      const effect = Upgrade.calculateAttackLevelEffect(10);
      // 1.1 * 10 = 11
      expect(effect).toBeCloseTo(11, 0.01);
    });
  });

  describe('getAttackLevelInfo', () => {
    it('攻撃力LvUPの情報を取得できる', () => {
      const info = Upgrade.getAttackLevelInfo();
      
      expect(info.type).toBe(UpgradeType.ATTACK_LEVEL);
      expect(info.currentLevel).toBe(0);
      expect(info.cost).toBe(10);
      expect(info.effect).toBeCloseTo(1.1, 0.01);
    });

    it('レベルが上がるとコストと効果が変わる', () => {
      // レベルを上げる
      Rebirth.gainRebirthStones(100); // 転生石を獲得
      Upgrade.upgradeAttackLevel();
      
      const info = Upgrade.getAttackLevelInfo();
      
      expect(info.currentLevel).toBe(1);
      expect(info.cost).toBe(20); // 10 * (1 + 1) = 20
      expect(info.effect).toBeCloseTo(2.2, 0.01); // 1.1 * 2 = 2.2
    });
  });

  describe('upgradeAttackLevel', () => {
    it('転生石が足りる場合は強化できる', () => {
      Rebirth.gainRebirthStones(100); // 転生石を獲得
      
      const success = Upgrade.upgradeAttackLevel();
      expect(success).toBe(true);
      
      const level = Upgrade.getAttackLevel();
      expect(level).toBe(1);
    });

    it('転生石が足りない場合は強化できない', () => {
      // 転生石を獲得しない
      const success = Upgrade.upgradeAttackLevel();
      expect(success).toBe(false);
      
      const level = Upgrade.getAttackLevel();
      expect(level).toBe(0);
    });

    it('転生石が消費される', () => {
      Rebirth.gainRebirthStones(100);
      const stonesBefore = Rebirth.getCurrentRebirthStones().toNumber();
      
      Upgrade.upgradeAttackLevel();
      
      const stonesAfter = Rebirth.getCurrentRebirthStones().toNumber();
      expect(stonesAfter).toBeLessThan(stonesBefore);
    });
  });

  describe('getAttackLevel', () => {
    it('現在の攻撃力レベルを取得できる', () => {
      expect(Upgrade.getAttackLevel()).toBe(0);
      
      Rebirth.gainRebirthStones(100);
      Upgrade.upgradeAttackLevel();
      
      expect(Upgrade.getAttackLevel()).toBe(1);
    });
  });
});

