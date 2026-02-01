/**
 * Pattern Detection Utilities
 * Harmonic patterns and chart patterns detection
 */

import { OHLCData } from './indicators';

export interface DetectedPattern {
    type: string;
    name: string;
    direction: 'bullish' | 'bearish';
    confidence: number; // 0-100
    points: PatternPoint[];
    targetPrice?: number;
    stopLoss?: number;
}

export interface PatternPoint {
    index: number;
    time: string | number;
    price: number;
    label: string; // X, A, B, C, D for harmonic patterns
}

// Fibonacci ratios used in harmonic patterns
const FIB_RATIOS = {
    0.382: 0.382,
    0.5: 0.5,
    0.618: 0.618,
    0.786: 0.786,
    0.886: 0.886,
    1.0: 1.0,
    1.272: 1.272,
    1.414: 1.414,
    1.618: 1.618,
    2.0: 2.0,
    2.24: 2.24,
    2.618: 2.618,
    3.618: 3.618
};

// Tolerance for Fibonacci ratio matching (e.g., 0.382 ± 0.05)
const FIB_TOLERANCE = 0.05;

/**
 * Check if a ratio matches a target Fibonacci ratio within tolerance
 */
function matchesFibRatio(ratio: number, targetRatio: number, tolerance = FIB_TOLERANCE): boolean {
    return Math.abs(ratio - targetRatio) <= tolerance;
}

/**
 * Calculate retracement ratio between three points
 * Returns ratio of (C - B) / (A - B)
 */
function calculateRetracement(pointA: number, pointB: number, pointC: number): number {
    const move = pointA - pointB;
    if (move === 0) return 0;
    return (pointC - pointB) / move;
}

/**
 * Find swing highs and lows in the data
 */
function findSwingPoints(data: OHLCData[], lookback: number = 5): { highs: number[]; lows: number[] } {
    const highs: number[] = [];
    const lows: number[] = [];

    for (let i = lookback; i < data.length - lookback; i++) {
        let isHigh = true;
        let isLow = true;

        for (let j = 1; j <= lookback; j++) {
            if (data[i].high <= data[i - j].high || data[i].high <= data[i + j].high) {
                isHigh = false;
            }
            if (data[i].low >= data[i - j].low || data[i].low >= data[i + j].low) {
                isLow = false;
            }
        }

        if (isHigh) highs.push(i);
        if (isLow) lows.push(i);
    }

    return { highs, lows };
}

/**
 * Detect Gartley Pattern (XABCD)
 * - AB retraces 61.8% of XA
 * - BC retraces 38.2% - 88.6% of AB
 * - CD extends to 78.6% of XA
 */
