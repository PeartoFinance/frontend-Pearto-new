'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Plus } from 'lucide-react';
import { getPortfolios, type Portfolio, type PortfolioHolding } from '@/services/portfolioService';

interface ProfilePortfolioProps {
    onAddHolding?: () => void;
}

export default function ProfilePortfolio({ onAddHolding }: ProfilePortfolioProps) {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

    useEffect(() => {
        loadPortfolios();
    }, []);

    const loadPortfolios = async () => {
        try {
            const data = await getPortfolios();
            setPortfolios(data);
            if (data.length > 0) {
                setSelectedPortfolio(data[0]);
            }
        } catch (error) {
            console.error('Failed to load portfolios:', error);
            const mockPortfolio: Portfolio = {
                id: 1,
                name: 'Main Portfolio',
                totalValue: 125450,
                totalGain: 12545,
                totalGainPercent: 11.1,
                holdings: [
                    {
                        id: 1,
                        symbol: 'AAPL',
                        name: 'Apple Inc.',
                        shares: 50,
                        avgCost: 165.20,
                        currentPrice: 175.43,
                        totalValue: 8771.50,
                        gain: 511.50,
                        gainPercent: 6.19,
                    },
                    {
                        id: 2,
                        symbol: 'MSFT',
                        name: 'Microsoft Corporation',
                        shares: 25,
                        avgCost: 350.00,
                        currentPrice: 378.85,
                        totalValue: 9471.25,
                        gain: 721.25,
                        gainPercent: 8.24,
                    },
                ]
            };
            setPortfolios([mockPortfolio]);
            setSelectedPortfolio(mockPortfolio);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    const portfolio = selectedPortfolio;
    if (!portfolio) {
        return (
            <div className="text-center py-12">
                <PieChart className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Portfolio Found</h3>
                <p className="text-slate-400 mb-4">Create your first portfolio to start tracking investments.</p>
                <button 
                    onClick={onAddHolding}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg transition"
                >
                    Create Portfolio
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Portfolio</h2>
                    <p className="text-slate-400 mt-1">Track your investment performance</p>
                </div>
                <button 
                    onClick={onAddHolding}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg transition"
                >
                    <Plus size={16} />
                    Add Holding
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111314] border border-slate-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Total Value</h3>
                            <p className="text-sm text-slate-400">Current portfolio worth</p>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        ${portfolio.totalValue.toLocaleString()}
                    </div>
                </div>

                <div className="bg-[#111314] border border-slate-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            {portfolio.totalGain >= 0 ? (
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Total Gain/Loss</h3>
                            <p className="text-sm text-slate-400">Unrealized P&L</p>
                        </div>
                    </div>
                    <div className={`text-2xl font-bold ${portfolio.totalGain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {portfolio.totalGain >= 0 ? '+' : ''}${portfolio.totalGain.toLocaleString()}
                    </div>
                    <div className={`text-sm ${portfolio.totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {portfolio.totalGain >= 0 ? '+' : ''}{portfolio.totalGainPercent.toFixed(2)}%
                    </div>
                </div>

                <div className="bg-[#111314] border border-slate-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Holdings</h3>
                            <p className="text-sm text-slate-400">Number of positions</p>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {portfolio.holdings.length}
                    </div>
                </div>
            </div>

            <div className="bg-[#111314] border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                    <h3 className="font-semibold text-white">Holdings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/50">
                            <tr className="text-left">
                                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Symbol</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Shares</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Cost</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Current Price</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Total Value</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Gain/Loss</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {portfolio.holdings.map((holding) => (
                                <HoldingRow key={holding.id} holding={holding} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function HoldingRow({ holding }: { holding: PortfolioHolding }) {
    const isGain = holding.gain >= 0;
    
    return (
        <tr className="hover:bg-slate-800/30 transition">
            <td className="px-6 py-4">
                <div>
                    <div className="font-medium text-white">{holding.symbol}</div>
                    <div className="text-sm text-slate-400 truncate max-w-[150px]">{holding.name}</div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-300">
                {holding.shares.toLocaleString()}
            </td>
            <td className="px-6 py-4 text-sm text-slate-300">
                ${holding.avgCost.toFixed(2)}
            </td>
            <td className="px-6 py-4 text-sm text-slate-300">
                ${holding.currentPrice.toFixed(2)}
            </td>
            <td className="px-6 py-4 text-sm font-medium text-white">
                ${holding.totalValue.toLocaleString()}
            </td>
            <td className="px-6 py-4">
                <div className={`text-sm font-medium ${isGain ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isGain ? '+' : ''}${holding.gain.toLocaleString()}
                </div>
                <div className={`text-xs ${isGain ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isGain ? '+' : ''}{holding.gainPercent.toFixed(2)}%
                </div>
            </td>
        </tr>
    );
}