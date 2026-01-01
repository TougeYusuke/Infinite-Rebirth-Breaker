/**
 * Storage - LocalStorage管理ユーティリティ
 * 
 * セーブデータの読み込み・保存を管理
 */

import { SaveData, DEFAULT_SAVE_DATA } from '../types/SaveData';

const STORAGE_KEY = 'infiniteRebirthBreaker_saveData';

/**
 * セーブデータを読み込む
 * 
 * @returns セーブデータ（存在しない場合はデフォルト値）
 */
export function loadSaveData(): SaveData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as SaveData;
      // デフォルト値とマージ（新しいフィールドが追加された場合に対応）
      return { ...DEFAULT_SAVE_DATA, ...parsed };
    }
  } catch (error) {
    console.error('セーブデータの読み込みに失敗しました:', error);
  }
  
  return { ...DEFAULT_SAVE_DATA };
}

/**
 * セーブデータを保存する
 * 
 * @param data - 保存するセーブデータ
 */
export function saveSaveData(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('セーブデータの保存に失敗しました:', error);
  }
}

/**
 * セーブデータをリセットする
 */
export function resetSaveData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('セーブデータのリセットに失敗しました:', error);
  }
}

