'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Plane, Search, MapPin, Globe } from 'lucide-react';

interface Airport {
    code: string;
    name: string;
    city: string;
    country: string;
    region: string;
}

const AIRPORTS: Airport[] = [
    { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'United States', region: 'North America' },
    { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China', region: 'Asia' },
    { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', region: 'Middle East' },
    { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States', region: 'North America' },
    { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', region: 'Asia' },
    { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', region: 'Asia' },
    { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'United States', region: 'North America' },
    { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom', region: 'Europe' },
    { code: 'LGW', name: 'London Gatwick', city: 'London', country: 'United Kingdom', region: 'Europe' },
    { code: 'STN', name: 'London Stansted', city: 'London', country: 'United Kingdom', region: 'Europe' },
    { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', region: 'Europe' },
    { code: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'France', region: 'Europe' },
    { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'United States', region: 'North America' },
    { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States', region: 'North America' },
    { code: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'United States', region: 'North America' },
    { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', region: 'Europe' },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', region: 'Europe' },
    { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', region: 'Europe' },
    { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', region: 'Asia' },
    { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', region: 'Asia' },
    { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand', region: 'Asia' },
    { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China', region: 'Asia' },
    { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', region: 'Oceania' },
    { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', region: 'Oceania' },
    { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States', region: 'North America' },
    { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'United States', region: 'North America' },
    { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'United States', region: 'North America' },
    { code: 'IAD', name: 'Washington Dulles International', city: 'Washington D.C.', country: 'United States', region: 'North America' },
    { code: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'United States', region: 'North America' },
    { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada', region: 'North America' },
    { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada', region: 'North America' },
    { code: 'GRU', name: 'São Paulo-Guarulhos International', city: 'São Paulo', country: 'Brazil', region: 'South America' },
    { code: 'EZE', name: 'Ministro Pistarini International', city: 'Buenos Aires', country: 'Argentina', region: 'South America' },
    { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico', region: 'North America' },
    { code: 'CUN', name: 'Cancún International', city: 'Cancún', country: 'Mexico', region: 'North America' },
    { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy', region: 'Europe' },
    { code: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'Italy', region: 'Europe' },
    { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain', region: 'Europe' },
    { code: 'BCN', name: 'Barcelona–El Prat', city: 'Barcelona', country: 'Spain', region: 'Europe' },
    { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', region: 'Europe' },
    { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', region: 'Middle East' },
    { code: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi', country: 'India', region: 'Asia' },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', region: 'Asia' },
    { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia' },
    { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa', region: 'Africa' },
    { code: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa', region: 'Africa' },
    { code: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya', region: 'Africa' },
    { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', region: 'Africa' },
    { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', region: 'Oceania' },
    { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', region: 'Europe' },
    { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria', region: 'Europe' },
    { code: 'LIS', name: 'Lisbon Humberto Delgado', city: 'Lisbon', country: 'Portugal', region: 'Europe' },
    { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', region: 'Europe' },
    { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway', region: 'Europe' },
    { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden', region: 'Europe' },
    { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', region: 'Europe' },
    { code: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland', region: 'Europe' },
];

export default function AirportCodeLookup() {
    const [search, setSearch] = useState('');
    const [regionFilter, setRegionFilter] = useState('');

    const results = useMemo(() => {
        let filtered = AIRPORTS;
        if (regionFilter) {
            filtered = filtered.filter(a => a.region === regionFilter);
        }
        if (!search.trim()) return filtered;
        const q = search.toLowerCase();
        return filtered.filter(a =>
            a.code.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            a.city.toLowerCase().includes(q) ||
            a.country.toLowerCase().includes(q)
        );
    }, [search, regionFilter]);

    const regions = useMemo(() => Array.from(new Set(AIRPORTS.map(a => a.region))).sort(), []);

    return (
        <CalculatorLayout
            title="Airport Code Lookup"
            description="Search major airports worldwide by name, code, city, or country"
            category="Travel"
            insights={[
                { label: 'Total Airports', value: `${AIRPORTS.length}` },
                { label: 'Results', value: `${results.length}`, color: 'text-blue-600' },
                { label: 'Regions', value: `${regions.length}`, color: 'text-purple-600' },
                { label: 'Filter', value: regionFilter || 'All', color: 'text-emerald-600' },
            ]}
            results={
                <div className="space-y-4">
                    <div className="text-center p-5 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl">
                        <Plane className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Airports Found</p>
                        <p className="text-4xl font-bold text-sky-600">{results.length}</p>
                    </div>

                    {results.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-slate-400">
                            <Search size={32} className="mb-2 opacity-40" />
                            <p className="text-sm">No airports match &quot;{search}&quot;</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {results.map(airport => (
                                <div key={airport.code} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded">
                                                {airport.code}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800 dark:text-white">{airport.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={10} className="text-slate-400" />
                                            <span className="text-xs text-slate-500">{airport.city}, {airport.country}</span>
                                        </div>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                                            {airport.region}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Airport code, name, or city..."
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                        />
                    </div>
                    {search && (
                        <button onClick={() => setSearch('')} className="mt-1 text-xs text-slate-500 hover:text-red-500 transition">Clear</button>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Region
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {regionFilter || 'All'}
                        </span>
                    </label>
                    <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        <option value="">All Regions</option>
                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Quick Lookups</p>
                    <div className="flex flex-wrap gap-1.5">
                        {['JFK', 'LHR', 'NRT', 'DXB', 'SIN', 'CDG', 'SYD', 'LAX'].map(code => (
                            <button key={code} onClick={() => setSearch(code)}
                                className="text-[10px] px-2 py-1 rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-100 transition">
                                {code}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
