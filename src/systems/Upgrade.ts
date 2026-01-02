/**
 * Upgrade - 強化システム
 * 
 * 転生石を消費して永続強化を行う
 */

import { loadSaveData, saveSaveData, SaveData } from '../utils/Storage';
import { Rebirth } from './Rebirth';

/**
 * 強化タイプ
 */
export enum UpgradeType {
  ATTACK_LEVEL = 'attackLevel', // 攻撃力レベル
}

/**
 * 強化情報
 */
export interface UpgradeInfo {
  type: UpgradeType;
  currentLevel: number;
  cost: number;
  effect: number;
}

/**
 * 強化システム
 * 
 * 転生石を消費して永続強化を行う
 */
export class Upgrade {
  /**
   * 攻撃力LvUPのコストを計算
   * 
   * 計算式: 10 * (currentLevel + 1)
   * 
   * @param currentLevel - 現在のレベル
   * @returns コスト
   */
  static calculateAttackLevelCost(currentLevel: number): number {
    return 10 * (currentLevel + 1);
  }

  /**
   * 攻撃力LvUPの効果を計算
   * 
   * 計算式: 1.1 * level 倍率
   * 
   * @param level - レベル
   * @returns 倍率
   */
  static calculateAttackLevelEffect(level: number): number {
    return 1.1 * level;
  }

  /**
   * 攻撃力LvUPの情報を取得
   * 
   * @returns 強化情報
   */
  static getAttackLevelInfo(): UpgradeInfo {
    const saveData = loadSaveData();
    const currentLevel = saveData.attackLevel;
    
    return {
      type: UpgradeType.ATTACK_LEVEL,
      currentLevel: currentLevel,
      cost: this.calculateAttackLevelCost(currentLevel),
      effect: this.calculateAttackLevelEffect(currentLevel + 1), // 次のレベルの効果
    };
  }

  /**
   * 攻撃力LvUPを実行
   * 
   * @returns 強化に成功した場合true
   */
  static upgradeAttackLevel(): boolean {
    const info = this.getAttackLevelInfo();
    
    // 転生石を消費
    const success = Rebirth.spendRebirthStones(info.cost);
    
    if (!success) {
      return false;
    }
    
    // レベルを上げる
    const saveData = loadSaveData();
    const updatedSaveData: SaveData = {
      ...saveData,
      attackLevel: saveData.attackLevel + 1,
    };
    
    saveSaveData(updatedSaveData, true); // 強制保存（重要イベント）
    
    return true;
  }

  /**
   * 現在の攻撃力レベルを取得
   * 
   * @returns 攻撃力レベル
   */
  static getAttackLevel(): number {
    const saveData = loadSaveData();
    return saveData.attackLevel;
  }
}

