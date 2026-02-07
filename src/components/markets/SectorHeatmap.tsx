'use client';

import React from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { useCurrency } from '@/contexts/CurrencyContext';
import { SectorAnalysisData } from '@/services/marketService';

interface SectorHeatmapProps {
    data: SectorAnalysisData[];
    height?: number;
}

// Exact colors from the reference image, updated to match Emerald Theme
const COLORS = {
    positiveStrong: '#10b981', // Emerald 500 (Vibrant)
    positiveMedium: '#34d399', // Emerald 400 (Light)
    positiveLight: '#6ee7b7',  // Emerald 300 (Very Light)
    negative: '#94a3b8',       // Slate 400 (Neutral/Grey instead of Red)
    neutral: '#cbd5e1',        // Slate 300
    text: '#ffffff',
    textDim: 'rgba(255,255,255,0.9)',
};

const getHeatmapColor = (change: number): string => {
    if (change === undefined || change === null || isNaN(change)) return COLORS.neutral;

    if (change >= 2.0) return COLORS.positiveStrong;
    if (change >= 0.5) return COLORS.positiveMedium;
    if (change > 0) return COLORS.positiveLight;
    if (change < 0) return COLORS.negative;
    return COLORS.neutral;
};

const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name, value, changePercent: directChange, weight: directWeight } = props;

    // Safely extract data
    const change = directChange ?? payload?.changePercent ?? root?.changePercent ?? 0;
    const weight = directWeight ?? payload?.weight ?? root?.weight ?? 0;

    const color = getHeatmapColor(change);
    const isTiny = width < 60 || height < 50;
    const isSmall = width < 100 || height < 70;

    return (
        <g>
            <rect
                x={x + 2} // Add gap
                y={y + 2} // Add gap
                width={width - 4} // Subtract gap * 2
                height={height - 4} // Subtract gap * 2
                rx={8} // Rounded corners as per design
                ry={8}
                style={{
                    fill: color,
                    stroke: 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                }}
                className="hover:opacity-90 hover:brightness-110 transition-all duration-300"
            />
            {!isTiny && (
                <>
                    {/* Sector Name - Top Left */}
                    <text
                        x={x + 10}
                        y={y + 18}
                        textAnchor="start"
                        fill={COLORS.text}
                        fontSize={10}
                        fontWeight="700"
                        style={{ textTransform: 'uppercase', pointerEvents: 'none' }}
                    >
                        {name && (width < 80 || name.length > 10) ? `${name.substring(0, 8)}..` : name}
                    </text>

                    {/* Trend Icon - Top Right - Simple Ascii/Unicode for now or SVG path */}
                    <path
                        d={change >= 0 ? "M 0 6 L 6 0 L 12 6" : "M 0 0 L 6 6 L 12 0"}
                        transform={`translate(${x + width - 18}, ${y + 10}) scale(0.8)`}
                        fill="none"
                        stroke={COLORS.textDim}
                        strokeWidth="2"
                    />

                    {!isSmall && (
                        <>
                            {/* Percentage - Center/Bottom Left - Big */}
                            <text
                                x={x + 10}
                                y={y + height - 25}
                                textAnchor="start"
                                fill={COLORS.text}
                                fontSize={18}
                                fontWeight="bold"
                                style={{ pointerEvents: 'none' }}
                            >
                                {change > 0 ? '+' : ''}{change?.toFixed(2)}%
                            </text>

                            {/* Weight - Bottom Left - Small */}
                            <text
                                x={x + 10}
                                y={y + height - 10}
                                textAnchor="start"
                                fill={COLORS.textDim}
                                fontSize={9}
                                fontWeight="500"
                                style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
                            >
                                {weight?.toFixed(1)}% Weight
                            </text>
                        </>
                    )}
                </>
            )}
        </g>
    );
};

import { formatLargeNumber } from '@/lib/formatters';

const CustomTooltip = ({ active, payload, formatPrice }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const change = data.changePercent ?? 0;
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl text-xs z-50 animate-in fade-in zoom-in-95 duration-200">
                <p className="font-bold text-slate-900 dark:text-white uppercase mb-1">{data.name}</p>
                <div className="flex justify-between gap-4">
                    <span className="text-slate-500 dark:text-slate-400">Change:</span>
                    <span className={`font-bold ${change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(2)}%
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-slate-500 dark:text-slate-400">Turnover:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                        {formatLargeNumber(data.turnover, (v) => formatPrice(v, 2))}
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-slate-500 dark:text-slate-400">Weight:</span>
                    <span className="text-slate-700 dark:text-slate-300">{data.weight?.toFixed(2)}%</span>
                </div>
            </div>
        );
    }
    return null;
};

export default function SectorHeatmap({ data, height = 400 }: SectorHeatmapProps) {
    const { formatPrice } = useCurrency();

    const treeData = data
        .filter(s => s.turnoverPercent > 0.1) // Filter very small
        .map(sector => ({
            name: sector.sector,
            value: sector.turnover,
            changePercent: sector.avgChangePercent,
            weight: sector.weight || sector.turnoverPercent, // Fallback if weight not explicit
            turnover: sector.turnover,
        }))
        .sort((a, b) => b.value - a.value);

    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    Market Heatmap
                    <span className="text-slate-300 cursor-help" title="Size represents turnover, color represents change %">ⓘ</span>
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS.positiveMedium }}></div>
                        Gain
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS.negative }}></div>
                        Loss / Neutral
                    </div>
                </div>
            </div>

            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={treeData}
                        dataKey="value"
                        aspectRatio={4 / 3}
                        stroke="none"
                        content={<CustomizedContent />}
                        isAnimationActive={true}
                    >
                        <Tooltip content={<CustomTooltip formatPrice={formatPrice} />} cursor={false} />
                    </Treemap>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
