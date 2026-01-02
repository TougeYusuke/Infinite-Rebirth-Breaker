/**
 * DebugPanel - デバッグパネル
 * 
 * デバッグ設定を変更するUIパネル
 */

import Phaser from 'phaser';
import { DebugSystem } from '../systems/DebugSystem';

/**
 * デバッグパネル
 */
export class DebugPanel {
  private scene: Phaser.Scene;
  private debugSystem: DebugSystem;
  private panel: Phaser.GameObjects.Container | null = null;
  private isVisible: boolean = false;
  
  // UI要素
  private background: Phaser.GameObjects.Graphics | null = null;
  private titleText: Phaser.GameObjects.Text | null = null;
  private attackPowerText: Phaser.GameObjects.Text | null = null;
  private taskSpawnText: Phaser.GameObjects.Text | null = null;
  private autoAttackText: Phaser.GameObjects.Text | null = null;
  private waveInfoText: Phaser.GameObjects.Text | null = null;
  private closeButton: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, debugSystem: DebugSystem) {
    this.scene = scene;
    this.debugSystem = debugSystem;
  }

  /**
   * パネルを作成
   */
  create(): void {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    
    this.panel = this.scene.add.container(centerX, centerY);
    this.panel.setDepth(100); // 最前面に表示
    this.panel.setAlpha(0); // 初期状態は非表示
    
    // 背景
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x000000, 0.8);
    this.background.fillRect(-200, -200, 400, 400);
    this.panel.add(this.background);
    
    // タイトル
    this.titleText = this.scene.add.text(0, -180, 'デバッグモード', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.panel.add(this.titleText);
    
    // 攻撃力倍率
    this.attackPowerText = this.scene.add.text(0, -120, '', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.panel.add(this.attackPowerText);
    
    // タスク生成間隔
    this.taskSpawnText = this.scene.add.text(0, -60, '', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.panel.add(this.taskSpawnText);
    
    // オート攻撃間隔
    this.autoAttackText = this.scene.add.text(0, 0, '', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.panel.add(this.autoAttackText);
    
    // Wave情報表示
    this.waveInfoText = this.scene.add.text(0, 60, '', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.panel.add(this.waveInfoText);
    
    // 閉じるボタン
    this.closeButton = this.scene.add.text(0, 150, '閉じる (Dキー)', {
      fontSize: '20px',
      color: '#4ecdc4',
      backgroundColor: '#2a2a2a',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);
    this.closeButton.setInteractive({ useHandCursor: true });
    this.closeButton.on('pointerdown', () => {
      this.hide();
    });
    this.panel.add(this.closeButton);
    
    // キーボードショートカット（Dキーで表示/非表示）
    this.scene.input.keyboard?.on('keydown-D', () => {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    });
    
    // 初期表示を更新
    this.updateDisplay();
  }

  /**
   * パネルを表示
   */
  show(): void {
    if (!this.panel) {
      return;
    }
    
    this.isVisible = true;
    this.panel.setAlpha(1.0);
    this.updateDisplay();
  }

  /**
   * パネルを非表示
   */
  hide(): void {
    if (!this.panel) {
      return;
    }
    
    this.isVisible = false;
    this.panel.setAlpha(0);
  }

  /**
   * 表示を更新
   */
  updateDisplay(): void {
    if (!this.attackPowerText || !this.taskSpawnText || !this.autoAttackText || !this.waveInfoText) {
      return;
    }
    
    const config = this.debugSystem.getConfig();
    
    // 攻撃力倍率
    this.attackPowerText.setText(
      `攻撃力倍率: ${config.attackPowerMultiplier.toFixed(1)}x\n` +
      `[Q/E] 減少/増加`
    );
    
    // タスク生成間隔
    this.taskSpawnText.setText(
      `タスク生成間隔: ${config.taskSpawnInterval}ms\n` +
      `[A/S] 減少/増加 (100ms単位)`
    );
    
    // オート攻撃間隔
    this.autoAttackText.setText(
      `オート攻撃間隔: ${config.autoAttackInterval}ms\n` +
      `[Z/X] 減少/増加 (100ms単位)`
    );
    
    // Wave情報表示
    this.waveInfoText.setText(
      `Wave情報: ${config.showWaveInfo ? '表示' : '非表示'}\n` +
      `[W] 切り替え`
    );
  }

  /**
   * 更新処理（キー入力の処理）
   * 
   * @param onConfigChanged - 設定変更時のコールバック（オプション）
   */
  update(onConfigChanged?: () => void): void {
    if (!this.isVisible || !this.debugSystem.isEnabled()) {
      return;
    }
    
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) {
      return;
    }
    
    let configChanged = false;
    
    // 攻撃力倍率の調整（Q/Eキー）
    if (Phaser.Input.Keyboard.JustDown(keyboard.addKey('Q'))) {
      const current = this.debugSystem.getAttackPowerMultiplier();
      this.debugSystem.setAttackPowerMultiplier(current - 0.1);
      this.updateDisplay();
      configChanged = true;
    }
    if (Phaser.Input.Keyboard.JustDown(keyboard.addKey('E'))) {
      const current = this.debugSystem.getAttackPowerMultiplier();
      this.debugSystem.setAttackPowerMultiplier(current + 0.1);
      this.updateDisplay();
      configChanged = true;
    }
    
    // タスク生成間隔の調整（A/Sキー）
    if (Phaser.Input.Keyboard.JustDown(keyboard.addKey('A'))) {
      const current = this.debugSystem.getTaskSpawnInterval();
      this.debugSystem.setTaskSpawnInterval(current - 100);
      this.updateDisplay();
      configChanged = true;
    }
    if (Phaser.Input.Keyboard.JustDown(keyboard.addKey('S'))) {
      const current = this.debugSystem.getTaskSpawnInterval();
      this.debugSystem.setTaskSpawnInterval(current + 100);
      this.updateDisplay();
      configChanged = true;
    }
    
    // オート攻撃間隔の調整（Z/Xキー）
    if (Phaser.Input.Keyboard.JustDown(keyboard.addKey('Z'))) {
      const current = this.debugSystem.getAutoAttackInterval();
      this.debugSystem.setAutoAttackInterval(current - 100);
      this.updateDisplay();
      configChanged = true;
    }
    if (Phaser.Input.Keyboard.JustDown(keyboard.addKey('X'))) {
      const current = this.debugSystem.getAutoAttackInterval();
      this.debugSystem.setAutoAttackInterval(current + 100);
      this.updateDisplay();
      configChanged = true;
    }
    
    // Wave情報の表示切替（Wキー）
    if (Phaser.Input.Keyboard.JustDown(keyboard.addKey('W'))) {
      const current = this.debugSystem.isShowWaveInfo();
      this.debugSystem.setShowWaveInfo(!current);
      this.updateDisplay();
      configChanged = true;
    }
    
    // 設定が変更された場合はコールバックを呼び出す
    if (configChanged && onConfigChanged) {
      onConfigChanged();
    }
  }

  /**
   * 破棄
   */
  destroy(): void {
    if (this.panel) {
      this.panel.destroy();
      this.panel = null;
    }
  }
}

