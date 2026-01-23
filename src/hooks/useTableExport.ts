'use client';

import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

export interface ExportColumn {
    key: string;
    label: string;
    format?: 'text' | 'number' | 'currency' | 'percent' | 'largeNumber' | 'date';
}

interface ExportOptions {
    filename: string;
    title?: string;
    columns: ExportColumn[];
}

type ExportData = Record<string, unknown>[];

// Format value based on column type
function formatValue(value: unknown, format?: ExportColumn['format']): string {
    if (value == null) return '-';

    switch (format) {
        case 'currency':
            return typeof value === 'number'
                ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : String(value);
        case 'percent':
            return typeof value === 'number'
                ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
                : String(value);
        case 'number':
            return typeof value === 'number'
                ? value.toLocaleString()
                : String(value);
        case 'largeNumber':
            if (typeof value !== 'number') return String(value);
            if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
            if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
            if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
            if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
            return value.toLocaleString();
        case 'date':
            if (value instanceof Date) {
                return value.toLocaleDateString();
            }
            if (typeof value === 'string') {
                try {
                    return new Date(value).toLocaleDateString();
                } catch {
                    return value;
                }
            }
            return String(value);
        default:
            return String(value);
    }
}

// Get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part) => {
        if (acc && typeof acc === 'object' && part in acc) {
            return (acc as Record<string, unknown>)[part];
        }
        return undefined;
    }, obj);
}

export function useTableExport() {
    const exportToCSV = useCallback((data: ExportData, options: ExportOptions) => {
        const { filename, columns } = options;

        // Create header row
        const headers = columns.map(col => col.label);

        // Create data rows
        const rows = data.map(row =>
            columns.map(col => {
                const value = getNestedValue(row, col.key);
                return formatValue(value, col.format);
            })
        );

        // Build CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Create and download blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${filename}.csv`);
    }, []);

    const exportToExcel = useCallback((data: ExportData, options: ExportOptions) => {
        const { filename, title, columns } = options;

        // Prepare data for Excel
        const excelData = data.map(row => {
            const excelRow: Record<string, string> = {};
            columns.forEach(col => {
                const value = getNestedValue(row, col.key);
                excelRow[col.label] = formatValue(value, col.format);
            });
            return excelRow;
        });

        // Create workbook
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, title || 'Data');

        // Auto-size columns
        const colWidths = columns.map(col => ({
            wch: Math.max(
                col.label.length,
                ...data.map(row => {
                    const val = formatValue(getNestedValue(row, col.key), col.format);
                    return val.length;
                })
            ) + 2
        }));
        ws['!cols'] = colWidths;

        // Generate and download
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${filename}.xlsx`);
    }, []);

    const exportToJSON = useCallback((data: ExportData, options: ExportOptions) => {
        const { filename, columns } = options;

        // Create formatted JSON
        const jsonData = data.map(row => {
            const jsonRow: Record<string, unknown> = {};
            columns.forEach(col => {
                jsonRow[col.key] = getNestedValue(row, col.key);
            });
            return jsonRow;
        });

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        saveAs(blob, `${filename}.json`);
    }, []);

    const exportToPDF = useCallback((data: ExportData, options: ExportOptions) => {
        const { filename, title, columns } = options;

        // Create PDF document
        const doc = new jsPDF({
            orientation: columns.length > 5 ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Add title
        if (title) {
            doc.setFontSize(16);
            doc.setTextColor(16, 185, 129); // Emerald color
            doc.text(title, 14, 15);
        }

        // Add timestamp
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate color
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, title ? 22 : 15);

        // Prepare table data
        const headers = columns.map(col => col.label);
        const tableData = data.map(row =>
            columns.map(col => {
                const value = getNestedValue(row, col.key);
                return formatValue(value, col.format);
            })
        );

        // Generate table
        autoTable(doc, {
            head: [headers],
            body: tableData,
            startY: title ? 28 : 20,
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [16, 185, 129], // Emerald
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252], // Slate-50
            },
            margin: { top: 10, right: 14, bottom: 10, left: 14 },
        });

        // Save PDF
        doc.save(`${filename}.pdf`);
    }, []);

    const exportData = useCallback((
        format: 'csv' | 'excel' | 'json' | 'pdf',
        data: ExportData,
        options: ExportOptions
    ) => {
        switch (format) {
            case 'csv':
                exportToCSV(data, options);
                break;
            case 'excel':
                exportToExcel(data, options);
                break;
            case 'json':
                exportToJSON(data, options);
                break;
            case 'pdf':
                exportToPDF(data, options);
                break;
        }
    }, [exportToCSV, exportToExcel, exportToJSON, exportToPDF]);

    return {
        exportToCSV,
        exportToExcel,
        exportToJSON,
        exportToPDF,
        exportData,
    };
}

export default useTableExport;
