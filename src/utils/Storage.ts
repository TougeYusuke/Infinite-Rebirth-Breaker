/**
 * Storage - LocalStorage管理ユーティリティ
 * 
 * セーブデータの読み込み・保存を管理
 */

import { SaveData, DEFAULT_SAVE_DATA, SAVE_DATA_VERSION } from '../types/SaveData';

// SaveData型をエクスポート（他のモジュールで使用するため）
export type { SaveData };

const STORAGE_KEY = 'infiniteRebirthBreaker_saveData';
const AUTO_SAVE_INTERVAL = 30000; // 30秒ごとに自動セーブ

/**
 * セーブデータの整合性をチェックし、必要に応じて修復する
 * 
 * @param data - チェックするセーブデータ
 * @returns 修復されたセーブデータ
 */
function validateAndRepairSaveData(data: any): SaveData {
  const repaired: SaveData = { ...DEFAULT_SAVE_DATA };
  
  // バージョンチェック
  if (data.version && typeof data.version === 'string') {
    repaired.version = data.version;
  }
  
  // maxStageの検証
  if (typeof data.maxStage === 'number' && data.maxStage >= 1) {
    repaired.maxStage = data.maxStage;
  }
  
  // rebirthStonesの検証
  if (typeof data.rebirthStones === 'string') {
    try {
      // Decimal文字列として有効かチェック
      const test = parseFloat(data.rebirthStones);
      if (!isNaN(test) && test >= 0) {
        repaired.rebirthStones = data.rebirthStones;
      }
    } catch (e) {
      console.warn('rebirthStonesの値が無効です。デフォルト値を使用します。', e);
    }
  }
  
  // attackLevelの検証
  if (typeof data.attackLevel === 'number' && data.attackLevel >= 0) {
    repaired.attackLevel = data.attackLevel;
  }
  
  // lastPlayedの検証
  if (typeof data.lastPlayed === 'number' && data.lastPlayed > 0) {
    repaired.lastPlayed = data.lastPlayed;
  }
  
  // lastSavedの検証（新規フィールド）
  if (typeof data.lastSaved === 'number' && data.lastSaved > 0) {
    repaired.lastSaved = data.lastSaved;
  }
  
  return repaired;
}

/**
 * セーブデータを読み込む
 * 
 * @returns セーブデータ（存在しない場合はデフォルト値）
 */
export function loadSaveData(): SaveData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      
      // データの整合性をチェック・修復
      const validated = validateAndRepairSaveData(parsed);
      
      // バージョンが古い場合は最新バージョンに更新
      if (validated.version !== SAVE_DATA_VERSION) {
        validated.version = SAVE_DATA_VERSION;
        console.log('セーブデータのバージョンを更新しました:', validated.version);
      }
      
      return validated;
    }
  } catch (error) {
    console.error('セーブデータの読み込みに失敗しました:', error);
    // 破損データの場合は削除してデフォルト値を返す
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.warn('破損したセーブデータを削除しました。');
    } catch (e) {
      console.error('セーブデータの削除に失敗しました:', e);
    }
  }
  
  return { ...DEFAULT_SAVE_DATA };
}

/**
 * セーブデータを保存する
 * 
 * @param data - 保存するセーブデータ
 * @param force - 強制保存（自動セーブの間隔チェックをスキップ）
 */
let lastSaveTime = 0;
export function saveSaveData(data: SaveData, force: boolean = false): void {
  try {
    const now = Date.now();
    
    // 自動セーブの間隔チェック（forceがtrueの場合はスキップ）
    if (!force && (now - lastSaveTime) < AUTO_SAVE_INTERVAL) {
      return; // まだ間隔が開いていない
    }
    
    // セーブデータにタイムスタンプを追加
    const dataToSave: SaveData = {
      ...data,
      lastSaved: now,
      version: SAVE_DATA_VERSION,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    lastSaveTime = now;
    
    console.log('セーブデータを保存しました:', dataToSave);
  } catch (error) {
    console.error('セーブデータの保存に失敗しました:', error);
    
    // LocalStorageの容量不足の場合
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('LocalStorageの容量が不足しています。古いデータを削除してください。');
    }
  }
}

/**
 * セーブデータをリセットする
 */
export function resetSaveData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    lastSaveTime = 0;
    console.log('セーブデータをリセットしました。');
  } catch (error) {
    console.error('セーブデータのリセットに失敗しました:', error);
  }
}

/**
 * セーブデータのバックアップを取得（JSON文字列）
 * 
 * @returns バックアップデータ（JSON文字列）
 */
export function exportSaveData(): string {
  const data = loadSaveData();
  return JSON.stringify(data, null, 2);
}

/**
 * セーブデータをインポート（JSON文字列から復元）
 * 
 * @param jsonString - インポートするJSON文字列
 * @returns インポートに成功した場合true
 */
export function importSaveData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    const validated = validateAndRepairSaveData(parsed);
    saveSaveData(validated, true); // 強制保存
    return true;
  } catch (error) {
    console.error('セーブデータのインポートに失敗しました:', error);
    return false;
  }
}

