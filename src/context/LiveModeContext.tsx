'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LiveModeContextType {
    isLive: boolean;
    toggleLive: () => void;
    refreshTrigger: number; // Incrementing counter to trigger refetches
    lastUpdated: Date;
    setLiveMode: (enabled: boolean) => void;
}

const LiveModeContext = createContext<LiveModeContextType | undefined>(undefined);

export function LiveModeProvider({ children, initialEnabled = false }: { children: ReactNode; initialEnabled?: boolean }) {
    const [isLive, setIsLive] = useState(initialEnabled);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isLive) {
            // Initial trigger
            setRefreshTrigger(prev => prev + 1);
            setLastUpdated(new Date());

            // Poll every 10 seconds (standard for non-streaming live data)
            interval = setInterval(() => {
                setRefreshTrigger(prev => prev + 1);
                setLastUpdated(new Date());
            }, 10000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLive]);

    const toggleLive = () => setIsLive(prev => !prev);
    const setLiveMode = (enabled: boolean) => setIsLive(enabled);

    return (
        <LiveModeContext.Provider value={{ isLive, toggleLive, refreshTrigger, lastUpdated, setLiveMode }}>
            {children}
        </LiveModeContext.Provider>
    );
}

export function useLiveMode() {
    const context = useContext(LiveModeContext);
    if (context === undefined) {
        throw new Error('useLiveMode must be used within a LiveModeProvider');
    }
    return context;
}
