/**
 * OneSignal Push Notification Service for Frontend
 * Handles SDK initialization, permission, device registration
 */

// OneSignal App ID - set this in .env.local
const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '';

interface OneSignalWindow extends Window {
    OneSignalDeferred?: Array<(os: any) => void>;
    OneSignal?: any;
}

declare const window: OneSignalWindow;

let initialized = false;

/**
 * Initialize OneSignal SDK (v2)
 * Call this once on app load
 */
export async function initOneSignal(): Promise<boolean> {
    if (initialized) return true;
    if (!ONESIGNAL_APP_ID) {
        console.warn('[OneSignal] App ID not configured — set NEXT_PUBLIC_ONESIGNAL_APP_ID');
        return false;
    }
    if (typeof window === 'undefined') return false;

    try {
        // Load the OneSignal Web SDK v2 script
        await loadOneSignalScript();

        // Use the deferred-init pattern recommended by OneSignal v2
        await new Promise<void>((resolve, reject) => {
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            window.OneSignalDeferred.push(async (OneSignal: any) => {
                try {
                    await OneSignal.init({
                        appId: ONESIGNAL_APP_ID,
                        allowLocalhostAsSecureOrigin: true,
                        serviceWorkerParam: { scope: '/' },
                        serviceWorkerPath: '/OneSignalSDKWorker.js',
                        notifyButton: { enable: false }, // We handle UI ourselves
                    });
                    window.OneSignal = OneSignal;
                    initialized = true;
                    console.log('[OneSignal] Initialized successfully');
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        return true;
    } catch (error) {
        console.error('[OneSignal] Init failed:', error);
        return false;
    }
}

/**
 * Load OneSignal Web SDK v2 script
 */
function loadOneSignalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector('script[src*="OneSignalSDK"]')) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load OneSignal SDK'));
        document.head.appendChild(script);
    });
}

/**
 * Request notification permission from user
 */
export async function requestPermission(): Promise<boolean> {
    if (!window.OneSignal) return false;

    try {
        await window.OneSignal.Notifications.requestPermission();
        return window.OneSignal.Notifications.permission === true;
    } catch (error) {
        console.error('[OneSignal] Permission request failed:', error);
        return false;
    }
}

/**
 * Check if user has granted notification permission
 */
export function hasPermission(): boolean {
    if (!window.OneSignal) return false;
    return window.OneSignal.Notifications.permission === true;
}

/**
 * Get the OneSignal Push Subscription ID (replaces "Player ID" in v2)
 */
export function getSubscriptionId(): string | null {
    if (!window.OneSignal) return null;
    try {
        return window.OneSignal.User.PushSubscription.id || null;
    } catch {
        return null;
    }
}

/**
 * Register the push device token with our backend
 */
export async function registerDeviceWithBackend(): Promise<boolean> {
    const subscriptionId = getSubscriptionId();
    if (!subscriptionId) {
        console.debug('[OneSignal] No subscription ID yet — user may not have granted permission');
        return false;
    }

    try {
        const token = localStorage.getItem('auth_token');
        if (!token) return false;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/devices/register`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    player_id: subscriptionId,
                    platform: 'web',
                    device_name: navigator.userAgent.substring(0, 200),
                }),
            }
        );
        if (response.ok) {
            console.log('[OneSignal] Device registered with backend');
        }
        return response.ok;
    } catch (error) {
        console.error('[OneSignal] Device registration failed:', error);
        return false;
    }
}

/**
 * Set external user ID so OneSignal can target by our user ID
 */
export async function setExternalUserId(userId: string): Promise<void> {
    if (!window.OneSignal) return;

    try {
        await window.OneSignal.login(userId);
        console.log('[OneSignal] External user ID set:', userId);
    } catch (error) {
        console.error('[OneSignal] Failed to set external user ID:', error);
    }
}

/**
 * Clear external user ID on logout
 */
export async function clearExternalUserId(): Promise<void> {
    if (!window.OneSignal) return;

    try {
        await window.OneSignal.logout();
    } catch (error) {
        console.error('[OneSignal] Logout failed:', error);
    }
}

/**
 * Add tags for notification segmentation
 */
export async function addTags(tags: Record<string, string>): Promise<void> {
    if (!window.OneSignal) return;

    try {
        await window.OneSignal.User.addTags(tags);
    } catch (error) {
        console.error('[OneSignal] Failed to add tags:', error);
    }
}

/**
 * Listen to foreground notification events
 */
export function onNotificationReceived(callback: (event: any) => void): () => void {
    if (!window.OneSignal) return () => {};

    window.OneSignal.Notifications.addEventListener('foregroundWillDisplay', callback);
    return () => {
        window.OneSignal.Notifications.removeEventListener('foregroundWillDisplay', callback);
    };
}

/**
 * Listen to notification click events
 */
export function onNotificationClicked(callback: (event: any) => void): () => void {
    if (!window.OneSignal) return () => {};

    window.OneSignal.Notifications.addEventListener('click', callback);
    return () => {
        window.OneSignal.Notifications.removeEventListener('click', callback);
    };
}
