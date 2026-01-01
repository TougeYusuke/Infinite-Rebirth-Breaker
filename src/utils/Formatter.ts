/**
 * Formatter - 数値フォーマットユーティリティ
 * 
 * 大きな数値を短縮表記（10k, 10M, 10B, 10aa等）に変換
 */

import Decimal from 'break_infinity.js';

/**
 * 数値を短縮表記に変換
 * 
 * @param value - フォーマットする数値（Decimal型）
 * @returns フォーマットされた文字列（例: "10k", "10M", "10aa"）
 */
export function formatNumber(value: Decimal): string {
  if (value.lessThanOrEqualTo(0)) {
    return '0';
  }

  // 1兆未満は通常表記
  if (value.lessThan(1e12)) {
    if (value.lessThan(1e3)) {
      return value.toFixed(0);
    } else if (value.lessThan(1e6)) {
      return (value.toNumber() / 1e3).toFixed(2) + 'k';
    } else if (value.lessThan(1e9)) {
      return (value.toNumber() / 1e6).toFixed(2) + 'M';
    } else {
      return (value.toNumber() / 1e9).toFixed(2) + 'B';
    }
  }

  // 1兆以上は指数表記またはbreak_infinity.jsの表記を使用
  const magnitude = value.log10();
  const magnitudeFloor = magnitude.floor();
  const mantissa = value.div(Decimal.pow(10, magnitudeFloor));
  
  if (magnitudeFloor.lessThan(27)) {
    // aa, ab, ac... の表記（26文字で1周）
    const suffixIndex = magnitudeFloor.toNumber() - 12;
    if (suffixIndex >= 0) {
      const firstChar = String.fromCharCode(97 + (suffixIndex % 26)); // a-z
      const secondChar = String.fromCharCode(97 + Math.floor(suffixIndex / 26)); // a-z
      
      return mantissa.toFixed(2) + firstChar + secondChar;
    }
  }
  
  // それ以上は指数表記
  return mantissa.toFixed(2) + 'e' + magnitudeFloor.toFixed(0);
}

