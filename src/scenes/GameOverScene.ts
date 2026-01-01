/**
 * GameOverScene - ゲームオーバーシーン
 * 
 * ゲームオーバー画面を管理
 */

import Phaser from 'phaser';
import { DecimalWrapper } from '../utils/Decimal';
import { formatNumber } from '../utils/Formatter';

/**
 * ゲームオーバー情報
 */
export interface GameOverInfo {
  reachedStage: number;        // 到達ステージ
  rebirthStones: number;      // 獲得転生石
  totalDamage: DecimalWrapper; // 累計ダメージ
}

/**
 * ゲームオーバーシーン
 * 
 * 到達ステージ、獲得転生石を表示し、再開選択画面へ遷移
 */
export class GameOverScene extends Phaser.Scene {
  private gameOverInfo: GameOverInfo | null = null;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  /**
   * ゲームオーバー情報を設定
   * 
   * @param info - ゲームオーバー情報
   */
  setGameOverInfo(info: GameOverInfo): void {
    this.gameOverInfo = info;
  }

  create(): void {
    // 背景色
    this.cameras.main.setBackgroundColor('#1a1a1a');
    
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // タイトル
    this.add.text(centerX, 100, 'Game Over', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    if (this.gameOverInfo) {
      // 到達ステージ表示
      this.add.text(centerX, centerY - 100, `到達ステージ: ${this.gameOverInfo.reachedStage}`, {
        fontSize: '32px',
        color: '#ffffff',
      }).setOrigin(0.5);
      
      // 獲得転生石表示
      this.add.text(centerX, centerY - 50, `獲得転生石: ${this.gameOverInfo.rebirthStones}`, {
        fontSize: '32px',
        color: '#ffd700',
      }).setOrigin(0.5);
      
      // 累計ダメージ表示
      const damageText = formatNumber(this.gameOverInfo.totalDamage.getValue());
      this.add.text(centerX, centerY, `累計ダメージ: ${damageText}`, {
        fontSize: '24px',
        color: '#cccccc',
      }).setOrigin(0.5);
    }
    
    // 再開ボタン（仮実装 - 後で実装）
    const restartButton = this.add.text(centerX, centerY + 150, 'タップして再開', {
      fontSize: '32px',
      color: '#4A90E2',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.on('pointerdown', () => {
      // 再開処理（後で実装）
      this.scene.start('BattleScene');
    });
    
    // タップで再開
    this.input.once('pointerdown', () => {
      this.scene.start('BattleScene');
    });
  }
}

