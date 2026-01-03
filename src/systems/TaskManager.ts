/**
 * TaskManager - タスクマネージャー
 * 
 * タスクの生成、管理、削除を担当
 */

import Phaser from 'phaser';
import { Task, TaskType } from '../entities/Task';
import { Reia } from '../entities/Reia';
import { WaveSystem } from './WaveSystem';

/**
 * タスクマネージャーの設定
 */
export interface TaskManagerConfig {
  spawnInterval: number;    // タスク生成間隔（ミリ秒）
  maxTasks: number;          // 最大タスク数
  spawnRadius: number;       // 生成半径（れいあからの距離）
  stage: number;            // 現在のステージ
  waveSystem?: WaveSystem;  // Waveシステム（オプション）
}

/**
 * タスクマネージャー
 */
export class TaskManager {
  private scene: Phaser.Scene;
  private reia: Reia;
  private config: TaskManagerConfig;
  private tasks: Task[] = [];
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private lastSpawnTime: number = 0;
  private waveSystem: WaveSystem | null = null;

  constructor(scene: Phaser.Scene, reia: Reia, config: TaskManagerConfig) {
    this.scene = scene;
    this.reia = reia;
    this.config = config;
    this.waveSystem = config.waveSystem || null;
  }

  /**
   * タスクマネージャーを開始
   */
  start(): void {
    // 最初のタスクを生成
    this.spawnTask();
    
    // 定期的にタスクを生成（WaveSystemの倍率を考慮）
    const baseInterval = this.config.spawnInterval;
    const waveMultiplier = this.waveSystem?.getSpawnIntervalMultiplier() || 1.0;
    const actualInterval = baseInterval * waveMultiplier;
    
    this.spawnTimer = this.scene.time.addEvent({
      delay: actualInterval,
      callback: () => {
        if (this.tasks.length < this.config.maxTasks) {
          this.spawnTask();
        }
        // WaveSystemの倍率が変わった場合に間隔を更新
        const newMultiplier = this.waveSystem?.getSpawnIntervalMultiplier() || 1.0;
        const newInterval = baseInterval * newMultiplier;
        if (this.spawnTimer && this.spawnTimer.delay !== newInterval) {
          this.spawnTimer.destroy();
          this.spawnTimer = this.scene.time.addEvent({
            delay: newInterval,
            callback: () => {
              if (this.tasks.length < this.config.maxTasks) {
                this.spawnTask();
              }
            },
            loop: true,
          });
        }
      },
      loop: true,
    });
  }

  /**
   * タスクマネージャーを停止
   */
  stop(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }
  }

  /**
   * 生成間隔を更新（デバッグ用）
   */
  updateSpawnInterval(newInterval: number): void {
    this.config.spawnInterval = newInterval;
    
    // 既存のタイマーを停止して再起動
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }
    
    // 新しい間隔で再起動
    this.start();
  }

  /**
   * 最大タスク数を更新（Wave進行に応じて）
   */
  updateMaxTasks(newMaxTasks: number): void {
    this.config.maxTasks = newMaxTasks;
    // 現在のタスク数が新しい最大数を超えている場合は削除しない（自然に減るまで待つ）
  }

  /**
   * タスクを生成
   */
  private spawnTask(): void {
    const now = Date.now();
    if (now - this.lastSpawnTime < this.config.spawnInterval) {
      return; // 生成間隔が短すぎる
    }
    this.lastSpawnTime = now;

    // れいあの位置を取得
    const reiaX = this.reia.x;
    const reiaY = this.reia.y;
    
    // れいあの周りを囲むように配置（ランダムな角度）
    const angle = Math.random() * Math.PI * 2;
    const distance = this.config.spawnRadius;
    const spawnX = reiaX + Math.cos(angle) * distance;
    const spawnY = reiaY + Math.sin(angle) * distance;
    
    // タスクの種類をランダムに決定（重み付け）
    const taskType = this.selectRandomTaskType();
    
    // WaveSystemの難易度倍率を考慮したstageを計算
    let effectiveStage = this.config.stage;
    if (this.waveSystem) {
      // Wave数に応じた難易度倍率をstageに反映
      const difficultyMultiplier = this.waveSystem.getTaskHPMultiplier();
      // 倍率をstageに変換（1.2倍 = stage + 1相当）
      effectiveStage = Math.floor(this.config.stage * difficultyMultiplier);
    }
    
    // タスクを作成
    const task = new Task(this.scene, {
      type: taskType,
      stage: effectiveStage,
      x: spawnX,
      y: spawnY,
      targetX: reiaX,
      targetY: reiaY,
    });
    
    this.tasks.push(task);
  }

  /**
   * ランダムにタスクの種類を選択（重み付け）
   */
  private selectRandomTaskType(): TaskType {
    const rand = Math.random();
    
    // 重み付け: バグ40%, 仕様変更30%, レビュー20%, 緊急10%
    if (rand < 0.4) {
      return TaskType.BUG;
    } else if (rand < 0.7) {
      return TaskType.FEATURE;
    } else if (rand < 0.9) {
      return TaskType.REVIEW;
    } else {
      return TaskType.URGENT;
    }
  }

  /**
   * タスクを更新
   */
  update(delta: number): void {
    // れいあの位置を更新
    const reiaX = this.reia.x;
    const reiaY = this.reia.y;
    
    // 各タスクを更新
    for (const task of this.tasks) {
      // 目標位置を更新
      (task as any).targetX = reiaX;
      (task as any).targetY = reiaY;
      
      task.updateTask(delta);
      
      // れいあに触れたかチェック
      if (task.isTouchingTarget()) {
        // ゲームオーバー（後で実装）
        // TODO: ゲームオーバー処理
      }
    }
  }

  /**
   * タスクを削除
   */
  removeTask(task: Task): void {
    const index = this.tasks.indexOf(task);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      task.destroy();
    }
  }

  /**
   * すべてのタスクを取得
   */
  getTasks(): Task[] {
    return this.tasks;
  }

  /**
   * タスク数を取得
   */
  getTaskCount(): number {
    return this.tasks.length;
  }

  /**
   * すべてのタスクを削除
   */
  clearAllTasks(): void {
    for (const task of this.tasks) {
      task.destroy();
    }
    this.tasks = [];
  }

  /**
   * 破棄
   */
  destroy(): void {
    this.stop();
    this.clearAllTasks();
  }
}

