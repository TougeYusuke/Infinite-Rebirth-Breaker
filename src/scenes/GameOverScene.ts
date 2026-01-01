/**
 * GameOverScene - ゲームオーバーシーン
 * 
 * ゲームオーバー画面を管理
 */

import Phaser from 'phaser';
import { DecimalWrapper } from '../utils/Decimal';
import { formatNumber } from '../utils/Formatter';
import { Rebirth } from '../systems/Rebirth';

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
    
    // 再開選択ボタン
    let buttonY = centerY + 100;
    
    // 「最初から無双する（Full Run）」ボタン
    const fullRunButton = this.add.text(centerX, buttonY, '最初から無双する（Full Run）', {
      fontSize: '24px',
      color: '#4A90E2',
      fontStyle: 'bold',
      backgroundColor: '#2a2a2a',
      padding: { x: 30, y: 15 },
    }).setOrigin(0.5);
    
    fullRunButton.setInteractive({ useHandCursor: true });
    fullRunButton.on('pointerdown', () => {
      this.startFullRun();
    });
    
    buttonY += 80;
    
    // 「前線へ復帰（Quick Skip）」ボタン
    const maxStage = Rebirth.getMaxStage();
    const quickSkipStage = Math.max(1, maxStage - 5);
    
    const quickSkipButton = this.add.text(centerX, buttonY, `前線へ復帰（Quick Skip）\nステージ${quickSkipStage}から開始`, {
      fontSize: '20px',
      color: '#F5A623',
      fontStyle: 'bold',
      backgroundColor: '#2a2a2a',
      padding: { x: 30, y: 15 },
      align: 'center',
    }).setOrigin(0.5);
    
    quickSkipButton.setInteractive({ useHandCursor: true });
    quickSkipButton.on('pointerdown', () => {
      this.startQuickSkip(quickSkipStage);
    });
    
    buttonY += 90;
    
    // 強化メニューボタン
    const upgradeButton = this.add.text(centerX, buttonY, '強化メニュー', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#444444',
      padding: { x: 30, y: 15 },
    }).setOrigin(0.5);
    
    upgradeButton.setInteractive({ useHandCursor: true });
    upgradeButton.on('pointerdown', () => {
      this.scene.start('UpgradeScene');
    });
  }

  /**
   * 「最初から無双する（Full Run）」で開始
   */
  private startFullRun(): void {
    // ステージ1から開始
    this.scene.start('BattleScene', { startStage: 1, isFullRun: true });
  }

  /**
   * 「前線へ復帰（Quick Skip）」で開始
   * 
   * @param startStage - 開始ステージ
   */
  private startQuickSkip(startStage: number): void {
    // 指定ステージから開始
    this.scene.start('BattleScene', { startStage: startStage, isFullRun: false });
  }
}

