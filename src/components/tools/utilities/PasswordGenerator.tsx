'use client';

import { useState, useCallback } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Key, Copy, RefreshCw, Check } from 'lucide-react';

export default function PasswordGenerator() {
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generatePassword = useCallback(() => {
        let chars = '';
        if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers) chars += '0123456789';
        if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (!chars) {
            setPassword('Select at least one option');
            return;
        }

        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(result);
        setCopied(false);
    }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy');
        }
    };

    // Password strength calculation
    const getStrength = () => {
        let score = 0;
        if (length >= 8) score++;
        if (length >= 12) score++;
        if (length >= 16) score++;
        if (includeUppercase && includeLowercase) score++;
        if (includeNumbers) score++;
        if (includeSymbols) score++;

        if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
        if (score <= 4) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
        if (score <= 5) return { label: 'Strong', color: 'bg-emerald-500', width: '75%' };
        return { label: 'Very Strong', color: 'bg-emerald-600', width: '100%' };
    };

    const strength = getStrength();

    return (
        <CalculatorLayout
            title="Password Generator"
            description="Generate strong, secure passwords"
            category="Security"
            results={
                <div className="space-y-6">
                    {/* Generated Password */}
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-500">Generated Password</span>
                            <button
                                onClick={copyToClipboard}
                                disabled={!password}
                                className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg font-mono text-lg break-all min-h-[60px] flex items-center">
                            {password || <span className="text-slate-400">Click Generate</span>}
                        </div>
                    </div>

                    {/* Strength Meter */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Password Strength</span>
                            <span className={`font-medium ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${strength.color} transition-all`} style={{ width: strength.width }} />
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={generatePassword}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Generate Password
                    </button>
                </div>
            }
        >
            {/* Length */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Password Length: {length}
                </label>
                <input
                    type="range"
                    min={6}
                    max={32}
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>6</span>
                    <span>32</span>
                </div>
            </div>

            {/* Character Options */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Include Characters</label>

                {[
                    { label: 'Uppercase (A-Z)', checked: includeUppercase, onChange: setIncludeUppercase },
                    { label: 'Lowercase (a-z)', checked: includeLowercase, onChange: setIncludeLowercase },
                    { label: 'Numbers (0-9)', checked: includeNumbers, onChange: setIncludeNumbers },
                    { label: 'Symbols (!@#$%...)', checked: includeSymbols, onChange: setIncludeSymbols },
                ].map((option) => (
                    <div key={option.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <span className="text-sm text-slate-600 dark:text-slate-300">{option.label}</span>
                        <button
                            onClick={() => option.onChange(!option.checked)}
                            className={`w-12 h-6 rounded-full relative transition ${option.checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${option.checked ? 'left-6' : 'left-0.5'}`} />
                        </button>
                    </div>
                ))}
            </div>
        </CalculatorLayout>
    );
}
