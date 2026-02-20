'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock, FileText } from 'lucide-react';

interface VisaRule {
    nationality: string;
    destination: string;
    required: 'no' | 'yes' | 'on-arrival' | 'e-visa';
    duration: string;
    notes: string;
}

const NATIONALITIES = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'Japan', 'South Korea', 'India', 'China', 'Brazil',
    'Mexico', 'Nigeria', 'South Africa', 'Philippines',
];

const DESTINATIONS = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Japan',
    'South Korea', 'France', 'Germany', 'Italy', 'Spain', 'Thailand',
    'Indonesia', 'India', 'China', 'Brazil', 'Mexico', 'Turkey',
    'UAE', 'Singapore', 'New Zealand', 'South Africa', 'Egypt',
    'Kenya', 'Morocco',
];

const VISA_DATA: VisaRule[] = [
    // US passport holders
    { nationality: 'United States', destination: 'United Kingdom', required: 'no', duration: '6 months', notes: 'Standard visitor visa allows up to 6 months stay for tourism.' },
    { nationality: 'United States', destination: 'France', required: 'no', duration: '90 days', notes: 'Schengen area — 90 days within 180-day period. No visa needed for tourism.' },
    { nationality: 'United States', destination: 'Germany', required: 'no', duration: '90 days', notes: 'Schengen area. Business and tourism up to 90 days visa-free.' },
    { nationality: 'United States', destination: 'Italy', required: 'no', duration: '90 days', notes: 'Schengen area. 90-day visa-free stay for tourism.' },
    { nationality: 'United States', destination: 'Spain', required: 'no', duration: '90 days', notes: 'Schengen area. 90-day visa-free stay for tourism.' },
    { nationality: 'United States', destination: 'Japan', required: 'no', duration: '90 days', notes: 'Visa-free for tourism. Extension possible at immigration office.' },
    { nationality: 'United States', destination: 'South Korea', required: 'no', duration: '90 days', notes: 'K-ETA required before travel. Visa-free for tourism.' },
    { nationality: 'United States', destination: 'Thailand', required: 'no', duration: '30 days', notes: 'Visa exemption for 30 days. Extendable for 30 more days at immigration office.' },
    { nationality: 'United States', destination: 'Indonesia', required: 'on-arrival', duration: '30 days', notes: 'Visa on arrival available for $35 USD. Extendable once for 30 days.' },
    { nationality: 'United States', destination: 'Australia', required: 'e-visa', duration: '90 days', notes: 'ETA (Electronic Travel Authority) required before travel. Apply online.' },
    { nationality: 'United States', destination: 'India', required: 'e-visa', duration: '30-180 days', notes: 'e-Visa available online. Multiple categories: tourist, business, medical.' },
    { nationality: 'United States', destination: 'China', required: 'yes', duration: 'Varies', notes: 'Visa required. Apply at Chinese embassy/consulate. Transit visa-free for some cities (72/144 hours).' },
    { nationality: 'United States', destination: 'Brazil', required: 'e-visa', duration: '90 days', notes: 'e-Visa required. Valid for up to 2 years with 90-day stays.' },
    { nationality: 'United States', destination: 'Turkey', required: 'e-visa', duration: '90 days', notes: 'e-Visa available online for $50 USD. Valid for 180 days.' },
    { nationality: 'United States', destination: 'UAE', required: 'no', duration: '30 days', notes: 'Visa-free for 30 days. Extendable.' },
    { nationality: 'United States', destination: 'Singapore', required: 'no', duration: '90 days', notes: 'Visa-free for up to 90 days for tourism.' },
    { nationality: 'United States', destination: 'Mexico', required: 'no', duration: '180 days', notes: 'Tourist card (FMM) issued on arrival. No visa needed.' },
    { nationality: 'United States', destination: 'New Zealand', required: 'e-visa', duration: '90 days', notes: 'NZeTA required before travel. Apply via app or online.' },
    { nationality: 'United States', destination: 'Canada', required: 'no', duration: '6 months', notes: 'No visa required. Valid passport needed.' },

    // UK passport holders
    { nationality: 'United Kingdom', destination: 'United States', required: 'e-visa', duration: '90 days', notes: 'ESTA required under Visa Waiver Program. Apply at least 72 hours before travel.' },
    { nationality: 'United Kingdom', destination: 'France', required: 'no', duration: '90 days', notes: 'Schengen area. 90 days in 180-day period. Post-Brexit rules apply.' },
    { nationality: 'United Kingdom', destination: 'Japan', required: 'no', duration: '90 days', notes: 'Visa-free for tourism up to 90 days.' },
    { nationality: 'United Kingdom', destination: 'Australia', required: 'e-visa', duration: '90 days', notes: 'ETA required. Apply online before travel.' },
    { nationality: 'United Kingdom', destination: 'Thailand', required: 'no', duration: '30 days', notes: '30-day visa exemption for tourism.' },
    { nationality: 'United Kingdom', destination: 'India', required: 'e-visa', duration: '30-180 days', notes: 'e-Visa available. Apply online before travel.' },
    { nationality: 'United Kingdom', destination: 'Canada', required: 'e-visa', duration: '6 months', notes: 'eTA required for air travel. Apply online.' },

    // India passport holders
    { nationality: 'India', destination: 'United States', required: 'yes', duration: 'Varies', notes: 'B1/B2 visa required. Apply at US embassy. Interview required.' },
    { nationality: 'India', destination: 'United Kingdom', required: 'yes', duration: '6 months', notes: 'Standard Visitor visa required. Apply online and attend appointment.' },
    { nationality: 'India', destination: 'Thailand', required: 'on-arrival', duration: '15 days', notes: 'Visa on arrival for 15 days at designated airports.' },
    { nationality: 'India', destination: 'Indonesia', required: 'on-arrival', duration: '30 days', notes: 'Visa on arrival available for $35 USD.' },
    { nationality: 'India', destination: 'Singapore', required: 'no', duration: '30 days', notes: 'Visa-free for up to 30 days for tourism.' },
    { nationality: 'India', destination: 'UAE', required: 'on-arrival', duration: '14 days', notes: 'Visa on arrival for Indian passport holders with valid US/EU visa or green card.' },
    { nationality: 'India', destination: 'Japan', required: 'yes', duration: 'Varies', notes: 'Visa required. Apply at Japanese embassy/consulate.' },
    { nationality: 'India', destination: 'France', required: 'yes', duration: '90 days', notes: 'Schengen visa required. Apply at VFS Global or French consulate.' },
    { nationality: 'India', destination: 'Turkey', required: 'e-visa', duration: '30 days', notes: 'e-Visa available online. Single entry.' },

    // Canada passport holders
    { nationality: 'Canada', destination: 'United States', required: 'no', duration: '6 months', notes: 'No visa required for Canadian citizens with valid passport.' },
    { nationality: 'Canada', destination: 'United Kingdom', required: 'no', duration: '6 months', notes: 'Visa-free for up to 6 months for tourism.' },
    { nationality: 'Canada', destination: 'Japan', required: 'no', duration: '90 days', notes: 'Visa-free for up to 90 days.' },
    { nationality: 'Canada', destination: 'France', required: 'no', duration: '90 days', notes: 'Schengen area. 90 days within 180-day period.' },
    { nationality: 'Canada', destination: 'Australia', required: 'e-visa', duration: '90 days', notes: 'ETA required. Apply online.' },

    // China passport holders
    { nationality: 'China', destination: 'United States', required: 'yes', duration: 'Varies', notes: 'B1/B2 visa required. 10-year multiple entry available. Interview required.' },
    { nationality: 'China', destination: 'Japan', required: 'yes', duration: 'Varies', notes: 'Visa required. Single or multiple entry available depending on conditions.' },
    { nationality: 'China', destination: 'Thailand', required: 'on-arrival', duration: '15 days', notes: 'Visa on arrival available at designated airports.' },
    { nationality: 'China', destination: 'Singapore', required: 'yes', duration: '30 days', notes: 'Visa required. Apply at Singapore embassy.' },
    { nationality: 'China', destination: 'UAE', required: 'no', duration: '30 days', notes: 'Visa-free for 30 days since 2018.' },
];

