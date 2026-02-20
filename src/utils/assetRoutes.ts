/**
 * Shared utility for determining the correct detail page URL for any asset.
 * Centralizes routing logic so stocks go to /stocks/ and crypto goes to /crypto/.
 */

// Common crypto suffixes (e.g. BTC-USD, ETH-EUR, DOGE-USDT, etc.)
const CRYPTO_SUFFIXES = ['-USD', '-EUR', '-GBP', '-USDT', '-BTC', '-ETH', '-JPY', '-AUD', '-CAD', '-KRW'];

/**
 * Detect if a symbol is a crypto asset based on its assetType field or symbol pattern.
 */
export function isCryptoSymbol(symbol: string, assetType?: string): boolean {
    if (assetType === 'crypto' || assetType === 'Crypto' || assetType === 'cryptocurrency') return true;
    if (!symbol) return false;
    const upper = symbol.toUpperCase();
    return CRYPTO_SUFFIXES.some(suffix => upper.endsWith(suffix));
}

/**
 * Get the correct detail page path for a given asset symbol.
 *
 * @param symbol  - The ticker symbol (e.g. "AAPL", "BTC-USD")
 * @param assetType - Optional asset type from API response (e.g. "stock", "crypto")
 * @returns The correct Next.js route path (e.g. "/stocks/AAPL" or "/crypto/BTC-USD")
 */
export function getAssetDetailPath(symbol: string, assetType?: string): string {
    if (isCryptoSymbol(symbol, assetType)) {
        return `/crypto/${symbol}`;
    }
    return `/stocks/${symbol}`;
}
