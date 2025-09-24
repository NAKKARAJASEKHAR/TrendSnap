/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { CollectionItem } from '../components/AdminPage';
import { VideoItem } from '../App';

// --- API Configuration ---

// Your frontend application needs to know the URL of your hosted backend server.
// The best practice is to provide this URL via an environment variable.
//
// In your hosting environment (like Netlify, Vercel, etc.), create an environment variable named:
// VITE_BACKEND_URL
//
// Set its value to the full URL of your deployed server.js API.
// Example: 'https://your-trendsnap-backend.onrender.com/api'
//
// IMPORTANT: This is the URL for your server, NOT your MongoDB connection string (MONGO_URI).
// The MONGO_URI is a secret key that should only be used by your backend server.
// Never expose your MONGO_URI in frontend code.

// The base URL for the backend API.
// It prioritizes an environment variable, falling back to a local relative path for development.
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const API_BASE_URL = env.VITE_BACKEND_URL || '/api';


/**
 * A helper function to process the response from the fetch API.
 * It checks for errors and parses the JSON body.
 * @param response The raw Response object from a fetch call.
 * @returns A promise that resolves to the parsed JSON data.
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorText = await response.text();
        // Provide a more informative error for developers
        console.error(`API request to ${response.url} failed with status ${response.status}: ${errorText}`);
        throw new Error(`The server returned an error. Please try again later.`);
    }
    // Handle responses that might not have a body (e.g., a 204 No Content from a DELETE request)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json() as Promise<T>;
    }
    // Return a resolved promise with 'undefined' if there's no JSON body
    return Promise.resolve(undefined as T);
}

// --- PRODUCTION-READY API FUNCTIONS ---

/**
 * Uploads an image file to the backend server.
 * @param file The File object to upload.
 * @returns A promise that resolves to the public URL of the uploaded file, returned by the server.
 */
export const uploadImage = async (file: File): Promise<string> => {
    console.log(`[API] Uploading file: ${file.name}`);
    const formData = new FormData();
    formData.append('file', file); // The backend will look for a 'file' field

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
    });

    const result = await handleResponse<{ url: string }>(response);
    return result.url;
};

// --- Collection Items API ---

export const getCollectionItems = async (): Promise<CollectionItem[]> => {
    console.log('[API] Fetching collection items...');
    const response = await fetch(`${API_BASE_URL}/collection`);
    return handleResponse<CollectionItem[]>(response);
};

export const addCollectionItem = async (item: Omit<CollectionItem, 'id'>): Promise<CollectionItem> => {
    console.log('[API] Adding new collection item:', item);
    const response = await fetch(`${API_BASE_URL}/collection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    return handleResponse<CollectionItem>(response);
};

export const updateCollectionItem = async (item: CollectionItem): Promise<CollectionItem> => {
     console.log('[API] Updating collection item:', item);
     const response = await fetch(`${API_BASE_URL}/collection/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    return handleResponse<CollectionItem>(response);
};

export const deleteCollectionItem = async (id: string | number): Promise<void> => {
    console.log(`[API] Deleting collection item with id: ${id}`);
    const response = await fetch(`${API_BASE_URL}/collection/${id}`, {
        method: 'DELETE',
    });
    await handleResponse<void>(response);
};

// --- Video Items API ---

export const getVideoItems = async (): Promise<VideoItem[]> => {
    console.log('[API] Fetching video items...');
    const response = await fetch(`${API_BASE_URL}/videos`);
    return handleResponse<VideoItem[]>(response);
};

export const addVideoItem = async (item: Omit<VideoItem, 'id'>): Promise<VideoItem> => {
    console.log('[API] Adding new video item:', item);
    const response = await fetch(`${API_BASE_URL}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    return handleResponse<VideoItem>(response);
};

export const updateVideoItem = async (item: VideoItem): Promise<VideoItem> => {
     console.log('[API] Updating video item:', item);
     const response = await fetch(`${API_BASE_URL}/videos/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    return handleResponse<VideoItem>(response);
};

export const deleteVideoItem = async (id: string | number): Promise<void> => {
    console.log(`[API] Deleting video item with id: ${id}`);
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
        method: 'DELETE',
    });
    await handleResponse<void>(response);
};