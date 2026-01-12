/**
 * Tools API Service
 * Fetches tool settings from backend with country context
 * NOTE: All modifications go through admin routes (/api/admin/tools)
 */

import { get } from './api';

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
 * Get all tool settings (for display, not admin)
 */
export async function getAllTools(): Promise<ToolSetting[]> {
    return get<ToolSetting[]>('/tools/settings');
}
