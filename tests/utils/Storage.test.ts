/**
 * Storage テスト
 * 
 * LocalStorage管理機能のテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadSaveData, saveSaveData, resetSaveData } from '../../src/utils/Storage';
import { SaveData, DEFAULT_SAVE_DATA } from '../../src/types/SaveData';

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

describe('Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('loadSaveData', () => {
    it('セーブデータが存在しない場合はデフォルト値を返す', () => {
      const data = loadSaveData();
      // lastPlayedは動的に生成されるため、除外して比較
      expect(data.maxStage).toBe(DEFAULT_SAVE_DATA.maxStage);
      expect(data.rebirthStones).toBe(DEFAULT_SAVE_DATA.rebirthStones);
      expect(data.attackLevel).toBe(DEFAULT_SAVE_DATA.attackLevel);
      expect(data.lastPlayed).toBeGreaterThan(0);
    });

    it('セーブデータが存在する場合は読み込む', () => {
      const testData: SaveData = {
        maxStage: 10,
        rebirthStones: '100',
        attackLevel: 5,
        lastPlayed: Date.now(),
      };
      
      saveSaveData(testData);
      const loaded = loadSaveData();
      
      expect(loaded.maxStage).toBe(10);
      expect(loaded.rebirthStones).toBe('100');
      expect(loaded.attackLevel).toBe(5);
    });
  });

  describe('saveSaveData', () => {
    it('セーブデータを正しく保存する', () => {
      const testData: SaveData = {
        maxStage: 5,
        rebirthStones: '50',
        attackLevel: 2,
        lastPlayed: Date.now(),
      };
      
      saveSaveData(testData);
      const saved = JSON.parse(localStorageMock.getItem('infiniteRebirthBreaker_saveData') || '{}');
      
      expect(saved.maxStage).toBe(5);
      expect(saved.rebirthStones).toBe('50');
    });
  });

  describe('resetSaveData', () => {
    it('セーブデータを削除する', () => {
      const testData: SaveData = {
        maxStage: 10,
        rebirthStones: '100',
        attackLevel: 5,
        lastPlayed: Date.now(),
      };
      
      saveSaveData(testData);
      resetSaveData();
      
      const data = loadSaveData();
      // lastPlayedは動的に生成されるため、除外して比較
      expect(data.maxStage).toBe(DEFAULT_SAVE_DATA.maxStage);
      expect(data.rebirthStones).toBe(DEFAULT_SAVE_DATA.rebirthStones);
      expect(data.attackLevel).toBe(DEFAULT_SAVE_DATA.attackLevel);
      expect(data.lastPlayed).toBeGreaterThan(0);
    });
  });
});

