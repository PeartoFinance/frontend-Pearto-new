'use client';

interface CategoryFilterProps {
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
    const allCategories = ['All', ...categories];

    return (
        <div className="flex flex-wrap gap-2">
            {allCategories.map(cat => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat === 'All' ? '' : cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${(cat === 'All' && !selected) || cat === selected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600'
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
