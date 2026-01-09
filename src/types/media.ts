/**
 * TV Channel Types
 */
export interface TVChannel {
    id: string;
    name: string;
    category: string;
    logo_url: string;
    stream_url: string;
    country_code: string;
    language: string;
    description: string;
    is_live: boolean;
    is_premium: boolean;
}

/**
 * Radio Station Types
 */
export interface RadioStation {
    id: number;
    name: string;
    stream_url: string;
    website_url?: string;
    logo_url?: string;
    country?: string;
    genre?: string;
    language?: string;
    bitrate?: string;
    description?: string;
}
