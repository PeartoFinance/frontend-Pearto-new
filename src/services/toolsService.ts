/**
 * Tools API Service
 * Fetches tool settings from backend with country context
 */

import { get, put } from './api';

export interface ToolSetting {
    tool_slug: string;
    tool_name: string;
    category: string;
    enabled: boolean;
    order_index: number;
    is_implemented: boolean;
    country_code: string;
}

/**
 * Get all enabled tools (public)
 */
export async function getEnabledTools(): Promise<ToolSetting[]> {
    return get<ToolSetting[]>('/tools/settings/enabled');
}

/**
 * Get all tool settings (admin)
 */
export async function getAllTools(): Promise<ToolSetting[]> {
    return get<ToolSetting[]>('/tools/settings');
}

/**
 * Toggle tool enabled status
 */
export async function toggleTool(slug: string, enabled: boolean): Promise<ToolSetting> {
    return put<ToolSetting>(`/tools/settings/${slug}`, { enabled });
}

/**
 * Bulk toggle tools
 */
export async function bulkToggleTools(slugs: string[], enabled: boolean): Promise<{ success: boolean; updated: number }> {
    return put('/tools/settings/bulk', { slugs, enabled });
}
