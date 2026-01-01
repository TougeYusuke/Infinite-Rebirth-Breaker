/**
 * Rebirth テスト
 * 
 * 転生システムの機能テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
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

describe('Rebirth', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('calculateRebirthStones', () => {
    it('ステージ1の転生石を正しく計算する', () => {
      const stones = Rebirth.calculateRebirthStones(1);
      expect(stones).toBe(1);
    });

    it('ステージ10の転生石を正しく計算する', () => {
      const stones = Rebirth.calculateRebirthStones(10);
      expect(stones).toBe(31);
    });

    it('ステージ100の転生石を正しく計算する', () => {
      const stones = Rebirth.calculateRebirthStones(100);
      expect(stones).toBe(1000);
    });
  });

  describe('gainRebirthStones', () => {
    it('転生石を獲得できる', () => {
      const stones = Rebirth.gainRebirthStones(10);
      expect(stones).toBe(31);
      
      const currentStones = Rebirth.getCurrentRebirthStones();
      expect(currentStones.toNumber()).toBe(31);
    });

    it('転生石が累積される', () => {
      Rebirth.gainRebirthStones(10);
      Rebirth.gainRebirthStones(10);
      
      const currentStones = Rebirth.getCurrentRebirthStones();
      expect(currentStones.toNumber()).toBe(62);
    });

    it('最高到達ステージが更新される', () => {
      Rebirth.gainRebirthStones(10);
      const saveData = loadSaveData();
      expect(saveData.maxStage).toBe(10);
      
      Rebirth.gainRebirthStones(5);
      const saveData2 = loadSaveData();
      expect(saveData2.maxStage).toBe(10); // 更新されない（10の方が大きい）
      
      Rebirth.gainRebirthStones(20);
      const saveData3 = loadSaveData();
      expect(saveData3.maxStage).toBe(20); // 更新される
    });
  });

  describe('spendRebirthStones', () => {
    it('転生石を消費できる', () => {
      Rebirth.gainRebirthStones(10); // 31個獲得
      
      const success = Rebirth.spendRebirthStones(10);
      expect(success).toBe(true);
      
      const currentStones = Rebirth.getCurrentRebirthStones();
      expect(currentStones.toNumber()).toBe(21);
    });

    it('転生石が足りない場合はfalseを返す', () => {
      Rebirth.gainRebirthStones(1); // 1個獲得
      
      const success = Rebirth.spendRebirthStones(100);
      expect(success).toBe(false);
      
      const currentStones = Rebirth.getCurrentRebirthStones();
      expect(currentStones.toNumber()).toBe(1); // 消費されていない
    });
  });

  describe('getCurrentRebirthStones', () => {
    it('現在の転生石を取得できる', () => {
      const stones = Rebirth.getCurrentRebirthStones();
      expect(stones.toNumber()).toBe(0);
      
      Rebirth.gainRebirthStones(10);
      const newStones = Rebirth.getCurrentRebirthStones();
      expect(newStones.toNumber()).toBe(31);
    });
  });

  describe('getMaxStage', () => {
    it('最高到達ステージを取得できる', () => {
      expect(Rebirth.getMaxStage()).toBe(1);
      
      Rebirth.gainRebirthStones(10);
      expect(Rebirth.getMaxStage()).toBe(10);
    });
  });
});

