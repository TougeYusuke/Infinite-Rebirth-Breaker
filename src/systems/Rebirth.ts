/**
 * Rebirth - 転生システム
 * 
 * 転生石の計算と管理を行う
 */

import { DecimalWrapper } from '../utils/Decimal';
import { loadSaveData, saveSaveData, SaveData } from '../utils/Storage';

/**
 * 転生システム
 * 
 * 転生石の計算、獲得、保存を管理
 */
export class Rebirth {
  /**
   * 転生石を計算
   * 
   * 計算式: Math.floor(stage ^ 1.5)
   * 
   * @param stage - 到達ステージ
   * @returns 獲得転生石（整数）
   */
  static calculateRebirthStones(stage: number): number {
    return DecimalWrapper.calculateRebirthStones(stage);
  }

  /**
   * 転生石を獲得
   * 
   * @param stage - 到達ステージ
   * @returns 獲得した転生石の数
   */
  static gainRebirthStones(stage: number): number {
    const stones = this.calculateRebirthStones(stage);
    
    // セーブデータを読み込む
    const saveData = loadSaveData();
    
    // 転生石を追加
    const currentStones = new DecimalWrapper(saveData.rebirthStones);
    const newStones = currentStones.add(stones);
    
    // セーブデータを更新
    const updatedSaveData: SaveData = {
      ...saveData,
      rebirthStones: newStones.toString(),
      maxStage: Math.max(saveData.maxStage, stage),
    };
    
    saveSaveData(updatedSaveData, true); // 強制保存（重要イベント）
    
    return stones;
  }

  /**
   * 現在の転生石を取得
   * 
   * @returns 現在の転生石（DecimalWrapper）
   */
  static getCurrentRebirthStones(): DecimalWrapper {
    const saveData = loadSaveData();
    return new DecimalWrapper(saveData.rebirthStones);
  }

  /**
   * 転生石を消費
   * 
   * @param amount - 消費する転生石の数
   * @returns 消費に成功した場合true
   */
  static spendRebirthStones(amount: number): boolean {
    const saveData = loadSaveData();
    const currentStones = new DecimalWrapper(saveData.rebirthStones);
    const amountDecimal = new DecimalWrapper(amount);
    
    // 転生石が足りない場合はfalse
    if (currentStones.lessThan(amountDecimal)) {
      return false;
    }
    
    // 転生石を消費
    const newStones = currentStones.sub(amountDecimal);
    
    // セーブデータを更新
    const updatedSaveData: SaveData = {
      ...saveData,
      rebirthStones: newStones.toString(),
    };
    
    saveSaveData(updatedSaveData, true); // 強制保存（重要イベント）
    
    return true;
  }

  /**
   * 最高到達ステージを取得
   * 
   * @returns 最高到達ステージ
   */
  static getMaxStage(): number {
    const saveData = loadSaveData();
    return saveData.maxStage;
  }
}

