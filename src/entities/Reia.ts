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
   * プロトタイプでは、シンプルな図形で表現
   */
  private createSprite(): void {
    // プロトタイプ: シンプルな円形で表現（後でスプライト画像に置き換え可能）
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0xff69b4, 1.0); // ピンク色
    graphics.fillCircle(0, 0, 40); // 半径40の円
    graphics.setDepth(10);
    
    // Containerに追加
    this.add(graphics);
    
    // テキストで「れいあ」と表示（プロトタイプ）
    const text = this.scene.add.text(0, 50, 'れいあ', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(text);
  }

  /**
   * 待機アニメーション
   */
  playIdleAnimation(): void {
    // 時々首をかしげるアニメーション（角度のみ、位置は変更しない）
    this.scene.tweens.add({
      targets: this,
      angle: -5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * タップ時アニメーション
   */
  playTapAnimation(): void {
    // 既存のアニメーションを停止（連打対策）
    this.scene.tweens.killTweensOf(this);
    
    // 元の位置に戻す（念のため）
    this.y = this.baseY;
    
    // キーボードを叩くアニメーション（上下に少し動く）
    this.scene.tweens.add({
      targets: this,
      y: this.baseY - 10, // 元の位置から-10
      duration: 100,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        // アニメーション完了後、確実に元の位置に戻す
        this.y = this.baseY;
      },
    });
  }

  /**
   * ストレスレベルを設定
   */
  setStressLevel(stress: number): void {
    this.stressLevel = Math.max(0, Math.min(100, stress));
    this.updateEmotionState();
    this.updateExpression();
  }

  /**
   * ストレスレベルを取得
   */
  getStressLevel(): number {
    return this.stressLevel;
  }

  /**
   * コンボ数を設定
   */
  setComboCount(combo: number): void {
    this.comboCount = combo;
    this.updateEmotionState();
    this.updateExpression();
  }

  /**
   * HPを設定
   */
  setHP(hp: number, maxHp: number): void {
    this.hp = hp;
    this.maxHp = maxHp;
    this.updateExpression();
  }

  /**
   * 感情状態を更新
   */
  private updateEmotionState(): void {
    // コンボ中でストレスが低い場合は「集中」
    if (this.comboCount >= 5 && this.stressLevel < 30) {
      this.emotionState = EmotionState.FOCUSED;
      return;
    }

    // ストレスレベルに応じて感情状態を決定
    if (this.stressLevel <= 30) {
      this.emotionState = EmotionState.NORMAL;
    } else if (this.stressLevel <= 70) {
      this.emotionState = EmotionState.ANXIOUS;
    } else {
      this.emotionState = EmotionState.PANIC;
    }
  }

  /**
   * 表情を更新
   */
  private updateExpression(): void {
    // HP状態に応じた表情
    const hpRatio = this.hp / this.maxHp;
    if (hpRatio <= 0.2) {
      this.expressionType = ExpressionType.ANXIOUS;
    } else if (hpRatio <= 0.5) {
      this.expressionType = ExpressionType.TIRED;
    } else {
      // コンボ状態に応じた表情
      if (this.comboCount >= 51) {
        this.expressionType = ExpressionType.EXCITED;
      } else if (this.comboCount >= 11) {
        this.expressionType = ExpressionType.FOCUSED;
      } else {
        this.expressionType = ExpressionType.HAPPY;
      }
    }
  }

  /**
   * 感情状態を取得
   */
  getEmotionState(): EmotionState {
    return this.emotionState;
  }

  /**
   * 表情タイプを取得
   */
  getExpressionType(): ExpressionType {
    return this.expressionType;
  }

  /**
   * 感情状態に応じたステータス倍率を取得
   */
  getStatusMultiplier(): { attack: number; speed: number } {
    switch (this.emotionState) {
      case EmotionState.NORMAL:
        return { attack: 1.0, speed: 1.0 };
      case EmotionState.ANXIOUS:
        return { attack: 0.8, speed: 1.2 }; // 焦って早く打つが、ミスが増える
      case EmotionState.PANIC:
        return { attack: 0.5, speed: 0.8 }; // 混乱して効率が悪い
      case EmotionState.FOCUSED:
        return { attack: 1.2, speed: 1.1 }; // ゾーンに入る
      default:
        return { attack: 1.0, speed: 1.0 };
    }
  }

  /**
   * セリフを取得（感情状態に応じた）
   */
  getDialogue(): string {
    if (this.stressLevel >= 80) {
      return '無理...';
    } else if (this.stressLevel >= 50) {
      return 'やばい...';
    } else if (this.comboCount >= 20) {
      return '調子いい！';
    } else if (this.comboCount >= 10) {
      return 'いける！';
    } else {
      return '';
    }
  }

  /**
   * 覚醒モードのアニメーション
   */
  playAwakeningAnimation(_type: 'focus' | 'burst' | 'creative'): void {
    // 目が光るエフェクト
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Power2',
    });

    // 周りにエフェクトを追加（後で実装）
    // TODO: エフェクトマネージャーと連携
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

