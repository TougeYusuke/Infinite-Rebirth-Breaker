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
  private isAttackAnimation: boolean = false; // 攻撃アニメーション中かどうか
  private attackAnimationTimer: Phaser.Time.TimerEvent | null = null; // 攻撃アニメーションのタイマー

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
    // 初期画像を作成（通常状態）
    this.sprite = this.scene.add.sprite(0, 0, 'reia_normal');

    // サイズ調整
    // 個別画像はサイズがバラバラの可能性があるため、必要に応じて調整
    // ここでは基準サイズに合わせてスケールを設定するか、縮小率を指定する
    this.sprite.setScale(0.25);

    // アンカー調整
    this.sprite.setOrigin(0.5, 0.5);

    this.add(this.sprite);
  }

  /**
   * 待機アニメーション
   */
  playIdleAnimation(): void {
    // 既存のアニメーションを停止
    this.scene.tweens.killTweensOf(this);

    if (this.sprite) {
      this.changeTexture('reia_normal');
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
      // 画像が読み込まれているか確認
      const texture = this.scene.textures.get('reia_attack');
      if (!texture) {
        return;
      }

      // 既存のアニメーションを停止（連打対策）
      this.scene.tweens.killTweensOf(this);

      // 既存のタイマーがあればキャンセル
      if (this.attackAnimationTimer) {
        this.attackAnimationTimer.destroy();
        this.attackAnimationTimer = null;
      }

      // 攻撃アニメーションフラグを立てる
      this.isAttackAnimation = true;

      // changeTextureメソッドを使用してテクスチャを変更
      this.changeTexture('reia_attack');

      // 新しいタイマーを開始（1秒後に待機ポーズに戻る）
      this.attackAnimationTimer = this.scene.time.delayedCall(1000, () => {
        // 攻撃アニメーションフラグを解除
        this.isAttackAnimation = false;
        this.attackAnimationTimer = null;

        if (this.emotionState === EmotionState.NORMAL) {
          this.playIdleAnimation();
        } else {
          this.updateExpression(); // 現在の状態に合わせた表情に戻す
        }
      });
    }

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
    // 攻撃アニメーション中は画像を変更しない
    if (this.isAttackAnimation) {
      return;
    }

    if (!this.sprite) return;

    // HP状態に応じた表情
    const hpRatio = this.hp / this.maxHp;

    // 優先度高：ゲームオーバー/気絶
    if (hpRatio <= 0) {
      this.changeTexture('reia_damage');
      return;
    }

    // ストレス/HPによる状態変化
    if (this.stressLevel >= 80 || hpRatio <= 0.2) {
      this.changeTexture('reia_panic');
    } else if (this.stressLevel >= 50) {
      this.changeTexture('reia_anxious');
    } else if (this.comboCount >= 10) {
      this.changeTexture('reia_focus');
    } else {
      this.changeTexture('reia_normal');
    }
  }

  /**
   * テクスチャを変更（Container内のスプライト対応）
   */
  private changeTexture(textureKey: string): void {
    if (!this.sprite) {
      return;
    }

    // 画像が読み込まれているか確認
    const texture = this.scene.textures.get(textureKey);
    if (!texture) {
      return;
    }

    // 現在のスプライトの状態を保存
    const oldX = this.sprite.x;
    const oldY = this.sprite.y;
    const oldScale = this.sprite.scaleX;

    // Containerからスプライトを削除
    this.remove(this.sprite);

    // 古いスプライトを削除
    this.sprite.destroy();
    this.sprite = null;

    // 新しいテクスチャでスプライトを再作成
    this.sprite = this.scene.add.sprite(oldX, oldY, textureKey);
    this.sprite.setScale(oldScale);
    this.sprite.setOrigin(0.5, 0.5);

    // Containerに追加
    this.add(this.sprite);
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
   * 注意: スケールアニメーションは削除（仕様にないため）
   * 視覚効果はAwakeningEffectで管理
   */
  playAwakeningAnimation(type: 'focus' | 'burst' | 'creative'): void {
    if (!this.sprite) return;

    // タイプに応じたポーズ（画像のみ変更、スケールは変更しない）
    switch (type) {
      case 'focus':
        this.changeTexture('reia_focus');
        break;
      case 'burst':
        this.changeTexture('reia_attack'); // 攻撃画像
        break;
      case 'creative':
        this.changeTexture('reia_attack'); // 攻撃画像
        break;
    }

    // スケールを確実に元の値（0.25）に戻す
    if (this.sprite) {
      this.sprite.setScale(0.25);
    }
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
