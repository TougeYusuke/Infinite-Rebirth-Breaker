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
import { AwakeningSystem, AwakeningType } from '../systems/AwakeningSystem';
import { DebugSystem } from '../systems/DebugSystem';
import { DebugPanel } from '../ui/DebugPanel';
import { WaveSystem } from '../systems/WaveSystem';
import { CodeBullet, CodeBulletConfig } from '../entities/CodeBullet';
import { Task } from '../entities/Task';
import { DamagePopup } from '../ui/DamagePopup';
import { DecimalWrapper } from '../utils/Decimal';
import { Rebirth } from '../systems/Rebirth';
import { GameOverScene, GameOverInfo } from './GameOverScene';
import { AwakeningEffect } from '../effects/AwakeningEffect';
import { ScreenClearEffect } from '../effects/ScreenClearEffect';

export class GameScene extends Phaser.Scene {
  private reia: Reia | null = null;
  private stressSystem: StressSystem | null = null;
  private combo: Combo | null = null;
  private taskManager: TaskManager | null = null;
  private attackSystem: AttackSystem | null = null;
  private taskRewardSystem: TaskRewardSystem | null = null;
  private awakeningSystem: AwakeningSystem | null = null;
  private debugSystem: DebugSystem | null = null;
  private debugPanel: DebugPanel | null = null;
  private waveSystem: WaveSystem | null = null;
  private awakeningEffect: AwakeningEffect | null = null;
  private screenClearEffect: ScreenClearEffect | null = null;
  private totalDamage: DecimalWrapper = new DecimalWrapper(0);
  private isGameOver: boolean = false;
  private startWave: number = 1; // 開始Wave数（Quick Skip用）
  
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
  private tensionBar: Phaser.GameObjects.Graphics | null = null;
  private tensionText: Phaser.GameObjects.Text | null = null;
  private awakeningText: Phaser.GameObjects.Text | null = null;
  private waveText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data?: { startWave?: number }): void {
    // 背景色
    this.cameras.main.setBackgroundColor('#2a2a2a');
    
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // ゲーム状態をリセット
    this.isGameOver = false;
    this.totalDamage = new DecimalWrapper(0);
    this.startWave = data?.startWave || 1;
    
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
    // デバッグ設定があればそれを使用、なければデフォルト値
    const autoAttackInterval = this.debugSystem?.getAutoAttackInterval() || 1000;
    
    const attackConfig: AttackSystemConfig = {
      baseDamage: 10,
      autoAttackInterval: autoAttackInterval,
      autoAttackDamageRatio: 0.5, // タップ攻撃の50%
    };
    this.attackSystem = new AttackSystem(attackConfig);
    
    // タスク報酬システム
    this.taskRewardSystem = new TaskRewardSystem();
    
    // 覚醒モードシステム
    this.awakeningSystem = new AwakeningSystem({
      maxTension: 100,
      baseGain: 5,
      lowStressBonus: 1.5,
      comboBonusRate: 0.1,
    });
    
    // デバッグシステム
    this.debugSystem = new DebugSystem();
    // 開発環境ではデバッグモードを有効化（本番環境ではfalseに設定）
    this.debugSystem.setEnabled(true);
    
    // デバッグパネル
    this.debugPanel = new DebugPanel(this, this.debugSystem);
    this.debugPanel.create();
    
    // Waveシステム
    this.waveSystem = new WaveSystem({
      tasksPerWave: 10,
      waveClearBonus: 1.2,
    });
    
    // 開始Wave数を設定（Quick Skip用）
    if (this.startWave > 1) {
      this.waveSystem.setWave(this.startWave);
    }
    
    // 覚醒モードのエフェクト
    this.awakeningEffect = new AwakeningEffect(this);
    
    // 画面クリア演出
    this.screenClearEffect = new ScreenClearEffect(this);
    
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
    if (!this.reia || !this.waveSystem) {
      return;
    }
    
    // デバッグ設定があればそれを使用、なければデフォルト値
    const spawnInterval = this.debugSystem?.getTaskSpawnInterval() || 3000;
    
    const config: TaskManagerConfig = {
      spawnInterval: spawnInterval,
      maxTasks: 10,         // 最大10個
      spawnRadius: 300,     // れいあから300ピクセル離れた位置
      stage: this.waveSystem.getCurrentWave(), // Wave数をstageとして使用
      waveSystem: this.waveSystem, // WaveSystemを渡す
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
    
    // テンションゲージ
    this.tensionBar = this.add.graphics();
    this.tensionBar.setDepth(10);
    
    // テンションテキスト
    this.tensionText = this.add.text(centerX, 190, 'テンション: 0%', {
      fontSize: '16px',
      color: '#ffd700',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(10);
    
    // 覚醒モードテキスト
    this.awakeningText = this.add.text(centerX, 220, '', {
      fontSize: '20px',
      color: '#ff00ff',
      fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(10);
    this.awakeningText.setAlpha(0.0);
    
    // Wave情報テキスト
    this.waveText = this.add.text(centerX, 250, 'Wave: 1', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.7)',
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
    
    // テンションゲージを描画
    if (this.tensionBar && this.tensionText && this.awakeningText && this.awakeningSystem) {
      const tensionLevel = this.awakeningSystem.getTensionLevel();
      const tension = this.awakeningSystem.getTension();
      
      this.tensionBar.clear();
      
      // 背景
      this.tensionBar.fillStyle(0x333333, 1.0);
      this.tensionBar.fillRect(20, 50, 200, 15);
      
      // テンションゲージ（金色）
      this.tensionBar.fillStyle(0xffd700, 1.0);
      this.tensionBar.fillRect(20, 50, 200 * tensionLevel, 15);
      
      // テンションテキスト
      this.tensionText.setText(`テンション: ${Math.floor(tension)}%`);
      
      // 覚醒モード表示
      const awakening = this.awakeningSystem.getCurrentAwakening();
      if (awakening.isActive && awakening.type) {
        const typeNames = {
          [AwakeningType.FOCUS]: '集中覚醒',
          [AwakeningType.BURST]: '爆発覚醒',
          [AwakeningType.CREATIVE]: '創造覚醒',
        };
        const seconds = Math.ceil(awakening.remainingTime / 1000);
        this.awakeningText.setText(`${typeNames[awakening.type]} (${seconds}秒)`);
        this.awakeningText.setAlpha(1.0);
      } else {
        this.awakeningText.setAlpha(0.0);
      }
    }
    
    // タスク数テキスト
    if (this.taskCountText && this.taskManager) {
      const taskCount = this.taskManager.getTaskCount();
      this.taskCountText.setText(`タスク: ${taskCount}`);
    }
    
    // Wave情報テキスト
    if (this.waveText && this.waveSystem) {
      const currentWave = this.waveSystem.getCurrentWave();
      const remainingTasks = this.waveSystem.getRemainingTasksInWave();
      this.waveText.setText(`Wave: ${currentWave} (残り: ${remainingTasks})`);
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
    
    // デバッグ設定の間隔を取得（デバッグ設定が優先）
    const debugInterval = this.debugSystem?.getAutoAttackInterval();
    const baseInterval = debugInterval || this.attackSystem.getAutoAttackInterval();
    
    // コード品質の効果を考慮した間隔を取得
    const codeQualityMultiplier = this.taskRewardSystem.getCodeQualitySpeedMultiplier();
    let interval = baseInterval * codeQualityMultiplier;
    
    // 集中覚醒の効果を考慮（攻撃速度2倍 = 間隔を半分に）
    if (this.awakeningSystem?.getAwakeningType() === AwakeningType.FOCUS) {
      interval *= 0.5;
    }
    
    // 既存のタイマーを停止
    if (this.autoAttackTimer) {
      this.autoAttackTimer.destroy();
    }
    
    // オート攻撃タイマーを開始
    this.autoAttackTimer = this.time.addEvent({
      delay: interval,
      callback: () => {
        this.performAutoAttack();
        // コード品質や覚醒モードが変わった場合に間隔を再計算
        this.restartAutoAttackIfNeeded();
      },
      loop: true,
    });
  }

  /**
   * オート攻撃を再開（コード品質や覚醒モードが変わった場合）
   */
  private restartAutoAttackIfNeeded(): void {
    if (!this.attackSystem || !this.taskRewardSystem) {
      return;
    }
    
    // デバッグ設定の間隔を取得（デバッグ設定が優先）
    const debugInterval = this.debugSystem?.getAutoAttackInterval();
    const baseInterval = debugInterval || this.attackSystem.getAutoAttackInterval();
    
    const codeQualityMultiplier = this.taskRewardSystem.getCodeQualitySpeedMultiplier();
    let currentInterval = baseInterval * codeQualityMultiplier;
    
    // 集中覚醒の効果を考慮
    if (this.awakeningSystem?.getAwakeningType() === AwakeningType.FOCUS) {
      currentInterval *= 0.5;
    }
    
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
      
      // 集中覚醒の倍率を取得
      const awakeningMultiplier = this.getAwakeningAttackMultiplier();
      
      // デバッグ設定の攻撃力倍率を取得
      const debugMultiplier = this.debugSystem?.getAttackPowerMultiplier() || 1.0;
      
      // ダメージを計算
      const damage = this.attackSystem.calculateDamage(
        this.reia,
        this.combo,
        true,
        featureMultiplier * awakeningMultiplier * debugMultiplier
      );
      
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
    
    // 集中覚醒の倍率を取得（攻撃力+50%）
    const awakeningMultiplier = this.getAwakeningAttackMultiplier();
    
    // デバッグ設定の攻撃力倍率を取得
    const debugMultiplier = this.debugSystem?.getAttackPowerMultiplier() || 1.0;
    
    // ダメージを計算
    const damage = this.attackSystem.calculateDamage(
      this.reia,
      this.combo,
      false,
      featureMultiplier * awakeningMultiplier * debugMultiplier
    );
    
    // 創造覚醒中は複数のタスクに同時ダメージ
    if (this.awakeningSystem?.getAwakeningType() === AwakeningType.CREATIVE) {
      this.fireCreativeBullets(x, y, damage);
    } else {
      // 通常の弾丸を発射
      this.fireBullet(this.reia.x, this.reia.y, x, y, damage);
    }
  }

  /**
   * 創造覚醒時の複数弾丸発射
   */
  private fireCreativeBullets(_targetX: number, _targetY: number, damage: DecimalWrapper): void {
    if (!this.taskManager || !this.reia) {
      return;
    }
    
    const tasks = this.taskManager.getTasks();
    
    // 最大5個のタスクに同時ダメージ
    const maxTargets = Math.min(5, tasks.length);
    
    for (let i = 0; i < maxTargets; i++) {
      const task = tasks[i];
      this.fireBullet(this.reia.x, this.reia.y, task.x, task.y, damage);
    }
  }

  /**
   * 覚醒モードの攻撃力倍率を取得
   */
  private getAwakeningAttackMultiplier(): number {
    if (!this.awakeningSystem) {
      return 1.0;
    }
    
    const awakeningType = this.awakeningSystem.getAwakeningType();
    
    if (awakeningType === AwakeningType.FOCUS) {
      return 1.5; // 攻撃力+50%
    }
    
    return 1.0;
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
      if (!this.isGameOver) {
        for (const task of tasks) {
          if (task.isTouchingTarget()) {
            this.handleGameOver();
            break;
          }
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
    
    // 覚醒モードシステムを更新
    if (this.awakeningSystem) {
      this.awakeningSystem.update(delta);
      
      // 覚醒モードが終了した場合、エフェクトを停止してオート攻撃を再開
      if (!this.awakeningSystem.isAwakeningActive()) {
        if (this.awakeningEffect) {
          this.awakeningEffect.stop();
        }
        if (this.autoAttackTimer) {
          this.restartAutoAttackIfNeeded();
        }
      }
    }
    
    // 覚醒モードのエフェクトを更新
    if (this.awakeningEffect) {
      this.awakeningEffect.update();
    }
    
    // 画面クリア演出を更新
    if (this.screenClearEffect) {
      this.screenClearEffect.update();
    }
    
    // デバッグパネルを更新
    if (this.debugPanel) {
      this.debugPanel.update(() => {
        // デバッグ設定が変更された時の処理
        this.onDebugConfigChanged();
      });
    }
    
    // れいあの状態を更新
    this.updateReiaState();
    
    // UIを更新
    this.updateUI();
  }

  /**
   * ゲームオーバー処理
   */
  private handleGameOver(): void {
    if (this.isGameOver || !this.waveSystem) {
      return;
    }
    
    this.isGameOver = true;
    
    // 到達Wave数を取得（stageとして扱う）
    const reachedWave = this.waveSystem.getCurrentWave();
    
    // 転生石を計算・獲得
    const rebirthStones = Rebirth.gainRebirthStones(reachedWave);
    
    // ゲームオーバー情報を作成
    const gameOverInfo: GameOverInfo = {
      reachedStage: reachedWave,
      rebirthStones: rebirthStones,
      totalDamage: this.totalDamage,
    };
    
    // GameOverSceneに情報を渡して遷移
    const gameOverScene = this.scene.get('GameOverScene') as GameOverScene;
    if (gameOverScene) {
      gameOverScene.setGameOverInfo(gameOverInfo);
    }
    
    this.scene.start('GameOverScene');
  }

  /**
   * デバッグ設定が変更された時の処理
   */
  private onDebugConfigChanged(): void {
    if (!this.debugSystem) {
      return;
    }
    
    // タスク生成間隔が変更された場合
    if (this.taskManager) {
      const newInterval = this.debugSystem.getTaskSpawnInterval();
      this.taskManager.updateSpawnInterval(newInterval);
    }
    
    // オート攻撃間隔が変更された場合
    this.restartAutoAttackIfNeeded();
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
          
          // 累計ダメージを記録
          this.totalDamage = this.totalDamage.add(damage);
          
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
    if (!this.taskManager || !this.stressSystem || !this.combo || !this.taskRewardSystem || !this.awakeningSystem || !this.waveSystem) {
      return;
    }
    
    // コンボを追加
    this.combo.addCombo(1);
    
    // ストレスを減少
    this.stressSystem.decreaseStress(this.combo.getComboCount());
    
    // タスク報酬を処理
    this.taskRewardSystem.onTaskDefeated(task.getType(), 0);
    
    // テンションゲージを増加
    const stressLevel = this.stressSystem.getStressLevel();
    const comboCount = this.combo.getComboCount();
    this.awakeningSystem.onTaskDefeated(stressLevel, comboCount);
    
    // Waveシステムを更新
    this.waveSystem.onTaskDefeated();
    
    // 覚醒モードをチェック
    this.checkAwakenings(task);
    
    // コード品質が変わった場合はオート攻撃を再開
    this.restartAutoAttackIfNeeded();
    
    // タスクを削除
    this.taskManager.removeTask(task);
  }

  /**
   * 覚醒モードをチェック
   */
  private checkAwakenings(task: Task): void {
    if (!this.awakeningSystem || !this.stressSystem || !this.combo) {
      return;
    }
    
    const comboCount = this.combo.getComboCount();
    const stressLevel = this.stressSystem.getStressLevel();
    
    // 集中覚醒をチェック（コンボ型）
    if (this.awakeningSystem.checkFocusAwakening(comboCount)) {
      this.activateFocusAwakening();
    }
    
    // 爆発覚醒をチェック（ストレス型）
    if (this.awakeningSystem.checkBurstAwakening(stressLevel)) {
      this.activateBurstAwakening();
    }
    
    // 創造覚醒をチェック（戦略型）
    if (this.awakeningSystem.checkCreativeAwakening(task.getType())) {
      this.activateCreativeAwakening();
    }
  }

  /**
   * 集中覚醒を発動
   */
  private activateFocusAwakening(): void {
    if (!this.reia || !this.awakeningEffect) {
      return;
    }
    
    // エフェクトを開始
    this.awakeningEffect.start(AwakeningType.FOCUS, this.reia.x, this.reia.y);
    
    // れいあの覚醒アニメーション
    this.reia.playAwakeningAnimation('focus');
    
    // セリフを表示（ランダムに選択）
    const dialogues = ['やれる！', 'いくよ！', '集中できる！', '覚醒！'];
    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    if (this.dialogueText) {
      this.dialogueText.setText(dialogue);
      this.dialogueText.setAlpha(1.0);
      this.dialogueText.setColor('#4ecdc4'); // 青緑色
      
      // セリフをフェードアウト
      this.tweens.add({
        targets: this.dialogueText,
        alpha: 0,
        duration: 2000,
        delay: 1000,
      });
    }
    
    // オート攻撃間隔を調整（攻撃速度2倍 = 間隔を半分に）
    this.restartAutoAttackIfNeeded();
    
    // 覚醒モード終了時にエフェクトを停止
    this.time.delayedCall(10000, () => {
      if (this.awakeningEffect) {
        this.awakeningEffect.stop();
      }
    });
  }

  /**
   * 爆発覚醒を発動
   */
  private activateBurstAwakening(): void {
    if (!this.taskManager || !this.stressSystem || !this.reia || !this.awakeningEffect) {
      return;
    }
    
    // エフェクトを開始
    this.awakeningEffect.start(AwakeningType.BURST, this.reia.x, this.reia.y);
    
    // れいあの覚醒アニメーション
    this.reia.playAwakeningAnimation('burst');
    
    // セリフを表示（ランダムに選択）
    const dialogues = ['もう無理...でもやる！', 'やれる！', 'いくよ！', '爆発！'];
    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    if (this.dialogueText) {
      this.dialogueText.setText(dialogue);
      this.dialogueText.setAlpha(1.0);
      this.dialogueText.setColor('#ff6b6b'); // 赤色
      
      // セリフをフェードアウト
      this.tweens.add({
        targets: this.dialogueText,
        alpha: 0,
        duration: 2000,
        delay: 1000,
      });
    }
    
    // 画面内のタスクを一気にクリア
    const tasks = this.taskManager.getTasks();
    const taskCount = tasks.length;
    
    for (const task of tasks) {
      // ダメージポップアップを表示
      this.showDamagePopup(task.x, task.y, new DecimalWrapper(999999));
      
      // タスクを削除
      this.taskManager.removeTask(task);
    }
    
    // 画面クリア演出を開始（タスクが複数ある場合のみ）
    if (taskCount > 0 && this.screenClearEffect) {
      this.screenClearEffect.start();
    }
    
    // ストレスを0%にリセット
    this.stressSystem.reset();
    
    // コンボを追加（爆発覚醒で倒した分）
    if (this.combo) {
      this.combo.addCombo(taskCount);
    }
    
    // エフェクトをすぐに停止（爆発覚醒は一瞬）
    this.time.delayedCall(1000, () => {
      if (this.awakeningEffect) {
        this.awakeningEffect.stop();
      }
    });
  }

  /**
   * 創造覚醒を発動
   */
  private activateCreativeAwakening(): void {
    if (!this.reia || !this.awakeningEffect) {
      return;
    }
    
    // エフェクトを開始
    this.awakeningEffect.start(AwakeningType.CREATIVE, this.reia.x, this.reia.y);
    
    // れいあの覚醒アニメーション
    this.reia.playAwakeningAnimation('creative');
    
    // セリフを表示（ランダムに選択）
    const dialogues = ['閃いた！', 'これでいける！', 'やれる！', '創造！'];
    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    if (this.dialogueText) {
      this.dialogueText.setText(dialogue);
      this.dialogueText.setAlpha(1.0);
      this.dialogueText.setColor('#ffd93d'); // 黄色
      
      // セリフをフェードアウト
      this.tweens.add({
        targets: this.dialogueText,
        alpha: 0,
        duration: 2000,
        delay: 1000,
      });
    }
    
    // 覚醒モード終了時にエフェクトを停止
    this.time.delayedCall(15000, () => {
      if (this.awakeningEffect) {
        this.awakeningEffect.stop();
      }
    });
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

