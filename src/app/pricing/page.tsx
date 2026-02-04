'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PricingCard from '@/components/pricing/PricingCard';

interface SubscriptionPlan {
    id: number;
    name: string;
    description?: string;
    price: number;
    currency: string;
    interval: string;
    features: Record<string, boolean | number | string> | null;
    maxMembers: number;
    isFeatured: boolean;
}

export default function PricingPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isYearly, setIsYearly] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/plans`);
                if (res.ok) {
                    const data = await res.json();
                    setPlans(data);
                }
            } catch (error) {
                console.error('Failed to fetch plans:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
                        {/* Back Link */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-500 mb-6 transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>

                        {/* Page Header */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-full mb-4">
                                <Zap size={14} /> Upgrade Your Experience
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                                Choose Your Plan
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                                Unlock premium features, advanced tools, and exclusive insights with our subscription plans.
                            </p>
                        </div>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-4 mb-10">
                            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                Monthly
                            </span>
                            <button
                                onClick={() => setIsYearly(!isYearly)}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${isYearly ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                Yearly <span className="text-emerald-500 text-xs">(Save 20%)</span>
                            </span>
                        </div>

                        {/* Plans Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                <span className="ml-3 text-gray-500 dark:text-gray-400">Loading plans...</span>
                            </div>
                        ) : plans.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-gray-500 dark:text-gray-400">No plans available at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {plans.map((plan) => (
                                    <PricingCard key={plan.id} plan={plan} isYearly={isYearly} />
                                ))}
                            </div>
                        )}

                        {/* FAQ Link */}
                        <div className="text-center mt-12">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Have questions?{' '}
                                <Link href="/faq" className="text-emerald-500 hover:underline font-medium">
                                    Check our FAQ
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        </div>
    );
}
