/**
 * ScreenClearEffect - 画面クリア演出
 * 
 * 爆発覚醒でタスクを全滅させた時の視覚効果
 */

import Phaser from 'phaser';

/**
 * 画面クリア演出
 */
export class ScreenClearEffect {
  private scene: Phaser.Scene;
  private isActive: boolean = false;
  private particles: Phaser.GameObjects.Text[] = [];
  private overlay: Phaser.GameObjects.Graphics | null = null;
  private clearText: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 画面クリア演出を開始
   */
  start(): void {
    if (this.isActive) {
      return;
    }
    
    this.isActive = true;
    const camera = this.scene.cameras.main;
    const centerX = camera.width / 2;
    const centerY = camera.height / 2;
    
    // 画面全体を明るくするオーバーレイ
    this.overlay = this.scene.add.graphics();
    this.overlay.fillStyle(0xffffff, 0.3);
    this.overlay.fillRect(0, 0, camera.width, camera.height);
    this.overlay.setDepth(8);
    this.overlay.setAlpha(0);
    
    // フェードイン
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0.3,
      duration: 200,
      ease: 'Power2',
    });
    
    // 「CLEAR!」テキスト
    this.clearText = this.scene.add.text(centerX, centerY, 'CLEAR!', {
      fontSize: '64px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.clearText.setOrigin(0.5);
    this.clearText.setDepth(9);
    this.clearText.setAlpha(0);
    this.clearText.setScale(0.5);
    
    // テキストのアニメーション（拡大→フェードアウト）
    this.scene.tweens.add({
      targets: this.clearText,
      alpha: 1.0,
      scale: 1.2,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (this.clearText) {
          this.scene.tweens.add({
            targets: this.clearText,
            alpha: 0,
            scale: 1.5,
            duration: 500,
            delay: 300,
            ease: 'Power2',
            onComplete: () => {
              if (this.clearText) {
                this.clearText.destroy();
                this.clearText = null;
              }
            },
          });
        }
      },
    });
    
    // 星やハートが飛び散るエフェクト
    this.createCelebrationParticles(centerX, centerY);
    
    // 演出終了
    this.scene.time.delayedCall(1500, () => {
      this.stop();
    });
  }

  /**
   * お祝いパーティクルを作成
   */
  private createCelebrationParticles(centerX: number, centerY: number): void {
    const symbols = ['✨', '⭐', '💫', '🌟', '💖', '❤️', '💝'];
    
    for (let i = 0; i < 30; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const text = this.scene.add.text(centerX, centerY, symbol, {
        fontSize: '32px',
      });
      text.setDepth(9);
      
      // ランダムな方向に飛ばす
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 150;
      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY + Math.sin(angle) * distance;
      
      // 回転アニメーション
      this.scene.tweens.add({
        targets: text,
        rotation: Math.PI * 2,
        duration: 1000,
        ease: 'Power2',
      });
      
      // 移動とフェードアウト
      this.scene.tweens.add({
        targets: text,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.5,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          text.destroy();
        },
      });
      
      this.particles.push(text);
    }
  }

  /**
   * 演出を停止
   */
  stop(): void {
    this.isActive = false;
    
    // オーバーレイをフェードアウト
    if (this.overlay) {
      this.scene.tweens.add({
        targets: this.overlay,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
          }
        },
      });
    }
    
    // パーティクルを削除
    for (const particle of this.particles) {
      if (particle && particle.active) {
        particle.destroy();
      }
    }
    this.particles = [];
  }

  /**
   * 更新処理
   */
  update(): void {
    // 必要に応じて更新処理を追加
  }
}

