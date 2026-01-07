/**
 * Tool Metadata Registry
 * Static metadata for tools - names, descriptions, icons, features
 * Database stores enabled/disabled state, this provides UI details
 */

import {
    Calculator, TrendingUp, Shield, DollarSign, Home,
    Heart, Users, Briefcase, Plane, ChefHat, Code, Palette
} from 'lucide-react';

export interface ToolMeta {
    slug: string;
    name: string;
    category: string;
    description: string;
    features: string[];
    icon?: string;
    href?: string;
}

// Category icons mapping
export const categoryIcons: Record<string, typeof Calculator> = {
    'Investing': TrendingUp,
    'Insurance': Shield,
    'Finance & Loans': DollarSign,
    'Real Estate': Home,
    'Health & Fitness': Heart,
    'Retirement': Users,
    'Business Operations': Briefcase,
    'Travel': Plane,
    'Cooking & Recipes': ChefHat,
    'Data & Code': Code,
    'Design': Palette,
};

// Category colors for styling
export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'Investing': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Insurance': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Finance & Loans': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Retirement': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'Real Estate': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'Health & Fitness': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Business Operations': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    'Travel': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    'Taxation': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Debt': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    'Personal Finance': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
};

// Default colors for unknown categories
export const defaultCategoryColor = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

// Tool metadata with descriptions and features
export const toolsMeta: Record<string, ToolMeta> = {
    'sip': {
        slug: 'sip',
        name: 'SIP Calculator',
        category: 'Investing',
        description: 'Calculate future value of systematic investment plans with monthly contributions.',
        features: ['Monthly contribution', 'Expected returns', 'Investment tenure', 'Future value']
    },
    'compound': {
        slug: 'compound',
        name: 'Compound Interest Calculator',
        category: 'Investing',
        description: 'Visualize how your investments grow with compound interest over time.',
        features: ['Initial deposit', 'Interest rate', 'Compounding period', 'Growth chart']
    },
    'emi': {
        slug: 'emi',
        name: 'Loan EMI Calculator',
        category: 'Finance & Loans',
        description: 'Calculate monthly loan payments and view complete amortization schedule.',
        features: ['Loan amount', 'Interest rate', 'Tenure', 'EMI breakdown']
    },
    'income-tax': {
        slug: 'income-tax',
        name: 'Income Tax Calculator',
        category: 'Taxation',
        description: 'Estimate your annual income tax based on salary and deductions.',
        features: ['Income slabs', 'Deductions', 'Tax payable', 'Regime comparison']
    },
    'retirement': {
        slug: 'retirement',
        name: 'Retirement Calculator',
        category: 'Retirement',
        description: 'Plan your retirement corpus and monthly contributions needed.',
        features: ['Current age', 'Retirement age', 'Monthly expense', 'Required corpus']
    },
    'goal-planner': {
        slug: 'goal-planner',
        name: 'Goal Planner',
        category: 'Investing',
        description: 'Plan contributions required to reach your financial goals.',
        features: ['Target amount', 'Time horizon', 'Inflation adjustment', 'Required SIP']
    },
    'life-insurance': {
        slug: 'life-insurance',
        name: 'Life Insurance Needs',
        category: 'Insurance',
        description: 'Evaluate how much life insurance coverage you need.',
        features: ['Income replacement', 'Liabilities', 'Existing cover', 'Gap analysis']
    },
    'term-insurance': {
        slug: 'term-insurance',
        name: 'Term Insurance Planner',
        category: 'Insurance',
        description: 'Compare term plan structures and find the right coverage.',
        features: ['Cover amount', 'Tenure', 'Premium estimate', 'Benefit types']
    },
    'budget-planner': {
        slug: 'budget-planner',
        name: 'Budget Planner',
        category: 'Personal Finance',
        description: 'Allocate your income across expense categories using 50/30/20 rule.',
        features: ['Income allocation', 'Expense categories', 'Savings goal', 'Visualization']
    },
    'credit-card-payoff-calculator': {
        slug: 'credit-card-payoff-calculator',
        name: 'Credit Card Payoff',
        category: 'Debt',
        description: 'Plan your credit card debt freedom date and save on interest.',
        features: ['Balance', 'APR', 'Monthly payment', 'Payoff timeline']
    },
    'car-insurance': {
        slug: 'car-insurance',
        name: 'Car Insurance Calculator',
        category: 'Insurance',
        description: 'Calculate indicative car insurance premium based on vehicle details.',
        features: ['IDV', 'Vehicle age', 'NCB', 'Premium estimate']
    },
    'bike-insurance': {
        slug: 'bike-insurance',
        name: 'Bike Insurance Calculator',
        category: 'Insurance',
        description: 'Calculate two-wheeler insurance premium estimate.',
        features: ['Vehicle details', 'CC', 'NCB discount', 'Premium']
    },
    'health-premium': {
        slug: 'health-premium',
        name: 'Health Premium Estimator',
        category: 'Insurance',
        description: 'Estimate health insurance premium based on age and coverage.',
        features: ['Age', 'Sum insured', 'City tier', 'Premium breakdown']
    },
    'travel-insurance': {
        slug: 'travel-insurance',
        name: 'Travel Insurance Calculator',
        category: 'Insurance',
        description: 'Estimate travel policy coverage and cost for your trip.',
        features: ['Trip duration', 'Destination', 'Coverage', 'Premium']
    },
    'calorie-calculator': {
        slug: 'calorie-calculator',
        name: 'Calorie Calculator',
        category: 'Health & Fitness',
        description: 'Calculate your daily calorie needs based on activity level.',
        features: ['BMR', 'Activity level', 'Goal', 'Daily calories']
    },
};

/**
 * Get tool metadata by slug
 */
export function getToolMeta(slug: string): ToolMeta | undefined {
    return toolsMeta[slug];
}

/**
 * Get category style
 */
export function getCategoryStyle(category: string) {
    return categoryColors[category] || defaultCategoryColor;
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: string) {
    return categoryIcons[category] || Calculator;
}
