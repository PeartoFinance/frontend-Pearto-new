export interface PriceData {
    time: string | number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface ChartMarker {
    time: string | number;
    position: 'aboveBar' | 'belowBar' | 'inBar';
    color: string;
    shape: 'circle' | 'square' | 'arrowUp' | 'arrowDown';
    text: string;
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: PriceData[], period: number): { time: string | number; value: number }[] {
    const result: { time: string | number; value: number }[] = [];
    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
        result.push({
            time: data[i].time,
            value: sum / period
        });
    }
    return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: PriceData[], period: number): { time: string | number; value: number }[] {
    const result: { time: string | number; value: number }[] = [];
    const k = 2 / (period + 1);

    // Start with SMA
    let ema = data.slice(0, period).reduce((acc, curr) => acc + curr.close, 0) / period;

    result.push({ time: data[period - 1].time, value: ema });

    for (let i = period; i < data.length; i++) {
        ema = data[i].close * k + ema * (1 - k);
        result.push({
            time: data[i].time,
            value: ema
        });
    }
    return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(data: PriceData[], period: number = 14): { time: string | number; value: number }[] {
    const result: { time: string | number; value: number }[] = [];
    let gains = 0;
    let losses = 0;

    // First RSI
    for (let i = 1; i <= period; i++) {
        const change = data[i].close - data[i - 1].close;
        if (change > 0) gains += change;
        else losses += Math.abs(change);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? Math.abs(change) : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        result.push({
            time: data[i].time,
            value: rsi
        });
    }
    return result;
}

/**
 * Detect Candlestick Patterns
 * Returns markers for the chart
 */
export function detectPatterns(data: PriceData[]): ChartMarker[] {
    const markers: ChartMarker[] = [];

    for (let i = 1; i < data.length; i++) {
        const current = data[i];
        const prev = data[i - 1];

        const isGreen = current.close > current.open;
        const isRed = current.close < current.open;
        const bodySize = Math.abs(current.close - current.open);
        const wickTop = current.high - Math.max(current.open, current.close);
        const wickBottom = Math.min(current.open, current.close) - current.low;
        const totalSize = current.high - current.low;

        // 1. Doji (Body is very small, < 10% of total range)
        if (bodySize < totalSize * 0.1 && totalSize > 0) {
            markers.push({
                time: current.time,
                position: isGreen ? 'belowBar' : 'aboveBar',
                color: '#f59e0b',
                shape: 'arrowUp', // Standard lightweight-charts shape
                text: 'Doji'
            });
            continue;
        }

        // 2. Hammer (Small body, long lower wick, small upper wick)
        // Lower wick > 2x body, Upper wick < 0.5x body, at swing low (simplified)
        if (wickBottom > 2 * bodySize && wickTop < 0.5 * bodySize && current.low < prev.low) {
            markers.push({
                time: current.time,
                position: 'belowBar',
                color: '#10b981',
                shape: 'arrowUp',
                text: 'Hammer'
            });
            continue;
        }

        // 3. Bullish Engulfing (Green engulfs Red)
        // Prev is Red, Current is Green. Current Body fully contains Prev Body.
        if (prev.close < prev.open && current.close > current.open) { // Prev Red, Curr Green
            if (current.open <= prev.close && current.close >= prev.open) {
                markers.push({
                    time: current.time,
                    position: 'belowBar',
                    color: '#22c55e',
                    shape: 'arrowUp',
                    text: 'Bull Engulf'
                });
                continue;
            }
        }

        // 4. Bearish Engulfing (Red engulfs Green)
        if (prev.close > prev.open && current.close < current.open) { // Prev Green, Curr Red
            if (current.open >= prev.close && current.close <= prev.open) {
                markers.push({
                    time: current.time,
                    position: 'aboveBar',
                    color: '#ef4444',
                    shape: 'arrowDown',
                    text: 'Bear Engulf'
                });
                continue;
            }
        }
    }

    return markers;
}
