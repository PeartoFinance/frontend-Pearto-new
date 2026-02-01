'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getRates, type ExchangeRate } from '../services/currencyService';
import { getPreferences, updatePreferences } from '../services/userService';
import { useAuth } from '../context/AuthContext';

interface CurrencyContextType {
    currency: string;
    rates: Record<string, number>;
    loading: boolean;
    setCurrency: (code: string) => Promise<void>;
    convertPrice: (amount: number) => number;
    formatPrice: (amount: number, minimumFractionDigits?: number, maximumFractionDigits?: number, options?: Intl.NumberFormatOptions) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [currency, setCurrencyState] = useState('USD');
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    // Initial load: Fetch user prefs + rates
    useEffect(() => {
        async function init() {
            try {
                // Fetch rates (public) and prefs (protected) in parallel if auth
                const ratesPromise = getRates();
                const prefsPromise = isAuthenticated
                    ? getPreferences()
                    : Promise.resolve({} as any);

                const [ratesData, prefs] = await Promise.all([
                    ratesPromise,
                    prefsPromise
                ]);

                if (prefs && prefs.currency) {
                    setCurrencyState(prefs.currency);
                }

                // Transform array to map for O(1) lookup
                const rateMap: Record<string, number> = {};
                (ratesData as ExchangeRate[]).forEach((r: ExchangeRate) => {
                    rateMap[r.targetCurrency] = r.rate;
                });
                // USD is always base 1
                rateMap['USD'] = 1;

                setRates(rateMap);
            } catch (error) {
                console.error('Failed to init currency context:', error);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [isAuthenticated]);

    const setCurrency = async (code: string) => {
        setCurrencyState(code);
        try {
            // Persist to backend without blocking UI
            updatePreferences({ currency: code });
        } catch (error) {
            console.error('Failed to save currency pref:', error);
        }
    };

    const convertPrice = (amount: number) => {
        if (!amount) return 0;
        if (currency === 'USD') return amount;

        const rate = rates[currency];
        if (!rate) return amount; // Fallback to USD if rate missing

        return amount * rate;
    };

    const formatPrice = (amount: number, minimumFractionDigits = 2, maximumFractionDigits = 2, options: Intl.NumberFormatOptions = {}) => {
        const converted = convertPrice(amount);

        // Handle different locale formats potentially, for now using en-US for consistency
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits,
            maximumFractionDigits,
            ...options
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, rates, loading, setCurrency, convertPrice, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
