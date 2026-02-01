'use client';

import { useState, useEffect } from 'react';
import {
    Save,
    FolderOpen,
    Trash2,
    Star,
    StarOff,
    Plus,
    X,
    Check,
    Layout
} from 'lucide-react';
import { getTemplates, createTemplate, deleteTemplate, type ChartTemplate, type ChartConfig } from '@/services/chartService';
import type { IndicatorConfig } from './indicators/IndicatorPanel';

interface ChartTemplateManagerProps {
    currentConfig: ChartConfig;
    activeIndicators: IndicatorConfig[];
    onApplyTemplate: (config: ChartConfig, indicators: IndicatorConfig[]) => void;
    className?: string;
}

export default function ChartTemplateManager({
    currentConfig,
    activeIndicators,
    onApplyTemplate,
    className = ''
}: ChartTemplateManagerProps) {
    const [templates, setTemplates] = useState<ChartTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [newName, setNewName] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Fetch templates
    useEffect(() => {
        async function loadTemplates() {
            try {
                const data = await getTemplates();
                setTemplates(data);
            } catch (error) {
                console.error('Failed to load templates:', error);
            } finally {
                setLoading(false);
            }
        }
        if (isOpen) loadTemplates();
    }, [isOpen]);

    const handleSaveTemplate = async () => {
        if (!newName.trim()) return;

        try {
            const template = await createTemplate({
                name: newName.trim(),
                config: {
                    ...currentConfig,
                    indicators: activeIndicators
                },
                isDefault: templates.length === 0
            });
            setTemplates(prev => [...prev, template]);
            setNewName('');
            setIsSaving(false);
        } catch (error) {
            console.error('Failed to save template:', error);
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        try {
            await deleteTemplate(templateId);
            setTemplates(prev => prev.filter(t => t.id !== templateId));
        } catch (error) {
            console.error('Failed to delete template:', error);
        }
    };

    const handleApplyTemplate = (template: ChartTemplate) => {
        const config = template.config;
        const indicators = (config.indicators || []) as IndicatorConfig[];
        onApplyTemplate(config, indicators);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition"
            >
                <Layout size={14} />
                <span>Templates</span>
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-[100] overflow-hidden">
                    {/* Header */}
                    <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Chart Templates</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-slate-700 rounded transition"
                        >
                            <X size={14} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Save Current */}
                    {isSaving ? (
                        <div className="p-3 border-b border-slate-700 bg-slate-800/50">
                            <input
                                type="text"
                                placeholder="Template name..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 mb-2"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsSaving(false)}
                                    className="flex-1 px-3 py-1.5 bg-slate-700 text-slate-300 rounded text-sm hover:bg-slate-600 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveTemplate}
                                    disabled={!newName.trim()}
                                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                    <Check size={14} />
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 border-b border-slate-700">
                            <button
                                onClick={() => setIsSaving(true)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                            >
                                <Save size={14} />
                                Save Current Configuration
                            </button>
                        </div>
                    )}

                    {/* Template List */}
                    <div className="max-h-64 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-slate-500">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                <FolderOpen size={24} className="mx-auto mb-2 opacity-50" />
                                No saved templates
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700">
                                {templates.map(template => (
                                    <div
                                        key={template.id}
                                        className="p-3 flex items-center gap-3 hover:bg-slate-800 group"
                                    >
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleApplyTemplate(template)}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white truncate">
                                                    {template.name}
                                                </span>
                                                {template.isDefault && (
                                                    <Star size={12} className="text-yellow-400" fill="currentColor" />
                                                )}
                                            </div>
                                            {template.description && (
                                                <p className="text-xs text-slate-500 truncate">
                                                    {template.description}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-500">
                                                {template.config.chartType || 'Default'} • {(template.config.indicators as any[])?.length || 0} indicators
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition"
                                        >
                                            <Trash2 size={14} className="text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-slate-700 bg-slate-800/30">
                        <p className="text-xs text-slate-500 text-center">
                            Templates save chart type, indicators, and colors
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
