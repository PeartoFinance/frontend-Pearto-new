'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ==========================================================
// FEATURE FLAGS CONTEXT
// Purpose: Provide global feature flags from admin settings
// Controls: AI widgets visibility, maintenance mode, etc.
// ==========================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FeatureFlags {
    ai_widgets_enabled: boolean;
    ai_analysis_enabled: boolean;
    maintenance_mode: boolean;
    [key: string]: boolean | string;
}

interface FeatureFlagsContextType {
    flags: FeatureFlags;
    isLoading: boolean;
    isAIEnabled: boolean;
    refreshFlags: () => Promise<void>;
}

const defaultFlags: FeatureFlags = {
    ai_widgets_enabled: true,
    ai_analysis_enabled: true,
    maintenance_mode: false,
};

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
    const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
    const [isLoading, setIsLoading] = useState(true);

    const refreshFlags = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/feature-flags`);
            if (res.ok) {
                const data = await res.json();
                setFlags(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Failed to fetch feature flags:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        refreshFlags();
    }, [refreshFlags]);

    // Convenience boolean for AI widgets
    const isAIEnabled = flags.ai_widgets_enabled && flags.ai_analysis_enabled;

    const value: FeatureFlagsContextType = {
        flags,
        isLoading,
        isAIEnabled,
        refreshFlags,
    };

    return (
        <FeatureFlagsContext.Provider value={value}>
            {children}
        </FeatureFlagsContext.Provider>
    );
}

export function useFeatureFlags() {
    const context = useContext(FeatureFlagsContext);
    if (context === undefined) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
    }
    return context;
}

// Convenience hook for checking if AI is enabled
export function useAIEnabled() {
    const { isAIEnabled, isLoading } = useFeatureFlags();
    return { isAIEnabled, isLoading };
}
