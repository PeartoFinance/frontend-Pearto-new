'use client';

import { useState, useRef } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { QrCode, Download, Copy, Check, Settings } from 'lucide-react';

export default function QRCodeGenerator() {
    const [text, setText] = useState('https://pearto.com');
    const [size, setSize] = useState(200);
    const [color, setColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [copied, setCopied] = useState(false);

    // Generate QR code URL using a public API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${color.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}`;

    const downloadQR = () => {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = 'qrcode.png';
        link.click();
    };

    const copyUrl = async () => {
        await navigator.clipboard.writeText(qrCodeUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <CalculatorLayout
            title="QR Code Generator"
            description="Generate QR codes for URLs, text, and more"
            category="Design"
            results={
                <div className="space-y-4">
                    {text ? (
                        <>
                            <div className="flex justify-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                                <img
                                    src={qrCodeUrl}
                                    alt="Generated QR Code"
                                    width={size}
                                    height={size}
                                    className="rounded-lg"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={downloadQR}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PNG
                                </button>
                                <button
                                    onClick={copyUrl}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-2">Encoded Content</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 break-all">
                                    {text.length > 100 ? text.slice(0, 100) + '...' : text}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">Enter text or URL to generate QR code</p>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Text or URL
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="https://example.com or any text"
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Size: {size}px
                    </label>
                    <input
                        type="range"
                        min={100}
                        max={400}
                        step={50}
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            QR Color
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono uppercase"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Background
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono uppercase"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Presets */}
                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Quick Presets
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            onClick={() => { setColor('#000000'); setBgColor('#ffffff'); }}
                            className="py-2 text-xs bg-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50"
                        >
                            Classic
                        </button>
                        <button
                            onClick={() => { setColor('#10b981'); setBgColor('#ffffff'); }}
                            className="py-2 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                        >
                            Green
                        </button>
                        <button
                            onClick={() => { setColor('#3b82f6'); setBgColor('#ffffff'); }}
                            className="py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        >
                            Blue
                        </button>
                        <button
                            onClick={() => { setColor('#ffffff'); setBgColor('#000000'); }}
                            className="py-2 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                        >
                            Dark
                        </button>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
