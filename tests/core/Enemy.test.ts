/**
 * Enemy テスト
 * 
 * 敵クラスの機能テスト
 */

import { describe, it, expect } from 'vitest';
import { Enemy, EnemyConfig } from '../../src/core/Enemy';
import { DecimalWrapper } from '../../src/utils/Decimal';

describe('Enemy', () => {
  describe('コンストラクタ', () => {
    it('敵を作成できる', () => {
      const config: EnemyConfig = {
        baseHP: 100,
        stage: 1,
      };
      
      const enemy = new Enemy(config);
      
      expect(enemy.getCurrentHP().toNumber()).toBeGreaterThan(0);
      expect(enemy.getMaxHP().toNumber()).toBeGreaterThan(0);
      expect(enemy.getStage()).toBe(1);
    });

    it('ステージ1のHPを正しく計算する', () => {
      const config: EnemyConfig = {
        baseHP: 100,
        stage: 1,
      };
      
      const enemy = new Enemy(config);
      // ステージ1の場合、HPは baseHP に近い値になる
      expect(enemy.getMaxHP().toNumber()).toBeCloseTo(100, 1);
    });

    it('ステージ2のHPを正しく計算する', () => {
      const config: EnemyConfig = {
        baseHP: 100,
        stage: 2,
      };
      
      const enemy = new Enemy(config);
      // 100 * (2 ^ 1.2) ≈ 229.7
      expect(enemy.getMaxHP().toNumber()).toBeCloseTo(229.7, 1);
    });
  });

  describe('ダメージ処理', () => {
    it('ダメージを受けることができる', () => {
      const config: EnemyConfig = {
        baseHP: 100,
        stage: 1,
      };
      
      const enemy = new Enemy(config);
      const initialHP = enemy.getCurrentHP().toNumber();
      
      const damage = enemy.takeDamage(50);
      
      expect(damage.toNumber()).toBe(50);
      expect(enemy.getCurrentHP().toNumber()).toBe(initialHP - 50);
    });

    it('HPが0未満にならない', () => {
      const config: EnemyConfig = {
        baseHP: 100,
        stage: 1,
      };
      
      const enemy = new Enemy(config);
      
      // 大量のダメージを与える
      enemy.takeDamage(10000);
      
      expect(enemy.getCurrentHP().toNumber()).toBe(0);
      expect(enemy.isDefeated()).toBe(true);
    });

    it('倒されたかどうかを正しく判定する', () => {
      const config: EnemyConfig = {
        baseHP: 100,
        stage: 1,
      };
      
      const enemy = new Enemy(config);
      
      expect(enemy.isDefeated()).toBe(false);
      
      enemy.takeDamage(enemy.getMaxHP());
      
      expect(enemy.isDefeated()).toBe(true);
    });
  });

  describe('HP割合', () => {
    it('HP割合を正しく計算する', () => {
      const config: EnemyConfig = {
        baseHP: 100,
        stage: 1,
      };
      
      const enemy = new Enemy(config);
      
      // 初期状態は100%
      expect(enemy.getHPRatio()).toBeCloseTo(1.0, 0.01);
      
      // 50%のダメージ
      enemy.takeDamage(enemy.getMaxHP().div(2));
      expect(enemy.getHPRatio()).toBeCloseTo(0.5, 0.01);
      
      // 0%までダメージ
      enemy.takeDamage(enemy.getMaxHP());
      expect(enemy.getHPRatio()).toBe(0);
    });
  });

  describe('回復', () => {
    it('完全回復ができる', () => {
      const config: EnemyConfig = {
        baseHP: 100,
        stage: 1,
      };
      
      const enemy = new Enemy(config);
      
      // ダメージを与える
      enemy.takeDamage(50);
      expect(enemy.getCurrentHP().toNumber()).toBeLessThan(enemy.getMaxHP().toNumber());
      
      // 完全回復
      enemy.healFull();
      expect(enemy.getCurrentHP().toNumber()).toBeCloseTo(enemy.getMaxHP().toNumber(), 0.01);
    });
  });
});

