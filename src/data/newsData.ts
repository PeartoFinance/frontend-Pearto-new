/**
 * News Categories and Static Data
 */

import { Briefcase, TrendingUp, Cpu, Globe, Zap } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface CategoryInfo {
    name: string;
    slug: string;
    description: string;
    icon: LucideIcon;
    bgGradient: string;
    textColor: string;
    emoji: string;
}

export const categories: CategoryInfo[] = [
    {
        name: 'Business',
        slug: 'business',
        description: 'Corporate news, earnings, mergers, and business developments',
        icon: Briefcase,
        bgGradient: 'bg-gradient-to-br from-blue-500 to-purple-600',
        textColor: 'text-white',
        emoji: '📈'
    },
    {
        name: 'Markets',
        slug: 'markets',
        description: 'Stock market updates, indices, and trading insights',
        icon: TrendingUp,
        bgGradient: 'bg-gradient-to-br from-green-500 to-teal-600',
        textColor: 'text-white',
        emoji: '💹'
    },
    {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech innovations, AI, fintech, and digital transformation',
        icon: Cpu,
        bgGradient: 'bg-gradient-to-br from-purple-500 to-indigo-600',
        textColor: 'text-white',
        emoji: '🚀'
    },
    {
        name: 'World',
        slug: 'world',
        description: 'Global economy, geopolitics, and international markets',
        icon: Globe,
        bgGradient: 'bg-gradient-to-br from-orange-500 to-red-600',
        textColor: 'text-white',
        emoji: '🌍'
    },
    {
        name: 'Energy',
        slug: 'energy',
        description: 'Oil, gas, renewable energy, and sustainability news',
        icon: Zap,
        bgGradient: 'bg-gradient-to-br from-yellow-500 to-orange-600',
        textColor: 'text-white',
        emoji: '⚡'
    }
];

export const getCategoryBySlug = (slug: string): CategoryInfo | undefined => {
    return categories.find(c => c.slug === slug);
};

export const getCategoryGradient = (category: string): string => {
    const cat = getCategoryBySlug(category);
    return cat?.bgGradient || 'bg-gradient-to-br from-slate-500 to-slate-600';
};

export const getCategoryEmoji = (category: string): string => {
    const cat = getCategoryBySlug(category);
    return cat?.emoji || '📰';
};
