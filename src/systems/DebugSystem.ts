/**
 * DebugSystem - デバッグシステム
 * 
 * 開発中にゲームのバランス調整やテストを容易にするためのデバッグ機能
 */

/**
 * デバッグ設定
 */
export interface DebugConfig {
  enabled: boolean;              // デバッグモードが有効かどうか
  attackPowerMultiplier: number; // 攻撃力倍率（デフォルト: 1.0）
  taskSpawnInterval: number;     // タスク生成間隔（ミリ秒、デフォルト: 3000）
  autoAttackInterval: number;    // オート攻撃間隔（ミリ秒、デフォルト: 1000）
}

/**
 * デバッグシステム
 */
export class DebugSystem {
  private config: DebugConfig;

  constructor() {
    // デフォルト設定
    this.config = {
      enabled: false, // デフォルトは無効（本番環境ではfalse）
      attackPowerMultiplier: 1.0,
      taskSpawnInterval: 3000,
      autoAttackInterval: 1000,
    };
  }

  /**
   * デバッグモードを有効化/無効化
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * デバッグモードが有効かどうか
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * 攻撃力倍率を設定
   */
  setAttackPowerMultiplier(multiplier: number): void {
    this.config.attackPowerMultiplier = Math.max(0.1, multiplier);
  }

  /**
   * 攻撃力倍率を取得
   */
  getAttackPowerMultiplier(): number {
    return this.config.attackPowerMultiplier;
  }

  /**
   * タスク生成間隔を設定
   */
  setTaskSpawnInterval(interval: number): void {
    this.config.taskSpawnInterval = Math.max(100, interval);
  }

  /**
   * タスク生成間隔を取得
   */
  getTaskSpawnInterval(): number {
    return this.config.taskSpawnInterval;
  }

  /**
   * オート攻撃間隔を設定
   */
  setAutoAttackInterval(interval: number): void {
    this.config.autoAttackInterval = Math.max(100, interval);
  }

  /**
   * オート攻撃間隔を取得
   */
  getAutoAttackInterval(): number {
    return this.config.autoAttackInterval;
  }

  /**
   * 設定を取得
   */
  getConfig(): DebugConfig {
    return { ...this.config };
  }

  /**
   * 設定をリセット
   */
  reset(): void {
    this.config = {
      enabled: false,
      attackPowerMultiplier: 1.0,
      taskSpawnInterval: 3000,
      autoAttackInterval: 1000,
    };
  }
}

