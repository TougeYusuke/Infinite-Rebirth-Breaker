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
    // ローディングバーの表示
    this.createLoadingBar();

    // --- アセットのロード ---

    // れいあキャラクター（スプライトシート）
    // 想定: 3x3グリッド
    // Bing Image Creator (1024x1024) の場合、1コマは約341px
    this.load.spritesheet('reia', 'assets/images/characters/reia_sheet.png', {
      frameWidth: 341, // 1024 / 3 ≒ 341
      frameHeight: 341,
    });
  }

  create(): void {
    console.log('BootScene: ゲーム起動');
    
    // GameSceneに遷移
    this.scene.start('GameScene');
  }

  /**
   * ローディングバーを作成
   */
  private createLoadingBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);
    
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }
}
