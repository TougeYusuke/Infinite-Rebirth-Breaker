/**
 * BattleScene - バトルシーン
 * 
 * メインのバトル画面を管理
 */

import Phaser from 'phaser';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    // バトル画面の初期化
    console.log('BattleScene: バトル開始');
    
    // 背景色
    this.cameras.main.setBackgroundColor('#2a2a2a');
    
    // テスト用テキスト
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Infinite Rebirth Breaker\nバトル画面（開発中）',
      {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
      }
    ).setOrigin(0.5);
  }
}

