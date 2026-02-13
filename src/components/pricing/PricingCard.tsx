'use client';

import { Check, Star, Sparkles, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

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
    trialEnabled?: boolean;
    trialDays?: number;
}

interface UserSubscription {
    planId: number;
    status: 'active' | 'trialing' | 'canceled' | 'expired';
    planName: string;
}

interface PricingCardProps {
    plan: SubscriptionPlan;
    isYearly: boolean;
    userSubscription?: UserSubscription | null;
}

export default function PricingCard({ plan, isYearly, userSubscription }: PricingCardProps) {
    const displayPrice = isYearly ? (plan.price * 12 * 0.8).toFixed(2) : plan.price.toFixed(2);
    const interval = isYearly ? 'year' : 'month';

    // Check if user is on this plan
    const isCurrentPlan = userSubscription?.planId === plan.id;
    const hasActiveSubscription = userSubscription && ['active', 'trialing'].includes(userSubscription.status);
    const isOnTrial = userSubscription?.status === 'trialing';

    // Extract feature list from JSON
    const featureList = plan.features
        ? Object.entries(plan.features)
            .filter(([, value]) => value === true || typeof value === 'number')
            .map(([key]) => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
        : [];

    // Determine CTA text and action
    const getCTAContent = () => {
        if (isCurrentPlan) {
            return {
                text: isOnTrial ? 'Current Plan (Trial)' : 'Current Plan',
                disabled: true,
                icon: <CheckCircle size={16} />
            };
        }

        if (hasActiveSubscription) {
            // User has subscription on different plan
            return {
                text: 'Upgrade',
                disabled: false,
                icon: <Sparkles size={16} />
            };
        }

        // No subscription - show trial or regular CTA
        if (plan.trialEnabled) {
            return {
                text: 'Start Free Trial',
                disabled: false,
                icon: <Clock size={16} />
            };
        }

        return {
            text: plan.isFeatured ? 'Get Started' : 'Choose Plan',
            disabled: false,
            icon: plan.isFeatured ? <Sparkles size={16} /> : null
        };
    };

    const cta = getCTAContent();

    return (
        <div
            className={`relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-6 flex flex-col transition-all duration-300 hover:shadow-xl ${plan.isFeatured
                ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                }`}
        >
            {/* Featured Badge */}
            {plan.isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Star size={12} fill="white" /> Most Popular
                </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan && (
                <div className="absolute -top-3 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {isOnTrial ? 'Your Trial' : 'Your Plan'}
                </div>
            )}

            {/* Plan Name */}
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                {plan.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
                )}
            </div>

            {/* Price */}
            <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{plan.currency}</span>
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{displayPrice}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">/{interval}</span>
                {isYearly && (
                    <p className="text-xs text-emerald-500 font-medium mt-1">Save 20% with yearly</p>
                )}
                {/* Trial Badge - Only show if user doesn't have subscription */}
                {plan.trialEnabled && plan.trialDays && !hasActiveSubscription && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                        <Clock size={12} />
                        {plan.trialDays}-day free trial
                    </div>
                )}
            </div>

            {/* Features */}
            <ul className="flex-1 space-y-3 mb-6">
                {featureList.length > 0 ? (
                    featureList.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <Check size={16} className="text-emerald-500 shrink-0" />
                            {feature}
                        </li>
                    ))
                ) : (
                    <li className="text-sm text-gray-500 dark:text-gray-400 italic">Basic features included</li>
                )}
            </ul>

            {/* CTA Button */}
            {cta.disabled ? (
                <div className="block w-full text-center py-3 px-4 rounded-xl font-semibold bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                    <span className="flex items-center justify-center gap-2">
                        {cta.icon} {cta.text}
                    </span>
                </div>
            ) : (
                <Link
                    href={`/checkout?plan=${plan.id}${isYearly ? '&yearly=true' : ''}${plan.trialEnabled && !hasActiveSubscription ? '&trial=true' : ''}`}
                    className={`block w-full text-center py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${plan.isFeatured
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                >
                    <span className="flex items-center justify-center gap-2">
                        {cta.icon} {cta.text}
                    </span>
                </Link>
            )}
        </div>
    );
}

