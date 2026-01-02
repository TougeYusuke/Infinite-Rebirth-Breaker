/**
 * GameScene - メインゲームシーン
 * 
 * れいあのコーディングバトルのメイン画面を管理
 */

import Phaser from 'phaser';
import { Reia, ReiaConfig } from '../entities/Reia';
import { StressSystem } from '../systems/StressSystem';
import { Combo } from '../systems/Combo';
import { TaskManager, TaskManagerConfig } from '../systems/TaskManager';
import { AttackSystem, AttackSystemConfig } from '../systems/AttackSystem';
import { TaskRewardSystem } from '../systems/TaskRewardSystem';
import { CodeBullet, CodeBulletConfig } from '../entities/CodeBullet';
import { Task } from '../entities/Task';
import { DamagePopup } from '../ui/DamagePopup';
import { DecimalWrapper } from '../utils/Decimal';

export class GameScene extends Phaser.Scene {
  private reia: Reia | null = null;
  private stressSystem: StressSystem | null = null;
  private combo: Combo | null = null;
  private taskManager: TaskManager | null = null;
  private attackSystem: AttackSystem | null = null;
  private taskRewardSystem: TaskRewardSystem | null = null;
  private stage: number = 1;
  
  // オート攻撃関連
  private autoAttackTimer: Phaser.Time.TimerEvent | null = null;
  
  // 攻撃関連
  private bullets: CodeBullet[] = [];
  private damagePopups: DamagePopup[] = [];
  
  // UI要素
  private stressBar: Phaser.GameObjects.Graphics | null = null;
  private stressText: Phaser.GameObjects.Text | null = null;
  private dialogueText: Phaser.GameObjects.Text | null = null;
  private taskCountText: Phaser.GameObjects.Text | null = null;
  private rewardStatusText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 背景色
    this.cameras.main.setBackgroundColor('#2a2a2a');
    
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // システムを初期化
    this.initializeSystems();
    
    // れいあキャラクターを初期化
    this.initializeReia(centerX, centerY);
    
    // タスクマネージャーを初期化
    this.initializeTaskManager();
    
    // UIを初期化
    this.initializeUI();
    
