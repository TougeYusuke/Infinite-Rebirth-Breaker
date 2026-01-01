/**
 * Battle テスト
 * 
 * バトルシステムの機能テスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Battle, BattleConfig } from '../../src/core/Battle';
import { Enemy, EnemyConfig } from '../../src/core/Enemy';
import { DecimalWrapper } from '../../src/utils/Decimal';

describe('Battle', () => {
  let battle: Battle;
  let enemy: Enemy;

  beforeEach(() => {
    const battleConfig: BattleConfig = {
      baseDamage: 10,
      attackLevel: 1,
      comboMultiplier: 1.0,
    };
    
    battle = new Battle(battleConfig);
    
    const enemyConfig: EnemyConfig = {
      baseHP: 100,
      stage: 1,
    };
    
    enemy = new Enemy(enemyConfig);
    battle.setEnemy(enemy);
  });

  describe('ダメージ計算', () => {
    it('基本ダメージを正しく計算する', () => {
      const damage = battle.calculateDamage(false);
      // baseDamage * attackLevel * comboMultiplier = 10 * 1 * 1 = 10
      expect(damage.toNumber()).toBe(10);
    });

    it('Tap Attackは2倍のダメージ', () => {
      const normalDamage = battle.calculateDamage(false);
      const tapDamage = battle.calculateDamage(true);
      
      expect(tapDamage.toNumber()).toBe(normalDamage.toNumber() * 2);
    });

    it('攻撃レベルを考慮して計算する', () => {
      battle.setAttackLevel(5);
      const damage = battle.calculateDamage(false);
      // baseDamage * attackLevel * comboMultiplier = 10 * 5 * 1 = 50
      expect(damage.toNumber()).toBe(50);
    });

    it('コンボ倍率を考慮して計算する', () => {
      battle.setComboMultiplier(2.0);
      const damage = battle.calculateDamage(false);
      // baseDamage * attackLevel * comboMultiplier = 10 * 1 * 2 = 20
      expect(damage.toNumber()).toBe(20);
    });
  });

  describe('Tap Attack', () => {
    it('Tap Attackでダメージを与えられる', () => {
      const initialHP = enemy.getCurrentHP().toNumber();
      const damage = battle.tapAttack();
      
      expect(damage).not.toBeNull();
      expect(damage!.toNumber()).toBeGreaterThan(0);
      expect(enemy.getCurrentHP().toNumber()).toBeLessThan(initialHP);
    });

    it('敵がいない場合はnullを返す', () => {
      battle.reset();
      const damage = battle.tapAttack();
      
      expect(damage).toBeNull();
    });

    it('倒された敵には攻撃できない', () => {
      // 敵を倒す
      enemy.takeDamage(enemy.getMaxHP());
      
      const damage = battle.tapAttack();
      expect(damage).toBeNull();
    });
  });

  describe('Auto Attack', () => {
    it('1秒経過で自動攻撃する', () => {
      const initialHP = enemy.getCurrentHP().toNumber();
      
      // 1秒未満では攻撃しない
      const damage1 = battle.autoAttack(500);
      expect(damage1).toBeNull();
      
      // 1秒経過で攻撃
      const damage2 = battle.autoAttack(500);
      expect(damage2).not.toBeNull();
      expect(enemy.getCurrentHP().toNumber()).toBeLessThan(initialHP);
    });

    it('タイマーがリセットされる', () => {
      // 1秒経過で攻撃
      battle.autoAttack(1000);
      
      // タイマーがリセットされているので、すぐには攻撃しない
      const damage = battle.autoAttack(500);
      expect(damage).toBeNull();
      
      // さらに500ms経過で攻撃
      const damage2 = battle.autoAttack(500);
      expect(damage2).not.toBeNull();
    });

    it('敵がいない場合はnullを返す', () => {
      battle.reset();
      const damage = battle.autoAttack(1000);
      
      expect(damage).toBeNull();
    });
  });

  describe('敵の状態確認', () => {
    it('敵が倒されたかどうかを正しく判定する', () => {
      expect(battle.isEnemyDefeated()).toBe(false);
      
      enemy.takeDamage(enemy.getMaxHP());
      
      expect(battle.isEnemyDefeated()).toBe(true);
    });
  });

  describe('設定の更新', () => {
    it('基本ダメージを更新できる', () => {
      battle.setBaseDamage(20);
      const damage = battle.calculateDamage(false);
      expect(damage.toNumber()).toBe(20);
    });

    it('攻撃レベルを更新できる', () => {
      battle.setAttackLevel(3);
      const damage = battle.calculateDamage(false);
      expect(damage.toNumber()).toBe(30);
    });

    it('コンボ倍率を更新できる', () => {
      battle.setComboMultiplier(1.5);
      const damage = battle.calculateDamage(false);
      expect(damage.toNumber()).toBe(15);
    });
  });
});

