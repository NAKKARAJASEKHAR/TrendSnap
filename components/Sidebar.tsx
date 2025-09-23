/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { cn } from '../lib/utils';

export type Page = 'home' | 'trending' | 'collection' | 'create' | 'videoScribe' | 'admin';

// --- Icon Components ---
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const TrendingIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const CollectionIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CreateIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293c.63.63 1.707.63 2.337 0l2.293-2.293c.63-.63.63-1.707 0-2.337L15.637.363c-.63-.63-1.707-.63-2.337 0L11 2.663c-.63.63-.63 1.707 0 2.337zM1 11l2.293 2.293c.63.63 1.707.63 2.337 0l2.293-2.293c.63-.63.63-1.707 0-2.337L5.637 6.363c-.63-.63-1.707-.63-2.337 0L1 8.663c-.63.63-.63 1.707 0 2.337zm18 0l2.293 2.293c.63.63 1.707.63 2.337 0l2.293-2.293c.63-.63.63-1.707 0-2.337L21.637 6.363c-.63-.63-1.707-.63-2.337 0L17 8.663c-.63.63-.63 1.707 0 2.337z" /></svg>;
const VideoScribeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>;
const AdminIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const PAGE_CONFIG: { page: Page; label: string; icon: React.ReactElement<any> }[] = [
    { page: 'home', label: 'Home', icon: <HomeIcon /> },
    { page: 'trending', label: 'Trending', icon: <TrendingIcon /> },
    { page: 'collection', label: 'Collection', icon: <CollectionIcon /> },
    { page: 'create', label: 'Create', icon: <CreateIcon /> },
    { page: 'videoScribe', label: 'Video Scribe', icon: <VideoScribeIcon /> },
    { page: 'admin', label: 'Admin', icon: <AdminIcon /> },
];


interface SidebarProps {
    currentPage: Page;
    onPageChange: (page: Page) => void;
    isVisible: boolean; // For desktop toggle
    isMobile: boolean;
}

// FIX: Define a dedicated interface for NavItem props to ensure correct type inference and resolve compiler errors.
interface NavItemProps {
    page: Page;
    currentPage: Page;
    onPageChange: (page: Page) => void;
    icon: React.ReactElement<any>;
    label: string;
}

const DesktopNavItem: React.FC<NavItemProps> = ({ page, currentPage, onPageChange, icon, label }) => {
    const isActive = currentPage === page;
    const activeClasses = "bg-yellow-400 text-black";
    const inactiveClasses = "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100";
    return (
        <button
            onClick={() => onPageChange(page)}
            className={cn(
                'w-full flex items-center gap-4 text-left font-permanent-marker text-lg px-6 py-3 rounded-md transition-colors duration-200',
                isActive ? activeClasses : inactiveClasses
            )}
            aria-current={isActive ? 'page' : undefined}
        >
            {React.cloneElement(icon, { className: "h-6 w-6 shrink-0" })}
            <span>{label}</span>
        </button>
    );
};

const MobileNavItem: React.FC<NavItemProps> = ({ page, currentPage, onPageChange, icon, label }) => {
    const isActive = currentPage === page;
    const activeClasses = "bg-yellow-400 text-black";
    const inactiveClasses = "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100";
    return (
        <button
            onClick={() => onPageChange(page)}
            className={cn(
                'w-full flex justify-center items-center p-3 rounded-md transition-colors duration-200 group relative',
                isActive ? activeClasses : inactiveClasses
            )}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
        >
            {icon}
            <span className="absolute left-full ml-3 px-2 py-1 bg-neutral-800 text-neutral-200 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {label}
            </span>
        </button>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, isVisible, isMobile }) => {

    if (isMobile) {
        return (
            <aside className="fixed left-0 top-0 h-full flex flex-col bg-black border-r border-white/10 z-40 w-20 py-6 shrink-0">
                <div 
                    className="text-center mb-10 cursor-pointer"
                    onClick={() => onPageChange('home')}
                    aria-label="Go to Home page"
                >
                    <h1 className="text-3xl font-caveat font-bold text-neutral-100">TS</h1>
                </div>
                <nav className="flex flex-col items-center gap-4 px-3">
                    {PAGE_CONFIG.map(({ page, label, icon }) => (
                        <MobileNavItem 
                            key={page} 
                            page={page} 
                            currentPage={currentPage} 
                            onPageChange={onPageChange} 
                            icon={icon} 
                            label={label} 
                        />
                    ))}
                </nav>
            </aside>
        );
    }

    // --- Desktop View ---
    return (
        <aside className={cn(
            "relative flex flex-col bg-black border-r border-white/10 z-20 shrink-0 transition-all duration-300 ease-in-out",
            isVisible ? "w-64 p-6" : "w-0 p-0 border-r-0"
        )}>
            <div className={cn("whitespace-nowrap overflow-hidden transition-opacity", isVisible ? "opacity-100 duration-200 delay-100" : "opacity-0 duration-100")}>
                <div className="text-center mb-12">
                    <h1 
                        className="text-4xl font-caveat font-bold text-neutral-100 cursor-pointer"
                        onClick={() => onPageChange('home')}
                    >
                        TrendSnap
                    </h1>
                </div>
                <nav className="flex flex-col gap-4">
                    {PAGE_CONFIG.map(({ page, label, icon }) => (
                         <DesktopNavItem 
                            key={page} 
                            page={page} 
                            currentPage={currentPage} 
                            onPageChange={onPageChange}
                            icon={icon}
                            label={label}
                         />
                     ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;