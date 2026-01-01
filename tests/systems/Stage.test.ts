/**
 * Stage テスト
 * 
 * ステージ進行システムの機能テスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Stage, StageConfig } from '../../src/systems/Stage';
import { Enemy } from '../../src/core/Enemy';

describe('Stage', () => {
  let stage: Stage;

  beforeEach(() => {
    const config: StageConfig = {
      baseHP: 100,
      startStage: 1,
    };
    
    stage = new Stage(config);
  });

  describe('コンストラクタ', () => {
    it('ステージを作成できる', () => {
      expect(stage.getCurrentStage()).toBe(1);
    });

    it('開始ステージを指定できる', () => {
      const config: StageConfig = {
        baseHP: 100,
        startStage: 5,
      };
      
      const newStage = new Stage(config);
      expect(newStage.getCurrentStage()).toBe(5);
    });
  });

  describe('ステージ進行', () => {
    it('次のステージに進める', () => {
      expect(stage.getCurrentStage()).toBe(1);
      
      const nextStage = stage.nextStage();
      
      expect(nextStage).toBe(2);
      expect(stage.getCurrentStage()).toBe(2);
    });

    it('ステージを設定できる', () => {
      stage.setStage(10);
      expect(stage.getCurrentStage()).toBe(10);
    });

    it('ステージ1未満には設定できない', () => {
      stage.setStage(0);
      expect(stage.getCurrentStage()).toBe(1);
      
      stage.setStage(-5);
      expect(stage.getCurrentStage()).toBe(1);
    });
  });

  describe('敵の生成', () => {
    it('敵を生成できる', () => {
      const enemy = stage.spawnEnemy();
      
      expect(enemy).toBeInstanceOf(Enemy);
      expect(enemy.getStage()).toBe(1);
    });

    it('生成された敵を取得できる', () => {
      const enemy = stage.spawnEnemy();
      const retrievedEnemy = stage.getEnemy();
      
      expect(retrievedEnemy).toBe(enemy);
    });

    it('敵が生成されていない場合はnullを返す', () => {
      const enemy = stage.getEnemy();
      expect(enemy).toBeNull();
    });

    it('次のステージに進むと敵がクリアされる', () => {
      stage.spawnEnemy();
      expect(stage.getEnemy()).not.toBeNull();
      
      stage.nextStage();
      expect(stage.getEnemy()).toBeNull();
    });
  });

  describe('敵の状態確認', () => {
    it('敵が倒されたかどうかを正しく判定する', () => {
      const enemy = stage.spawnEnemy();
      
      expect(stage.isEnemyDefeated()).toBe(false);
      
      enemy.takeDamage(enemy.getMaxHP());
      
      expect(stage.isEnemyDefeated()).toBe(true);
    });

    it('敵がいない場合はfalseを返す', () => {
      expect(stage.isEnemyDefeated()).toBe(false);
    });
  });

  describe('リセット', () => {
    it('ステージをリセットできる', () => {
      stage.setStage(10);
      stage.spawnEnemy();
      
      stage.reset();
      
      expect(stage.getCurrentStage()).toBe(1);
      expect(stage.getEnemy()).toBeNull();
    });
  });
});

