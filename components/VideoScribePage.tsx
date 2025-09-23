/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VideoItem } from '../App';

/**
 * Converts a standard YouTube URL (watch or youtu.be) into an embeddable URL.
 * @param url The original YouTube URL.
 * @returns The embeddable URL string or null if the URL is invalid.
 */
const getYouTubeEmbedUrl = (url: string): string | null => {
    let videoId: string | null = null;
    try {
        // Regular expression to capture video ID from various YouTube URL formats
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
    // YouTube URL check
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const embedUrl = getYouTubeEmbedUrl(url);
        if (embedUrl) {
            return <iframe src={embedUrl} title="Video Player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>;
        }
    }
    // Direct video file check
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return <video src={url} controls className="w-full h-full object-contain bg-black"></video>;
    }
    return <div className="w-full h-full flex items-center justify-center text-neutral-500 p-4 text-center">Invalid or unsupported video URL</div>;
};


interface VideoScribePageProps {
    videoItems: VideoItem[];
}

const VideoScribePage: React.FC<VideoScribePageProps> = ({ videoItems }) => {
    const [copiedScriptId, setCopiedScriptId] = useState<number | null>(null);

    const handleCopyScript = (script: string, id: number) => {
        navigator.clipboard.writeText(script);
        setCopiedScriptId(id);
        setTimeout(() => setCopiedScriptId(null), 2000); // Reset after 2 seconds
    };
    
    return (
        <div className="z-10 w-full h-full p-4 md:p-8 overflow-y-auto">
            <motion.div
                className="max-w-6xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-12">
                    <h2 className="text-5xl md:text-8xl font-caveat font-bold text-neutral-100">Video Scribe</h2>
                    <p className="font-permanent-marker text-neutral-300 mt-4 text-xl tracking-wide">
                        Watch videos with their scripts side-by-side.
                    </p>
                </div>

                <AnimatePresence>
                    {videoItems.length > 0 ? (
                        <motion.div 
                            className="space-y-12"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                            }}
                        >
                            {videoItems.map((item) => (
                                    <motion.section 
                                        key={item.id} 
                                        className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 md:p-6"
                                        variants={{
                                            hidden: { y: 20, opacity: 0 },
                                            visible: { y: 0, opacity: 1 }
                                        }}
                                    >
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            {/* Video Player */}
                                            <div className="w-full lg:w-2/3 aspect-video bg-black rounded-md overflow-hidden shadow-lg">
                                                <VideoPlayer url={item.url} />
                                            </div>

                                            {/* Script Area */}
                                            <div className="w-full lg:w-1/3 flex flex-col">
                                                 <div className="flex justify-between items-center mb-3 flex-shrink-0">
                                                    <h3 className="font-permanent-marker text-yellow-400 text-2xl">Script</h3>
                                                    <button
                                                        onClick={() => handleCopyScript(item.script, item.id)}
                                                        className="p-2 bg-neutral-800/70 rounded-full text-white hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                                                        aria-label="Copy script"
                                                    >
                                                        {copiedScriptId === item.id ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                                 <div className="bg-neutral-800/70 p-4 rounded-md h-64 lg:h-full overflow-y-auto flex-grow">
                                                     <p className="text-neutral-300 whitespace-pre-wrap leading-relaxed">{item.script}</p>
                                                 </div>
                                            </div>
                                        </div>
                                    </motion.section>
                                ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            className="text-center py-16"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <p className="text-neutral-500 font-permanent-marker text-2xl">No videos yet.</p>
                            <p className="text-neutral-600 mt-4">Videos added in the Admin Panel will appear here.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default VideoScribePage;