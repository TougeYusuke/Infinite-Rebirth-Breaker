/**
 * Timer テスト
 * 
 * タイマーシステムの機能テスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Timer, TimerConfig } from '../../src/systems/Timer';

describe('Timer', () => {
  let timer: Timer;

  beforeEach(() => {
    const config: TimerConfig = {
      timeLimit: 30, // 30秒
    };
    
    timer = new Timer(config);
  });

  describe('コンストラクタ', () => {
    it('タイマーを作成できる', () => {
      expect(timer.getTimeLimit()).toBe(30);
      expect(timer.getTimeRemaining()).toBe(30);
      expect(timer.isActive()).toBe(false);
    });
  });

  describe('タイマーの開始・停止', () => {
    it('タイマーを開始できる', () => {
      timer.start();
      
      expect(timer.isActive()).toBe(true);
      expect(timer.isTimeExpired()).toBe(false);
    });

    it('タイマーを停止できる', () => {
      timer.start();
      timer.stop();
      
      expect(timer.isActive()).toBe(false);
    });

    it('タイマーをリセットできる', () => {
      timer.start();
      timer.update(5000); // 5秒経過
      
      timer.reset();
      
      expect(timer.getTimeRemaining()).toBe(30);
      expect(timer.isActive()).toBe(false);
      expect(timer.isTimeExpired()).toBe(false);
    });
  });

  describe('タイマーの更新', () => {
    it('タイマーが更新される', () => {
      timer.start();
      const initialTime = timer.getTimeRemaining();
      
      timer.update(1000); // 1秒経過
      
      expect(timer.getTimeRemaining()).toBeLessThan(initialTime);
    });

    it('実行中でない場合は更新されない', () => {
      const initialTime = timer.getTimeRemaining();
      
      timer.update(1000);
      
      expect(timer.getTimeRemaining()).toBe(initialTime);
    });

    it('時間切れになると停止する', () => {
      timer.start();
      
      // 30秒以上経過させる
      timer.update(31000);
      
      expect(timer.isTimeExpired()).toBe(true);
      expect(timer.isActive()).toBe(false);
      expect(timer.getTimeRemaining()).toBe(0);
    });

    it('時間切れ後は更新されない', () => {
      timer.start();
      timer.update(31000); // 時間切れ
      
      const timeBefore = timer.getTimeRemaining();
      timer.update(1000);
      
      expect(timer.getTimeRemaining()).toBe(timeBefore);
    });
  });

  describe('残り時間の取得', () => {
    it('残り時間を取得できる', () => {
      timer.start();
      timer.update(5000); // 5秒経過
      
      const remaining = timer.getTimeRemaining();
      expect(remaining).toBeCloseTo(25, 1);
    });

    it('残り時間の割合を取得できる', () => {
      timer.start();
      
      // 初期状態は100%
      expect(timer.getTimeRatio()).toBeCloseTo(1.0, 0.01);
      
      // 15秒経過（50%）
      timer.update(15000);
      expect(timer.getTimeRatio()).toBeCloseTo(0.5, 0.1);
      
      // 30秒経過（0%）
      timer.update(15000);
      expect(timer.getTimeRatio()).toBe(0);
    });
  });

  describe('制限時間の設定', () => {
    it('制限時間を設定できる', () => {
      timer.setTimeLimit(60);
      
      expect(timer.getTimeLimit()).toBe(60);
    });

    it('実行中でない場合、残り時間も更新される', () => {
      timer.setTimeLimit(60);
      
      expect(timer.getTimeRemaining()).toBe(60);
    });
  });
});

