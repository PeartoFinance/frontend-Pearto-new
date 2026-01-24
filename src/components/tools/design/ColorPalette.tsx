'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Palette, Copy, Check, RefreshCw } from 'lucide-react';

export default function ColorPalette() {
    const [baseColor, setBaseColor] = useState('#10b981');
    const [copied, setCopied] = useState<string | null>(null);

    const hexToHSL = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    };

    const hslToHex = (h: number, s: number, l: number) => {
        h = ((h % 360) + 360) % 360;
        s = Math.max(0, Math.min(100, s)) / 100;
        l = Math.max(0, Math.min(100, l)) / 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (h < 60) { r = c; g = x; }
        else if (h < 120) { r = x; g = c; }
        else if (h < 180) { g = c; b = x; }
        else if (h < 240) { g = x; b = c; }
        else if (h < 300) { r = x; b = c; }
        else { r = c; b = x; }

        const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const palette = useMemo(() => {
        const { h, s, l } = hexToHSL(baseColor);
        return {
            base: baseColor,
            complementary: hslToHex(h + 180, s, l),
            analogous1: hslToHex(h + 30, s, l),
            analogous2: hslToHex(h - 30, s, l),
            triadic1: hslToHex(h + 120, s, l),
            triadic2: hslToHex(h - 120, s, l),
            lighter: hslToHex(h, s, Math.min(l + 20, 95)),
            darker: hslToHex(h, s, Math.max(l - 20, 5)),
        };
    }, [baseColor]);

    const copyColor = async (color: string, key: string) => {
        await navigator.clipboard.writeText(color);
        setCopied(key);
        setTimeout(() => setCopied(null), 1500);
    };

    const generateRandom = () => {
        const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        setBaseColor(randomHex);
    };

    const ColorSwatch = ({ color, label, colorKey }: { color: string; label: string; colorKey: string }) => (
        <div
            onClick={() => copyColor(color, colorKey)}
            className="cursor-pointer group"
        >
            <div
                className="h-16 rounded-lg mb-2 transition-transform group-hover:scale-105"
                style={{ backgroundColor: color }}
            />
            <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    {color.toUpperCase()}
                    {copied === colorKey ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                        <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                    )}
                </span>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            title="Color Palette Generator"
            description="Generate harmonious color palettes from a base color"
            category="Design"
            results={
                <div className="space-y-4">
                    <p className="text-xs text-slate-500 text-center">Click any color to copy</p>

                    <div className="grid grid-cols-2 gap-4">
                        <ColorSwatch color={palette.base} label="Base" colorKey="base" />
                        <ColorSwatch color={palette.complementary} label="Complementary" colorKey="comp" />
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                        <p className="text-xs font-medium text-slate-500 mb-2">Analogous</p>
                        <div className="grid grid-cols-3 gap-2">
                            <ColorSwatch color={palette.analogous2} label="" colorKey="ana2" />
                            <ColorSwatch color={palette.base} label="" colorKey="base2" />
                            <ColorSwatch color={palette.analogous1} label="" colorKey="ana1" />
                        </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                        <p className="text-xs font-medium text-slate-500 mb-2">Triadic</p>
                        <div className="grid grid-cols-3 gap-2">
                            <ColorSwatch color={palette.triadic2} label="" colorKey="tri2" />
                            <ColorSwatch color={palette.base} label="" colorKey="base3" />
                            <ColorSwatch color={palette.triadic1} label="" colorKey="tri1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <ColorSwatch color={palette.lighter} label="Lighter" colorKey="light" />
                        <ColorSwatch color={palette.darker} label="Darker" colorKey="dark" />
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Base Color
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="color"
                            value={baseColor}
                            onChange={(e) => setBaseColor(e.target.value)}
                            className="w-16 h-12 rounded-lg cursor-pointer border-2 border-slate-200 dark:border-slate-700"
                        />
                        <input
                            type="text"
                            value={baseColor}
                            onChange={(e) => {
                                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                                    setBaseColor(e.target.value);
                                }
                            }}
                            placeholder="#10b981"
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono uppercase"
                        />
                    </div>
                </div>

                <button
                    onClick={generateRandom}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
                >
                    <RefreshCw className="w-4 h-4" />
                    Generate Random
                </button>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-2">Quick Presets</p>
                    <div className="flex gap-2 flex-wrap">
                        {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                            <button
                                key={color}
                                onClick={() => setBaseColor(color)}
                                className="w-8 h-8 rounded-lg border-2 border-white dark:border-slate-700 shadow-sm hover:scale-110 transition"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
