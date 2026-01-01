/**
 * GameState - ゲーム状態の型定義
 * 
 * 実行時のゲーム状態を管理
 */

import Decimal from 'break_infinity.js';

export interface GameState {
  currentStage: number;    // 現在のステージ
  currentEnemyHP: Decimal; // 現在の敵HP
  comboCount: number;      // 現在のコンボ数
  timeRemaining: number;   // 残り時間（秒）
  totalDamage: Decimal;    // 累計ダメージ
}

