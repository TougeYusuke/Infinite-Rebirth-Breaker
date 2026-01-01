/**
 * Timer - タイマーシステム
 * 
 * 各ステージの制限時間を管理
 */

/**
 * タイマー設定
 */
export interface TimerConfig {
  timeLimit: number;  // 制限時間（秒）
}

/**
 * タイマーシステム
 * 
 * 各ステージの制限時間（30秒）を管理し、時間切れを検知する
 */
export class Timer {
  private timeLimit: number;      // 制限時間（秒）
  private timeRemaining: number;   // 残り時間（秒）
  private isRunning: boolean = false;
  private isExpired: boolean = false;

  /**
   * コンストラクタ
   * 
   * @param config - タイマー設定
   */
  constructor(config: TimerConfig) {
    this.timeLimit = config.timeLimit;
    this.timeRemaining = config.timeLimit;
  }

  /**
   * タイマーを開始
   */
  start(): void {
    this.isRunning = true;
    this.isExpired = false;
    this.timeRemaining = this.timeLimit;
  }

  /**
   * タイマーを停止
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * タイマーをリセット
   */
  reset(): void {
    this.isRunning = false;
    this.isExpired = false;
    this.timeRemaining = this.timeLimit;
  }

  /**
   * タイマーを更新
   * 
   * このメソッドは毎フレーム呼び出されることを想定
   * 
   * @param deltaTime - 前フレームからの経過時間（ミリ秒）
   */
  update(deltaTime: number): void {
    if (!this.isRunning || this.isExpired) {
      return;
    }
    
    // ミリ秒を秒に変換
    const deltaSeconds = deltaTime / 1000;
    
    // 残り時間を減らす
    this.timeRemaining -= deltaSeconds;
    
    // 時間切れチェック
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.isExpired = true;
      this.isRunning = false;
    }
  }

  /**
   * 残り時間を取得
   * 
   * @returns 残り時間（秒）
   */
  getTimeRemaining(): number {
    return Math.max(0, this.timeRemaining);
  }

  /**
   * 残り時間の割合を取得（0.0 〜 1.0）
   * 
   * @returns 残り時間の割合
   */
  getTimeRatio(): number {
    if (this.timeLimit <= 0) {
      return 0;
    }
    
    return Math.max(0, Math.min(1, this.timeRemaining / this.timeLimit));
  }

  /**
   * タイマーが時間切れかどうか
   * 
   * @returns true の場合、時間切れ
   */
  isTimeExpired(): boolean {
    return this.isExpired;
  }

  /**
   * タイマーが実行中かどうか
   * 
   * @returns true の場合、実行中
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * 制限時間を取得
   * 
   * @returns 制限時間（秒）
   */
  getTimeLimit(): number {
    return this.timeLimit;
  }

  /**
   * 制限時間を設定
   * 
   * @param timeLimit - 制限時間（秒）
   */
  setTimeLimit(timeLimit: number): void {
    this.timeLimit = timeLimit;
    if (!this.isRunning) {
      this.timeRemaining = timeLimit;
    }
  }
}

