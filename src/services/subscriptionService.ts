/**
 * Subscription Service
 * Handles subscription-related API calls
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SubscriptionPlan {
    id: number;
    name: string;
    description?: string;
    price: number;
    currency: string;
    interval: string;
    features: Record<string, boolean | number | string> | null;
    trialEnabled?: boolean;
    trialDays?: number;
}

export interface SubscriptionStatus {
    plan_name: string;
    status: string;
    expires_at: string | null;
    features: Record<string, boolean>;
    usage: Record<string, {
        limit: number;
        used: number;
        remaining: number;
        period: string;
    }>;
}

export interface BillingHistoryItem {
    id: string;
    date: string;
    amount: number;
    status: string;
    description: string;
}

/**
 * Get all subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const res = await fetch(`${API_URL}/subscription/plans`);
    if (!res.ok) throw new Error('Failed to fetch plans');
    return res.json();
}

/**
 * Get current user's subscription status
 */
export async function getSubscriptionStatus(token: string): Promise<SubscriptionStatus> {
    const res = await fetch(`${API_URL}/user/subscription`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) throw new Error('Failed to fetch subscription status');
    return res.json();
}

/**
 * Get billing history
 */
export async function getBillingHistory(token: string): Promise<BillingHistoryItem[]> {
    const res = await fetch(`${API_URL}/user/billing-history`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.history || [];
}

/**
 * Track usage of a feature
 */
export async function trackFeatureUsage(
    token: string,
    featureKey: string
): Promise<{ allowed: boolean; remaining: number; used: number }> {
    const res = await fetch(`${API_URL}/user/usage/${featureKey}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) throw new Error('Failed to track usage');
    return res.json();
}

/**
 * Verify a coupon code
 */
export async function verifyCoupon(
    token: string,
    planId: number,
    couponCode: string
): Promise<{ valid: boolean; final_price?: number; error?: string }> {
    const res = await fetch(`${API_URL}/subscription/verify-coupon`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: planId, coupon_code: couponCode }),
    });
    return res.json();
}

/**
 * Initiate checkout
 */
export async function initiateCheckout(
    token: string,
    options: {
        planId: number;
        couponCode?: string | null;
        trial?: boolean;
        gateway?: 'stripe' | 'paypal';
    }
): Promise<{
    order_id?: string;
    approval_url?: string;
    is_trial?: boolean;
    final_price?: number;
    error?: string;
}> {
    const res = await fetch(`${API_URL}/subscription/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            plan_id: options.planId,
            coupon_code: options.couponCode,
            trial: options.trial || false,
            gateway: options.gateway || 'stripe',
        }),
    });
    return res.json();
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(token: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`${API_URL}/subscription/cancel`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || 'Failed to cancel' };
    }
    return { success: true };
}

/**
 * Capture/confirm payment after returning from gateway
 */
export async function capturePayment(
    token: string,
    orderId: string,
    gateway: 'stripe' | 'paypal',
    subscriptionId?: string
): Promise<{
    success: boolean;
    subscription_id?: string;
    is_trial?: boolean;
    error?: string;
}> {
    const res = await fetch(`${API_URL}/subscription/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            order_id: orderId,
            gateway,
            subscription_id: subscriptionId,
        }),
    });
    const data = await res.json();
    return {
        success: res.ok,
        subscription_id: data.subscription_id,
        is_trial: data.is_trial,
        error: data.error,
    };
}
