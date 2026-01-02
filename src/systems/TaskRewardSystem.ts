/**
 * TaskRewardSystem - タスク報酬システム
 * 
 * タスクを倒した時の報酬を管理する
 */

import { TaskType } from '../entities/Task';

/**
 * デバッグポイント（バグを倒した時に獲得）
 */
export interface DebugPoints {
  total: number; // 累計デバッグポイント
}

/**
 * 仕様理解度（仕様変更を倒した時に獲得）
 */
export interface FeatureUnderstanding {
  level: number;        // 現在のレベル（連続で倒した数）
  attackMultiplier: number; // 攻撃力倍率（1.0 + level * 0.2）
  remainingTime: number;    // 残り時間（ミリ秒）
}

/**
 * コード品質（レビュー依頼を倒した時に獲得）
 */
export interface CodeQuality {
  level: number;        // 現在のレベル（最大5）
  autoAttackSpeedMultiplier: number; // オート攻撃速度倍率（1.0 - level * 0.1）
}

/**
 * 緊急対応力（緊急タスクを倒した時に獲得）
 */
export interface EmergencyResponse {
  level: number;        // 現在のレベル（最大3）
  stressResistance: number; // ストレス耐性（1.0 - level * 0.1）
}

/**
 * タスク報酬システム
 */
export class TaskRewardSystem {
  private debugPoints: DebugPoints = { total: 0 };
  private featureUnderstanding: FeatureUnderstanding = {
    level: 0,
    attackMultiplier: 1.0,
    remainingTime: 0,
  };
  private codeQuality: CodeQuality = {
    level: 0,
    autoAttackSpeedMultiplier: 1.0,
  };
  private emergencyResponse: EmergencyResponse = {
    level: 0,
    stressResistance: 1.0,
  };
  
  // 連続で倒したタスクの種類を記録（仕様変更の連続ボーナス用）
  private consecutiveTaskTypes: TaskType[] = [];
  private maxConsecutiveCount = 3; // 3連続で倒すとボーナス

  /**
   * タスクを倒した時の報酬を処理
   */
  onTaskDefeated(taskType: TaskType, deltaTime: number = 0): void {
    // 仕様理解度の残り時間を更新
    this.updateFeatureUnderstanding(deltaTime);

    switch (taskType) {
      case TaskType.BUG:
        this.handleBugReward();
        break;
      case TaskType.FEATURE:
        this.handleFeatureReward();
        break;
      case TaskType.REVIEW:
        this.handleReviewReward();
        break;
      case TaskType.URGENT:
        this.handleUrgentReward();
        break;
    }
  }

  /**
   * バグを倒した時の報酬
   */
  private handleBugReward(): void {
    // デバッグポイントを獲得
    this.debugPoints.total += 1;
    this.consecutiveTaskTypes = []; // 連続記録をリセット
  }

  /**
   * 仕様変更を倒した時の報酬
   */
  private handleFeatureReward(): void {
    // 連続記録を更新
    this.consecutiveTaskTypes.push(TaskType.FEATURE);
    
    // 3連続で倒した場合は2倍の効果
    const isTriple = this.consecutiveTaskTypes.length >= this.maxConsecutiveCount &&
                     this.consecutiveTaskTypes.slice(-this.maxConsecutiveCount).every(t => t === TaskType.FEATURE);
    
    if (isTriple) {
      // 3連続ボーナス: 効果が2倍
      this.featureUnderstanding.level = 2; // レベル2 = 2倍の効果
      this.featureUnderstanding.attackMultiplier = 1.0 + (2 * 0.2) * 2; // 1.8倍
      this.consecutiveTaskTypes = []; // リセット
    } else {
      // 通常: レベル1 = 1.2倍
      this.featureUnderstanding.level = 1;
      this.featureUnderstanding.attackMultiplier = 1.0 + (1 * 0.2); // 1.2倍
    }
    
    // 10秒間持続
    this.featureUnderstanding.remainingTime = 10000;
  }

  /**
   * レビュー依頼を倒した時の報酬
   */
  private handleReviewReward(): void {
    // コード品質を上げる（最大5回まで）
    if (this.codeQuality.level < 5) {
      this.codeQuality.level += 1;
      this.codeQuality.autoAttackSpeedMultiplier = 1.0 - (this.codeQuality.level * 0.1);
    }
    this.consecutiveTaskTypes = []; // 連続記録をリセット
  }

  /**
   * 緊急タスクを倒した時の報酬
   */
  private handleUrgentReward(): void {
    // 緊急対応力を上げる（最大3回まで）
    if (this.emergencyResponse.level < 3) {
      this.emergencyResponse.level += 1;
      this.emergencyResponse.stressResistance = 1.0 - (this.emergencyResponse.level * 0.1);
    }
    this.consecutiveTaskTypes = []; // 連続記録をリセット
  }

  /**
   * 仕様理解度の残り時間を更新
   */
  private updateFeatureUnderstanding(deltaTime: number): void {
    if (this.featureUnderstanding.remainingTime > 0) {
      this.featureUnderstanding.remainingTime -= deltaTime;
      if (this.featureUnderstanding.remainingTime <= 0) {
        // 効果が切れた
        this.featureUnderstanding.level = 0;
        this.featureUnderstanding.attackMultiplier = 1.0;
        this.featureUnderstanding.remainingTime = 0;
      }
    }
  }

  /**
   * 更新処理（毎フレーム呼び出す）
   */
  update(deltaTime: number): void {
    this.updateFeatureUnderstanding(deltaTime);
  }

  /**
   * デバッグポイントを取得
   */
  getDebugPoints(): number {
    return this.debugPoints.total;
  }

  /**
   * 仕様理解度の攻撃力倍率を取得
   */
  getFeatureAttackMultiplier(): number {
    return this.featureUnderstanding.attackMultiplier;
  }

  /**
   * 仕様理解度の残り時間を取得（ミリ秒）
   */
  getFeatureRemainingTime(): number {
    return this.featureUnderstanding.remainingTime;
  }

  /**
   * コード品質のオート攻撃速度倍率を取得
   */
  getCodeQualitySpeedMultiplier(): number {
    return this.codeQuality.autoAttackSpeedMultiplier;
  }

  /**
   * コード品質のレベルを取得
   */
  getCodeQualityLevel(): number {
    return this.codeQuality.level;
  }

  /**
   * 緊急対応力のストレス耐性を取得
   */
  getEmergencyStressResistance(): number {
    return this.emergencyResponse.stressResistance;
  }

  /**
   * 緊急対応力のレベルを取得
   */
  getEmergencyResponseLevel(): number {
    return this.emergencyResponse.level;
  }

  /**
   * リセット（ゲームオーバー時など）
   */
  reset(): void {
    this.debugPoints = { total: 0 };
    this.featureUnderstanding = {
      level: 0,
      attackMultiplier: 1.0,
      remainingTime: 0,
    };
    this.codeQuality = {
      level: 0,
      autoAttackSpeedMultiplier: 1.0,
    };
    this.emergencyResponse = {
      level: 0,
      stressResistance: 1.0,
    };
    this.consecutiveTaskTypes = [];
  }
}

