/**
 * Technical Indicators Library
 * Pure TypeScript calculations for chart indicators
 */

export interface OHLCData {
    time: number | string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface IndicatorValue {
    time: number | string;
    value: number;
}

export interface MACDValue {
    time: number | string;
    macd: number;
    signal: number;
    histogram: number;
}

export interface BollingerValue {
    time: number | string;
    upper: number;
    middle: number;
    lower: number;
}

export interface StochasticValue {
    time: number | string;
    k: number;
    d: number;
}

// ============== MOVING AVERAGES ==============

/**
 * Simple Moving Average (SMA)
 * @param data - Array of OHLC data
 * @param period - Number of periods
 * @returns Array of SMA values
 */
export function calculateSMA(data: OHLCData[], period: number): IndicatorValue[] {
    const result: IndicatorValue[] = [];

    if (data.length < period) return result;

    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        result.push({
            time: data[i].time,
            value: sum / period
        });
    }

    return result;
}

/**
 * Exponential Moving Average (EMA)
 * @param data - Array of OHLC data
 * @param period - Number of periods
 * @returns Array of EMA values
 */
export function calculateEMA(data: OHLCData[], period: number): IndicatorValue[] {
    const result: IndicatorValue[] = [];

    if (data.length < period) return result;

    const multiplier = 2 / (period + 1);

    // First EMA is SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i].close;
    }
    let ema = sum / period;
    result.push({ time: data[period - 1].time, value: ema });

    // Calculate remaining EMAs
    for (let i = period; i < data.length; i++) {
        ema = (data[i].close - ema) * multiplier + ema;
        result.push({ time: data[i].time, value: ema });
    }

    return result;
}

// ============== MOMENTUM INDICATORS ==============

/**
 * Relative Strength Index (RSI)
 * @param data - Array of OHLC data
 * @param period - Number of periods (default: 14)
 * @returns Array of RSI values (0-100)
 */
export function calculateRSI(data: OHLCData[], period: number = 14): IndicatorValue[] {
    const result: IndicatorValue[] = [];

    if (data.length < period + 1) return result;

    // Calculate price changes
    const changes: number[] = [];
    for (let i = 1; i < data.length; i++) {
        changes.push(data[i].close - data[i - 1].close);
    }

    // Initial average gain/loss
    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 0; i < period; i++) {
        if (changes[i] > 0) {
            avgGain += changes[i];
        } else {
            avgLoss += Math.abs(changes[i]);
        }
    }

    avgGain /= period;
    avgLoss /= period;

    // First RSI
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    let rsi = 100 - (100 / (1 + rs));
    result.push({ time: data[period].time, value: rsi });

    // Subsequent RSIs using Wilder's smoothing
    for (let i = period; i < changes.length; i++) {
        const gain = changes[i] > 0 ? changes[i] : 0;
        const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi = 100 - (100 / (1 + rs));

        result.push({ time: data[i + 1].time, value: rsi });
    }

    return result;
}

/**
 * Moving Average Convergence Divergence (MACD)
 * @param data - Array of OHLC data
 * @param fastPeriod - Fast EMA period (default: 12)
 * @param slowPeriod - Slow EMA period (default: 26)
 * @param signalPeriod - Signal line period (default: 9)
 * @returns Array of MACD values
 */
export function calculateMACD(
    data: OHLCData[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
): MACDValue[] {
    const result: MACDValue[] = [];

    if (data.length < slowPeriod + signalPeriod) return result;

    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);

    // Align EMAs
    const offset = slowPeriod - fastPeriod;
    const macdLine: IndicatorValue[] = [];

    for (let i = 0; i < slowEMA.length; i++) {
        macdLine.push({
            time: slowEMA[i].time,
            value: fastEMA[i + offset].value - slowEMA[i].value
        });
    }

    // Signal line is EMA of MACD line
    const signalMultiplier = 2 / (signalPeriod + 1);
    let signal = 0;

    // First signal is SMA of MACD
    for (let i = 0; i < signalPeriod; i++) {
        signal += macdLine[i].value;
    }
    signal /= signalPeriod;

    // Calculate signal line and histogram
    for (let i = signalPeriod - 1; i < macdLine.length; i++) {
        if (i >= signalPeriod) {
            signal = (macdLine[i].value - signal) * signalMultiplier + signal;
        }

        result.push({
            time: macdLine[i].time,
            macd: macdLine[i].value,
            signal: signal,
            histogram: macdLine[i].value - signal
        });
    }

    return result;
}

/**
 * Stochastic Oscillator
 * @param data - Array of OHLC data
 * @param kPeriod - %K period (default: 14)
 * @param dPeriod - %D smoothing period (default: 3)
 * @returns Array of Stochastic values
 */
export function calculateStochastic(
    data: OHLCData[],
    kPeriod: number = 14,
    dPeriod: number = 3
): StochasticValue[] {
    const result: StochasticValue[] = [];

    if (data.length < kPeriod + dPeriod) return result;

    const kValues: IndicatorValue[] = [];

    // Calculate %K
    for (let i = kPeriod - 1; i < data.length; i++) {
        let lowestLow = data[i].low;
        let highestHigh = data[i].high;

        for (let j = 1; j < kPeriod; j++) {
            lowestLow = Math.min(lowestLow, data[i - j].low);
            highestHigh = Math.max(highestHigh, data[i - j].high);
        }

        const k = highestHigh === lowestLow
            ? 50
            : ((data[i].close - lowestLow) / (highestHigh - lowestLow)) * 100;

        kValues.push({ time: data[i].time, value: k });
    }

    // Calculate %D (SMA of %K)
    for (let i = dPeriod - 1; i < kValues.length; i++) {
        let dSum = 0;
        for (let j = 0; j < dPeriod; j++) {
            dSum += kValues[i - j].value;
        }

        result.push({
            time: kValues[i].time,
            k: kValues[i].value,
            d: dSum / dPeriod
        });
    }

    return result;
}

