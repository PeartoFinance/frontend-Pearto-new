import { MousePointer2, TrendingUp, Minus, Box, Maximize, Type, Trash2, X, Crosshair, Pencil } from 'lucide-react';

interface ChartToolbarProps {
    activeTool: string | null;
    onToolSelect: (tool: 'trend' | 'ray' | 'horizontal' | 'rectangle') => void;
    onClearDrawings: () => void;
    variant?: 'default' | 'vertical-compact';
}

const tools = [
    { id: 'trend', icon: TrendingUp, label: 'Trend Line' },
    { id: 'ray', icon: Crosshair, label: 'Ray' },
    { id: 'horizontal', icon: Minus, label: 'Horizontal Line' },
    { id: 'rectangle', icon: Box, label: 'Rectangle' },
] as const;

export function ChartToolbar({ activeTool, onToolSelect, onClearDrawings, variant = 'default' }: ChartToolbarProps) {
    const isCompact = variant === 'vertical-compact';
    const iconSize = isCompact ? 18 : 20;

    return (
        <div className={`flex flex-col gap-1 ${isCompact ? '' : 'p-1 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 h-full w-[44px]'}`}>
            {/* Pointer/Select tool */}
            <button
                onClick={() => onToolSelect(null as any)}
                className={`p-2 rounded-lg transition overflow-hidden group relative ${activeTool === null
                        ? isCompact ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600'
                        : isCompact ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                title="Select"
            >
                <MousePointer2 size={iconSize} />
                <span className={`absolute ${isCompact ? 'left-10' : 'left-[44px]'} top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none`}>
                    Select
                </span>
            </button>

            {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                    <button
                        key={tool.id}
                        onClick={() => onToolSelect(tool.id)}
                        className={`p-2 rounded-lg transition overflow-hidden group relative ${activeTool === tool.id
                                ? isCompact ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600'
                                : isCompact ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        title={tool.label}
                    >
                        <Icon size={iconSize} />
                        <span className={`absolute ${isCompact ? 'left-10' : 'left-[44px]'} top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none`}>
                            {tool.label}
                        </span>
                    </button>
                );
            })}

            <div className={`h-px ${isCompact ? 'bg-slate-700' : 'bg-slate-200 dark:bg-slate-700'} my-1`} />

            <button
                onClick={onClearDrawings}
                className={`p-2 rounded-lg transition group relative ${isCompact ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                title="Clear All"
            >
                <Trash2 size={iconSize} />
                <span className={`absolute ${isCompact ? 'left-10' : 'left-[44px]'} top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none`}>
                    Clear Drawings
                </span>
            </button>
        </div>
    );
}

export default ChartToolbar;
