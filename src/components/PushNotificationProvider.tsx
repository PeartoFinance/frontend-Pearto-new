'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ReactOneSignal from 'react-onesignal';
import {
    initOneSignal,
    requestPermission,
    setExternalUserId,
    clearExternalUserId,
    registerDeviceWithBackend,
    hasPermission,
    onNotificationReceived,
} from '@/services/onesignal';

/**
 * PushNotificationProvider
 *
 * Handles:
 * 1. Initialize OneSignal SDK on mount
 * 2. When user logs in → link user ID + register device with backend
 * 3. When user logs out → clear user linkage
 * 4. On foreground notification → optionally show a toast (future)
 *
 * Render as a sibling component (not a context provider) since it doesn't
 * expose any state to children.
 */
export default function PushNotificationProvider() {
    const { user, isAuthenticated, token } = useAuth();
    const sdkReady = useRef(false);
    const registeredUserId = useRef<string | null>(null);

    // 1. Initialize OneSignal SDK once on mount
    useEffect(() => {
        let cancelled = false;

        async function init() {
            const ok = await initOneSignal();
            if (!cancelled) {
                sdkReady.current = ok;
            }
        }

        init();
        return () => { cancelled = true; };
    }, []);

    // 2. When authenticated, link user + register device
    useEffect(() => {
        if (!isAuthenticated || !user || !token) return;

        let cancelled = false;

        async function linkUser() {
            // Wait a tick for SDK to be ready
            if (!sdkReady.current) {
                // Try initializing again (may have loaded late)
                const ok = await initOneSignal();
                if (!ok || cancelled) return;
                sdkReady.current = true;
            }

            // Avoid re-registering the same user
            if (registeredUserId.current === user!.id) return;

            try {
                // Validate user ID
                if (!user?.id) {
                    console.warn('[Push] User ID is missing, skipping OneSignal login');
                    return;
                }

                // Link OneSignal subscription to our user ID
                await setExternalUserId(String(user!.id));

                // If user already granted permission, register device with backend
                if (hasPermission()) {
                    await registerDeviceWithBackend();
                } else {
                    // Proactively ask the user if they want to enable notifications using OneSignal's native soft-prompt
                    try {
                        // Using any to bypass strict type checking for the slidedown API if not fully covered in definition
                        const sdk = (window as any).OneSignal || ReactOneSignal;
                        if (sdk && sdk.Slidedown) {
                            sdk.Slidedown.promptPush();
                        } else {
                            await ReactOneSignal.Slidedown.promptPush();
                        }
                    } catch (err) {
                        console.warn('[Push] Slidedown prompt failed or prompted already:', err);
                    }
                }

                if (!cancelled) {
                    registeredUserId.current = user!.id;
                }
            } catch (err) {
                console.error('[Push] Failed to link user:', err);
            }
        }

        linkUser();
        return () => { cancelled = true; };
    }, [isAuthenticated, user, token]);

    // 3. Clear external user on logout
    useEffect(() => {
        if (!isAuthenticated && registeredUserId.current) {
            clearExternalUserId();
            registeredUserId.current = null;
        }
    }, [isAuthenticated]);

    // 4. Log foreground notifications (can extend to toast later)
    useEffect(() => {
        if (!sdkReady.current) return;

        const cleanup = onNotificationReceived((event: any) => {
            console.log('[Push] Foreground notification:', event);
            // Future: show in-app toast
        });

        return cleanup;
    }, []);

    // This component renders nothing
    return null;
}

/**
 * Standalone function to prompt for push permission and register.
 * Call this from a UI button (e.g., "Enable Push Notifications" toggle).
 */
export async function enablePushNotifications(): Promise<boolean> {
    const ok = await initOneSignal();
    if (!ok) return false;

    const granted = await requestPermission();
    if (!granted) return false;

    // Register with backend
    await registerDeviceWithBackend();
    return true;
}