// ============== VOLATILITY INDICATORS ==============

/**
 * Bollinger Bands
 * @param data - Array of OHLC data
 * @param period - Number of periods (default: 20)
 * @param stdDev - Standard deviation multiplier (default: 2)
 * @returns Array of Bollinger Band values
 */
export function calculateBollingerBands(
    data: OHLCData[],
    period: number = 20,
    stdDev: number = 2
): BollingerValue[] {
    const result: BollingerValue[] = [];

    if (data.length < period) return result;

    for (let i = period - 1; i < data.length; i++) {
        // Middle band (SMA)
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        const middle = sum / period;

        // Standard deviation
        let variance = 0;
        for (let j = 0; j < period; j++) {
            variance += Math.pow(data[i - j].close - middle, 2);
        }
        const std = Math.sqrt(variance / period);

        result.push({
            time: data[i].time,
            upper: middle + stdDev * std,
            middle: middle,
            lower: middle - stdDev * std
        });
    }

    return result;
}

/**
 * Average True Range (ATR)
 * @param data - Array of OHLC data
 * @param period - Number of periods (default: 14)
 * @returns Array of ATR values
 */
export function calculateATR(data: OHLCData[], period: number = 14): IndicatorValue[] {
    const result: IndicatorValue[] = [];

    if (data.length < period + 1) return result;

    // Calculate True Range
    const trueRanges: number[] = [];

    for (let i = 1; i < data.length; i++) {
        const tr = Math.max(
            data[i].high - data[i].low,
            Math.abs(data[i].high - data[i - 1].close),
            Math.abs(data[i].low - data[i - 1].close)
        );
        trueRanges.push(tr);
    }

    // First ATR is simple average
    let atr = 0;
    for (let i = 0; i < period; i++) {
        atr += trueRanges[i];
    }
    atr /= period;

    result.push({ time: data[period].time, value: atr });

    // Subsequent ATRs using Wilder's smoothing
    for (let i = period; i < trueRanges.length; i++) {
        atr = (atr * (period - 1) + trueRanges[i]) / period;
        result.push({ time: data[i + 1].time, value: atr });
    }

    return result;
}

// ============== VOLUME INDICATORS ==============

/**
 * Volume Weighted Average Price (VWAP)
 * @param data - Array of OHLC data with volume
 * @returns Array of VWAP values
 */
export function calculateVWAP(data: OHLCData[]): IndicatorValue[] {
    const result: IndicatorValue[] = [];

    let cumulativeTPV = 0; // Cumulative (typical price * volume)
    let cumulativeVolume = 0;

    for (const candle of data) {
        const typicalPrice = (candle.high + candle.low + candle.close) / 3;
        const volume = candle.volume || 0;

        cumulativeTPV += typicalPrice * volume;
        cumulativeVolume += volume;

        const vwap = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : typicalPrice;

        result.push({
            time: candle.time,
            value: vwap
        });
    }

    return result;
}

/**
 * On-Balance Volume (OBV)
 * @param data - Array of OHLC data with volume
 * @returns Array of OBV values
 */
export function calculateOBV(data: OHLCData[]): IndicatorValue[] {
    const result: IndicatorValue[] = [];

    if (data.length === 0) return result;

    let obv = 0;
    result.push({ time: data[0].time, value: obv });

    for (let i = 1; i < data.length; i++) {
        const volume = data[i].volume || 0;

        if (data[i].close > data[i - 1].close) {
            obv += volume;
        } else if (data[i].close < data[i - 1].close) {
            obv -= volume;
        }
        // If close equals previous close, OBV stays the same

        result.push({
            time: data[i].time,
            value: obv
        });
    }

    return result;
}

// ============== UTILITY FUNCTIONS ==============

/**
 * Get indicator color based on type and theme
 */
export function getIndicatorColor(indicatorType: string, index: number = 0): string {
    const colors: Record<string, string[]> = {
        sma: ['#2196F3', '#4CAF50', '#FF9800', '#E91E63'],
        ema: ['#9C27B0', '#00BCD4', '#CDDC39', '#FF5722'],
        rsi: ['#FFC107'],
        macd: ['#2196F3', '#FF5722', '#9E9E9E'],
        bollinger: ['#2196F3', '#2196F3', '#2196F3'],
        stochastic: ['#2196F3', '#FF5722'],
        atr: ['#9C27B0'],
        vwap: ['#E91E63'],
        obv: ['#4CAF50'],
    };

    const typeColors = colors[indicatorType] || ['#2196F3'];
    return typeColors[index % typeColors.length];
}

/**
 * Export all indicator functions
 */
export default {
    calculateSMA,
    calculateEMA,
    calculateRSI,
    calculateMACD,
    calculateStochastic,
    calculateBollingerBands,
    calculateATR,
    calculateVWAP,
    calculateOBV,
    getIndicatorColor,
};
