/**
 * CodeBullet - コードの弾丸
 * 
 * れいあが発射する「コード」の弾丸
 */

import Phaser from 'phaser';
import { DecimalWrapper } from '../utils/Decimal';

/**
 * コードの弾丸の設定
 */
export interface CodeBulletConfig {
  x: number;              // 発射位置X
  y: number;              // 発射位置Y
  targetX: number;        // 目標位置X
  targetY: number;        // 目標位置Y
  speed: number;          // 速度（ピクセル/秒）
  damage: DecimalWrapper; // ダメージ
}

/**
 * コードのアイコン（ランダムに選択）
 */
const CODE_ICONS = ['</>', '{}', '[]', '()', '=>', '++', '--'];

/**
 * コードの弾丸
 */
export class CodeBullet extends Phaser.GameObjects.Container {
  private damage: DecimalWrapper;
  private speed: number;
  private targetX: number;
  private targetY: number;
  private iconText: Phaser.GameObjects.Text | null = null;
  private hasHit: boolean = false;

  constructor(scene: Phaser.Scene, config: CodeBulletConfig) {
    super(scene, config.x, config.y);
    
    this.damage = config.damage;
    this.speed = config.speed;
    this.targetX = config.targetX;
    this.targetY = config.targetY;
    
    // シーンに追加
    scene.add.existing(this);
    
    // アイコンの作成
    this.createIcon();
    
    // 発射方向を計算
    this.calculateDirection();
  }

  /**
   * アイコンの作成
   */
  private createIcon(): void {
    // ランダムにアイコンを選択
    const icon = CODE_ICONS[Math.floor(Math.random() * CODE_ICONS.length)];
    
    this.iconText = this.scene.add.text(0, 0, icon, {
      fontSize: '24px',
      color: '#4ecdc4',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(8);
    
    this.add(this.iconText);
    
    // 回転アニメーション
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 1000,
      repeat: -1,
      ease: 'Linear',
    });
  }

  /**
   * 発射方向を計算
   */
  private calculateDirection(): void {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      // 角度を計算（ラジアン）
      const angle = Math.atan2(dy, dx);
      this.rotation = angle;
    }
  }

  /**
   * 更新処理
   */
  update(delta: number): boolean {
    // 既に当たっている場合は削除
    if (this.hasHit) {
      return true; // 削除フラグ
    }
    
    // 目標位置に向かって移動
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 10) {
      // 目標位置に到達したら削除
      return true;
    }
    
    // 移動
    const moveDistance = (this.speed * delta) / 1000; // ピクセル/秒をピクセル/フレームに変換
    const moveX = (dx / distance) * moveDistance;
    const moveY = (dy / distance) * moveDistance;
    
    this.x += moveX;
    this.y += moveY;
    
    return false; // まだ有効
  }

  /**
   * ダメージを取得
   */
  getDamage(): DecimalWrapper {
    return this.damage;
  }

  /**
   * 当たったことをマーク
   */
  markAsHit(): void {
    this.hasHit = true;
  }

  /**
   * 破棄
   */
  destroy(): void {
    if (this.iconText) {
      this.iconText.destroy();
    }
    super.destroy();
  }
}

