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
  directionX: number;     // 方向ベクトルX（正規化済み）
  directionY: number;     // 方向ベクトルY（正規化済み）
  speed: number;          // 速度（ピクセル/秒）
  damage: DecimalWrapper; // ダメージ
  cameraWidth?: number;   // カメラの幅（画面外判定用、オプション）
  cameraHeight?: number;  // カメラの高さ（画面外判定用、オプション）
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
  private directionX: number;
  private directionY: number;
  private cameraWidth: number;
  private cameraHeight: number;
  private iconText: Phaser.GameObjects.Text | null = null;
  private hasHit: boolean = false;

  constructor(scene: Phaser.Scene, config: CodeBulletConfig) {
    super(scene, config.x, config.y);
    
    this.damage = config.damage;
    this.speed = config.speed;
    this.directionX = config.directionX;
    this.directionY = config.directionY;
    this.cameraWidth = config.cameraWidth || scene.cameras.main.width;
    this.cameraHeight = config.cameraHeight || scene.cameras.main.height;
    
    // シーンに追加
    scene.add.existing(this);
    
    // アイコンの作成
    this.createIcon();
    
    // 発射方向を計算（角度を設定）
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
   * 発射方向を計算（角度を設定）
   */
  private calculateDirection(): void {
    // 方向ベクトルから角度を計算（ラジアン）
    const angle = Math.atan2(this.directionY, this.directionX);
    this.rotation = angle;
  }

  /**
   * 更新処理
   */
  update(delta: number): boolean {
    // 既に当たっている場合は削除
    if (this.hasHit) {
      return true; // 削除フラグ
    }
    
    // 方向ベクトルに沿って移動
    const moveDistance = (this.speed * delta) / 1000; // ピクセル/秒をピクセル/フレームに変換
    const moveX = this.directionX * moveDistance;
    const moveY = this.directionY * moveDistance;
    
    this.x += moveX;
    this.y += moveY;
    
    // 画面外に出たら削除
    const margin = 50; // マージン（画面外に出てから削除）
    if (
      this.x < -margin ||
      this.x > this.cameraWidth + margin ||
      this.y < -margin ||
      this.y > this.cameraHeight + margin
    ) {
      return true; // 削除フラグ
    }
    
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

