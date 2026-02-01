/**
 * Chart Service
 * API calls for chart drawings, templates, indicators, and AI analysis
 */

import { get, post, put, del } from './api';

// ============== TYPES ==============

export interface ChartDrawing {
    id: string;
    symbol: string;
    drawingType: string;
    data: Record<string, unknown>;
    isVisible: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ChartTemplate {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    config: ChartConfig;
    createdAt: string;
}

export interface ChartConfig {
    chartType?: 'candle' | 'area' | 'line' | 'bar';
    period?: string;
    interval?: string;
    indicators?: IndicatorConfig[];
    colors?: Record<string, string>;
    gridVisible?: boolean;
}

export interface IndicatorConfig {
    id: string;
    type: string;
    params: Record<string, number>;
    color?: string;
    isActive: boolean;
}

export interface IndicatorDefinition {
    id: string;
    name: string;
    category: 'trend' | 'momentum' | 'volatility' | 'volume';
    defaultParams: Record<string, number>;
    description: string;
}

export interface ChartAnalysis {
    success: boolean;
    analysis: string;
    symbol: string;
    timeframe: string;
    provider: string;
    error?: string;
}

export interface DetectedPattern {
    id: number;
    symbol: string;
    patternType: string;
    timeframe: string;
    data: Record<string, unknown>;
    confidence: number;
    direction: 'bullish' | 'bearish';
    detectedAt: string;
}

// ============== DRAWINGS ==============

/**
 * Get all drawings for a symbol
 */
export async function getDrawings(symbol: string): Promise<ChartDrawing[]> {
    return get<ChartDrawing[]>(`/chart/drawings/${symbol.toUpperCase()}`);
}

/**
 * Save a new drawing
 */
export async function saveDrawing(symbol: string, drawing: Partial<ChartDrawing>): Promise<ChartDrawing> {
    return post<ChartDrawing>(`/chart/drawings/${symbol.toUpperCase()}`, drawing);
}

/**
 * Update a drawing
 */
export async function updateDrawing(symbol: string, drawingId: string, data: Partial<ChartDrawing>): Promise<ChartDrawing> {
    return put<ChartDrawing>(`/chart/drawings/${symbol.toUpperCase()}/${drawingId}`, data);
}

/**
 * Delete a drawing
 */
export async function deleteDrawing(symbol: string, drawingId: string): Promise<{ message: string }> {
    return del<{ message: string }>(`/chart/drawings/${symbol.toUpperCase()}/${drawingId}`);
}

/**
 * Bulk save all drawings for a symbol
 */
export async function bulkSaveDrawings(symbol: string, drawings: Partial<ChartDrawing>[]): Promise<{ message: string }> {
    return post<{ message: string }>(`/chart/drawings/${symbol.toUpperCase()}/bulk`, { drawings });
}

// ============== TEMPLATES ==============

/**
 * Get all user templates
 */
export async function getTemplates(): Promise<ChartTemplate[]> {
    return get<ChartTemplate[]>('/chart/templates');
}

/**
 * Create a new template
 */
export async function createTemplate(template: Partial<ChartTemplate>): Promise<ChartTemplate> {
    return post<ChartTemplate>('/chart/templates', template);
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string): Promise<{ message: string }> {
    return del<{ message: string }>(`/chart/templates/${templateId}`);
}

// ============== INDICATORS ==============

/**
 * Get available indicators list
 */
export async function getAvailableIndicators(): Promise<IndicatorDefinition[]> {
    return get<IndicatorDefinition[]>('/chart/indicators');
}

/**
 * Get user's saved indicator settings
 */
export async function getIndicatorSettings(symbol?: string): Promise<IndicatorConfig[]> {
    const params = symbol ? `?symbol=${symbol.toUpperCase()}` : '';
    return get<IndicatorConfig[]>(`/chart/indicators/settings${params}`);
}

/**
 * Save indicator settings
 */
export async function saveIndicatorSettings(settings: Partial<IndicatorConfig> & { symbol?: string }): Promise<IndicatorConfig> {
    return post<IndicatorConfig>('/chart/indicators/settings', settings);
}

// ============== AI ANALYSIS ==============

/**
 * Get AI analysis for a chart
 */
export async function analyzeChart(
    symbol: string,
    chartData: {
        currentPrice?: number;
        changePercent?: number;
        high?: number;
        low?: number;
        volume?: number;
    },
    timeframe: string = '1D'
): Promise<ChartAnalysis> {
    return post<ChartAnalysis>(`/chart/analyze/${symbol.toUpperCase()}`, {
        chartData,
        timeframe
    });
}

// ============== PATTERNS ==============

/**
 * Get detected patterns for a symbol
 */
export async function getPatterns(symbol: string, timeframe: string = '1D'): Promise<DetectedPattern[]> {
    return get<DetectedPattern[]>(`/chart/patterns/${symbol.toUpperCase()}?timeframe=${timeframe}`);
}

// ============== EXPORT ==============

export default {
    // Drawings
    getDrawings,
    saveDrawing,
    updateDrawing,
    deleteDrawing,
    bulkSaveDrawings,
    // Templates
    getTemplates,
    createTemplate,
    deleteTemplate,
    // Indicators
    getAvailableIndicators,
    getIndicatorSettings,
    saveIndicatorSettings,
    // Analysis
    analyzeChart,
    getPatterns,
};