export function detectGartley(data: OHLCData[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const { highs, lows } = findSwingPoints(data, 3);
    const allSwings = [...highs.map(i => ({ i, type: 'high' as const })), ...lows.map(i => ({ i, type: 'low' as const }))]
        .sort((a, b) => a.i - b.i);

    // Need at least 5 swing points for XABCD
    if (allSwings.length < 5) return patterns;

    // Look for potential patterns in recent swings
    for (let xi = 0; xi < allSwings.length - 4; xi++) {
        const X = allSwings[xi];
        const A = allSwings[xi + 1];
        const B = allSwings[xi + 2];
        const C = allSwings[xi + 3];
        const D = allSwings[xi + 4];

        // Bullish Gartley: X low, A high, B low, C high, D low
        // Bearish Gartley: X high, A low, B high, C low, D high

        const isBullish = X.type === 'low' && A.type === 'high' && B.type === 'low' && C.type === 'high' && D.type === 'low';
        const isBearish = X.type === 'high' && A.type === 'low' && B.type === 'high' && C.type === 'low' && D.type === 'high';

        if (!isBullish && !isBearish) continue;

        const xPrice = isBullish ? data[X.i].low : data[X.i].high;
        const aPrice = isBullish ? data[A.i].high : data[A.i].low;
        const bPrice = isBullish ? data[B.i].low : data[B.i].high;
        const cPrice = isBullish ? data[C.i].high : data[C.i].low;
        const dPrice = isBullish ? data[D.i].low : data[D.i].high;

        // Check Fibonacci ratios
        const abRet = calculateRetracement(xPrice, aPrice, bPrice);
        const bcRet = calculateRetracement(aPrice, bPrice, cPrice);
        const xdRet = calculateRetracement(xPrice, aPrice, dPrice);

        // Gartley: AB = 61.8% of XA, BC = 38.2-88.6% of AB, D = 78.6% of XA
        const isValidGartley =
            matchesFibRatio(Math.abs(abRet), 0.618, 0.1) &&
            (Math.abs(bcRet) >= 0.382 && Math.abs(bcRet) <= 0.886) &&
            matchesFibRatio(Math.abs(xdRet), 0.786, 0.1);

        if (isValidGartley) {
            const confidence = calculatePatternConfidence(abRet, bcRet, xdRet, 'gartley');

            patterns.push({
                type: 'gartley',
                name: isBullish ? 'Bullish Gartley' : 'Bearish Gartley',
                direction: isBullish ? 'bullish' : 'bearish',
                confidence,
                points: [
                    { index: X.i, time: data[X.i].time, price: xPrice, label: 'X' },
                    { index: A.i, time: data[A.i].time, price: aPrice, label: 'A' },
                    { index: B.i, time: data[B.i].time, price: bPrice, label: 'B' },
                    { index: C.i, time: data[C.i].time, price: cPrice, label: 'C' },
                    { index: D.i, time: data[D.i].time, price: dPrice, label: 'D' }
                ],
                targetPrice: isBullish ? cPrice : cPrice, // Target at C level
                stopLoss: isBullish ? xPrice * 0.99 : xPrice * 1.01 // Stop below/above X
            });
        }
    }

    return patterns;
}

/**
 * Calculate pattern confidence based on Fibonacci ratio accuracy
 */
function calculatePatternConfidence(abRet: number, bcRet: number, xdRet: number, patternType: string): number {
    let confidence = 50; // Base confidence

    // Add points for accurate Fibonacci ratios
    if (patternType === 'gartley') {
        confidence += (1 - Math.abs(Math.abs(abRet) - 0.618) / 0.618) * 20;
        confidence += (1 - Math.abs(Math.abs(xdRet) - 0.786) / 0.786) * 20;
    }

    return Math.min(100, Math.max(0, Math.round(confidence)));
}

/**
 * Detect Head and Shoulders pattern
 */
export function detectHeadAndShoulders(data: OHLCData[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const { highs, lows } = findSwingPoints(data, 5);

    // Need at least 5 significant highs for H&S
    if (highs.length < 5) return patterns;

    // Look for potential H&S: left shoulder, head, right shoulder
    for (let i = 0; i < highs.length - 4; i++) {
        const ls = highs[i];      // Left shoulder
        const h = highs[i + 2];   // Head (skip one)
        const rs = highs[i + 4];  // Right shoulder

        const lsPrice = data[ls].high;
        const hPrice = data[h].high;
        const rsPrice = data[rs].high;

        // Head should be higher than shoulders
        if (hPrice <= lsPrice || hPrice <= rsPrice) continue;

        // Shoulders should be roughly equal (within 10%)
        const shoulderDiff = Math.abs(lsPrice - rsPrice) / Math.max(lsPrice, rsPrice);
        if (shoulderDiff > 0.1) continue;

        // Find neckline (lows between peaks)
        const nl1Idx = lows.find(l => l > ls && l < h);
        const nl2Idx = lows.find(l => l > h && l < rs);

        if (!nl1Idx || !nl2Idx) continue;

        const neckline = (data[nl1Idx].low + data[nl2Idx].low) / 2;
        const patternHeight = hPrice - neckline;

        patterns.push({
            type: 'head_and_shoulders',
            name: 'Head and Shoulders (Bearish)',
            direction: 'bearish',
            confidence: 70 + (1 - shoulderDiff) * 20,
            points: [
                { index: ls, time: data[ls].time, price: lsPrice, label: 'LS' },
                { index: h, time: data[h].time, price: hPrice, label: 'H' },
                { index: rs, time: data[rs].time, price: rsPrice, label: 'RS' }
            ],
            targetPrice: neckline - patternHeight, // Target = neckline - pattern height
            stopLoss: hPrice * 1.02
        });
    }

    return patterns;
}

/**
 * Detect Double Top/Bottom patterns
 */
export function detectDoubleTopBottom(data: OHLCData[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const { highs, lows } = findSwingPoints(data, 5);

    // Double Tops
    for (let i = 0; i < highs.length - 1; i++) {
        const first = highs[i];
        const second = highs[i + 1];

        // Tops should be within 3% of each other
        const priceDiff = Math.abs(data[first].high - data[second].high) / data[first].high;
        if (priceDiff > 0.03) continue;

        // Need some time between tops (at least 10 bars)
        if (second - first < 10) continue;

        // Find the valley between tops
        const valleyIdx = lows.find(l => l > first && l < second);
        if (!valleyIdx) continue;

        const avgTop = (data[first].high + data[second].high) / 2;
        const valley = data[valleyIdx].low;
        const patternHeight = avgTop - valley;

        patterns.push({
            type: 'double_top',
            name: 'Double Top (Bearish)',
            direction: 'bearish',
            confidence: 75,
            points: [
                { index: first, time: data[first].time, price: data[first].high, label: 'T1' },
                { index: valleyIdx, time: data[valleyIdx].time, price: valley, label: 'V' },
                { index: second, time: data[second].time, price: data[second].high, label: 'T2' }
            ],
            targetPrice: valley - patternHeight,
            stopLoss: avgTop * 1.02
        });
    }

    // Double Bottoms
    for (let i = 0; i < lows.length - 1; i++) {
        const first = lows[i];
        const second = lows[i + 1];

        const priceDiff = Math.abs(data[first].low - data[second].low) / data[first].low;
        if (priceDiff > 0.03) continue;
        if (second - first < 10) continue;

        const peakIdx = highs.find(h => h > first && h < second);
        if (!peakIdx) continue;

        const avgBottom = (data[first].low + data[second].low) / 2;
        const peak = data[peakIdx].high;
        const patternHeight = peak - avgBottom;

        patterns.push({
            type: 'double_bottom',
            name: 'Double Bottom (Bullish)',
            direction: 'bullish',
            confidence: 75,
            points: [
                { index: first, time: data[first].time, price: data[first].low, label: 'B1' },
                { index: peakIdx, time: data[peakIdx].time, price: peak, label: 'P' },
                { index: second, time: data[second].time, price: data[second].low, label: 'B2' }
            ],
            targetPrice: peak + patternHeight,
            stopLoss: avgBottom * 0.98
        });
    }

    return patterns;
}

/**
 * Detect all patterns in the data
 */
export function detectAllPatterns(data: OHLCData[]): DetectedPattern[] {
    if (data.length < 20) return [];

    const patterns: DetectedPattern[] = [];

    try {
        patterns.push(...detectGartley(data));
        patterns.push(...detectHeadAndShoulders(data));
        patterns.push(...detectDoubleTopBottom(data));
    } catch (e) {
        console.error('Error detecting patterns:', e);
    }

    // Sort by confidence
    return patterns.sort((a, b) => b.confidence - a.confidence);
}

export default {
    detectGartley,
    detectHeadAndShoulders,
    detectDoubleTopBottom,
    detectAllPatterns
};
