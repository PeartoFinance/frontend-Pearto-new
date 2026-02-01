'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Plus, Trash2, X, Search, ExternalLink } from 'lucide-react';
import { getPortfolios, createPortfolio, addHolding, deleteHolding, type Portfolio, type PortfolioHolding } from '@/services/portfolioService';
import { get } from '@/services/api';
import { TableExportButton } from '@/components/common/TableExportButton';
import PriceDisplay from '@/components/common/PriceDisplay';
import HealthScore from '@/components/portfolio/HealthScore';
import GoalSetting from '@/components/portfolio/GoalSetting';

interface StockOption {
    symbol: string;
    name: string;
    exchange?: string;
}

interface ProfilePortfolioProps {
    onAddHolding?: () => void;
}

export default function ProfilePortfolio({ onAddHolding }: ProfilePortfolioProps) {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddHoldingModal, setShowAddHoldingModal] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState('My Portfolio');
    const [holdingData, setHoldingData] = useState({ symbol: '', name: '', shares: '', avgBuyPrice: '' });
    const [submitting, setSubmitting] = useState(false);

    // Health Score State
    const [showHealthSettings, setShowHealthSettings] = useState(false);

    // Stock search state
    const [stockSearch, setStockSearch] = useState('');
    const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
    const [showStockDropdown, setShowStockDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadPortfolios();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowStockDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search stocks when typing
    useEffect(() => {
        const searchStocks = async () => {
            if (stockSearch.length < 1) {
                setStockOptions([]);
                return;
            }
            setSearchLoading(true);
            try {
                const results = await get<StockOption[]>(`/stocks/search?q=${stockSearch}&limit=10`);
                setStockOptions(results);
                setShowStockDropdown(true);
            } catch (error) {
                console.error('Failed to search stocks:', error);
            } finally {
                setSearchLoading(false);
            }
        };
        const debounce = setTimeout(searchStocks, 300);
        return () => clearTimeout(debounce);
    }, [stockSearch]);

    const loadPortfolios = async () => {
        try {
            const data = await getPortfolios();
            setPortfolios(data);
            if (data.length > 0) {
                setSelectedPortfolio(data[0]);
            }
        } catch (error) {
            console.error('Failed to load portfolios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePortfolio = async () => {
        if (!newPortfolioName.trim()) return;
        setSubmitting(true);
        try {
            const newPortfolio = await createPortfolio(newPortfolioName);
            setPortfolios([...portfolios, newPortfolio]);
            setSelectedPortfolio(newPortfolio);
            setShowCreateModal(false);
            setNewPortfolioName('My Portfolio');
        } catch (error) {
            console.error('Failed to create portfolio:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectStock = (stock: StockOption) => {
        setHoldingData({ ...holdingData, symbol: stock.symbol, name: stock.name });
        setStockSearch(`${stock.symbol} - ${stock.name}`);
        setShowStockDropdown(false);
    };

    const handleAddHolding = async () => {
        if (!selectedPortfolio || !holdingData.symbol || !holdingData.shares || !holdingData.avgBuyPrice) return;
        setSubmitting(true);
        try {
            await addHolding(
                String(selectedPortfolio.id),
                holdingData.symbol.toUpperCase(),
                parseFloat(holdingData.shares),
                parseFloat(holdingData.avgBuyPrice)
            );
            await loadPortfolios();
            setShowAddHoldingModal(false);
            setHoldingData({ symbol: '', name: '', shares: '', avgBuyPrice: '' });
            setStockSearch('');
        } catch (error) {
            console.error('Failed to add holding:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteHolding = async (holdingId: string | number) => {
        if (!selectedPortfolio) return;
        try {
            await deleteHolding(String(selectedPortfolio.id), String(holdingId));
            await loadPortfolios();
        } catch (error) {
            console.error('Failed to delete holding:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!selectedPortfolio) {
        return (
            <div className="text-center py-12">
                <PieChart className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Portfolio Found</h3>
                <p className="text-gray-500 dark:text-slate-400 mb-4">Create your first portfolio to start tracking investments.</p>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg transition"
                >
                    Create Portfolio
                </button>

                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-md text-left">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create Portfolio</h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm text-gray-500 dark:text-slate-400 mb-2">Portfolio Name</label>
                                <input
                                    type="text"
                                    value={newPortfolioName}
                                    onChange={(e) => setNewPortfolioName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="My Portfolio"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                                    Cancel
                                </button>
                                <button onClick={handleCreatePortfolio} disabled={submitting} className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg disabled:opacity-50">
                                    {submitting ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Track your investment performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/portfolio"
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium rounded-lg transition"
                    >
                        <ExternalLink size={16} />
                        View Full Portfolio
                    </Link>
                    <button
                        onClick={() => setShowAddHoldingModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg transition"
                    >
                        <Plus size={16} />
                        Add Holding
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* Health Score Card (Span 1) */}
                <div className="md:col-span-1">
                    <div className="h-full">
                        <HealthScore compact onConfigure={() => setShowHealthSettings(true)} />
                    </div>
                </div>

                {/* Status Cards (Span 3) */}
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <DollarSign className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Total Value</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Current portfolio worth</p>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            <PriceDisplay amount={selectedPortfolio.totalValue || 0} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                {selectedPortfolio.totalGain >= 0 ? (
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <TrendingDown className="w-5 h-5 text-red-500" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Total Gain/Loss</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Unrealized P&L</p>
                            </div>
                        </div>
                        <div className={`text-2xl font-bold ${selectedPortfolio.totalGain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            <PriceDisplay amount={selectedPortfolio.totalGain || 0} prefix={selectedPortfolio.totalGain >= 0 ? '+' : ''} />
                        </div>
                        <div className={`text-sm ${selectedPortfolio.totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {selectedPortfolio.totalGain >= 0 ? '+' : ''}{selectedPortfolio.totalGainPercent?.toFixed(2) || '0'}%
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-cyan-500/10 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-cyan-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Holdings</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Number of positions</p>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedPortfolio.holdings?.length || 0}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Holdings</h3>
                    <TableExportButton
                        data={selectedPortfolio.holdings || []}
                        columns={[
                            { key: 'symbol', label: 'Symbol' },
                            { key: 'name', label: 'Name' },
                            { key: 'shares', label: 'Shares', format: 'number' },
                            { key: 'avgCost', label: 'Avg Cost', format: 'currency' },
                            { key: 'currentPrice', label: 'Current', format: 'currency' },
                            { key: 'totalValue', label: 'Value', format: 'currency' },
                            { key: 'gain', label: 'Gain/Loss', format: 'currency' },
                            { key: 'gainPercent', label: 'Gain %', format: 'percent' },
                        ]}
                        filename={`portfolio-${selectedPortfolio.name}`}
                        title={`${selectedPortfolio.name} Holdings`}
                        variant="icon"
                    />
                </div>
                {selectedPortfolio.holdings?.length === 0 ? (
                    <div className="text-center py-12">
                        <BarChart3 className="w-12 h-12 text-gray-400 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-slate-400">No holdings yet. Add your first stock!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-800/50">
                                <tr className="text-left">
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Symbol</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Shares</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Avg Cost</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Current</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Value</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Gain/Loss</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {selectedPortfolio.holdings?.map((holding) => (
                                    <HoldingRow key={holding.id} holding={holding} portfolioId={String(selectedPortfolio.id)} onDelete={() => handleDeleteHolding(holding.id)} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Goal Setting Modal */}
            {showHealthSettings && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="relative w-full max-w-2xl">
                        <button
                            onClick={() => setShowHealthSettings(false)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-200 lg:hidden"
                        >
                            <X size={24} />
                        </button>
                        <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700 lg:hidden">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Investment Strategy</h3>
                                <button onClick={() => setShowHealthSettings(false)} className="text-gray-500 dark:text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>
                            <GoalSetting variant="clean" onComplete={() => setShowHealthSettings(false)} />
                        </div>
                        <button
                            onClick={() => setShowHealthSettings(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hidden lg:block z-10"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}

            {/* Add Holding Modal */}
            {showAddHoldingModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Holding</h3>
                            <button onClick={() => { setShowAddHoldingModal(false); setStockSearch(''); setHoldingData({ symbol: '', name: '', shares: '', avgBuyPrice: '' }); }} className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            {/* Stock Symbol Search */}
                            <div ref={searchRef} className="relative">
                                <label className="block text-sm text-gray-500 dark:text-slate-400 mb-2">Search Stock</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={stockSearch}
                                        onChange={(e) => setStockSearch(e.target.value)}
                                        onFocus={() => stockOptions.length > 0 && setShowStockDropdown(true)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="Search by symbol or name..."
                                    />
                                    {searchLoading && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {showStockDropdown && stockOptions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {stockOptions.map((stock) => (
                                            <button
                                                key={stock.symbol}
                                                onClick={() => handleSelectStock(stock)}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                                                    <div className="text-sm text-gray-500 dark:text-slate-400 truncate">{stock.name}</div>
                                                </div>
                                                {stock.exchange && (
                                                    <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">{stock.exchange}</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {holdingData.symbol && (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <div className="text-sm text-emerald-500">Selected: <span className="font-semibold">{holdingData.symbol}</span></div>
                                    <div className="text-xs text-emerald-400">{holdingData.name}</div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-gray-500 dark:text-slate-400 mb-2">Number of Shares</label>
                                <input
                                    type="number"
                                    value={holdingData.shares}
                                    onChange={(e) => setHoldingData({ ...holdingData, shares: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-slate-400 mb-2">Average Buy Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={holdingData.avgBuyPrice}
                                    onChange={(e) => setHoldingData({ ...holdingData, avgBuyPrice: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="150.00"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowAddHoldingModal(false); setStockSearch(''); setHoldingData({ symbol: '', name: '', shares: '', avgBuyPrice: '' }); }} className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                                Cancel
                            </button>
                            <button
                                onClick={handleAddHolding}
                                disabled={submitting || !holdingData.symbol || !holdingData.shares || !holdingData.avgBuyPrice}
                                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg disabled:opacity-50"
                            >
                                {submitting ? 'Adding...' : 'Add Holding'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function HoldingRow({ holding, portfolioId, onDelete }: { holding: PortfolioHolding; portfolioId: string; onDelete: () => void }) {
    const router = useRouter();
    const isGain = holding.gain >= 0;

    const handleRowClick = () => {
        router.push(`/portfolio/${portfolioId}/holdings/${holding.id}`);
    };

    return (
        <tr
            className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition cursor-pointer"
            onClick={handleRowClick}
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {holding.symbol.slice(0, 2)}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">{holding.symbol}</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400 truncate max-w-[150px]">{holding.name}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">
                <PriceDisplay amount={holding.shares} showSymbol={false} />
            </td>
            <td className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">
                <PriceDisplay amount={holding.avgCost} />
            </td>
            <td className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">
                <PriceDisplay amount={holding.currentPrice} />
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                <PriceDisplay amount={holding.totalValue} />
            </td>
            <td className="px-6 py-4">
                <div className={`text-sm font-medium ${isGain ? 'text-emerald-500' : 'text-red-500'}`}>
                    <PriceDisplay amount={holding.gain} prefix={isGain ? '+' : ''} />
                </div>
                <div className={`text-xs ${isGain ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isGain ? '+' : ''}{holding.gainPercent?.toFixed(2)}%
                </div>
            </td>
            <td className="px-6 py-4">
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 text-gray-400 dark:text-slate-400 hover:text-red-500 transition"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
}