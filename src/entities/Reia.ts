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
    // フレームサイズ 400x400 を想定
    this.sprite = this.scene.add.sprite(0, 0, 'reia', 1); // デフォルトは上段中央（微笑み）
    
    // サイズ調整
    // 400pxだとかなり大きいので縮小 (約100-120px程度に)
    this.sprite.setScale(0.25);
    
    // アンカー調整（足元が見切れる場合の微調整）
    // 原点を中心(0.5, 0.5)から少し下(0.5, 0.6)などにずらすことで表示位置を変えることが可能
    // 今回は標準の0.5でまず確認
    this.sprite.setOrigin(0.5, 0.5);
    
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
   */
  playAwakeningAnimation(type: 'focus' | 'burst' | 'creative'): void {
    if (!this.sprite) return;

    // タイプに応じたポーズ
    switch (type) {
        case 'focus':
            this.sprite.setTexture('reia_focus');
            break;
        case 'burst':
            this.sprite.setTexture('reia_attack'); // 攻撃画像
            break;
        case 'creative':
            this.sprite.setTexture('reia_attack'); // 攻撃画像
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

