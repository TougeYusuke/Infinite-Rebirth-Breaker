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
  private stage: number = 1;
  
  // 攻撃関連
  private bullets: CodeBullet[] = [];
  private damagePopups: DamagePopup[] = [];
  
  // UI要素
  private stressBar: Phaser.GameObjects.Graphics | null = null;
  private stressText: Phaser.GameObjects.Text | null = null;
  private dialogueText: Phaser.GameObjects.Text | null = null;
  private taskCountText: Phaser.GameObjects.Text | null = null;

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
    if (!this.attackSystem) {
      return;
    }
    
    const interval = this.attackSystem.getAutoAttackInterval();
    // オート攻撃タイマーを開始（将来的に停止する場合は変数に保存する）
    this.time.addEvent({
      delay: interval,
      callback: () => {
        this.performAutoAttack();
      },
      loop: true,
    });
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
    
    if (nearestTask) {
      // ダメージを計算
      const damage = this.attackSystem.calculateDamage(this.reia, this.combo, true);
      
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
    
    // ダメージを計算
    const damage = this.attackSystem.calculateDamage(this.reia, this.combo, false);
    
    // 弾丸を発射
    this.fireBullet(this.reia.x, this.reia.y, x, y, damage);
  }

  /**
   * 弾丸を発射
   */
  private fireBullet(fromX: number, fromY: number, toX: number, toY: number, damage: DecimalWrapper): void {
    const config: CodeBulletConfig = {
      x: fromX,
      y: fromY,
      targetX: toX,
      targetY: toY,
      speed: 500, // 500ピクセル/秒
      damage: damage,
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
      if (this.stressSystem && this.reia) {
        for (const task of tasks) {
          const distance = task.getDistanceToTarget();
          if (distance < 200) { // 200ピクセル以内
            this.stressSystem.increaseStress(distance, task.getType());
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
    if (!this.taskManager || !this.stressSystem || !this.combo) {
      return;
    }
    
    // コンボを追加
    this.combo.addCombo(1);
    
    // ストレスを減少
    this.stressSystem.decreaseStress(this.combo.getComboCount());
    
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

