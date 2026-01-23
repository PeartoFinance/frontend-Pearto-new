'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileJson, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { useTableExport, type ExportColumn } from '@/hooks/useTableExport';

export interface TableExportButtonProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    columns: ExportColumn[];
    filename: string;
    title?: string;
    className?: string;
    variant?: 'default' | 'compact' | 'icon';
    disabled?: boolean;
}

type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

interface FormatOption {
    id: ExportFormat;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
    {
        id: 'csv',
        label: 'CSV',
        icon: <FileText size={16} />,
        description: 'Comma-separated values'
    },
    {
        id: 'excel',
        label: 'Excel',
        icon: <FileSpreadsheet size={16} />,
        description: 'Microsoft Excel (.xlsx)'
    },
    {
        id: 'json',
        label: 'JSON',
        icon: <FileJson size={16} />,
        description: 'JavaScript Object Notation'
    },
    {
        id: 'pdf',
        label: 'PDF',
        icon: <FileText size={16} />,
        description: 'Portable Document Format'
    }
];

export function TableExportButton({
    data,
    columns,
    filename,
    title,
    className = '',
    variant = 'default',
    disabled = false
}: TableExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [exporting, setExporting] = useState<ExportFormat | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { exportData } = useTableExport();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = async (format: ExportFormat) => {
        if (data.length === 0) return;

        setExporting(format);
        try {
            // Small delay for UI feedback
            await new Promise(resolve => setTimeout(resolve, 100));
            exportData(format, data, { filename, title, columns });
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(null);
            setIsOpen(false);
        }
    };

    const isDisabled = disabled || data.length === 0;

    if (variant === 'icon') {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isDisabled}
                    className={`p-2 rounded-lg transition ${isDisabled
                        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        : 'text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        } ${className}`}
                    title="Export data"
                >
                    <Download size={18} />
                </button>

                {isOpen && !isDisabled && (
                    <DropdownMenu
                        options={FORMAT_OPTIONS}
                        exporting={exporting}
                        onSelect={handleExport}
                    />
                )}
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isDisabled}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition ${isDisabled
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        } ${className}`}
                >
                    <Download size={14} />
                    Export
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && !isDisabled && (
                    <DropdownMenu
                        options={FORMAT_OPTIONS}
                        exporting={exporting}
                        onSelect={handleExport}
                    />
                )}
            </div>
        );
    }

    // Default variant
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isDisabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${isDisabled
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    } ${className}`}
            >
                <Download size={16} />
                Export
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !isDisabled && (
                <DropdownMenu
                    options={FORMAT_OPTIONS}
                    exporting={exporting}
                    onSelect={handleExport}
                />
            )}
        </div>
    );
}

function DropdownMenu({
    options,
    exporting,
    onSelect
}: {
    options: FormatOption[];
    exporting: ExportFormat | null;
    onSelect: (format: ExportFormat) => void;
}) {
    return (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2">
                <p className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Export Format
                </p>
                {options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        disabled={exporting !== null}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-50"
                    >
                        <div className={`p-1.5 rounded-lg ${option.id === 'csv' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                            option.id === 'excel' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                                option.id === 'json' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                    'bg-red-100 dark:bg-red-900/30 text-red-600'
                            }`}>
                            {exporting === option.id ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                option.icon
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white text-sm">
                                {option.label}
                            </p>
                            <p className="text-xs text-slate-500">
                                {option.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export { type ExportColumn };
export default TableExportButton;
