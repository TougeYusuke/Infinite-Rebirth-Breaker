/**
 * UpgradeScene - 強化シーン
 * 
 * 転生石を消費して永続強化を行う画面
 */

import Phaser from 'phaser';
import { Upgrade, UpgradeInfo } from '../systems/Upgrade';
import { Rebirth } from '../systems/Rebirth';
import { formatNumber } from '../utils/Formatter';

/**
 * 強化シーン
 * 
 * 転生石を消費して永続強化を行う
 */
export class UpgradeScene extends Phaser.Scene {
  private upgradeInfo: UpgradeInfo | null = null;

  constructor() {
    super({ key: 'UpgradeScene' });
  }

  create(): void {
    // 背景色
    this.cameras.main.setBackgroundColor('#1a1a1a');
    
    const centerX = this.cameras.main.width / 2;
    
    // 上部から詰めて配置
    let currentY = 60; // 開始位置を上げる (100 -> 60)
    
    // タイトル
    this.add.text(centerX, currentY, '強化メニュー', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    currentY += 60; // 70 -> 60
    
    // 現在の転生石表示
    const currentStones = Rebirth.getCurrentRebirthStones();
    this.add.text(centerX, currentY, `所持転生石: ${formatNumber(currentStones.getValue())}`, {
      fontSize: '24px',
      color: '#ffd700',
    }).setOrigin(0.5);
    
    currentY += 50; 
    
    // 強化情報を取得
    this.upgradeInfo = Upgrade.getAttackLevelInfo();
    
    // 攻撃力LvUP表示
    this.add.text(centerX, currentY, `攻撃力 Lv.${this.upgradeInfo.currentLevel}`, {
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    currentY += 45;
    
    // コスト表示
    this.add.text(centerX, currentY, `コスト: ${this.upgradeInfo.cost} 転生石`, {
      fontSize: '20px',
      color: '#cccccc',
    }).setOrigin(0.5);
    
    currentY += 35;
    
    // 効果表示
    this.add.text(centerX, currentY, `効果: ダメージ ${this.upgradeInfo.effect.toFixed(1)}倍`, {
      fontSize: '20px',
      color: '#4A90E2',
    }).setOrigin(0.5);
    
    currentY += 80; // ボタンまでの間隔を少し確保
    
    // 強化ボタン
    const upgradeButton = this.add.text(centerX, currentY, '強化する', {
      fontSize: '32px',
      color: '#4A90E2',
      fontStyle: 'bold',
      backgroundColor: '#2a2a2a',
      padding: { x: 40, y: 20 },
    }).setOrigin(0.5);
    
    upgradeButton.setInteractive({ useHandCursor: true });
    upgradeButton.on('pointerdown', () => {
      this.handleUpgrade();
    });
    
    // 戻るボタン
    // 強化ボタンから十分な間隔を空ける
    currentY += 100;
    
    const backButton = this.add.text(centerX, currentY, '戻る', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 30, y: 15 },
    }).setOrigin(0.5);
    
    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => {
      this.scene.start('GameOverScene');
    });
  }

  /**
   * 強化処理
   */
  private handleUpgrade(): void {
    if (!this.upgradeInfo) {
      return;
    }
    
    // 転生石が足りるかチェック
    const currentStones = Rebirth.getCurrentRebirthStones();
    if (currentStones.lessThan(this.upgradeInfo.cost)) {
      // 転生石が足りない
      console.log('転生石が足りません');
      return;
    }
    
    // 強化を実行
    const success = Upgrade.upgradeAttackLevel();
    
    if (success) {
      // 強化成功 - シーンを再描画
      this.scene.restart();
    } else {
      console.log('強化に失敗しました');
    }
  }
}

