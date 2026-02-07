
/**
 * Formats large numbers using Indian/South Asian numbering system (K, L, Cr, Arab, Kharab)
 * or falls back to locale string.
 */
export const formatLargeNumber = (
    num: number | null | undefined,
    formatter?: (val: number) => string
) => {
    if (num == null) return '-';

    const fmt = (val: number) => formatter ? formatter(val) : val.toFixed(2);

    if (num >= 1e12) return `${fmt(num / 1e12)} Kharab`;
    if (num >= 1e9) return `${fmt(num / 1e9)} Arab`;
    if (num >= 1e7) return `${fmt(num / 1e7)} Cr`;
    if (num >= 1e5) return `${fmt(num / 1e5)} L`;
    if (num >= 1e3) return `${fmt(num / 1e3)} K`;

    return formatter ? formatter(num) : num.toLocaleString();
};

/**
 * Formats currency with large suffix (e.g. Rs 4.5 Arab)
 */
export const formatLargeCurrency = (num: number | null | undefined, symbol: string) => {
    if (num == null) return '-';
    // If it's small, just use standard format (we assume caller might use formatPrice for small)
    // But here we just append symbol for consistency with large
    return `${symbol} ${formatLargeNumber(num)}`;
};
