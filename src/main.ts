/**
 * Infinite Rebirth Breaker - エントリーポイント
 * 
 * Phaser 3ゲームの初期化とメインループを管理
 */

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { BattleScene } from './scenes/BattleScene';
import { GameOverScene } from './scenes/GameOverScene';
import { UpgradeScene } from './scenes/UpgradeScene';

// ゲーム設定
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 375,
  height: 667,
  parent: 'game-container',
  backgroundColor: '#1a1a1a',
  scene: [BootScene, BattleScene, GameOverScene, UpgradeScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// ゲームインスタンスの作成
const game = new Phaser.Game(config);

export default game;

