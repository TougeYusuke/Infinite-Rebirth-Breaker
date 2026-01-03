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

    // れいあキャラクター（個別画像）
    // GitHub Pagesのサブパスに対応するため、絶対パスを使用
    const baseUrl = import.meta.env.BASE_URL; // '/Infinite-Rebirth-Breaker/'
    this.load.image('reia_normal', `${baseUrl}assets/images/characters/reia_normal.png`);
    this.load.image('reia_focus', `${baseUrl}assets/images/characters/reia_focus.png`);
    this.load.image('reia_attack', `${baseUrl}assets/images/characters/reia_attack.png`);
    this.load.image('reia_anxious', `${baseUrl}assets/images/characters/reia_anxious.png`);
    this.load.image('reia_panic', `${baseUrl}assets/images/characters/reia_panic.png`);
    this.load.image('reia_damage', `${baseUrl}assets/images/characters/reia_damage.png`);

    // タスク（敵）画像
    // GitHub Pagesのサブパスに対応するため、絶対パスを使用
    const baseUrl = import.meta.env.BASE_URL; // '/Infinite-Rebirth-Breaker/'
    this.load.image('task_bug', `${baseUrl}assets/images/tasks/task_bug.png`);
    this.load.image('task_feature', `${baseUrl}assets/images/tasks/task_feature.png`);
    this.load.image('task_review', `${baseUrl}assets/images/tasks/task_review.png`);
    this.load.image('task_urgent', `${baseUrl}assets/images/tasks/task_urgent.png`);
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
