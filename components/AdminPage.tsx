// FIX: Removed reference to "vite/client" which was not found.
// The necessary types for import.meta.env are provided globally in App.tsx.
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoItem } from '../App';

// --- Type Definitions ---
export interface CollectionItem {
    id: number | string;
    url: string;
    prompt: string;
}
type AdminView = 'idle' | 'addingImage' | 'addingVideo';

type ToastNotification = {
    id: number;
    message: string;
    type: 'success' | 'error';
};

// Define the base URL for the API. Use Vite's environment variables with a fallback for local development.
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5001';


// --- Helper Functions ---
const convertGoogleDriveUrl = (url: string, type: 'image' | 'video'): string | null => {
    const regex = /\/file\/d\/([a-zA-Z0-9_-]{25,})|id=([a-zA-Z0-9_-]{25,})|uc\?id=([a-zA-Z0-9_-]{25,})/;
    const match = url.match(regex);

    if (match && url.includes('drive.google.com')) {
        const fileId = match[1] || match[2] || match[3];
        if (fileId) {
            if (type === 'image') {
                return `https://drive.google.com/uc?export=download&id=${fileId}`;
            }
            if (type === 'video') {
                return `https://drive.google.com/file/d/${fileId}/preview`;
            }
        }
    }
    return null;
};

const getYouTubeEmbedUrl = (url: string): string | null => {
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

const VideoPlayer: React.FC<{ url: string }> = ({ url }) => {
    const driveEmbedUrl = convertGoogleDriveUrl(url, 'video');
    if (driveEmbedUrl) {
        return <iframe src={driveEmbedUrl} title="Video Preview" frameBorder="0" allow="autoplay" allowFullScreen className="w-full h-full"></iframe>;
    }
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const embedUrl = getYouTubeEmbedUrl(url);
        if (embedUrl) {
            return <iframe src={embedUrl} title="Video Preview" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>;
        }
    }
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return <video src={url} controls className="w-full h-full object-contain bg-black"></video>;
    }
    
    if(url.includes('x.com') || url.includes('twitter.com') || url.includes('threads.net')) {
         return <div className="w-full h-full flex items-center justify-center text-center p-4"><p className="text-neutral-500">Social media links are not supported for video.<br/>Please use a YouTube, Google Drive, or direct video link (.mp4).</p></div>;
    }

    return <div className="w-full h-full flex items-center justify-center text-center p-4"><p className="text-neutral-500">Unsupported URL. <br/>Preview works for YouTube, GDrive, .mp4, .webm, & .ogg.</p></div>;
};

// --- Style Constants ---
const primaryButtonClasses = "font-permanent-marker text-xl text-center text-black bg-yellow-400 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:-rotate-2 hover:bg-yellow-300 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryButtonClasses = "font-permanent-marker text-lg text-center text-white bg-white/10 backdrop-blur-sm border-2 border-white/80 py-2 px-6 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:rotate-2 hover:bg-white hover:text-black";
const smallButtonClasses = "text-sm font-bold text-black bg-yellow-400 py-1 px-3 rounded-sm transform transition-transform duration-150 hover:scale-110";
const smallDangerButtonClasses = "text-sm font-bold text-white bg-red-600 py-1 px-3 rounded-sm transform transition-transform duration-150 hover:scale-110";
const dangerButtonClasses = "font-permanent-marker text-xl text-center text-white bg-red-600 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:-rotate-2 hover:bg-red-500 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)]";

