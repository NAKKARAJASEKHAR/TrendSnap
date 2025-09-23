// FIX: Replaced the reference to "vite/client" with a global type definition
// to resolve "Cannot find type definition file" and subsequent import.meta.env errors.
// This is a workaround for a likely misconfigured TypeScript environment.
declare global {
    interface ImportMeta {
        readonly env: {
            readonly VITE_API_BASE_URL?: string;
        }
    }
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import Sidebar, { Page } from './components/Sidebar';
import HomePage from './components/HomePage';
import CollectionPage from './components/CollectionPage';
import TrendingPage from './components/TrendingPage';
import AdminPage, { CollectionItem } from './components/AdminPage';
import VideoScribePage from './components/VideoScribePage';
import CreatePage from './components/CreatePage';
import LoginPage from './components/LoginPage';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';


export interface VideoItem {
    id: number | string; // ID can be number for local, string for DB
    url: string; // Original YouTube URL
    script: string;
}

// Define the base URL for the API. Use Vite's environment variables with a fallback for local development.
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5001';

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};


function App() {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [initialPromptForCreate, setInitialPromptForCreate] = useState('');
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isSidebarVisible, setIsSidebarVisible] = useState(!isMobile);

    // --- State for Admin-managed content ---
    const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
    const [videoItems, setVideoItems] = useState<VideoItem[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);

    // --- Auth State ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // --- Data Fetching from Backend API ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [imagesRes, videosRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/images`),
                    fetch(`${API_BASE_URL}/api/videos`)
                ]);

                if (!imagesRes.ok || !videosRes.ok) {
                    throw new Error('Failed to fetch data from server');
                }

                const imagesData = await imagesRes.json();
                const videosData = await videosRes.json();

                // Mongoose's toJSON virtuals often transform _id to id.
                // The frontend types (string | number) are compatible.
                setCollectionItems(imagesData);
                setVideoItems(videosData);
                setApiError(null); // Clear any previous errors on successful fetch
            } catch (error) {
                console.error("API fetch failed:", error);
                setApiError("API fetch failed, loading sample data as a fallback.");
                // Load static sample data as a fallback if the API is down
                setCollectionItems([
                    { id: 'sample1', url: 'https://storage.googleapis.com/aistudio-samples/past-forward/c_1.jpeg', prompt: 'A majestic dragon perched atop a snow-covered mountain peak at dawn.' },
                    { id: 'sample2', url: 'https://storage.googleapis.com/aistudio-samples/past-forward/c_2.jpeg', prompt: 'Cyberpunk warrior princess with neon katanas on a rainy Tokyo street.' },
                ]);
                setVideoItems([
                    { id: 'sample1', url: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ', script: 'This is a sample script. In a real app, this content would be loaded from your database via a backend API.' },
                ]);
            }
        };
        fetchData();
    }, []);


    useEffect(() => {
        // Adjust sidebar visibility when switching between mobile and desktop views
        setIsSidebarVisible(!isMobile);
    }, [isMobile]);


    // Clear the initial prompt when navigating away from the create page
    useEffect(() => {
        if (currentPage !== 'create') {
            setInitialPromptForCreate('');
        }
    }, [currentPage]);
 
    const handleToggleSidebar = (e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent content click handler from firing
        setIsSidebarVisible(!isSidebarVisible);
    };

    const handleContentClick = () => {
        if (isSidebarVisible && !isMobile) {
            setIsSidebarVisible(false);
        }
    };

    const handleNavigateToCreateWithPrompt = (prompt: string) => {
        setInitialPromptForCreate(prompt);
        setCurrentPage('create');
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentPage('home');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage isMobile={isMobile} />;
            case 'trending':
                return <TrendingPage />;
            case 'collection':
                return <CollectionPage collectionItems={collectionItems} onStyleSelect={handleNavigateToCreateWithPrompt} />;
            case 'create':
                return <CreatePage initialPrompt={initialPromptForCreate} />;
            case 'admin':
                return isAuthenticated ? (
                    <AdminPage 
                        collectionItems={collectionItems}
                        onCollectionItemsChange={setCollectionItems}
                        videoItems={videoItems}
                        onVideoItemsChange={setVideoItems}
                        onLogout={handleLogout}
                    />
                ) : (
                    <LoginPage onLoginSuccess={handleLoginSuccess} />
                );
            case 'videoScribe':
                return <VideoScribePage videoItems={videoItems} />;
            default:
                return <HomePage isMobile={isMobile} />;
        }
    };

    return (
        <div className="bg-black text-neutral-200 min-h-screen w-full flex">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]"></div>
            
            <Sidebar 
                currentPage={currentPage} 
                onPageChange={setCurrentPage}
                isVisible={isSidebarVisible}
                isMobile={isMobile}
            />
             <AnimatePresence>
                {apiError && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="absolute top-0 left-0 right-0 z-[100] bg-red-600/90 text-white text-center p-3 font-bold shadow-lg"
                    >
                        {apiError}
                    </motion.div>
                )}
            </AnimatePresence>

            <main 
                className={cn(
                    "flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto relative transition-all duration-300 ease-in-out",
                    isMobile && "ml-20"
                )}
                onClick={handleContentClick}
            >
                {!isMobile && (
                    <button
                        onClick={handleToggleSidebar}
                        className="absolute top-5 left-5 z-30 p-2 bg-neutral-800/50 rounded-full text-white hover:bg-neutral-700/70 transition-colors"
                        aria-label={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
                    >
                        {isSidebarVisible ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                )}
                {renderPage()}
            </main>
        </div>
    );
}

export default App;