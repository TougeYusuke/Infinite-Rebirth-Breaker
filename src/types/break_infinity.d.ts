/**
 * break_infinity.js の型定義
 * 
 * break_infinity.js パッケージに型定義が含まれていない場合の補完
 */

declare module 'break_infinity.js' {
  export default class Decimal {
    constructor(value: number | string | Decimal);
    
    static fromNumber(value: number): Decimal;
    static fromString(value: string): Decimal;
    static fromDecimal(value: Decimal): Decimal;
    static fromMantissaExponent(mantissa: number, exponent: number): Decimal;
    
    static pow(base: number | Decimal, exponent: number | Decimal): Decimal;
    static log10(value: number | Decimal): Decimal;
    
    toNumber(): number;
    toString(): string;
    toFixed(decimalPlaces: number): string;
    
    add(value: number | Decimal): Decimal;
    sub(value: number | Decimal): Decimal;
    mul(value: number | Decimal): Decimal;
    div(value: number | Decimal): Decimal;
    
    lessThan(value: number | Decimal): boolean;
    lessThanOrEqualTo(value: number | Decimal): boolean;
    greaterThan(value: number | Decimal): boolean;
    greaterThanOrEqualTo(value: number | Decimal): boolean;
    equals(value: number | Decimal): boolean;
    
    log10(): Decimal;
    floor(): Decimal;
    ceil(): Decimal;
    round(): Decimal;
    abs(): Decimal;
    
    pow(value: number | Decimal): Decimal;
    exp(): Decimal;
    log(): Decimal;
  }
}

