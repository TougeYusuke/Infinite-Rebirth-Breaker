/**
 * BattleScene - バトルシーン
 * 
 * メインのバトル画面を管理
 */

import Phaser from 'phaser';
import { Battle, BattleConfig } from '../core/Battle';
import { DamagePopup } from '../ui/DamagePopup';
import { HPBar } from '../ui/HPBar';
import { DecimalWrapper } from '../utils/Decimal';
import { Stage, StageConfig } from '../systems/Stage';
import { Timer, TimerConfig } from '../systems/Timer';
import { GameOverScene, GameOverInfo } from './GameOverScene';
import { Rebirth } from '../systems/Rebirth';
import { Upgrade } from '../systems/Upgrade';
import { Combo } from '../systems/Combo';
import { loadSaveData, saveSaveData } from '../utils/Storage';

export class BattleScene extends Phaser.Scene {
  private battle: Battle | null = null;
  private stage: Stage | null = null;
  private timer: Timer | null = null;
  private combo: Combo | null = null;
  private hpBar: HPBar | null = null;
  private timerBar: HPBar | null = null;
  private damagePopups: DamagePopup[] = [];
  private baseDamage: number = 10;
  private attackLevel: number = 1;
  private totalDamage: DecimalWrapper = DecimalWrapper.zero();
  private isFullRun: boolean = true; // Full Runモードかどうか
  
  // UI要素
  private stageText: Phaser.GameObjects.Text | null = null;
  private timerText: Phaser.GameObjects.Text | null = null;
  private comboText: Phaser.GameObjects.Text | null = null;
  private comboBar: HPBar | null = null;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(data?: { startStage?: number; isFullRun?: boolean }): void {
    // バトル画面の初期化
    
    // 背景色
    this.cameras.main.setBackgroundColor('#2a2a2a');
    
    // シーン遷移時のデータを処理
    const startStage = data?.startStage || 1;
    this.isFullRun = data?.isFullRun !== false; // デフォルトはtrue
    
    // 攻撃レベルをセーブデータから読み込む（0の場合は1として扱う）
    this.attackLevel = Math.max(1, Upgrade.getAttackLevel());
    
    // システムを初期化
    this.initializeSystems(startStage);
    
    // 最初の敵を生成
    this.spawnEnemy();
    
    // UIを初期化
    this.initializeUI();
    
    // タップイベントを設定
    this.input.on('pointerdown', () => {
      this.handleTap();
    });
  }

  /**
   * システムを初期化
   * 
   * @param startStage - 開始ステージ
   */
  private initializeSystems(startStage: number = 1): void {
    // コンボシステム
    // Full Runの場合は0から、Quick Skipの場合は0から（コンボはリセット）
    this.combo = new Combo(0);
    
    // バトルシステム
    const comboMultiplier = this.combo.getComboMultiplier();
    const battleConfig: BattleConfig = {
      baseDamage: this.baseDamage,
      attackLevel: this.attackLevel,
      comboMultiplier: comboMultiplier,
    };
    this.battle = new Battle(battleConfig);
    
    // ステージシステム
    const stageConfig: StageConfig = {
      baseHP: 100,
      startStage: startStage,
    };
    this.stage = new Stage(stageConfig);
    
    // タイマーシステム
    const timerConfig: TimerConfig = {
      timeLimit: 30, // 30秒
    };
    this.timer = new Timer(timerConfig);
    this.timer.start();
    
    // 累計ダメージをリセット
    this.totalDamage = DecimalWrapper.zero();
  }