    // タップイベントを設定
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleTap(pointer.x, pointer.y);
    });
  }

  /**
   * システムを初期化
   */
  private initializeSystems(): void {
    // ストレスシステム
    this.stressSystem = new StressSystem({
      maxStress: 100,
      stressDecayRate: 10,
      stressIncreaseBase: 1.0,
    });
    
    // コンボシステム
    this.combo = new Combo(0);
    
    // 攻撃システム
    const attackConfig: AttackSystemConfig = {
      baseDamage: 10,
      autoAttackInterval: 1000, // 1秒ごと
      autoAttackDamageRatio: 0.5, // タップ攻撃の50%
    };
    this.attackSystem = new AttackSystem(attackConfig);
    
    // タスク報酬システム
    this.taskRewardSystem = new TaskRewardSystem();
    
    // オート攻撃タイマーを開始
    this.startAutoAttack();
  }

  /**
   * れいあキャラクターを初期化
   */
  private initializeReia(x: number, y: number): void {
    const config: ReiaConfig = {
      x: x,
      y: y,
      scale: 1.0,
    };
    
    this.reia = new Reia(this, config);
    
    // れいあの状態を更新
    this.updateReiaState();
  }

  /**
   * タスクマネージャーを初期化
   */
  private initializeTaskManager(): void {
    if (!this.reia) {
      return;
    }
    
    const config: TaskManagerConfig = {
      spawnInterval: 3000, // 3秒ごとに生成
      maxTasks: 10,         // 最大10個
      spawnRadius: 300,     // れいあから300ピクセル離れた位置
      stage: this.stage,
    };
    
    this.taskManager = new TaskManager(this, this.reia, config);
    this.taskManager.start();
  }

  /**
   * UIを初期化
   */
  private initializeUI(): void {
    const centerX = this.cameras.main.width / 2;
    
    // ストレスバー
    this.stressBar = this.add.graphics();
    this.stressBar.setDepth(10);
    
    // ストレステキスト
    this.stressText = this.add.text(centerX, 50, 'ストレス: 0%', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(10);
    
    // セリフテキスト
    this.dialogueText = this.add.text(centerX, 100, '', {
      fontSize: '18px',
      color: '#ffd700',
      fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(10);
    
    // タスク数テキスト
    this.taskCountText = this.add.text(centerX, 130, 'タスク: 0', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(10);
    
    // 報酬ステータステキスト
    this.rewardStatusText = this.add.text(centerX, 160, '', {
      fontSize: '14px',
      color: '#4ecdc4',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(10);
    
    this.updateUI();
  }

  /**
   * UIを更新
   */
  private updateUI(): void {
    if (!this.stressSystem || !this.reia || !this.stressBar || !this.stressText) {
      return;
    }
    
    const stressLevel = this.stressSystem.getStressLevel();
    const stress = this.stressSystem.getStress();
    
    // ストレスバーを描画
    this.stressBar.clear();
    
    // 背景
    this.stressBar.fillStyle(0x333333, 1.0);
    this.stressBar.fillRect(20, 20, 200, 20);
    
    // ストレスバー（色はストレスレベルに応じて変化）
    let barColor = 0x00ff00; // 緑（低）
    if (stressLevel > 0.7) {
      barColor = 0xff0000; // 赤（高）
    } else if (stressLevel > 0.3) {
      barColor = 0xffaa00; // オレンジ（中）
    }
    
    this.stressBar.fillStyle(barColor, 1.0);
    this.stressBar.fillRect(20, 20, 200 * stressLevel, 20);
    
    // ストレステキスト
    this.stressText.setText(`ストレス: ${Math.floor(stress)}%`);
    
    // タスク数テキスト
    if (this.taskCountText && this.taskManager) {
      const taskCount = this.taskManager.getTaskCount();
      this.taskCountText.setText(`タスク: ${taskCount}`);
    }
    
    // セリフ
    const dialogue = this.reia.getDialogue();
    if (this.dialogueText) {
      if (dialogue) {
        this.dialogueText.setText(dialogue);
        this.dialogueText.setAlpha(1.0);
      } else {
        this.dialogueText.setAlpha(0.0);
      }
    }
    
    // 報酬ステータスを更新
    if (this.rewardStatusText && this.taskRewardSystem) {
      const statusLines: string[] = [];
      
      // 仕様理解度
      const featureTime = this.taskRewardSystem.getFeatureRemainingTime();
      if (featureTime > 0) {
        const seconds = Math.ceil(featureTime / 1000);
        const multiplier = this.taskRewardSystem.getFeatureAttackMultiplier();
        statusLines.push(`仕様理解度: ${(multiplier * 100).toFixed(0)}% (${seconds}秒)`);
      }
      
      // コード品質
      const codeQualityLevel = this.taskRewardSystem.getCodeQualityLevel();
      if (codeQualityLevel > 0) {
        statusLines.push(`コード品質: Lv.${codeQualityLevel}`);
      }
      
      // 緊急対応力
      const emergencyLevel = this.taskRewardSystem.getEmergencyResponseLevel();
      if (emergencyLevel > 0) {
        statusLines.push(`緊急対応力: Lv.${emergencyLevel}`);
      }
      
      // デバッグポイント
      const debugPoints = this.taskRewardSystem.getDebugPoints();
      if (debugPoints > 0) {
        statusLines.push(`デバッグポイント: ${debugPoints}`);
      }
      
      if (statusLines.length > 0) {
        this.rewardStatusText.setText(statusLines.join(' | '));
        this.rewardStatusText.setAlpha(1.0);
      } else {
        this.rewardStatusText.setAlpha(0.0);
      }
    }
  }

  /**
   * れいあの状態を更新
   */
  private updateReiaState(): void {
    if (!this.reia || !this.stressSystem || !this.combo) {
      return;
    }
    
    const stress = this.stressSystem.getStress();
    const comboCount = this.combo.getComboCount();
    
    // れいあの状態を更新
    this.reia.setStressLevel(stress);
    this.reia.setComboCount(comboCount);
    this.reia.setHP(100, 100); // プロトタイプでは固定
  }

  /**
   * オート攻撃を開始
   */
  private startAutoAttack(): void {
    if (!this.attackSystem || !this.taskRewardSystem) {
      return;
    }
    
    // コード品質の効果を考慮した間隔を取得
    const codeQualityMultiplier = this.taskRewardSystem.getCodeQualitySpeedMultiplier();
    const interval = this.attackSystem.getAutoAttackInterval(codeQualityMultiplier);
    
    // 既存のタイマーを停止
    if (this.autoAttackTimer) {
      this.autoAttackTimer.destroy();
    }
    
    // オート攻撃タイマーを開始
    this.autoAttackTimer = this.time.addEvent({
      delay: interval,
      callback: () => {
        this.performAutoAttack();
        // コード品質が変わった場合に間隔を再計算
        this.restartAutoAttackIfNeeded();
      },
      loop: true,
    });
  }

  /**
   * オート攻撃を再開（コード品質が変わった場合）
   */
  private restartAutoAttackIfNeeded(): void {
    if (!this.attackSystem || !this.taskRewardSystem) {
      return;
    }
    
    const codeQualityMultiplier = this.taskRewardSystem.getCodeQualitySpeedMultiplier();
    const currentInterval = this.attackSystem.getAutoAttackInterval(codeQualityMultiplier);
    
    // タイマーの間隔が変わった場合は再起動
    if (this.autoAttackTimer && this.autoAttackTimer.delay !== currentInterval) {
      this.startAutoAttack();
    }
  }

  /**
   * オート攻撃を実行
   */
  private performAutoAttack(): void {
    if (!this.reia || !this.attackSystem || !this.combo || !this.taskManager) {
      return;
    }
    
    const tasks = this.taskManager.getTasks();
    if (tasks.length === 0) {
      return; // タスクがない場合は発射しない
    }
    
    // 最も近いタスクを選択
    let nearestTask: Task | null = null;
    let nearestDistance = Infinity;
    
    for (const task of tasks) {
      const distance = task.getDistanceToTarget();
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTask = task;
      }
    }
    
    if (nearestTask && this.taskRewardSystem) {
      // 仕様理解度の倍率を取得
      const featureMultiplier = this.taskRewardSystem.getFeatureAttackMultiplier();
      
      // ダメージを計算
      const damage = this.attackSystem.calculateDamage(this.reia, this.combo, true, featureMultiplier);
      
      // 弾丸を発射
      this.fireBullet(this.reia.x, this.reia.y, nearestTask.x, nearestTask.y, damage);
    }
  }

  /**
   * タップ処理
   */
  private handleTap(x: number, y: number): void {
    if (!this.reia || !this.attackSystem || !this.combo) {
      return;
    }
    
    // れいあのタップアニメーション
    this.reia.playTapAnimation();
    
    // 仕様理解度の倍率を取得
    const featureMultiplier = this.taskRewardSystem?.getFeatureAttackMultiplier() || 1.0;
    
    // ダメージを計算
    const damage = this.attackSystem.calculateDamage(this.reia, this.combo, false, featureMultiplier);
    
    // 弾丸を発射
    this.fireBullet(this.reia.x, this.reia.y, x, y, damage);
  }

  /**
   * 弾丸を発射
   */
  private fireBullet(fromX: number, fromY: number, toX: number, toY: number, damage: DecimalWrapper): void {
    // 方向ベクトルを計算
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 距離が0の場合は発射しない
    if (distance === 0) {
      return;
    }
    
    // 正規化された方向ベクトル
    const directionX = dx / distance;
    const directionY = dy / distance;
    
    const config: CodeBulletConfig = {
      x: fromX,
      y: fromY,
      directionX: directionX,
      directionY: directionY,
      speed: 500, // 500ピクセル/秒
      damage: damage,
      cameraWidth: this.cameras.main.width,
      cameraHeight: this.cameras.main.height,
    };
    
    const bullet = new CodeBullet(this, config);
    this.bullets.push(bullet);
  }

  /**
   * 更新処理
   */
  update(_time: number, delta: number): void {
    // タスクマネージャーを更新
    if (this.taskManager) {
      this.taskManager.update(delta);
      
      // タスクが近づいた時にストレスを増加させる
      const tasks = this.taskManager.getTasks();
      if (this.stressSystem && this.reia && this.taskRewardSystem) {
        // 緊急対応力のストレス耐性を取得
        const stressResistance = this.taskRewardSystem.getEmergencyStressResistance();
        
        for (const task of tasks) {
          const distance = task.getDistanceToTarget();
          if (distance < 200) { // 200ピクセル以内
            this.stressSystem.increaseStress(distance, task.getType(), stressResistance);
          }
        }
      }
      
      // れいあに触れたタスクをチェック（ゲームオーバー）
      for (const task of tasks) {
        if (task.isTouchingTarget()) {
          // TODO: ゲームオーバー処理（Phase 4で実装）
          console.log('Game Over: タスクがれいあに触れました');
        }
      }
    }
    
    // 弾丸を更新
    this.updateBullets(delta);
    
    // 弾丸とタスクの衝突判定
    this.checkBulletTaskCollisions();
    
    // ダメージポップアップを更新
    this.updateDamagePopups();
    
    // タスク報酬システムを更新（仕様理解度の残り時間など）
    if (this.taskRewardSystem) {
      this.taskRewardSystem.update(delta);
    }
    
    // れいあの状態を更新
    this.updateReiaState();
    
    // UIを更新
    this.updateUI();
  }

  /**
   * 弾丸を更新
   */
  private updateBullets(delta: number): void {
    const bulletsToRemove: CodeBullet[] = [];
    
    for (const bullet of this.bullets) {
      const shouldRemove = bullet.update(delta);
      if (shouldRemove) {
        bulletsToRemove.push(bullet);
      }
    }
    
    // 削除対象の弾丸を削除
    for (const bullet of bulletsToRemove) {
      const index = this.bullets.indexOf(bullet);
      if (index !== -1) {
        this.bullets.splice(index, 1);
        bullet.destroy();
      }
    }
  }

  /**
   * 弾丸とタスクの衝突判定
   */
  private checkBulletTaskCollisions(): void {
    if (!this.taskManager) {
      return;
    }
    
    const tasks = this.taskManager.getTasks();
    const bulletsToRemove: CodeBullet[] = [];
    
    for (const bullet of this.bullets) {
      for (const task of tasks) {
        // 衝突判定（簡易版: 距離で判定）
        const dx = bullet.x - task.x;
        const dy = bullet.y - task.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 40) { // 衝突判定の閾値
          // ダメージを与える
          const damage = bullet.getDamage();
          const isDefeated = task.takeDamage(damage);
          
          // ダメージポップアップを表示
          this.showDamagePopup(task.x, task.y, damage);
          
          // 弾丸を削除
          bullet.markAsHit();
          bulletsToRemove.push(bullet);
          
          if (isDefeated) {
            // タスクを倒した
            this.onTaskDefeated(task);
          }
          
          break; // 1つの弾丸は1つのタスクにしか当たらない
        }
      }
    }
    
    // 削除対象の弾丸を削除
    for (const bullet of bulletsToRemove) {
      const index = this.bullets.indexOf(bullet);
      if (index !== -1) {
        this.bullets.splice(index, 1);
        bullet.destroy();
      }
    }
  }

  /**
   * タスクを倒した時の処理
   */
  private onTaskDefeated(task: Task): void {
    if (!this.taskManager || !this.stressSystem || !this.combo || !this.taskRewardSystem) {
      return;
    }
    
    // コンボを追加
    this.combo.addCombo(1);
    
    // ストレスを減少
    this.stressSystem.decreaseStress(this.combo.getComboCount());
    
    // タスク報酬を処理
    this.taskRewardSystem.onTaskDefeated(task.getType(), 0);
    
    // コード品質が変わった場合はオート攻撃を再開
    this.restartAutoAttackIfNeeded();
    
    // タスクを削除
    this.taskManager.removeTask(task);
  }

  /**
   * ダメージポップアップを表示
   */
  private showDamagePopup(x: number, y: number, damage: DecimalWrapper): void {
    const popup = new DamagePopup(this, { x, y, damage });
    this.damagePopups.push(popup);
  }

  /**
   * ダメージポップアップを更新
   */
  private updateDamagePopups(): void {
    const popupsToRemove: DamagePopup[] = [];
    
    for (const popup of this.damagePopups) {
      if (popup.isDestroyed()) {
        popupsToRemove.push(popup);
      }
    }
    
    // 削除対象のポップアップを削除
    for (const popup of popupsToRemove) {
      const index = this.damagePopups.indexOf(popup);
      if (index !== -1) {
        this.damagePopups.splice(index, 1);
      }
    }
  }
}

