/**
 * GameScene - メインゲームシーン
 * 
 * れいあのコーディングバトルのメイン画面を管理
 */

import Phaser from 'phaser';
import { Reia, ReiaConfig } from '../entities/Reia';
import { StressSystem } from '../systems/StressSystem';
import { Combo } from '../systems/Combo';

export class GameScene extends Phaser.Scene {
  private reia: Reia | null = null;
  private stressSystem: StressSystem | null = null;
  private combo: Combo | null = null;
  
  // UI要素
  private stressBar: Phaser.GameObjects.Graphics | null = null;
  private stressText: Phaser.GameObjects.Text | null = null;
  private dialogueText: Phaser.GameObjects.Text | null = null;

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
   * タップ処理
   */
  private handleTap(_x: number, _y: number): void {
    if (!this.reia) {
      return;
    }
    
    // れいあのタップアニメーション
    this.reia.playTapAnimation();
    
    // タスクを倒した想定（プロトタイプ）
    // TODO: 実際のタスクシステムと連携
    if (this.stressSystem && this.combo) {
      this.combo.addCombo(1);
      this.stressSystem.decreaseStress(this.combo.getComboCount());
      this.updateReiaState();
      this.updateUI();
    }
  }

  /**
   * 更新処理
   */
  update(_time: number, _delta: number): void {
    // ストレスが自然に増加する（プロトタイプ: テスト用）
    // TODO: 実際のタスクシステムと連携して、タスクが近づいた時にストレスを増加させる
    
    // UIを更新
    this.updateUI();
  }
}

