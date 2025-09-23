/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Card3D } from './ui/Card3D';
import type { CollectionItem } from './AdminPage';

// This data is now managed in App.tsx and passed as props
// const styleCategories = [ ... ];

interface CollectionPageProps {
    collectionItems: CollectionItem[];
    onStyleSelect: (prompt: string) => void;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};


const CollectionPage: React.FC<CollectionPageProps> = ({ collectionItems, onStyleSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // For now, we'll display all items in one category.
    // A more advanced implementation could involve adding a 'category' field to CollectionItem.
    const filteredItems = collectionItems.filter(item =>
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="z-10 w-full h-full p-4 md:p-8 overflow-y-auto">
            <motion.div
                className="max-w-6xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div className="text-center mb-8" variants={itemVariants}>
                    <h2 className="text-5xl md:text-8xl font-caveat font-bold text-neutral-100">Inspiration Gallery</h2>
                    <p className="font-permanent-marker text-neutral-300 mt-4 text-xl tracking-wide">
                        Click a style to use it on the Create page.
                    </p>
                </motion.div>

                 <motion.div className="mb-12" variants={itemVariants}>
                    <div className="relative max-w-lg mx-auto">
                        <input
                            type="text"
                            placeholder="Search prompts (e.g., 'Fantasy', 'Robot')..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-10 bg-neutral-900 border-2 border-neutral-700 rounded-md text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors"
                        />
                         <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </motion.div>

                <motion.section variants={itemVariants}>
                    {filteredItems.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {filteredItems.map((image) => (
                                <Card3D 
                                    key={image.id} 
                                    className="aspect-square group cursor-pointer"
                                    onClick={() => onStyleSelect(image.prompt)}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.prompt}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <p className="font-permanent-marker text-white text-xl border-2 border-white px-4 py-2 rounded-sm">
                                            Use this Style
                                            </p>
                                    </div>
                                </Card3D>
                            ))}
                        </div>
                    ) : (
                         <motion.div className="text-center py-12" variants={itemVariants}>
                            <p className="text-neutral-500 font-permanent-marker text-xl">
                                {collectionItems.length > 0 ? "No results found." : "The gallery is empty."}
                            </p>
                            <p className="text-neutral-600 mt-2">
                                {collectionItems.length > 0 ? "Try a different search term." : "Add images from the Admin Panel to see them here."}
                            </p>
                        </motion.div>
                    )}
                </motion.section>
            </motion.div>
        </div>
    );
};

export default CollectionPage;
