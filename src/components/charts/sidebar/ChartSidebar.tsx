import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    TrendingUp,
    Clock,
    Star,
    ChevronRight,
    Flame,
    BarChart3,
    Coins,
    Globe,
    Hammer,
    LayoutGrid
} from 'lucide-react';
import {
    getTopMovers,
    getQuotes,
    getCryptoMarkets,
    getCommodities,
    type MarketStock,
    type Commodity
} from '@/services/marketService';
import {
    getUserWatchlist,
    UserWatchlistItem
} from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useForexRates } from '@/hooks/useContentData';

interface ChartSidebarProps {
    symbol: string;
}

type TabType = 'stocks' | 'crypto' | 'forex' | 'commodities';

export default function ChartSidebar({ symbol }: ChartSidebarProps) {
    const { user, isAuthenticated } = useAuth();
    const { formatPrice } = useCurrency();
    const [activeTab, setActiveTab] = useState<TabType>('stocks');

    const [watchlist, setWatchlist] = useState<UserWatchlistItem[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

    // Data states
    const [trending, setTrending] = useState<MarketStock[]>([]);
    const [crypto, setCrypto] = useState<MarketStock[]>([]);
    const [commodities, setCommodities] = useState<Commodity[]>([]);
    const { data: forexRates = [] } = useForexRates('USD');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load recently viewed
        const stored = localStorage.getItem('pearto_recently_viewed');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setRecentlyViewed(parsed.slice(0, 5));
            } catch { }
        }

        // Add current symbol
        const updated = [symbol, ...(recentlyViewed.filter(s => s !== symbol))].slice(0, 10);
        localStorage.setItem('pearto_recently_viewed', JSON.stringify(updated));

        // Fetch Data based on active tab? Or fetch all initially?
        // Let's fetch trending stocks + watchlist initially.
        // Others can be lazy, but for sidebar it's fine to fetch.

        const fetchInitial = async () => {
            try {
                const trendingData = await getTopMovers('both', 10);
                if (trendingData.gainers) setTrending(trendingData.gainers);

                if (isAuthenticated) {
                    const watchlistRes = await getUserWatchlist();
                    setWatchlist(watchlistRes.items || []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchInitial();
    }, [symbol, isAuthenticated]);

    // Fetch tab specific data when tab changes
    useEffect(() => {
        const fetchTabData = async () => {
            if (activeTab === 'crypto' && crypto.length === 0) {
                try {
                    const data = await getCryptoMarkets(20);
                    setCrypto(data);
                } catch (e) { console.error(e); }
            }
            if (activeTab === 'commodities' && commodities.length === 0) {
                try {
                    const data = await getCommodities();
                    setCommodities(data);
                } catch (e) { console.error(e); }
            }
            // Forex is handled by hook
        };
        fetchTabData();
    }, [activeTab]);

    const formatPercent = (pct: number | null | undefined) => {
        if (pct == null) return '0.00%';
        return pct >= 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`;
    };

    const tabs: { id: TabType; icon: any; label: string }[] = [
        { id: 'stocks', icon: LayoutGrid, label: 'Stocks' },
        { id: 'crypto', icon: Coins, label: 'Crypto' },
        { id: 'forex', icon: Globe, label: 'Forex' },
        { id: 'commodities', icon: Hammer, label: 'Comm.' },
    ];

    const renderList = () => {
        if (loading) return <div className="p-4 text-xs text-slate-500">Loading...</div>;

        switch (activeTab) {
            case 'stocks':
                return (
                    <div className="space-y-1">
                        {trending.map(t => (
                            <Link key={t.symbol} href={`/chart/${t.symbol}`} className="flex items-center justify-between px-3 py-2 hover:bg-slate-800 rounded group">
                                <div>
                                    <div className="font-bold text-xs text-slate-300 group-hover:text-blue-400">{t.symbol}</div>
                                    <div className="text-[10px] text-slate-500 truncate w-24">{t.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-300">{formatPrice(t.price)}</div>
                                    <div className={`text-[10px] ${t.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatPercent(t.changePercent)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                );
            case 'crypto':
                return (
                    <div className="space-y-1">
                        {crypto.map(c => (
                            <Link key={c.symbol} href={`/chart/${c.symbol}?type=crypto`} className="flex items-center justify-between px-3 py-2 hover:bg-slate-800 rounded group">
                                <div>
                                    <div className="font-bold text-xs text-slate-300 group-hover:text-blue-400">{c.symbol}</div>
                                    <div className="text-[10px] text-slate-500 truncate w-24">{c.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-300">{formatPrice(c.price)}</div>
                                    <div className={`text-[10px] ${c.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatPercent(c.changePercent)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                );
            case 'forex':
                return (
                    <div className="space-y-1">
                        {forexRates.map(f => (
                            <Link key={f.pair} href={`/chart/${f.pair}?type=forex`} className="flex items-center justify-between px-3 py-2 hover:bg-slate-800 rounded group">
                                <div>
                                    <div className="font-bold text-xs text-slate-300 group-hover:text-blue-400">{f.pair}</div>
                                    <div className="text-[10px] text-slate-500">FX Rate</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-300">{f.rate?.toFixed(4)}</div>
                                    <div className={`text-[10px] ${(f.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatPercent(f.changePercent || 0)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                );
            case 'commodities':
                return (
                    <div className="space-y-1">
                        {commodities.map(c => (
                            <Link key={c.symbol} href={`/chart/${c.symbol}?type=commodity`} className="flex items-center justify-between px-3 py-2 hover:bg-slate-800 rounded group">
                                <div>
                                    <div className="font-bold text-xs text-slate-300 group-hover:text-blue-400">{c.symbol}</div>
                                    <div className="text-[10px] text-slate-500 truncate w-24">{c.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-300">{formatPrice(c.price)}</div>
                                    <div className={`text-[10px] ${c.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatPercent(c.changePercent)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                );
        }
    };

    return (
        <aside className="w-72 border-l border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden h-full">
            {/* My Portfolio & Markets Header */}
            <div className="p-4 border-b border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-sm text-slate-200">Market Explorer</h2>
                    <Link
                        href="/portfolio"
                        className="text-xs text-blue-400 hover:text-blue-300"
                    >
                        Portfolio
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-800/50 p-1 rounded-lg">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center justify-center py-2 rounded text-[10px] font-medium transition ${activeTab === tab.id
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon size={14} className="mb-1" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* Watchlist Section (Always Visible) */}
                {watchlist.length > 0 && isAuthenticated && (
                    <div className="p-2 border-b border-slate-800/50">
                        <div className="flex items-center gap-2 px-2 py-1 mb-1 opacity-70">
                            <Star size={12} className="text-yellow-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Watchlist</span>
                        </div>
                        <div className="space-y-1">
                            {watchlist.slice(0, 3).map(item => (
                                <Link
                                    key={item.symbol}
                                    href={`/chart/${item.symbol}`}
                                    className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-800 rounded group"
                                >
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-blue-400">{item.symbol}</span>
                                    <span className={`text-xs ${item.changePercent && item.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatPercent(item.changePercent || 0)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                        <div className="h-px bg-slate-800 mx-2 my-2"></div>
                    </div>
                )}

                {/* Tab Content */}
                <div className="p-1">
                    <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>{tabs.find(t => t.id === activeTab)?.label} Movers</span>
                        <ChevronRight size={12} />
                    </div>
                    {renderList()}
                </div>
            </div>
        </aside>
    );
}
