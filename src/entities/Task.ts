/**
 * Task - タスク（敵）
 * 
 * れいあの周りに出現し、近づいてくるタスク
 */

import Phaser from 'phaser';
import { DecimalWrapper } from '../utils/Decimal';

/**
 * タスクの種類
 */
export enum TaskType {
  BUG = 'bug',           // バグ
  FEATURE = 'feature',   // 仕様変更
  REVIEW = 'review',     // レビュー依頼
  URGENT = 'urgent',     // 緊急タスク
}

/**
 * タスクの設定
 */
export interface TaskConfig {
  type: TaskType;
  stage: number;         // ステージ数
  x: number;            // 初期X座標
  y: number;            // 初期Y座標
  targetX: number;      // 目標X座標（れいあの位置）
  targetY: number;      // 目標Y座標（れいあの位置）
}

/**
 * タスクの種類別の設定
 */
interface TaskTypeConfig {
  hpMultiplier: number;      // HP倍率
  speed: number;             // 移動速度（ピクセル/秒）
  stressMultiplier: number;  // ストレス増加倍率
  color: number;             // 色（プロトタイプ用）
  icon: string;             // アイコン（プロトタイプ用）
}

const TASK_TYPE_CONFIGS: Record<TaskType, TaskTypeConfig> = {
  [TaskType.BUG]: {
    hpMultiplier: 0.8,
    speed: 30, // 中速
    stressMultiplier: 0.8,
    color: 0xff6b6b, // 柔らかい赤
    icon: '🐛',
  },
  [TaskType.FEATURE]: {
    hpMultiplier: 1.2,
    speed: 20, // 低速
    stressMultiplier: 1.2,
    color: 0x4ecdc4, // 柔らかい青
    icon: '📄',
  },
  [TaskType.REVIEW]: {
    hpMultiplier: 1.5,
    speed: 20, // 低速
    stressMultiplier: 1.0,
    color: 0xffe66d, // 柔らかい黄
    icon: '✓',
  },
  [TaskType.URGENT]: {
    hpMultiplier: 2.0,
    speed: 50, // 高速
    stressMultiplier: 1.5,
    color: 0xff4757, // 赤
    icon: '⚠',
  },
};

/**
 * タスク
 */
