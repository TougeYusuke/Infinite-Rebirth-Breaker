/**
 * BattleScene - バトルシーン
 * 
 * メインのバトル画面を管理
 */

import Phaser from 'phaser';
import { Battle, BattleConfig } from '../core/Battle';
import { Enemy, EnemyConfig } from '../core/Enemy';
import { DamagePopup } from '../ui/DamagePopup';
import { HPBar } from '../ui/HPBar';
import { DecimalWrapper } from '../utils/Decimal';

export class BattleScene extends Phaser.Scene {
  private battle: Battle | null = null;
  private enemy: Enemy | null = null;
  private hpBar: HPBar | null = null;
  private damagePopups: DamagePopup[] = [];
  private currentStage: number = 1;
  private baseDamage: number = 10;
  private attackLevel: number = 1;
  private comboMultiplier: number = 1.0;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    // バトル画面の初期化
    console.log('BattleScene: バトル開始');
    
    // 背景色
    this.cameras.main.setBackgroundColor('#2a2a2a');
    
    // バトルシステムを初期化
    this.initializeBattle();
    
    // 最初の敵を生成
    this.spawnEnemy(this.currentStage);
    
    // タップイベントを設定
    this.input.on('pointerdown', () => {
      this.handleTap();
    });
  }

  /**
   * バトルシステムを初期化
   */
  private initializeBattle(): void {
    const battleConfig: BattleConfig = {
      baseDamage: this.baseDamage,
      attackLevel: this.attackLevel,
      comboMultiplier: this.comboMultiplier,
    };
    
    this.battle = new Battle(battleConfig);
  }

  /**
   * 敵を生成
   * 
   * @param stage - ステージ番号
   */
  private spawnEnemy(stage: number): void {
    const enemyConfig: EnemyConfig = {
      baseHP: 100,
      stage: stage,
    };
    
    this.enemy = new Enemy(enemyConfig);
    
    if (this.battle) {
      this.battle.setEnemy(this.enemy);
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
    if (!this.battle || !this.enemy) {
      return;
    }
    
    // Tap Attack
    const damage = this.battle.tapAttack();
    
    if (damage && !damage.isZero()) {
      // ダメージポップアップを表示
      this.showDamagePopup(damage);
      
      // HPバーを更新
      this.updateHPBar();
      
      // 敵が倒されたかチェック
      if (this.enemy.isDefeated()) {
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
    if (this.hpBar && this.enemy) {
      const ratio = this.enemy.getHPRatio();
      this.hpBar.updateHP(ratio);
    }
  }

  /**
   * 敵が倒された時の処理
   */
  private onEnemyDefeated(): void {
    console.log(`Stage ${this.currentStage} クリア！`);
    
    // 次のステージへ
    this.currentStage++;
    this.spawnEnemy(this.currentStage);
  }

  /**
   * 更新処理（毎フレーム呼び出される）
   * 
   * @param time - 経過時間（ミリ秒）
   * @param delta - 前フレームからの経過時間（ミリ秒）
   */
  update(time: number, delta: number): void {
    if (!this.battle || !this.enemy) {
      return;
    }
    
    // Auto Attack
    const damage = this.battle.autoAttack(delta);
    
    if (damage && !damage.isZero()) {
      // ダメージポップアップを表示
      this.showDamagePopup(damage);
      
      // HPバーを更新
      this.updateHPBar();
      
      // 敵が倒されたかチェック
      if (this.enemy.isDefeated()) {
        this.onEnemyDefeated();
      }
    }
    
    // 破棄されたポップアップを配列から削除
    this.damagePopups = this.damagePopups.filter(p => !p.isDestroyed());
  }
}

