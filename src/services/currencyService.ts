import { get } from './api';

export interface ExchangeRate {
    pair: string;
    rate: number;
    targetCurrency: string;
    last_updated: string;
}

export interface ConversionResult {
    original_amount_usd: number;
    converted_amount: number;
    rate: number;
    currency: string;
    last_updated: string;
}

/**
 * Fetch all available exchange rates
 */
export async function getRates(): Promise<ExchangeRate[]> {
    const response = await get<{ status: string; rates: ExchangeRate[] }>('/currency/rates');
    return response.rates || [];
}

/**
 * Convert USD amount to target currency
 * (Note: Should generally use CurrencyContext for client-side conversion to avoid excessive API calls)
 */
export async function convertCurrency(amount: number, toCurrency: string): Promise<ConversionResult> {
    return get<ConversionResult>(`/currency/convert?amount=${amount}&to=${toCurrency}`);
}