// --- Modal Components ---
const EditImageModal: React.FC<{ item: CollectionItem, onSave: (item: CollectionItem) => Promise<void>, onClose: () => void }> = ({ item, onSave, onClose }) => {
    const [editedUrl, setEditedUrl] = useState(item.url.startsWith('data:') ? '' : item.url);
    const [editedPrompt, setEditedPrompt] = useState(item.prompt);
    const [preview, setPreview] = useState<string | null>(item.url);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const processFile = (file: File) => {
        if (file && ["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setEditedUrl(''); // Clear URL field on upload
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please upload a valid image file (PNG, JPG, WEBP).");
        }
    };
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handlePreviewUrl = (url: string) => {
        if (!url.trim()) return;

        const googleDriveUrl = convertGoogleDriveUrl(url, 'image');
        setPreview(googleDriveUrl || url);
    };

    const handleSave = () => {
        if (preview && editedPrompt.trim()) {
            onSave({ ...item, url: preview, prompt: editedPrompt });
        } else {
            alert("Please ensure there is a preview image and the prompt is not empty.");
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <input type="file" ref={editFileInputRef} onChange={handleFileUpload} className="hidden" accept="image/png,image/jpeg,image/webp" />
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 w-full max-w-3xl flex flex-col md:flex-row gap-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex-1 space-y-6">
                    <h3 className="text-3xl font-permanent-marker text-yellow-400">Edit Image</h3>
                    <div>
                        <label className="font-permanent-marker text-neutral-300 text-lg">Image Source</label>
                        <div className="mt-2 space-y-4">
                            <div className="flex gap-2">
                                <input type="url" value={editedUrl} onChange={(e) => setEditedUrl(e.target.value)} placeholder="Paste new URL..." className="flex-grow p-3 bg-neutral-800 border-2 border-neutral-700 rounded-md" />
                                <button onClick={() => handlePreviewUrl(editedUrl)} className={`${secondaryButtonClasses} text-sm px-4`}>
                                    Preview
                                </button>
                            </div>
                             <p className="text-xs text-neutral-500 mt-1">For best results, use a direct image URL (ending in .jpg, .png) or a Google Drive link.</p>
                            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-700" /></div><div className="relative flex justify-center"><span className="bg-neutral-900 px-2 text-sm text-neutral-500">OR</span></div></div>
                            <button onClick={() => editFileInputRef.current?.click()} className={`${secondaryButtonClasses} w-full`}>Upload New File</button>
                        </div>
                    </div>
                    <div>
                        <label className="font-permanent-marker text-neutral-300 text-lg">Prompt</label>
                        <textarea value={editedPrompt} onChange={(e) => setEditedPrompt(e.target.value)} className="w-full h-24 p-3 mt-2 bg-neutral-800 border-2 border-neutral-700 rounded-md" />
                    </div>
                    <div className="flex gap-4"><button onClick={handleSave} className={`${primaryButtonClasses} text-lg`}>Save</button><button onClick={onClose} className={secondaryButtonClasses}>Cancel</button></div>
                </div>
                <div className="w-full md:w-1/3 h-64 flex items-center justify-center bg-neutral-800/50 border-2 border-dashed border-neutral-700 rounded-lg overflow-hidden">
                    {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" onError={() => setPreview(null)} /> : <p className="text-neutral-500">Preview</p>}
                </div>
            </motion.div>
        </motion.div>
    );
};

const EditVideoModal: React.FC<{ item: VideoItem, onSave: (item: VideoItem) => Promise<void>, onClose: () => void }> = ({ item, onSave, onClose }) => {
    const [editedUrl, setEditedUrl] = useState(item.url);
    const [editedScript, setEditedScript] = useState(item.script);
    const [previewUrl, setPreviewUrl] = useState(item.url);

    const handleSave = () => {
        if (!editedUrl.trim()) { alert("Please enter a video URL."); return; }
        if (!editedScript.trim()) { alert("Please enter a script."); return; }
        onSave({ ...item, url: editedUrl, script: editedScript });
    };

    return (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 w-full max-w-4xl flex flex-col md:flex-row gap-8 max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex-1 flex flex-col space-y-6 overflow-y-auto">
                    <h3 className="text-3xl font-permanent-marker text-yellow-400">Edit Video</h3>
                    <div>
                        <label className="font-permanent-marker text-neutral-300 text-lg">Video URL</label>
                        <div className="flex gap-2 mt-2">
                             <input type="url" value={editedUrl} onChange={(e) => setEditedUrl(e.target.value)} className="flex-grow p-3 bg-neutral-800 border-2 border-neutral-700 rounded-md" />
                             <button onClick={() => setPreviewUrl(editedUrl)} className={`${secondaryButtonClasses} text-sm px-4`}>Preview</button>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">Use YouTube, Google Drive, or direct video links (.mp4). Social media links like X/Threads are not supported for video.</p>
                    </div>
                    <div>
                        <label className="font-permanent-marker text-neutral-300 text-lg">Script</label>
                        <textarea value={editedScript} onChange={(e) => setEditedScript(e.target.value)} className="w-full h-32 p-3 mt-2 bg-neutral-800 border-2 border-neutral-700 rounded-md" />
                    </div>
                    <div className="flex gap-4 mt-auto pt-4"><button onClick={handleSave} className={`${primaryButtonClasses} text-lg`}>Save</button><button onClick={onClose} className={secondaryButtonClasses}>Cancel</button></div>
                </div>
                 <div className="w-full md:w-1/2 h-64 md:h-auto flex items-center justify-center bg-neutral-800/50 border-2 border-dashed border-neutral-700 rounded-lg overflow-hidden">
                    {previewUrl ? <VideoPlayer url={previewUrl} /> : <p className="text-neutral-500">Video Preview</p>}
                </div>
            </motion.div>
        </motion.div>
    );
};

const ConfirmationModal: React.FC<{ onConfirm: () => void, onCancel: () => void }> = ({ onConfirm, onCancel }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
        onClick={onCancel}
    >
        <motion.div
            initial={{ y: 50, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 50, scale: 0.95 }}
            className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 w-full max-w-md text-center"
            onClick={(e) => e.stopPropagation()}
        >
            <h3 className="text-3xl font-permanent-marker text-yellow-400">Are you sure?</h3>
            <p className="text-neutral-300 mt-4 mb-8">This action cannot be undone. The item will be permanently deleted.</p>
            <div className="flex justify-center gap-6">
                <button onClick={onCancel} className={secondaryButtonClasses}>
                    Cancel
                </button>
                <button onClick={onConfirm} className={dangerButtonClasses}>
                    Delete
                </button>
            </div>
        </motion.div>
    </motion.div>
);

const ToastContainer: React.FC<{ notifications: ToastNotification[], onDismiss: (id: number) => void }> = ({ notifications, onDismiss }) => (
    <div className="fixed bottom-4 right-4 z-[100] w-80 space-y-3">
        <AnimatePresence>
            {notifications.map(toast => (
                <motion.div
                    key={toast.id}
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className={`relative p-4 rounded-md shadow-lg text-white border ${toast.type === 'success' ? 'bg-green-600/80 border-green-500' : 'bg-red-600/80 border-red-500'}`}
                >
                    <p className="font-bold text-sm">{toast.message}</p>
                    <button onClick={() => onDismiss(toast.id)} className="absolute top-1 right-1 text-white/70 hover:text-white">&times;</button>
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
);


// --- Main Component ---
interface AdminPageProps {
    collectionItems: CollectionItem[];
    onCollectionItemsChange: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
    videoItems: VideoItem[];
    onVideoItemsChange: React.Dispatch<React.SetStateAction<VideoItem[]>>;
    onLogout: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ collectionItems, onCollectionItemsChange, videoItems, onVideoItemsChange, onLogout }) => {
    const [view, setView] = useState<AdminView>('idle');
    const [editingImage, setEditingImage] = useState<CollectionItem | null>(null);
    const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'image' | 'video', id: number | string } | null>(null);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    
    // Form states
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImagePrompt, setNewImagePrompt] = useState('');
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
    const newImageFileInputRef = useRef<HTMLInputElement>(null);
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [newVideoScript, setNewVideoScript] = useState('');
    const [newVideoPreviewUrl, setNewVideoPreviewUrl] = useState<string | null>(null);

    const addToast = (message: string, type: 'success' | 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const processFile = (file: File, callback: (dataUrl: string) => void) => {
        if (file && ["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            const reader = new FileReader();
            reader.onloadend = () => callback(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            addToast("Please upload a valid image file (PNG, JPG, WEBP).", 'error');
        }
    };

    const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            processFile(e.target.files[0], (dataUrl) => {
                setNewImagePreview(dataUrl);
                setNewImageUrl('');
            });
        }
    };

    const handlePreviewUrl = (url: string) => {
        if (!url.trim()) return;
        const googleDriveUrl = convertGoogleDriveUrl(url, 'image');
        setNewImagePreview(googleDriveUrl || url);
    };
    
    const handleSaveNewImage = async () => {
        if (!newImagePreview || !newImagePrompt.trim()) {
            addToast("Image preview and prompt are required.", 'error');
            return;
        }
        
        const newImagePayload = {
            url: newImagePreview,
            prompt: newImagePrompt,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/images`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newImagePayload)
            });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            const savedImage = await response.json();
            
            onCollectionItemsChange(prev => [savedImage, ...prev]);
            addToast('Image saved successfully!', 'success');
            
            setNewImageUrl(''); setNewImagePrompt(''); setNewImagePreview(null);
            setView('idle');
        } catch (error) {
            console.error("Failed to save new image:", error);
            addToast(error instanceof Error ? error.message : 'Failed to save image.', 'error');
        }
    };

    const handleUpdateImage = async (item: CollectionItem) => {
         try {
            const response = await fetch(`${API_BASE_URL}/api/images/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: item.url, prompt: item.prompt })
            });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            const updatedImage = await response.json();
            
            onCollectionItemsChange(prev => prev.map(i => i.id === updatedImage.id ? updatedImage : i));
            setEditingImage(null);
            addToast('Image updated successfully!', 'success');
        } catch (error) {
            console.error("Failed to update image:", error);
            addToast(error instanceof Error ? error.message : 'Failed to update image.', 'error');
        }
    };
    
    const handleDeleteRequest = (type: 'image' | 'video', id: number | string) => {
        setItemToDelete({ type, id });
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const { type, id } = itemToDelete;
        
        const endpoint = type === 'image' ? `/api/images/${id}` : `/api/videos/${id}`;
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

            if (type === 'image') {
                onCollectionItemsChange(prev => prev.filter(i => i.id !== id));
            } else {
                onVideoItemsChange(prev => prev.filter(v => v.id !== id));
            }
            addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`, 'success');
        } catch (error) {
             console.error(`Failed to delete ${type}:`, error);
             addToast(error instanceof Error ? error.message : `Failed to delete ${type}.`, 'error');
        } finally {
            setItemToDelete(null);
        }
    };

    const handleSaveNewVideo = async () => {
        if (!newVideoUrl.trim() || !newVideoScript.trim()) {
            addToast("Video URL and script are required.", 'error');
            return;
        }

        const newVideoPayload = { url: newVideoUrl, script: newVideoScript };
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newVideoPayload)
            });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            const savedVideo = await response.json();

            onVideoItemsChange(prev => [savedVideo, ...prev]);
            addToast('Video saved successfully!', 'success');
            
            setNewVideoUrl(''); setNewVideoScript(''); setNewVideoPreviewUrl(null);
            setView('idle');
        } catch (error) {
             console.error("Failed to save new video:", error);
             addToast(error instanceof Error ? error.message : 'Failed to save video.', 'error');
        }
    };

    const handleUpdateVideo = async (item: VideoItem) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/videos/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: item.url, script: item.script })
            });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            const updatedVideo = await response.json();

            onVideoItemsChange(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
            setEditingVideo(null);
            addToast('Video updated successfully!', 'success');
        } catch (error) {
            console.error("Failed to update video:", error);
            addToast(error instanceof Error ? error.message : 'Failed to update video.', 'error');
        }
    };

    const motionProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 }
    };

    return (
        <div className="z-10 w-full h-full p-4 md:p-8 overflow-y-auto">
            <input type="file" ref={newImageFileInputRef} onChange={handleNewImageUpload} className="hidden" accept="image/png,image/jpeg,image/webp" />

            <motion.div className="max-w-6xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="relative text-center mb-12">
                    <h2 className="text-5xl md:text-8xl font-caveat font-bold">Admin Panel</h2>
                    <p className="font-permanent-marker text-neutral-300 mt-4 text-xl">Manage App Content</p>
                    <button 
                        onClick={onLogout}
                        className="absolute top-0 right-0 font-permanent-marker text-lg text-center text-white bg-white/10 backdrop-blur-sm border-2 border-white/80 py-2 px-6 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:rotate-2 hover:bg-white hover:text-black"
                    >
                        Logout
                    </button>
                </div>

                <div className="mb-12 min-h-[100px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {view === 'idle' && (
                            <motion.div key="idle" {...motionProps} className="flex flex-col sm:flex-row items-center justify-center gap-8">
                                <button onClick={() => setView('addingImage')} className={primaryButtonClasses}>+ Add New Image</button>
                                <button onClick={() => setView('addingVideo')} className={primaryButtonClasses}>+ Add New Video</button>
                            </motion.div>
                        )}
                        {view === 'addingImage' && (
                            <motion.div key="addImageForm" {...motionProps} className="w-full">
                                <section className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                                    <h3 className="text-3xl font-permanent-marker text-yellow-400 mb-6">Add New Image</h3>
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="flex-1 space-y-6">
                                            <div>
                                                <label className="font-permanent-marker text-neutral-300 text-lg">Image Source</label>
                                                <div className="mt-2 space-y-4">
                                                    <div className="flex gap-2">
                                                        <input type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="flex-grow p-3 bg-neutral-800 border-2 border-neutral-700 rounded-md" placeholder="Paste direct image or Google Drive URL..." />
                                                        <button onClick={() => handlePreviewUrl(newImageUrl)} className={`${secondaryButtonClasses} text-sm px-4`}>
                                                            Preview
                                                        </button>
                                                    </div>
                                                     <p className="text-xs text-neutral-500 mt-1">For best results, use a direct image URL (ending in .jpg, .png) or a Google Drive link.</p>
                                                    <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-700" /></div><div className="relative flex justify-center"><span className="bg-neutral-900 px-2 text-sm text-neutral-500">OR</span></div></div>
                                                    <button onClick={() => newImageFileInputRef.current?.click()} className={`${secondaryButtonClasses} w-full`}>Upload from Computer</button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="font-permanent-marker text-neutral-300 text-lg">Prompt</label>
                                                <textarea value={newImagePrompt} onChange={(e) => setNewImagePrompt(e.target.value)} className="w-full h-24 p-3 mt-2 bg-neutral-800 border-2 border-neutral-700 rounded-md" placeholder="A majestic dragon..." />
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={handleSaveNewImage} className={`${primaryButtonClasses} text-lg`} disabled={!newImagePreview || !newImagePrompt.trim()}>Save</button>
                                                <button onClick={() => setView('idle')} className={secondaryButtonClasses}>Cancel</button>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-1/3 h-64 flex items-center justify-center bg-neutral-800/50 border-2 border-dashed border-neutral-700 rounded-lg overflow-hidden">
                                            {newImagePreview ? (
                                                <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => {addToast('Could not load preview. The URL might be incorrect or blocked.', 'error'); setNewImagePreview(null)}} />
                                            ) : (
                                                <p className="text-neutral-500">Preview</p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}
                        {view === 'addingVideo' && (
                             <motion.div key="addVideoForm" {...motionProps} className="w-full">
                                <section className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                                    <h3 className="text-3xl font-permanent-marker text-yellow-400 mb-6">Add New Video</h3>
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="flex-1 space-y-6">
                                            <label className="font-permanent-marker text-neutral-300 text-lg">Video URL</label>
                                            <div className="flex gap-2 mt-2">
                                                <input type="url" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} className="flex-grow p-3 bg-neutral-800 border-2 border-neutral-700 rounded-md" placeholder="YouTube, Google Drive, or direct video URL" />
                                                <button onClick={() => setNewVideoPreviewUrl(newVideoUrl)} className={`${secondaryButtonClasses} text-sm px-4`}>Preview</button>
                                            </div>
                                            <p className="text-xs text-neutral-500 mt-2">Use YouTube, Google Drive, or direct video links (.mp4). Social media links like X/Threads are not supported for video.</p>
                                            <div>
                                                <label className="font-permanent-marker text-neutral-300 text-lg">Script</label>
                                                <textarea value={newVideoScript} onChange={(e) => setNewVideoScript(e.target.value)} className="w-full h-32 p-3 mt-2 bg-neutral-800 border-2 border-neutral-700 rounded-md" placeholder="The video starts..." />
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={handleSaveNewVideo} className={`${primaryButtonClasses} text-lg`} disabled={!newVideoUrl.trim() || !newVideoScript.trim()}>Save</button>
                                                <button onClick={() => setView('idle')} className={secondaryButtonClasses}>Cancel</button>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-1/2 h-64 md:h-auto flex items-center justify-center bg-neutral-800/50 border-2 border-dashed border-neutral-700 rounded-lg overflow-hidden">{newVideoPreviewUrl ? <VideoPlayer url={newVideoPreviewUrl} /> : <p className="text-neutral-500">Video Preview</p>}</div>
                                    </div>
                                </section>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <section className="mb-16">
                    <h3 className="text-4xl font-permanent-marker text-yellow-400 mb-6 border-b-2 border-neutral-800 pb-2">Current Gallery</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {collectionItems.map(item => (
                                <motion.div 
                                    key={item.id} 
                                    layout 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                    transition={{ type: 'spring', duration: 0.5 }}
                                    className="relative overflow-hidden rounded-lg group aspect-square bg-neutral-800"
                                >
                                    <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/70 p-2 flex-col justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity flex">
                                        <p className="text-xs font-semibold line-clamp-4">"{item.prompt}"</p>
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingImage(item)} className={smallButtonClasses}>Edit</button>
                                            <button onClick={() => handleDeleteRequest('image', item.id)} className={smallDangerButtonClasses}>Delete</button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>
                
                <section>
                    <h3 className="text-4xl font-permanent-marker text-yellow-400 mb-6 border-b-2 border-neutral-800 pb-2">Current Videos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {videoItems.map(item => (
                                <motion.div 
                                    key={item.id} 
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                    transition={{ type: 'spring', duration: 0.5 }}
                                    className="relative overflow-hidden rounded-lg group bg-neutral-800 border border-neutral-700"
                                >
                                    <div className="aspect-video bg-black">
                                        <VideoPlayer url={item.url} />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-neutral-400 line-clamp-3 h-[60px]">"{item.script}"</p>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button onClick={() => setEditingVideo(item)} className={smallButtonClasses}>Edit</button>
                                            <button onClick={() => handleDeleteRequest('video', item.id)} className={smallDangerButtonClasses}>Delete</button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>

            </motion.div>
            
            <ToastContainer notifications={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

            <AnimatePresence>
                {editingImage && <EditImageModal item={editingImage} onSave={handleUpdateImage} onClose={() => setEditingImage(null)} />}
                {editingVideo && <EditVideoModal item={editingVideo} onSave={handleUpdateVideo} onClose={() => setEditingVideo(null)} />}
                {itemToDelete && <ConfirmationModal onConfirm={handleConfirmDelete} onCancel={() => setItemToDelete(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default AdminPage;