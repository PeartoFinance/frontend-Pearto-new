'use client';

import { useState, useEffect } from 'react';
import { Save, Globe, DollarSign, Languages, MapPin } from 'lucide-react';
import { UserPreferences, updatePreferences, getPreferences } from '@/services/userService';

interface ProfilePreferencesProps {
    initialPreferences?: UserPreferences;
    onUpdate?: (preferences: UserPreferences) => void;
}

const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
];

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
];

const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'JP', name: 'Japan' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'CN', name: 'China' },
    { code: 'KR', name: 'South Korea' },
    { code: 'SG', name: 'Singapore' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
];

export default function ProfilePreferences({ initialPreferences, onUpdate }: ProfilePreferencesProps) {
    const [preferences, setPreferences] = useState<UserPreferences>({
        currency: 'USD',
        languagePref: 'en',
        countryCode: 'US',
        taxResidency: '',
        ...initialPreferences,
    });
    const [loading, setLoading] = useState(!initialPreferences);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (!initialPreferences) {
            loadPreferences();
        }
    }, [initialPreferences]);

    const loadPreferences = async () => {
        try {
            const data = await getPreferences();
            setPreferences(data);
        } catch (error) {
            console.error('Failed to load preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof UserPreferences, value: string) => {
        setPreferences(prev => ({ ...prev, [field]: value }));
        setMessage(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            await updatePreferences(preferences);
            setMessage({ type: 'success', text: 'Preferences updated successfully!' });
            onUpdate?.(preferences);
        } catch (error: any) {
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to update preferences' 
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Preferences</h2>
                <p className="text-slate-400 mt-1">
                    Customize your experience with currency, language, and regional settings.
                </p>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-3 rounded-lg text-sm ${
                    message.type === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Currency */}
                <div className="bg-[#111314] border border-slate-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Currency</h3>
                            <p className="text-sm text-slate-400">Your preferred currency for display</p>
                        </div>
                    </div>
                    <select
                        value={preferences.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition"
                    >
                        {CURRENCIES.map(currency => (
                            <option key={currency.code} value={currency.code}>
                                {currency.symbol} {currency.name} ({currency.code})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Language */}
                <div className="bg-[#111314] border border-slate-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                            <Languages className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Language</h3>
                            <p className="text-sm text-slate-400">Interface language preference</p>
                        </div>
                    </div>
                    <select
                        value={preferences.languagePref}
                        onChange={(e) => handleChange('languagePref', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition"
                    >
                        {LANGUAGES.map(language => (
                            <option key={language.code} value={language.code}>
                                {language.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Country */}
                <div className="bg-[#111314] border border-slate-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Globe className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Country</h3>
                            <p className="text-sm text-slate-400">Your country of residence</p>
                        </div>
                    </div>
                    <select
                        value={preferences.countryCode}
                        onChange={(e) => handleChange('countryCode', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition"
                    >
                        {COUNTRIES.map(country => (
                            <option key={country.code} value={country.code}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tax Residency */}
                <div className="bg-[#111314] border border-slate-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <MapPin className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Tax Residency</h3>
                            <p className="text-sm text-slate-400">For tax reporting purposes (optional)</p>
                        </div>
                    </div>
                    <input
                        type="text"
                        value={preferences.taxResidency || ''}
                        onChange={(e) => handleChange('taxResidency', e.target.value)}
                        placeholder="Enter tax residency country"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition"
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-medium rounded-lg transition flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Save Preferences
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}