  /**
   * UIを初期化
   */
  private initializeUI(): void {
    // ステージ表示
    this.stageText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
    });
    
    // タイマー表示
    this.timerText = this.add.text(20, 50, '', {
      fontSize: '20px',
      color: '#ffffff',
    });
    
    // タイマーバー
    this.timerBar = new HPBar(this, {
      x: this.cameras.main.width / 2,
      y: 50,
      width: 300,
      height: 10,
    });
    
    // コンボ表示（Full Runの場合のみ）
    if (this.isFullRun) {
      this.comboText = this.add.text(20, 80, '', {
        fontSize: '20px',
        color: '#4A90E2',
      });
      
      // コンボバー
      this.comboBar = new HPBar(this, {
        x: this.cameras.main.width / 2,
        y: 80,
        width: 300,
        height: 10,
      });
    }
    
    this.updateUI();
  }

  /**
   * 敵を生成
   */
  private spawnEnemy(): void {
    if (!this.stage) {
      return;
    }
    
    const enemy = this.stage.spawnEnemy();
    
    if (this.battle) {
      this.battle.setEnemy(enemy);
    }
    
    // HPバーを作成
    if (this.hpBar) {
      this.hpBar.destroy();
    }
    
    this.hpBar = new HPBar(this, {
      x: this.cameras.main.width / 2,
      y: 100,
      width: 300,
      height: 20,
    });
    
    // HPバーを更新
    this.updateHPBar();
  }

  /**
   * タップ処理
   */
  private handleTap(): void {
    if (!this.battle || !this.stage) {
      return;
    }
    
    const enemy = this.stage.getEnemy();
    if (!enemy) {
      return;
    }
    
    // Tap Attack
    const damage = this.battle.tapAttack();
    
    if (damage && !damage.isZero()) {
      // 累計ダメージを更新
      this.totalDamage = this.totalDamage.add(damage);
      
      // ダメージポップアップを表示
      this.showDamagePopup(damage);
      
      // HPバーを更新
      this.updateHPBar();
      
      // 敵が倒されたかチェック
      if (this.stage.isEnemyDefeated()) {
        this.onEnemyDefeated();
      }
    }
  }

  /**
   * ダメージポップアップを表示
   * 
   * @param damage - ダメージ値
   */
  private showDamagePopup(damage: DecimalWrapper): void {
    // 敵の位置にポップアップを表示
    const x = this.cameras.main.width / 2;
    const y = this.cameras.main.height / 2;
    
    const popup = new DamagePopup(this, {
      x: x + (Math.random() - 0.5) * 100, // ランダムな位置に表示
      y: y + (Math.random() - 0.5) * 100,
      damage: damage,
    });
    
    this.damagePopups.push(popup);
    
    // 破棄されたポップアップを配列から削除
    this.damagePopups = this.damagePopups.filter(p => !p.isDestroyed());
  }

  /**
   * HPバーを更新
   */
  private updateHPBar(): void {
    if (this.hpBar && this.stage) {
      const enemy = this.stage.getEnemy();
      if (enemy) {
        const ratio = enemy.getHPRatio();
        this.hpBar.updateHP(ratio);
      }
    }
  }

  /**
   * UIを更新
   */
  private updateUI(): void {
    // ステージ表示
    if (this.stageText && this.stage) {
      this.stageText.setText(`Stage ${this.stage.getCurrentStage()}`);
    }
    
    // タイマー表示
    if (this.timerText && this.timer) {
      const timeRemaining = Math.ceil(this.timer.getTimeRemaining());
      this.timerText.setText(`Time: ${timeRemaining}s`);
    }
    
    // タイマーバー
    if (this.timerBar && this.timer) {
      const ratio = this.timer.getTimeRatio();
      this.timerBar.updateHP(ratio);
    }
    
    // コンボ表示（Full Runの場合のみ）
    if (this.isFullRun && this.combo) {
      if (this.comboText) {
        const comboCount = this.combo.getComboCount();
        const multiplier = this.combo.getComboMultiplier();
        this.comboText.setText(`Combo: ${comboCount} (x${multiplier.toFixed(1)})`);
      }
      
      if (this.comboBar) {
        const ratio = this.combo.getComboRatio();
        this.comboBar.updateHP(ratio);
      }
    }
  }

  /**
   * 敵が倒された時の処理
   */
  private onEnemyDefeated(): void {
    if (!this.stage) {
      return;
    }
    
    // Full Runの場合、コンボを追加
    if (this.isFullRun && this.combo) {
      this.combo.addCombo(1);
      
      // バトルシステムのコンボ倍率を更新
      if (this.battle) {
        const comboMultiplier = this.combo.getComboMultiplier();
        this.battle.setComboMultiplier(comboMultiplier);
      }
    }
    
    // タイマーをリセット
    if (this.timer) {
      this.timer.reset();
      this.timer.start();
    }
    
    // 次のステージへ
    this.stage.nextStage();
    this.spawnEnemy();
  }

  /**
   * ゲームオーバー処理
   */
  private onGameOver(): void {
    if (!this.stage || !this.timer) {
      return;
    }
    
    // 転生石を計算
    const reachedStage = this.stage.getCurrentStage();
    let baseStones = Rebirth.calculateRebirthStones(reachedStage);
    
    // Full Runの場合、コンボ倍率を適用
    if (this.isFullRun && this.combo) {
      const comboMultiplier = this.combo.getComboMultiplier();
      baseStones = Math.floor(baseStones * comboMultiplier);
    }
    
    // 転生石を獲得
    const currentSaveData = loadSaveData();
    const currentStones = new DecimalWrapper(currentSaveData.rebirthStones);
    const newStones = currentStones.add(baseStones);
    
    // セーブデータを更新
    const updatedSaveData = {
      ...currentSaveData,
      rebirthStones: newStones.toString(),
      maxStage: Math.max(currentSaveData.maxStage, reachedStage),
    };
    saveSaveData(updatedSaveData);
    
    // ゲームオーバー情報を設定
    const gameOverInfo: GameOverInfo = {
      reachedStage: reachedStage,
      rebirthStones: baseStones,
      totalDamage: this.totalDamage,
    };
    
    // GameOverSceneに情報を渡す
    const gameOverScene = this.scene.get('GameOverScene') as GameOverScene;
    if (gameOverScene) {
      gameOverScene.setGameOverInfo(gameOverInfo);
    }
    
    // GameOverSceneに遷移
    this.scene.start('GameOverScene');
  }

  /**
   * 更新処理（毎フレーム呼び出される）
   * 
   * @param _time - 経過時間（ミリ秒）（未使用）
   * @param delta - 前フレームからの経過時間（ミリ秒）
   */
  update(_time: number, delta: number): void {
    if (!this.battle || !this.stage || !this.timer) {
      return;
    }
    
    // タイマーを更新
    this.timer.update(delta);
    
    // 時間切れチェック
    if (this.timer.isTimeExpired()) {
      this.onGameOver();
      return;
    }
    
    // Auto Attack
    const damage = this.battle.autoAttack(delta);
    
    if (damage && !damage.isZero()) {
      // 累計ダメージを更新
      this.totalDamage = this.totalDamage.add(damage);
      
      // ダメージポップアップを表示
      this.showDamagePopup(damage);
      
      // HPバーを更新
      this.updateHPBar();
      
      // 敵が倒されたかチェック
      if (this.stage.isEnemyDefeated()) {
        this.onEnemyDefeated();
      }
    }
    
    // UIを更新
    this.updateUI();
    
    // 破棄されたポップアップを配列から削除
    this.damagePopups = this.damagePopups.filter(p => !p.isDestroyed());
  }
}

