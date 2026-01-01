/**
 * DamagePopup - ダメージポップアップ
 * 
 * ダメージ数値をポップアップ表示するクラス
 */

import Phaser from 'phaser';
import { DecimalWrapper } from '../utils/Decimal';
import { formatNumber } from '../utils/Formatter';

/**
 * ダメージポップアップの設定
 */
export interface DamagePopupConfig {
  x: number;           // X座標
  y: number;           // Y座標
  damage: DecimalWrapper; // ダメージ値
}

/**
 * ダメージの大きさに応じた色
 */
enum DamageColor {
  SMALL = 0x4A90E2,    // 青（小）
  MEDIUM = 0xF5A623,   // 黄（中）
  LARGE = 0xD0021B,    // 赤（大）
}

/**
 * ダメージの閾値（色を決定する）
 */
const DAMAGE_THRESHOLD_SMALL = 1000;   // 1000未満は小
const DAMAGE_THRESHOLD_MEDIUM = 100000; // 100000未満は中、それ以上は大

/**
 * ダメージポップアップクラス
 * 
 * PhaserのTextオブジェクトを使用してダメージを表示
 */
export class DamagePopup {
  private text: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;
  private tween: Phaser.Tweens.Tween | null = null;

  /**
   * コンストラクタ
   * 
   * @param scene - Phaserシーン
   * @param config - ポップアップ設定
   */
  constructor(scene: Phaser.Scene, config: DamagePopupConfig) {
    this.scene = scene;
    
    // ダメージの色を決定
    const color = this.getDamageColor(config.damage);
    
    // テキストオブジェクトを作成
    this.text = scene.add.text(config.x, config.y, formatNumber(config.damage.getValue()), {
      fontSize: '32px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    
    // アンカーを中央に設定
    this.text.setOrigin(0.5, 0.5);
    
    // アニメーションを開始
    this.startAnimation();
  }

  /**
   * ダメージの大きさに応じた色を取得
   * 
   * @param damage - ダメージ値
   * @returns 色コード
   */
  private getDamageColor(damage: DecimalWrapper): number {
    const damageNumber = damage.toNumber();
    
    if (damageNumber < DAMAGE_THRESHOLD_SMALL) {
      return DamageColor.SMALL;    // 青
    } else if (damageNumber < DAMAGE_THRESHOLD_MEDIUM) {
      return DamageColor.MEDIUM;   // 黄
    } else {
      return DamageColor.LARGE;    // 赤
    }
  }

  /**
   * アニメーションを開始
   */
  private startAnimation(): void {
    // 上に移動しながらフェードアウト
    this.tween = this.scene.tweens.add({
      targets: this.text,
      y: this.text.y - 100,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });
  }

  /**
   * ポップアップを破棄
   */
  destroy(): void {
    if (this.tween) {
      this.tween.destroy();
      this.tween = null;
    }
    
    if (this.text) {
      this.text.destroy();
    }
  }

  /**
   * ポップアップが破棄されたかどうか
   * 
   * @returns true の場合、破棄されている
   */
  isDestroyed(): boolean {
    return !this.text || !this.text.active;
  }
}

