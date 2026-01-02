/**
 * SaveData - セーブデータの型定義
 * 
 * LocalStorageに保存するゲームデータの構造
 */

export interface SaveData {
  version: string;        // セーブデータのバージョン（将来の拡張に対応）
  maxStage: number;       // 過去最高到達ステージ
  rebirthStones: string;  // 所持している転生石（Decimal文字列）
  attackLevel: number;    // 攻撃力強化レベル
  lastPlayed: number;     // 最終プレイ日時（タイムスタンプ）
  lastSaved: number;      // 最終セーブ日時（タイムスタンプ）
}

/**
 * 現在のセーブデータバージョン
 */
export const SAVE_DATA_VERSION = '1.0.0';

/**
 * デフォルトのセーブデータ
 */
export const DEFAULT_SAVE_DATA: SaveData = {
  version: SAVE_DATA_VERSION,
  maxStage: 1,
  rebirthStones: '0',
  attackLevel: 0,
  lastPlayed: Date.now(),
  lastSaved: Date.now(),
};