export default function VisaRequirementChecker() {
    const [nationality, setNationality] = useState('United States');
    const [destination, setDestination] = useState('Japan');

    const result = useMemo(() => {
        if (nationality === destination) {
            return { required: 'no' as const, duration: 'N/A', notes: 'You are a citizen of this country — no visa required.', nationality, destination };
        }
        return VISA_DATA.find(r => r.nationality === nationality && r.destination === destination) || null;
    }, [nationality, destination]);

    const statusConfig = {
        no: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', label: 'Visa Free', desc: 'No visa required' },
        yes: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', label: 'Visa Required', desc: 'Must apply before travel' },
        'on-arrival': { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', label: 'Visa on Arrival', desc: 'Obtain at destination' },
        'e-visa': { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', label: 'e-Visa', desc: 'Apply online before travel' },
    };

    return (
        <CalculatorLayout
            title="Visa Requirement Checker"
            description="Check visa requirements for your nationality and destination"
            category="Travel"
            insights={[
                { label: 'Passport', value: nationality },
                { label: 'Destination', value: destination, color: 'text-blue-600' },
                { label: 'Status', value: result ? statusConfig[result.required].label : 'No Data', color: 'text-emerald-600' },
                { label: 'Duration', value: result?.duration || '-', color: 'text-purple-600' },
            ]}
            results={
                <div className="space-y-4">
                    <div className="text-center p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                        <Shield className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">{nationality} → {destination}</p>
                        <p className="text-2xl font-bold text-indigo-600">Visa Check</p>
                    </div>

                    {!result ? (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                            <AlertTriangle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No data available for this combination.</p>
                            <p className="text-xs text-slate-400 mt-1">Check with the embassy of {destination} for accurate info.</p>
                        </div>
                    ) : (
                        <>
                            {(() => {
                                const config = statusConfig[result.required];
                                const StatusIcon = config.icon;
                                return (
                                    <div className={`p-5 rounded-xl border ${config.bg} ${config.border}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <StatusIcon className={`w-8 h-8 ${config.color}`} />
                                            <div>
                                                <p className={`text-lg font-bold ${config.color}`}>{config.label}</p>
                                                <p className="text-xs text-slate-500">{config.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Duration Allowed</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{result.duration}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Passport</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{nationality}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Destination</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{destination}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Notes</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">{result.notes}</p>
                            </div>
                        </>
                    )}

                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-amber-600 dark:text-amber-400">
                                <strong>Disclaimer:</strong> Visa requirements change frequently. Always verify with the official embassy or consulate before travel. This tool provides general guidance only.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Your Nationality
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {nationality}
                        </span>
                    </label>
                    <select value={nationality} onChange={e => setNationality(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Destination Country
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            {destination}
                        </span>
                    </label>
                    <select value={destination} onChange={e => setDestination(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                        {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Legend</p>
                    <div className="space-y-1.5">
                        {Object.entries(statusConfig).map(([key, cfg]) => {
                            const Icon = cfg.icon;
                            return (
                                <div key={key} className="flex items-center gap-2">
                                    <Icon size={14} className={cfg.color} />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">{cfg.label} — {cfg.desc}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
