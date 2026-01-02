/**
 * Reia - れいあキャラクター
 * 
 * 画面中央に配置される、かわいい社畜エンジニア「れいあ」のキャラクター
 */

import Phaser from 'phaser';

/**
 * れいあの感情状態
 */
export enum EmotionState {
  NORMAL = 'normal',      // 平常心
  ANXIOUS = 'anxious',    // 焦り
  PANIC = 'panic',        // パニック
  FOCUSED = 'focused',    // 集中
}

/**
 * れいあの表情タイプ
 */
export enum ExpressionType {
  HAPPY = 'happy',         // 元気な表情
  TIRED = 'tired',         // 疲れた表情
  ANXIOUS = 'anxious',     // 焦った表情
  FOCUSED = 'focused',     // 集中した表情
  EXCITED = 'excited',     // テンションMAXの表情
}

/**
 * れいあの設定
 */
export interface ReiaConfig {
  x: number;              // X座標（通常は画面中央）
  y: number;              // Y座標（通常は画面中央）
  scale?: number;          // スケール（デフォルト: 1.0）
}

/**
 * れいあキャラクター
 */
export class Reia extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite | null = null;
  private emotionState: EmotionState = EmotionState.NORMAL;
  private expressionType: ExpressionType = ExpressionType.HAPPY;
  private stressLevel: number = 0; // 0-100
  private comboCount: number = 0;
  private hp: number = 100;
  private maxHp: number = 100;
  private baseY: number = 0; // 元のY座標（アニメーション用）

  constructor(scene: Phaser.Scene, config: ReiaConfig) {
    super(scene, config.x, config.y);
    
    // 元のY座標を保存
    this.baseY = config.y;
    
    // シーンに追加
    scene.add.existing(this);
    
    // スプライトの作成（プロトタイプではシンプルな図形で表現）
    this.createSprite();
    
    // 初期アニメーション
    this.playIdleAnimation();
  }

  /**
   * スプライトの作成
   */
  private createSprite(): void {
    // スプライトシートから画像を作成
    // フレームサイズ 192x192 を想定
    this.sprite = this.scene.add.sprite(0, 0, 'reia', 1); // デフォルトは上段中央（微笑み）
    
    // サイズ調整（画面に合わせて少し縮小などが必要ならここで行う）
    // 元が192pxなので、少し大きいかもしれない
    this.sprite.setScale(0.8);
    
    this.add(this.sprite);
    
    // デバッグ用の名前表示（オプション）
    // const text = this.scene.add.text(0, 80, 'れいあ', {
    //   fontSize: '16px',
    //   color: '#ffffff',
    //   fontStyle: 'bold',
    // }).setOrigin(0.5);
    // this.add(text);
  }

  /**
   * 待機アニメーション
   */
  playIdleAnimation(): void {
    if (this.sprite) {
      this.sprite.setFrame(1); // 上段中央（微笑み）
    }

    // ふわふわ浮くアニメーション
    this.scene.tweens.add({
      targets: this,
      y: this.baseY - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * タップ時アニメーション
   */
  playTapAnimation(): void {
    if (this.sprite) {
      this.sprite.setFrame(5); // 中段右（指差しコード魔法）
      
      // 一定時間後に待機ポーズに戻る
      this.scene.time.delayedCall(300, () => {
        if (this.emotionState === EmotionState.NORMAL) {
            this.playIdleAnimation();
        } else {
            this.updateExpression(); // 現在の状態に合わせた表情に戻す
        }
      });
    }

    // 既存のアニメーションを停止（連打対策）
    this.scene.tweens.killTweensOf(this);
    this.y = this.baseY; // 位置リセット
    
    // 前に飛び出す動き
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.9, // 少し潰れる（予備動作）
      scaleY: 0.9,
      duration: 50,
      yoyo: true,
      onComplete: () => {
          this.scene.tweens.add({
            targets: this,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 100,
          });
      }
    });
  }

  /**
   * 表情を更新
   */
  private updateExpression(): void {
    if (!this.sprite) return;

    // HP状態に応じた表情
    const hpRatio = this.hp / this.maxHp;
    
    // 優先度高：ゲームオーバー/気絶
    if (hpRatio <= 0) {
        this.sprite.setFrame(8); // 下段右（気絶）
        return;
    }

    // ストレス/HPによる状態変化
    if (this.stressLevel >= 80 || hpRatio <= 0.2) {
        this.sprite.setFrame(7); // 下段中央（パニック）
    } else if (this.stressLevel >= 50) {
        this.sprite.setFrame(6); // 下段左（泣き/困り）
    } else if (this.comboCount >= 10) {
        this.sprite.setFrame(4); // 中段中央（レンチ/やる気）
    } else {
        this.sprite.setFrame(1); // 上段中央（通常）
    }
  }

  /**
   * 覚醒モードのアニメーション
   */
  playAwakeningAnimation(type: 'focus' | 'burst' | 'creative'): void {
    if (!this.sprite) return;

    // タイプに応じたポーズ
    switch (type) {
        case 'focus':
            this.sprite.setFrame(2); // 上段右（キリッ）
            break;
        case 'burst':
            this.sprite.setFrame(4); // 中段中央（レンチ攻撃）
            break;
        case 'creative':
            this.sprite.setFrame(5); // 中段右（指差し）
            break;
    }

    // 演出エフェクト
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Power2',
    });
  }

  /**
   * 破棄
   */
  destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
    super.destroy();
  }
}

