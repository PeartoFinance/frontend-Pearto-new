'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchNavigation, NavigationItem, NavigationResponse } from '@/services/navigationService';

interface NavigationContextType {
    navigation: NavigationResponse | null;
    loading: boolean;
    error: string | null;
    getSection: (section: string) => NavigationItem[];
    refresh: () => Promise<void>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
    const [navigation, setNavigation] = useState<NavigationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadNavigation = async () => {
        try {
            setLoading(true);
            const data = await fetchNavigation();
            setNavigation(data);
            setError(null);
        } catch (err) {
            setError('Failed to load navigation');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNavigation();
    }, []);

    const getSection = (section: string): NavigationItem[] => {
        if (!navigation) return [];
        return navigation.navigation[section] || [];
    };

    const refresh = async () => {
        await loadNavigation();
    };

    return (
        <NavigationContext.Provider value={{ navigation, loading, error, getSection, refresh }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}

export default NavigationContext;
