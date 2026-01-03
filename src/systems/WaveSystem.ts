/**
 * WaveSystem - Waveシステム
 * 
 * Wave進行と難易度調整を管理
 */

/**
 * Waveシステムの設定
 */
export interface WaveSystemConfig {
  tasksPerWave: number;      // 1Waveあたりのタスク数（デフォルト: 10）
  waveClearBonus: number;    // Waveクリア時のボーナス（デフォルト: 1.2倍）
}

/**
 * Waveシステム
 */
export class WaveSystem {
  private currentWave: number = 1;
  private tasksDefeatedInWave: number = 0;
  private tasksPerWave: number = 10;
  private waveClearBonus: number = 1.2;

  constructor(config?: Partial<WaveSystemConfig>) {
    this.tasksPerWave = config?.tasksPerWave || 10;
    this.waveClearBonus = config?.waveClearBonus || 1.2;
  }

  /**
   * タスクを倒した時の処理
   * @returns Waveが進んだ場合true
   */
  onTaskDefeated(): boolean {
    this.tasksDefeatedInWave++;
    
    // Waveクリア判定
    if (this.tasksDefeatedInWave >= this.tasksPerWave) {
      this.nextWave();
      return true; // Waveが進んだ
    }
    return false; // Waveは進まなかった
  }

  /**
   * 次のWaveに進む
   */
  private nextWave(): void {
    this.currentWave++;
    this.tasksDefeatedInWave = 0;
  }

  /**
   * 現在のWave数を取得
   */
  getCurrentWave(): number {
    return this.currentWave;
  }

  /**
   * Wave内で倒したタスク数を取得
   */
  getTasksDefeatedInWave(): number {
    return this.tasksDefeatedInWave;
  }

  /**
   * Wave内の残りタスク数を取得
   */
  getRemainingTasksInWave(): number {
    return Math.max(0, this.tasksPerWave - this.tasksDefeatedInWave);
  }

  /**
   * Wave進行率を取得（0.0 〜 1.0）
   */
  getWaveProgress(): number {
    return this.tasksDefeatedInWave / this.tasksPerWave;
  }

  /**
   * Wave数に応じた難易度倍率を取得
   */
  getDifficultyMultiplier(): number {
    // Wave数に応じて難易度が上がる（1.2倍ずつ）
    return Math.pow(this.waveClearBonus, this.currentWave - 1);
  }

  /**
   * Wave数に応じたタスクのHP倍率を取得
   */
  getTaskHPMultiplier(): number {
    return this.getDifficultyMultiplier();
  }

  /**
   * Wave数に応じたタスク生成間隔の倍率を取得（Waveが進むと生成が速くなる）
   */
  getSpawnIntervalMultiplier(): number {
    // Waveが進むと生成間隔が短くなる（最大0.5倍まで）
    return Math.max(0.5, 1.0 - (this.currentWave - 1) * 0.05);
  }

  /**
   * リセット（ゲームオーバー時など）
   */
  reset(): void {
    this.currentWave = 1;
    this.tasksDefeatedInWave = 0;
  }

  /**
   * Wave数を設定（デバッグ用）
   */
  setWave(wave: number): void {
    this.currentWave = Math.max(1, wave);
    this.tasksDefeatedInWave = 0;
  }
}

