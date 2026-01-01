/**
 * Formatter テスト
 * 
 * 数値フォーマット機能のテスト
 */

import { describe, it, expect } from 'vitest';
import Decimal from 'break_infinity.js';
import { formatNumber } from '../../src/utils/Formatter';

describe('Formatter', () => {
  describe('formatNumber', () => {
    it('0を正しくフォーマットする', () => {
      expect(formatNumber(new Decimal(0))).toBe('0');
    });

    it('1000未満の数値を正しくフォーマットする', () => {
      expect(formatNumber(new Decimal(999))).toBe('999');
    });

    it('k表記を正しくフォーマットする', () => {
      const result = formatNumber(new Decimal(10000));
      expect(result).toContain('k');
    });

    it('M表記を正しくフォーマットする', () => {
      const result = formatNumber(new Decimal(1000000));
      expect(result).toContain('M');
    });

    it('B表記を正しくフォーマットする', () => {
      const result = formatNumber(new Decimal(1000000000));
      expect(result).toContain('B');
    });
  });
});

