'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// ==========================================================
// SUBSCRIPTION CONTEXT
// Purpose: Track user's subscription status, features, and usage limits
// Powers the frontend feature gating system
// ==========================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UsageInfo {
    limit: number;
    used: number;
    remaining: number;
    period: string;
}

interface SubscriptionState {
    planName: string;
    status: string;
    expiresAt: string | null;
    features: Record<string, boolean>;
    usage: Record<string, UsageInfo>;
    isLoading: boolean;
    isPro: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
    hasFeature: (key: string) => boolean;
    checkLimit: (key: string) => boolean;
    getRemaining: (key: string) => number;
    trackUsage: (key: string) => Promise<{ allowed: boolean; remaining: number }>;
    refreshSubscription: () => Promise<void>;
}

const defaultState: SubscriptionState = {
    planName: 'Free',
    status: 'active',
    expiresAt: null,
    features: {},
    usage: {},
    isLoading: true,
    isPro: false,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const { token, user } = useAuth();
    const [state, setState] = useState<SubscriptionState>(defaultState);

    // Fetch subscription data
    const refreshSubscription = useCallback(async () => {
        if (!token) {
            setState({ ...defaultState, isLoading: false });
            return;
        }

        try {
            const res = await fetch(`${API_URL}/user/subscription`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.ok) {
                const data = await res.json();
                setState({
                    planName: data.plan_name || 'Free',
                    status: data.status || 'active',
                    expiresAt: data.expires_at,
                    features: data.features || {},
                    usage: data.usage || {},
                    isLoading: false,
                    isPro: data.plan_name !== 'Free',
                });
            } else {
                setState({ ...defaultState, isLoading: false });
            }
        } catch (error) {
            console.error('Failed to fetch subscription:', error);
            setState({ ...defaultState, isLoading: false });
        }
    }, [token]);

    // Fetch on mount and when token changes
    useEffect(() => {
        refreshSubscription();
    }, [refreshSubscription, user?.id]);

    // Check if user has a boolean feature enabled
    const hasFeature = useCallback((key: string): boolean => {
        if (state.isPro) return true; // Pro users have all features
        return state.features[key] === true;
    }, [state.features, state.isPro]);

    // Check if user can perform a limited action (remaining > 0 or unlimited)
    const checkLimit = useCallback((key: string): boolean => {
        if (state.isPro) return true;
        const usage = state.usage[key];
        if (!usage) return true; // No limit defined
        if (usage.limit === -1) return true; // Unlimited
        return usage.remaining > 0;
    }, [state.usage, state.isPro]);

    // Get remaining uses for a feature (-1 = unlimited)
    const getRemaining = useCallback((key: string): number => {
        if (state.isPro) return -1;
        const usage = state.usage[key];
        if (!usage) return -1;
        return usage.remaining;
    }, [state.usage, state.isPro]);

    // Track usage of a feature (call before performing action)
    const trackUsage = useCallback(async (key: string): Promise<{ allowed: boolean; remaining: number }> => {
        if (!token) {
            return { allowed: false, remaining: 0 };
        }

        // If Pro, always allow
        if (state.isPro) {
            return { allowed: true, remaining: -1 };
        }

        try {
            const res = await fetch(`${API_URL}/user/usage/${key}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();

            // Update local state with new usage
            if (res.ok) {
                setState(prev => ({
                    ...prev,
                    usage: {
                        ...prev.usage,
                        [key]: {
                            ...prev.usage[key],
                            used: data.used,
                            remaining: data.remaining,
                        },
                    },
                }));
            }

            return {
                allowed: data.allowed ?? false,
                remaining: data.remaining ?? 0,
            };
        } catch (error) {
            console.error('Failed to track usage:', error);
            return { allowed: false, remaining: 0 };
        }
    }, [token, state.isPro]);

    const value: SubscriptionContextType = {
        ...state,
        hasFeature,
        checkLimit,
        getRemaining,
        trackUsage,
        refreshSubscription,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}

// Convenience hook for checking a specific feature
export function useFeature(key: string) {
    const { hasFeature, isLoading } = useSubscription();
    return { hasFeature: hasFeature(key), isLoading };
}

// Convenience hook for checking a usage limit
export function useUsageLimit(key: string) {
    const { checkLimit, getRemaining, trackUsage, isLoading } = useSubscription();
    return {
        canUse: checkLimit(key),
        remaining: getRemaining(key),
        trackUsage: () => trackUsage(key),
        isLoading,
    };
}
