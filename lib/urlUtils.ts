/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Converts a Google Drive sharing URL into a direct download (for images) or preview (for videos) URL.
 * @param url The original Google Drive URL.
 * @param type The content type, either 'image' or 'video'.
 * @returns The converted URL string or null if the URL is not a valid Google Drive link.
 */
export const convertGoogleDriveUrl = (url: string, type: 'image' | 'video'): string | null => {
    // This regex captures the file ID from various Google Drive URL formats.
    const regex = /\/file\/d\/([a-zA-Z0-9_-]{25,})|id=([a-zA-Z0-9_-]{25,})|uc\?id=([a-zA-Z0-9_-]{25,})/;
    const match = url.match(regex);

    if (match && url.includes('drive.google.com')) {
        const fileId = match[1] || match[2] || match[3];
        if (fileId) {
            if (type === 'image') {
                // Returns a direct download link suitable for <img> tags.
                return `https://drive.google.com/uc?export=download&id=${fileId}`;
            }
            if (type === 'video') {
                // Returns a preview/embed link suitable for <iframe> tags.
                return `https://drive.google.com/file/d/${fileId}/preview`;
            }
        }
    }
    return null;
};


/**
 * Converts a standard YouTube URL (watch, youtu.be, embed, shorts) into an embeddable URL.
 * @param url The original YouTube URL.
 * @returns The embeddable URL string or null if the URL is invalid.
 */
export const getYouTubeEmbedUrl = (url: string): string | null => {
    let videoId: string | null = null;
    try {
        const patterns = [
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
            /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                videoId = match[1];
                break;
            }
        }
    } catch (e) {
        console.error("Error parsing video URL:", url, e);
        return null;
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};
