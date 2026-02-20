'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import PriceDisplay from '@/components/common/PriceDisplay';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Brain, Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

interface MindNode {
    id: string;
    text: string;
    children: MindNode[];
    collapsed: boolean;
}

export default function MindMapGenerator() {
    const { formatPrice } = useCurrency();
    const [centralTopic, setCentralTopic] = useState('Product Launch');
    const [branches, setBranches] = useState<MindNode[]>([
        {
            id: '1', text: 'Marketing', collapsed: false, children: [
                { id: '1a', text: 'Social Media', collapsed: false, children: [] },
                { id: '1b', text: 'Email Campaign', collapsed: false, children: [] },
                { id: '1c', text: 'Press Release', collapsed: false, children: [] },
            ]
        },
        {
            id: '2', text: 'Development', collapsed: false, children: [
                { id: '2a', text: 'Frontend', collapsed: false, children: [] },
                { id: '2b', text: 'Backend API', collapsed: false, children: [] },
                { id: '2c', text: 'Testing', collapsed: false, children: [] },
            ]
        },
        {
            id: '3', text: 'Design', collapsed: false, children: [
                { id: '3a', text: 'UI/UX', collapsed: false, children: [] },
                { id: '3b', text: 'Branding', collapsed: false, children: [] },
            ]
        },
    ]);

    const [newBranchText, setNewBranchText] = useState('');
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const [newSubText, setNewSubText] = useState('');

    const addBranch = () => {
        if (!newBranchText.trim()) return;
        setBranches(prev => [...prev, { id: Date.now().toString(), text: newBranchText.trim(), collapsed: false, children: [] }]);
        setNewBranchText('');
    };

    const removeBranch = (id: string) => {
        setBranches(prev => prev.filter(b => b.id !== id));
        if (selectedBranchId === id) setSelectedBranchId(null);
    };

    const toggleCollapse = (id: string) => {
        setBranches(prev => prev.map(b => b.id === id ? { ...b, collapsed: !b.collapsed } : b));
    };

    const addSubBranch = () => {
        if (!newSubText.trim() || !selectedBranchId) return;
        setBranches(prev => prev.map(b => {
            if (b.id === selectedBranchId) {
                return { ...b, children: [...b.children, { id: Date.now().toString(), text: newSubText.trim(), collapsed: false, children: [] }] };
            }
            return b;
        }));
        setNewSubText('');
    };

    const removeSubBranch = (branchId: string, subId: string) => {
        setBranches(prev => prev.map(b => {
            if (b.id === branchId) {
                return { ...b, children: b.children.filter(c => c.id !== subId) };
            }
            return b;
        }));
    };

    const stats = useMemo(() => {
        const totalBranches = branches.length;
        const totalSubBranches = branches.reduce((s, b) => s + b.children.length, 0);
        const totalNodes = 1 + totalBranches + totalSubBranches; // central + branches + subs
        const maxDepth = totalSubBranches > 0 ? 3 : totalBranches > 0 ? 2 : 1;
        return { totalBranches, totalSubBranches, totalNodes, maxDepth };
    }, [branches]);

    const BRANCH_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6'];

    return (
        <CalculatorLayout
            title="Mind Map Generator"
            description="Organize ideas visually with a tree-like mind map structure"
            category="Productivity"
            insights={[
                { label: 'Branches', value: `${stats.totalBranches}`, color: 'text-blue-600' },
                { label: 'Sub-branches', value: `${stats.totalSubBranches}`, color: 'text-purple-600' },
                { label: 'Total Nodes', value: `${stats.totalNodes}` },
                { label: 'Depth', value: `${stats.maxDepth} levels` },
            ]}
            results={
                <div className="space-y-4">
                    {/* Mind Map Visualization */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 overflow-x-auto">
                        <div className="min-w-[400px] flex flex-col items-center">
                            {/* Central topic */}
                            <div className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-lg text-sm font-bold text-center max-w-[200px]">
                                <Brain size={16} className="inline mr-1.5 -mt-0.5" />
                                {centralTopic || 'Central Topic'}
                            </div>

                            {branches.length > 0 && (
                                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
                            )}

                            {/* Branches */}
                            <div className="flex flex-wrap justify-center gap-4 items-start">
                                {branches.map((branch, bi) => {
                                    const color = BRANCH_COLORS[bi % BRANCH_COLORS.length];
                                    return (
                                        <div key={branch.id} className="flex flex-col items-center">
                                            {/* Connector */}
                                            <div className="w-px h-4" style={{ backgroundColor: color }} />

                                            {/* Branch node */}
                                            <button
                                                onClick={() => toggleCollapse(branch.id)}
                                                className="px-4 py-2 rounded-xl border-2 text-sm font-semibold shadow-sm hover:shadow-md transition flex items-center gap-1.5 max-w-[160px]"
                                                style={{
                                                    borderColor: color,
                                                    backgroundColor: `${color}15`,
                                                    color: color,
                                                }}
                                            >
                                                {branch.children.length > 0 && (
                                                    branch.collapsed
                                                        ? <ChevronRight size={12} />
                                                        : <ChevronDown size={12} />
                                                )}
                                                <span className="truncate">{branch.text}</span>
                                            </button>

                                            {/* Sub-branches */}
                                            {!branch.collapsed && branch.children.length > 0 && (
                                                <>
                                                    <div className="w-px h-3" style={{ backgroundColor: color }} />
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        {branch.children.map(sub => (
                                                            <div key={sub.id} className="flex items-center gap-1.5">
                                                                <div className="w-3 h-px" style={{ backgroundColor: color }} />
                                                                <div
                                                                    className="px-3 py-1.5 rounded-lg text-xs border shadow-sm max-w-[130px] truncate"
                                                                    style={{
                                                                        borderColor: `${color}60`,
                                                                        backgroundColor: `${color}08`,
                                                                        color: color,
                                                                    }}
                                                                >
                                                                    {sub.text}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}

                                            {!branch.collapsed && branch.children.length === 0 && (
                                                <p className="text-[9px] text-slate-400 mt-1 italic">No sub-branches</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Branches</p>
                            <p className="text-lg font-bold text-blue-600">{stats.totalBranches}</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Sub-branches</p>
                            <p className="text-lg font-bold text-purple-600">{stats.totalSubBranches}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Total Nodes</p>
                            <p className="text-lg font-bold text-emerald-600">{stats.totalNodes}</p>
                        </div>
                    </div>

                    {/* Outline View */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Outline View</p>
                        <div className="text-sm space-y-1">
                            <p className="font-bold text-slate-700 dark:text-slate-300">🧠 {centralTopic || 'Central Topic'}</p>
                            {branches.map((b, bi) => (
                                <div key={b.id} className="ml-4">
                                    <p className="font-medium" style={{ color: BRANCH_COLORS[bi % BRANCH_COLORS.length] }}>
                                        ├─ {b.text}
                                    </p>
                                    {b.children.map((sub, si) => (
                                        <p key={sub.id} className="ml-4 text-xs text-slate-500">
                                            {si === b.children.length - 1 ? '└─' : '├─'} {sub.text}
                                        </p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Central topic */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Brain size={14} className="text-emerald-500" />
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Central Topic</label>
                    </div>
                    <input type="text" value={centralTopic} onChange={(e) => setCentralTopic(e.target.value)}
                        placeholder="Main topic..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                </div>

                {/* Add branch */}
                <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Add Branch</label>
                    <div className="flex gap-2">
                        <input type="text" value={newBranchText} onChange={(e) => setNewBranchText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addBranch()}
                            placeholder="Branch name..."
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                        <button onClick={addBranch}
                            className="px-3 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition">
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Branches */}
                <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Branches</p>
                    {branches.map((b, bi) => (
                        <div key={b.id}>
                            <div className={`flex items-center justify-between px-3 py-2 rounded-lg border transition cursor-pointer ${selectedBranchId === b.id
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                                onClick={() => setSelectedBranchId(selectedBranchId === b.id ? null : b.id)}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: BRANCH_COLORS[bi % BRANCH_COLORS.length] }} />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{b.text}</span>
                                    <span className="text-[10px] text-slate-400">({b.children.length})</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); removeBranch(b.id); }}
                                    className="p-1 text-slate-400 hover:text-red-500 transition">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                            {/* Sub-branches list */}
                            {selectedBranchId === b.id && (
                                <div className="ml-4 mt-1.5 space-y-1">
                                    {b.children.map(sub => (
                                        <div key={sub.id} className="flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50">
                                            <span className="text-xs text-slate-600 dark:text-slate-400">{sub.text}</span>
                                            <button onClick={() => removeSubBranch(b.id, sub.id)}
                                                className="p-0.5 text-slate-400 hover:text-red-500 transition">
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add sub-branch */}
                {selectedBranchId && (
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                            Add to: <span className="text-emerald-600">{branches.find(b => b.id === selectedBranchId)?.text}</span>
                        </label>
                        <div className="flex gap-2">
                            <input type="text" value={newSubText} onChange={(e) => setNewSubText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addSubBranch()}
                                placeholder="Sub-branch..."
                                className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                            <button onClick={addSubBranch}
                                className="px-3 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </CalculatorLayout>
    );
}
