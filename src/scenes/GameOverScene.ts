/**
 * GameOverScene - ゲームオーバーシーン
 * 
 * ゲームオーバー画面を管理
 */

import Phaser from 'phaser';
import { DecimalWrapper } from '../utils/Decimal';
import { formatNumber } from '../utils/Formatter';
import { Rebirth } from '../systems/Rebirth';

/**
 * ゲームオーバー情報
 */
export interface GameOverInfo {
  reachedStage: number;        // 到達ステージ
  rebirthStones: number;      // 獲得転生石
  totalDamage: DecimalWrapper; // 累計ダメージ
}

/**
 * ゲームオーバーシーン
 * 
 * 到達ステージ、獲得転生石を表示し、再開選択画面へ遷移
 */
export class GameOverScene extends Phaser.Scene {
  private gameOverInfo: GameOverInfo | null = null;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  /**
   * ゲームオーバー情報を設定
   * 
   * @param info - ゲームオーバー情報
   */
  setGameOverInfo(info: GameOverInfo): void {
    this.gameOverInfo = info;
  }

  create(): void {
    // 背景色
    this.cameras.main.setBackgroundColor('#1a1a1a');

    const centerX = this.cameras.main.width / 2;
    // タイトルとステータスを上部に固定配置
    const titleY = 80;
    const statsStartY = 160;
    const statsSpacing = 50;

    // タイトル
    this.add.text(centerX, titleY, 'Game Over', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (this.gameOverInfo) {
      // 到達ステージ表示
      this.add.text(centerX, statsStartY, `到達ステージ: ${this.gameOverInfo.reachedStage}`, {
        fontSize: '32px',
        color: '#ffffff',
      }).setOrigin(0.5);

      // 獲得転生石表示
      this.add.text(centerX, statsStartY + statsSpacing, `獲得転生石: ${this.gameOverInfo.rebirthStones}`, {
        fontSize: '32px',
        color: '#ffd700',
      }).setOrigin(0.5);

      // 累計ダメージ表示
      const damageText = formatNumber(this.gameOverInfo.totalDamage.getValue());
      this.add.text(centerX, statsStartY + statsSpacing * 2, `累計ダメージ: ${damageText}`, {
        fontSize: '24px',
        color: '#cccccc',
      }).setOrigin(0.5);
    }

    // 再開選択ボタン
    // ステータス表示の下から配置開始
    let buttonY = statsStartY + statsSpacing * 2 + 90;

    // 「最初から無双する（Full Run）」ボタン
    const fullRunButton = this.add.text(centerX, buttonY, '最初から無双する（Full Run）', {
      fontSize: '24px',
      color: '#4A90E2',
      fontStyle: 'bold',
      backgroundColor: '#2a2a2a',
      padding: { x: 30, y: 15 },
    }).setOrigin(0.5);

    fullRunButton.setInteractive({ useHandCursor: true });
    fullRunButton.on('pointerdown', () => {
      this.startFullRun();
    });

    buttonY += 100; // 間隔を広げる（70 → 100）

    // 「前線へ復帰（Quick Skip）」ボタン
    const maxStage = Rebirth.getMaxStage();
    const quickSkipStage = Math.max(1, maxStage - 5);

    const quickSkipButton = this.add.text(centerX, buttonY, `前線へ復帰（Quick Skip）\nステージ${quickSkipStage}から開始`, {
      fontSize: '20px',
      color: '#F5A623',
      fontStyle: 'bold',
      backgroundColor: '#2a2a2a',
      padding: { x: 30, y: 15 },
      align: 'center',
    }).setOrigin(0.5);

    quickSkipButton.setInteractive({ useHandCursor: true });
    quickSkipButton.on('pointerdown', () => {
      this.startQuickSkip(quickSkipStage);
    });

    // 強化メニューボタン（画面下部のセーフエリア内に配置）
    // 画面の高さに応じて位置を調整（最低でもボタン間隔を保つ）
    const screenHeight = this.cameras.main.height;
    const safeAreaBottom = 100; // 下部のセーフエリア（Safariのツールバー分）
    const availableHeight = screenHeight - safeAreaBottom;
    
    // 前のボタンから十分な間隔を空ける
    const minButtonY = buttonY + 100;
    
    // 画面下部に配置するが、最低ラインを下回らないようにする
    // availableHeight - 50 (ボタン半分の高さ) と minButtonY の大きい方を使用する
    // ただし、画面外に出ないように上限も設ける必要があるが、
    // ここでは「重ならないこと」を優先し、下に伸びることを許容する（スクロールできないが重なりよりはマシ）
    // 今回は画面内に収めるために、要素を上に詰めたので、minButtonYで配置しても収まるはず
    
    // 最後のボタン位置決定
    let finalButtonY = minButtonY;
    
    // もし画面下部に余裕があれば、少し下に寄せる（見た目のバランス）
    if (finalButtonY < availableHeight - 50) {
        // 下詰めにする場合：finalButtonY = availableHeight - 50;
        // 今回は均等配置気味にしたいので、minButtonYを採用
    }

    const upgradeButton = this.add.text(centerX, finalButtonY, '強化メニュー', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#444444',
      padding: { x: 30, y: 15 },
    }).setOrigin(0.5);

    upgradeButton.setInteractive({ useHandCursor: true });
    upgradeButton.on('pointerdown', () => {
      this.scene.start('UpgradeScene');
    });
  }

  /**
   * 「最初から無双する（Full Run）」で開始
   */
  private startFullRun(): void {
    // ステージ1から開始
    this.scene.start('BattleScene', { startStage: 1, isFullRun: true });
  }

  /**
   * 「前線へ復帰（Quick Skip）」で開始
   * 
   * @param startStage - 開始ステージ
   */
  private startQuickSkip(startStage: number): void {
    // 指定ステージから開始
    this.scene.start('BattleScene', { startStage: startStage, isFullRun: false });
  }
}

