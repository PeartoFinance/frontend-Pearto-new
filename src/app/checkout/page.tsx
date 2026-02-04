'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Tag, Check, Loader2, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';

interface SubscriptionPlan {
    id: number;
    name: string;
    description?: string;
    price: number;
    currency: string;
    interval: string;
    features: Record<string, boolean | number | string> | null;
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isAuthenticated, token } = useAuth();

    const planId = searchParams.get('plan');
    const isYearly = searchParams.get('yearly') === 'true';

    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [basePrice, setBasePrice] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // Fetch plan details
    useEffect(() => {
        const fetchPlan = async () => {
            if (!planId) {
                router.push('/pricing');
                return;
            }
            try {
                const res = await fetch(`${API_URL}/subscription/plans`);
                if (res.ok) {
                    const plans = await res.json();
                    const foundPlan = plans.find((p: SubscriptionPlan) => p.id === parseInt(planId));
                    if (foundPlan) {
                        setPlan(foundPlan);
                        const price = isYearly ? foundPlan.price * 12 * 0.8 : foundPlan.price;
                        setBasePrice(price);
                        setFinalPrice(price);
                    } else {
                        router.push('/pricing');
                    }
                }
            } catch (err) {
                console.error('Failed to fetch plan:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [planId, isYearly, router, API_URL]);

    // Apply coupon
    const handleApplyCoupon = async () => {
        if (!couponCode.trim() || !planId) return;

        setCouponLoading(true);
        setCouponError('');

        try {
            const res = await fetch(`${API_URL}/subscription/verify-coupon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ plan_id: parseInt(planId), coupon_code: couponCode }),
            });

            const data = await res.json();

            if (res.status === 401 || res.status === 403) {
                // Session expired or invalid
                router.push(`/login?redirect=/checkout?plan=${planId}${isYearly ? '&yearly=true' : ''}`);
                return;
            }

            if (res.ok && data.valid) {
                setFinalPrice(data.final_price);
                setCouponApplied(true);
            } else {
                setCouponError(data.error || 'Invalid coupon code');
            }
        } catch (err) {
            setCouponError('Failed to verify coupon');
        } finally {
            setCouponLoading(false);
        }
    };

    // Remove coupon
    const handleRemoveCoupon = () => {
        setCouponCode('');
        setCouponApplied(false);
        setFinalPrice(basePrice);
    };

    // Initiate payment
    const handlePayment = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/checkout?plan=${planId}${isYearly ? '&yearly=true' : ''}`);
            return;
        }

        setPaymentLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/subscription/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    plan_id: parseInt(planId!),
                    coupon_code: couponApplied ? couponCode : null,
                }),
            });

            const data = await res.json();

            if (res.status === 401 || res.status === 403) {
                // Session expired or invalid
                router.push(`/login?redirect=/checkout?plan=${planId}${isYearly ? '&yearly=true' : ''}`);
                return;
            }

            if (res.ok && data.approval_url) {
                // Redirect to PayPal
                window.location.href = data.approval_url;
            } else {
                setError(data.error || 'Failed to initiate payment');
            }
        } catch (err) {
            setError('Payment service unavailable');
        } finally {
            setPaymentLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 dark:text-gray-400">Plan not found</p>
                <Link href="/pricing" className="text-emerald-500 hover:underline mt-2 inline-block">
                    View all plans
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Back Link */}
            <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-500 mb-6 transition-colors"
            >
                <ArrowLeft size={16} /> Back to Pricing
            </Link>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 text-white">
                    <h1 className="text-xl font-bold">Complete Your Purchase</h1>
                    <p className="text-emerald-100 text-sm mt-1">Secure checkout powered by PayPal</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Summary */}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                            Order Summary
                        </h2>
                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {isYearly ? 'Yearly' : 'Monthly'} subscription
                                    </p>
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {plan.currency} {basePrice.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Coupon Section */}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                            Promo Code
                        </h2>
                        {couponApplied ? (
                            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4">
                                <div className="flex items-center gap-2">
                                    <Check size={18} className="text-emerald-500" />
                                    <span className="font-medium text-emerald-700 dark:text-emerald-300">{couponCode}</span>
                                    <span className="text-sm text-emerald-600 dark:text-emerald-400">applied</span>
                                </div>
                                <button
                                    onClick={handleRemoveCoupon}
                                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Enter promo code"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading || !couponCode.trim()}
                                    className="px-5 py-3 bg-gray-900 dark:bg-slate-600 text-white font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-slate-500 disabled:opacity-50 transition-colors"
                                >
                                    {couponLoading ? <Loader2 size={18} className="animate-spin" /> : 'Apply'}
                                </button>
                            </div>
                        )}
                        {couponError && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                <AlertCircle size={14} /> {couponError}
                            </p>
                        )}
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                            <span className="text-gray-900 dark:text-white">{plan.currency} {basePrice.toFixed(2)}</span>
                        </div>
                        {couponApplied && (
                            <div className="flex justify-between items-center mt-2 text-emerald-600 dark:text-emerald-400">
                                <span>Discount</span>
                                <span>- {plan.currency} {(basePrice - finalPrice).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {plan.currency} {finalPrice.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Pay Button */}
                    <button
                        onClick={handlePayment}
                        disabled={paymentLoading}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-3"
                    >
                        {paymentLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard size={20} />
                                Pay with PayPal
                            </>
                        )}
                    </button>

                    {/* Security Note */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        Secure payment • Cancel anytime
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="px-4 lg:px-6 py-8">
                        <Suspense fallback={
                            <div className="flex items-center justify-center min-h-[400px]">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            </div>
                        }>
                            <CheckoutContent />
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    );
}
