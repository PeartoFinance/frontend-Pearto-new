'use client';

import Link from 'next/link';

const categories = [
    { name: 'Business', description: 'Corporate news and business updates', gradient: 'from-blue-600 to-blue-700' },
    { name: 'Markets', description: 'Stock market and financial data', gradient: 'from-emerald-600 to-emerald-700' },
    { name: 'Technology', description: 'Tech innovations and digital trends', gradient: 'from-purple-600 to-purple-700' },
    { name: 'World', description: 'Global news and international affairs', gradient: 'from-rose-600 to-rose-700' },
    { name: 'Energy', description: 'Energy sector and sustainability', gradient: 'from-amber-600 to-amber-700' },
];

export default function CategoryBar() {
    return (
        <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
                <Link
                    key={cat.name}
                    href={`/${cat.name.toLowerCase()}`}
                    className={`px-4 py-2 bg-gradient-to-r ${cat.gradient} text-white rounded-xl hover:shadow-lg transition-shadow`}
                >
                    <p className="font-bold text-sm">{cat.name}</p>
                    <p className="text-xs text-white/80 line-clamp-1 hidden sm:block">{cat.description}</p>
                </Link>
            ))}
        </div>
    );
}
