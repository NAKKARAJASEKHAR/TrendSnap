// FIX: Replaced the reference to "vite/client" with a global type definition
// to resolve "Cannot find type definition file" and subsequent import.meta.env errors.
// This is a workaround for a likely misconfigured TypeScript environment.
declare global {
    interface ImportMeta {
        readonly env: {
            // Renamed to be more descriptive. This variable should hold the URL
            // of the hosted backend server, not a database connection string.
            readonly VITE_BACKEND_URL?: string;
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
import GoogleAd from './components/GoogleAd'; // Import the new ad component
import { cn } from './lib/utils';
import * as api from './services/apiService';


export interface VideoItem {
    id: number | string; // ID can be number for local, string for DB
    url: string; // Original YouTube URL
    script: string;
}

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

    // --- State for Admin-managed content, now fetched from API ---
    const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
    const [videoItems, setVideoItems] = useState<VideoItem[]>([]);
    const [isLoadingContent, setIsLoadingContent] = useState(true);


    // --- Auth State ---
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try {
            // Check localStorage for persisted authentication state
            return localStorage.getItem('isAuthenticated') === 'true';
        } catch (error) {
            console.error("Failed to read authentication state from localStorage", error);
            return false;
        }
    });

    // --- Data Fetching from Mock API ---
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoadingContent(true);
                const [collections, videos] = await Promise.all([
                    api.getCollectionItems(),
                    api.getVideoItems(),
                ]);
                setCollectionItems(collections);
                setVideoItems(videos);
            } catch (error) {
                console.error("Failed to load initial app data", error);
            } finally {
                setIsLoadingContent(false);
            }
        };
        loadData();
    }, []);


    // Persist authentication state to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('isAuthenticated', String(isAuthenticated));
        } catch (error) {
            console.error("Failed to save authentication state to localStorage", error);
        }
    }, [isAuthenticated]);


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

    // --- API Handlers for Admin Page ---

    const handleAddCollectionItem = async (item: Omit<CollectionItem, 'id'>, file?: File) => {
        let url = item.url;
        if (file) {
            url = await api.uploadImage(file);
        }
        const newItem = await api.addCollectionItem({ ...item, url });
        setCollectionItems(prev => [newItem, ...prev]);
    };
    
    const handleUpdateCollectionItem = async (item: CollectionItem, file?: File) => {
        let url = item.url;
        if (file) {
            url = await api.uploadImage(file);
        }
        const updatedItem = await api.updateCollectionItem({ ...item, url });
        setCollectionItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    };

    const handleDeleteCollectionItem = async (id: string | number) => {
        await api.deleteCollectionItem(id);
        setCollectionItems(prev => prev.filter(i => i.id !== id));
    };

    const handleAddVideoItem = async (item: Omit<VideoItem, 'id'>) => {
        const newItem = await api.addVideoItem(item);
        setVideoItems(prev => [newItem, ...prev]);
    };

    const handleUpdateVideoItem = async (item: VideoItem) => {
        const updatedItem = await api.updateVideoItem(item);
        setVideoItems(prev => prev.map(v => v.id === updatedItem.id ? updatedItem : v));
    };

    const handleDeleteVideoItem = async (id: string | number) => {
        await api.deleteVideoItem(id);
        setVideoItems(prev => prev.filter(v => v.id !== id));
    };
 
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
        // You could show a global loader here while isLoadingContent is true
        if (isLoadingContent) {
            return (
                <div className="flex items-center justify-center h-full">
                    <svg className="animate-spin h-10 w-10 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            );
        }

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
                        onAddCollectionItem={handleAddCollectionItem}
                        onUpdateCollectionItem={handleUpdateCollectionItem}
                        onDeleteCollectionItem={handleDeleteCollectionItem}
                        videoItems={videoItems}
                        onAddVideoItem={handleAddVideoItem}
                        onUpdateVideoItem={handleUpdateVideoItem}
                        onDeleteVideoItem={handleDeleteVideoItem}
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
                isAuthenticated={isAuthenticated}
            />

            <main 
                className={cn(
                    "flex-1 flex flex-col items-center justify-start p-4 overflow-y-auto relative transition-all duration-300 ease-in-out",
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
                <div className="flex-1 w-full flex flex-col items-center justify-center">
                    {renderPage()}
                </div>
                {/* Ad Banner */}
                <div className="w-full flex justify-center mt-auto pt-4">
                    <GoogleAd key={`${currentPage}-${isSidebarVisible}`} />
                </div>
            </main>
        </div>
    );
}

export default App;