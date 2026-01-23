'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface Country {
    code: string;
    name: string;
    nativeName?: string;
    currencyCode?: string;
    currencySymbol?: string;
    flagEmoji?: string;
    defaultMarketIndex?: string;
}

interface CountryContextType {
    country: string;
    countryData: Country | null;
    countries: Country[];
    isLoading: boolean;
    source: 'auto' | 'manual';
    setCountry: (code: string) => void;
    clearOverride: () => void;
}

const CountryContext = createContext<CountryContextType | null>(null);

const STORAGE_KEY = 'user_country_override';
const API_COUNTRY_KEY = 'user_country'; // Key used by api.ts for headers
const DEFAULT_COUNTRY = 'US';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.71:5000';

export function CountryProvider({ children }: { children: ReactNode }) {
    const [country, setCountryState] = useState<string>(DEFAULT_COUNTRY);
    const [countryData, setCountryData] = useState<Country | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [source, setSource] = useState<'auto' | 'manual'>('auto');

    // Fetch list of active countries
    const refreshCountries = useCallback(async (): Promise<Country[]> => {
        try {
            const res = await fetch(`${API_BASE}/api/countries`);
            if (res.ok) {
                const data = await res.json();
                setCountries(data.countries || []);
                return data.countries || [];
            }
        } catch (e) {
            console.warn('[CountryContext] Failed to fetch countries:', e);
        }
        return [];
    }, []);

    // Auto-detect country from server
    const detectCountry = useCallback(async (): Promise<string> => {
        try {
            const res = await fetch(`${API_BASE}/api/geo`);
            if (res.ok) {
                const data = await res.json();
                return data.country || DEFAULT_COUNTRY;
            }
        } catch (e) {
            console.warn('[CountryContext] Geo detection failed:', e);
        }
        return DEFAULT_COUNTRY;
    }, []);

    // Initialize on mount
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);

            // Check for manual override first
            const override = localStorage.getItem(STORAGE_KEY);

            // Fetch countries list
            const countryList = await refreshCountries();

            let selectedCode: string;
            if (override && countryList.some((c) => c.code === override)) {
                selectedCode = override;
                setSource('manual');
            } else {
                // TODO: Re-enable geo detection when ready
                // selectedCode = await detectCountry();
                // For now, hardcode US as default
                selectedCode = DEFAULT_COUNTRY;
                setSource('auto');
            }

            setCountryState(selectedCode);
            // Sync to api.ts localStorage key for HTTP headers
            localStorage.setItem(API_COUNTRY_KEY, selectedCode);

            // Set detailed country data
            const found = countryList.find((c) => c.code === selectedCode);
            setCountryData(found || null);

            setIsLoading(false);
        };

        init();
    }, [refreshCountries, detectCountry]);

    // Set country manually
    const setCountry = useCallback(
        (code: string) => {
            const upperCode = code.toUpperCase();
            setCountryState(upperCode);
            localStorage.setItem(STORAGE_KEY, upperCode);
            // Sync to api.ts localStorage key for HTTP headers
            localStorage.setItem(API_COUNTRY_KEY, upperCode);
            setSource('manual');

            const found = countries.find((c) => c.code === upperCode);
            setCountryData(found || null);
        },
        [countries]
    );

    // Clear manual override
    const clearOverride = useCallback(async () => {
        localStorage.removeItem(STORAGE_KEY);
        setSource('auto');

        const detected = await detectCountry();
        setCountryState(detected);
        // Sync to api.ts localStorage key for HTTP headers
        localStorage.setItem(API_COUNTRY_KEY, detected);

        const found = countries.find((c) => c.code === detected);
        setCountryData(found || null);
    }, [detectCountry, countries]);

    const value: CountryContextType = {
        country,
        countryData,
        countries,
        isLoading,
        source,
        setCountry,
        clearOverride,
    };

    return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}

export function useCountry() {
    const context = useContext(CountryContext);
    if (!context) {
        throw new Error('useCountry must be used within a CountryProvider');
    }
    return context;
}

export default CountryContext;
