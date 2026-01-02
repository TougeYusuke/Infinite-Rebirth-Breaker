/**
 * AwakeningEffect - 覚醒モードのエフェクト
 * 
 * 覚醒モード発動時の視覚効果を管理
 */

import Phaser from 'phaser';
import { AwakeningType } from '../systems/AwakeningSystem';

/**
 * 覚醒モードのエフェクト
 */
export class AwakeningEffect {
  private scene: Phaser.Scene;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private overlay: Phaser.GameObjects.Graphics | null = null;
  private glowEffect: Phaser.GameObjects.Graphics | null = null;
  private isActive: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 覚醒モードのエフェクトを開始
   */
  start(awakeningType: AwakeningType, reiaX: number, reiaY: number): void {
    if (this.isActive) {
      this.stop();
    }
    
    this.isActive = true;
    
    // 画面全体を明るくするオーバーレイ
    this.createOverlay(awakeningType);
    
    // れいあの周りに光るエフェクト
    this.createGlowEffect(reiaX, reiaY, awakeningType);
    
    // コードが舞い散るエフェクト
    this.createCodeParticles(reiaX, reiaY, awakeningType);
  }

  /**
   * エフェクトを停止
   */
  stop(): void {
    this.isActive = false;
    
    // パーティクルを停止
    for (const emitter of this.particles) {
      emitter.stop();
      emitter.destroy();
    }
    this.particles = [];
    
    // オーバーレイを削除
    if (this.overlay) {
      this.overlay.destroy();
      this.overlay = null;
    }
    
    // グローエフェクトを削除
    if (this.glowEffect) {
      this.glowEffect.destroy();
      this.glowEffect = null;
    }
  }

  /**
   * 画面全体を明るくするオーバーレイを作成
   */
  private createOverlay(awakeningType: AwakeningType): void {
    const camera = this.scene.cameras.main;
    const width = camera.width;
    const height = camera.height;
    
    // 覚醒タイプに応じた色
    const colors = {
      [AwakeningType.FOCUS]: 0x4ecdc4,      // 青緑（集中）
      [AwakeningType.BURST]: 0xff6b6b,      // 赤（爆発）
      [AwakeningType.CREATIVE]: 0xffd93d,   // 黄色（創造）
    };
    
    const color = colors[awakeningType] || 0xffffff;
    
    this.overlay = this.scene.add.graphics();
    this.overlay.fillStyle(color, 0.2); // 半透明
    this.overlay.fillRect(0, 0, width, height);
    this.overlay.setDepth(5);
    
    // フェードイン・フェードアウトアニメーション
    this.overlay.setAlpha(0);
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0.2,
      duration: 300,
      ease: 'Power2',
    });
  }

  /**
   * れいあの周りに光るエフェクトを作成
   */
  private createGlowEffect(reiaX: number, reiaY: number, awakeningType: AwakeningType): void {
    const colors = {
      [AwakeningType.FOCUS]: 0x4ecdc4,
      [AwakeningType.BURST]: 0xff6b6b,
      [AwakeningType.CREATIVE]: 0xffd93d,
    };
    
    const color = colors[awakeningType] || 0xffffff;
    
    this.glowEffect = this.scene.add.graphics();
    this.glowEffect.setDepth(6);
    
    // パルスアニメーション
    const pulse = () => {
      if (!this.glowEffect || !this.isActive) {
        return;
      }
      
      this.glowEffect.clear();
      this.glowEffect.fillStyle(color, 0.5);
      this.glowEffect.fillCircle(reiaX, reiaY, 50);
      
      this.scene.tweens.add({
        targets: { radius: 50 },
        radius: 80,
        duration: 500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        onUpdate: (tween: Phaser.Tweens.Tween) => {
          if (!this.glowEffect || !this.isActive) {
            return;
          }
          const radius = tween.getValue(0) as number;
          if (radius === null || isNaN(radius)) {
            return;
          }
          this.glowEffect.clear();
          this.glowEffect.fillStyle(color, 0.5);
          this.glowEffect.fillCircle(reiaX, reiaY, radius);
        },
      });
    };
    
    pulse();
  }

  /**
   * コードが舞い散るエフェクトを作成
   */
  private createCodeParticles(reiaX: number, reiaY: number, _awakeningType: AwakeningType): void {
    // コードアイコンのリスト
    const codeIcons = ['</>', '{}', '[]', '()', '=>', '++', '--'];
    
    // テキストパーティクルを作成（コードアイコンを表示）
    for (let i = 0; i < 20; i++) {
      const icon = codeIcons[Math.floor(Math.random() * codeIcons.length)];
      const text = this.scene.add.text(reiaX, reiaY, icon, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      });
      text.setDepth(7);
      
      // ランダムな方向に飛ばす
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 100;
      const targetX = reiaX + Math.cos(angle) * distance;
      const targetY = reiaY + Math.sin(angle) * distance;
      
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
    }
  }

  /**
   * 更新処理
   */
  update(): void {
    // 必要に応じて更新処理を追加
  }
}

