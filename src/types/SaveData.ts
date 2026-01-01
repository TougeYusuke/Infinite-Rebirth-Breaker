/**
 * SaveData - セーブデータの型定義
 * 
 * LocalStorageに保存するゲームデータの構造
 */

export interface SaveData {
  maxStage: number;        // 過去最高到達ステージ
  rebirthStones: string;   // 所持している転生石（Decimal文字列）
  attackLevel: number;     // 攻撃力強化レベル
  lastPlayed: number;      // 最終プレイ日時（タイムスタンプ）
}

/**
 * デフォルトのセーブデータ
 */
export const DEFAULT_SAVE_DATA: SaveData = {
  maxStage: 1,
  rebirthStones: '0',
  attackLevel: 0,
  lastPlayed: Date.now(),
};

