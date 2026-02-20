/**
 * Fixes image URLs that might be pointing to local development servers
 * or have other issues.
 */
export function fixImageUrl(url: string | undefined | null): string {
    if (!url) return '';

    // If it's a blob or data URL, return as is
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;

    // Replace local IP/localhost with production API
    // backend is at https://apipearto.ashlya.com/api, but images might be at /static/...
    // user avatar example: http://192.168.1.71:5000/static/uploads/...

    // We want to replace the origin but keep the path
    const prodOrigin = 'https://apipearto.ashlya.com';

    if (url.includes('192.168.1.71:5000') || url.includes('localhost:5000')) {
        return url.replace(/http:\/\/(192\.168\.1\.71|localhost):5000/, prodOrigin);
    }

    // If it's a relative path starting with /static, prepend the API URL
    if (url.startsWith('/static/')) {
        return `${prodOrigin}${url}`;
    }

    return url;
}