export class Task extends Phaser.GameObjects.Container {
  private hp: DecimalWrapper;
  private maxHp: DecimalWrapper;
  private taskType: TaskType; // 'type'はContainerのプロパティと競合するため、'taskType'に変更
  private config: TaskTypeConfig;
  private targetX: number;
  private targetY: number;
  private speed: number;
  private sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics | null = null;
  private iconText: Phaser.GameObjects.Text | null = null;
  private hpBar: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, taskConfig: TaskConfig) {
    super(scene, taskConfig.x, taskConfig.y);
    
    this.taskType = taskConfig.type;
    this.config = TASK_TYPE_CONFIGS[this.taskType];
    this.targetX = taskConfig.targetX;
    this.targetY = taskConfig.targetY;
    this.speed = this.config.speed;
    
    // HP計算（ゲームバランス調整）
    // 初期状態（Wave 1）で最も弱い敵（BUG）を2~3発で倒せるようにする
    // baseDamage=10、attackLevel=1の場合、1発=10ダメージ
    // 2~3発で倒すには、HPを20~30にする必要がある
    // BUGのHP倍率=0.8なので、baseHP=30とすると、BUGのHP=30*0.8=24（2~3発で倒せる）
    const baseHP = 30; // 100 → 30に調整（序盤を2~3発で倒せるように）
    
    // Wave進行に応じた難易度倍率（WaveSystemから渡される、またはstageから計算）
    // stage=1の場合、waveMultiplier=1.0
    // stage=2の場合、waveMultiplier=1.2
    // stage=3の場合、waveMultiplier=1.44
    // など、指数関数的に増加
    const waveMultiplier = Math.pow(1.2, taskConfig.stage - 1);
    
    // HP = baseHP * waveMultiplier * taskTypeMultiplier
    const hpValue = baseHP * waveMultiplier * this.config.hpMultiplier;
    this.maxHp = new DecimalWrapper(hpValue);
    this.hp = new DecimalWrapper(hpValue);
    
    // シーンに追加
    scene.add.existing(this);
    
    // スプライトの作成
    this.createSprite();
    
    // HPバーの作成
    this.createHPBar();
  }

  /**
   * スプライトの作成
   */
  private createSprite(): void {
    // タスクタイプに応じた画像を読み込む
    const imageKey = this.getImageKey();
    
    // 画像が読み込まれているか確認
    if (this.scene.textures.exists(imageKey)) {
      // 画像が存在する場合は画像スプライトを使用
      this.sprite = this.scene.add.sprite(0, 0, imageKey);
      this.sprite.setScale(0.5); // 画像サイズに応じて調整（120px画像の場合、60px表示）
      this.sprite.setOrigin(0.5, 0.5);
      this.sprite.setDepth(5);
      this.add(this.sprite);
    } else {
      // 画像が存在しない場合はフォールバック（Graphics描画）
      this.sprite = this.scene.add.graphics();
      this.sprite.fillStyle(this.config.color, 1.0);
      this.sprite.fillCircle(0, 0, 30); // 半径30の円
      this.sprite.setDepth(5);
      this.add(this.sprite);
      
      // アイコンテキスト
      this.iconText = this.scene.add.text(0, 0, this.config.icon, {
        fontSize: '24px',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(6);
      this.add(this.iconText);
    }
  }

  /**
   * タスクタイプに応じた画像キーを取得
   */
  private getImageKey(): string {
    switch (this.taskType) {
      case TaskType.BUG:
        return 'task_bug';
      case TaskType.FEATURE:
        return 'task_feature';
      case TaskType.REVIEW:
        return 'task_review';
      case TaskType.URGENT:
        return 'task_urgent';
      default:
        return 'task_bug'; // デフォルト
    }
  }

  /**
   * HPバーの作成
   */
  private createHPBar(): void {
    this.hpBar = this.scene.add.graphics();
    this.hpBar.setDepth(7);
    this.updateHPBar();
  }

  /**
   * HPバーを更新
   */
  private updateHPBar(): void {
    if (!this.hpBar) {
      return;
    }
    
    const hpRatio = this.hp.toNumber() / this.maxHp.toNumber();
    const barWidth = 50;
    const barHeight = 4;
    
    this.hpBar.clear();
    
    // 背景
    this.hpBar.fillStyle(0x333333, 1.0);
    this.hpBar.fillRect(-barWidth / 2, -40, barWidth, barHeight);
    
    // HPバー
    const barColor = hpRatio > 0.5 ? 0x00ff00 : hpRatio > 0.2 ? 0xffaa00 : 0xff0000;
    this.hpBar.fillStyle(barColor, 1.0);
    this.hpBar.fillRect(-barWidth / 2, -40, barWidth * hpRatio, barHeight);
  }

  /**
   * 更新処理
   */
  updateTask(delta: number): void {
    // れいあに向かって移動
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const moveDistance = (this.speed * delta) / 1000; // ピクセル/秒をピクセル/フレームに変換
      const moveX = (dx / distance) * moveDistance;
      const moveY = (dy / distance) * moveDistance;
      
      this.x += moveX;
      this.y += moveY;
    }
    
    // HPバーを更新
    this.updateHPBar();
  }

  /**
   * ダメージを与える
   */
  takeDamage(damage: DecimalWrapper): boolean {
    this.hp = this.hp.sub(damage);
    
    if (this.hp.lessThanOrEqualTo(0)) {
      this.hp = DecimalWrapper.zero();
      return true; // 倒された
    }
    
    return false; // まだ生きている
  }

  /**
   * HPを取得
   */
  getHP(): DecimalWrapper {
    return this.hp;
  }

  /**
   * 最大HPを取得
   */
  getMaxHP(): DecimalWrapper {
    return this.maxHp;
  }

  /**
   * タスクの種類を取得
   */
  getType(): TaskType {
    return this.taskType;
  }

  /**
   * れいあとの距離を取得
   */
  getDistanceToTarget(): number {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * れいあに触れたかどうか
   */
  isTouchingTarget(threshold: number = 50): boolean {
    return this.getDistanceToTarget() < threshold;
  }

  /**
   * ストレス増加倍率を取得
   */
  getStressMultiplier(): number {
    return this.config.stressMultiplier;
  }

  /**
   * 破棄
   */
  destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
    if (this.iconText) {
      this.iconText.destroy();
    }
    if (this.hpBar) {
      this.hpBar.destroy();
    }
    super.destroy();
  }
}

