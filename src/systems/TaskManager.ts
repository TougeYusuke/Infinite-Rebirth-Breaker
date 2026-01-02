/**
 * TaskManager - タスクマネージャー
 * 
 * タスクの生成、管理、削除を担当
 */

import Phaser from 'phaser';
import { Task, TaskType } from '../entities/Task';
import { Reia } from '../entities/Reia';

/**
 * タスクマネージャーの設定
 */
export interface TaskManagerConfig {
  spawnInterval: number;    // タスク生成間隔（ミリ秒）
  maxTasks: number;          // 最大タスク数
  spawnRadius: number;       // 生成半径（れいあからの距離）
  stage: number;            // 現在のステージ
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

  constructor(scene: Phaser.Scene, reia: Reia, config: TaskManagerConfig) {
    this.scene = scene;
    this.reia = reia;
    this.config = config;
  }

  /**
   * タスクマネージャーを開始
   */
  start(): void {
    // 最初のタスクを生成
    this.spawnTask();
    
    // 定期的にタスクを生成
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.config.spawnInterval,
      callback: () => {
        if (this.tasks.length < this.config.maxTasks) {
          this.spawnTask();
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
    
    // タスクを作成
    const task = new Task(this.scene, {
      type: taskType,
      stage: this.config.stage,
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

