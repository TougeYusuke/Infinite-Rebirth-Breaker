/**
 * BootScene - 起動シーン
 * 
 * ゲームの初期化とローディングを管理
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // ここでアセットをロード
    // 例: this.load.image('logo', 'assets/logo.png');
  }

  create(): void {
    // 起動処理
    console.log('BootScene: ゲーム起動');
    
    // BattleSceneに遷移
    this.scene.start('BattleScene');
  }
}

